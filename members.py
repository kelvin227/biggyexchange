from fastapi import APIRouter, Depends, HTTPException, Header, Request, Body
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from sqlalchemy import select, func, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timezone
import hashlib
from anyio import to_thread
from ...core.db import SessionLocal
from ...core.config import settings
from pydantic import BaseModel, EmailStr
from ...models.member import Member
from ...models.member_task import MemberTask
from ...models.target import Target
from ...schemas.member import MemberIn, MemberOut, MemberUpdate
from ...schemas.member import MemberRightsOut
from ...schemas.member_task import MemberTaskIn, MemberTaskOut, MemberTaskUpdate
from ...services.activity_log import log_admin_activity
from jose import jwt
from ...models.project import Project
from ...models.supported_network import SupportedNetwork
from ...models.member_holding import MemberHolding, MemberHoldingHistory
from ...models.member_rights import MemberRights
from ...services.holdings import refresh_holdings_for_member
from ...schemas.holding import MemberHoldingIn, MemberHoldingOut, MemberHoldingHistoryOut
from ...models.screenshot import Screenshot
from ...schemas.screenshot import ScreenshotOut
from ...models.error import Error
from fastapi import Query
from ...core.authz import (
    require_admin_email,
    require_member_wallet,
    require_admin_or_member_owns_member_id,
    require_member_owns_member_id,
)
from ...core.authz import get_auth_claims
import logging
from ...services.s3_storage import (
    ensure_bucket_configured,
    build_screenshot_key,
    upload_bytes,
    download_bytes,
    LOCAL_FALLBACK_BUCKET,
)
from ...services.sqs_queue import enqueue_ocr_job

router = APIRouter(tags=["members"])
logger = logging.getLogger(__name__)

import re
import json
import os
import httpx
from urllib.parse import urlparse


# Pydantic models for request bodies with hCaptcha
class MemberInWithHCaptcha(BaseModel):
    """Member creation with hCaptcha verification"""
    country: str
    timezone: str
    manual_timezone: Optional[str] = None
    email: EmailStr
    sms: Optional[str] = None
    telegram: Optional[str] = None
    telegram_username: Optional[str] = None
    google_email: Optional[str] = None
    notify_email: bool = True
    notify_sms: bool = False
    notify_telegram: bool = False
    reward_preference: str = 'JBC'
    availability: Optional[dict] = None
    wallet_address: Optional[str] = None
    google_id: Optional[str] = None
    telegram_id: Optional[str] = None
    hcaptcha_token: str  # Required for submission


class CompleteTaskWithHCaptcha(BaseModel):
    """Task completion with hCaptcha verification"""
    hcaptcha_token: str
    submission_url: Optional[str] = None


async def validate_hcaptcha_token(token: str, remote_ip: str | None = None) -> dict:
    """
    Validate hCaptcha token against hcaptcha.com/siteverify.
    Returns the hCaptcha response dict with 'success' and other fields.
    """
    secret = os.getenv("HCAPTCHA_SECRET_KEY", "")
    if not secret:
        logger.error("hCaptcha secret not configured")
        raise HTTPException(status_code=500, detail="hCaptcha secret not configured")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://hcaptcha.com/siteverify",
                data={
                    "secret": secret,
                    "response": token,
                    "remoteip": remote_ip,
                },
            )
            try:
                result = resp.json()
            except Exception:
                result = {"success": False, "error-codes": ["json_parse_error"]}
            return result
    except Exception as e:
        logger.error(f"hCaptcha validation error: {e}")
        raise HTTPException(status_code=500, detail="hCaptcha validation failed")


async def log_hcaptcha_failure(
    db: AsyncSession,
    member_id: int | None,
    failure_reason: str,
    request: Request,
    hcaptcha_error_codes: list | None = None,
):
    """Log hCaptcha validation failures to Error table."""
    from ...models.error import Error
    
    error_entry = Error(
        error_type="hcaptcha_validation",
        error_message=failure_reason,
        member_id=member_id,
        ip_address=request.client.host if request.client else None,
        browser=request.headers.get("user-agent"),
        user_agent=request.headers.get("user-agent"),
        additional_context={
            "error_codes": hcaptcha_error_codes or [],
            "timestamp": datetime.utcnow().isoformat(),
        },
    )
    db.add(error_entry)
    try:
        await db.commit()
    except Exception as exc:
        logger.warning(f"Failed to log hCaptcha failure: {exc}")
        await db.rollback()


async def _normalize_email_or_error(email_raw: Optional[str]) -> str:
    if email_raw is None:
        raise HTTPException(status_code=400, detail={"code": "EMAIL_REQUIRED", "message": "Email is required"})
    email_clean = str(email_raw).strip().lower()
    if not email_clean:
        raise HTTPException(status_code=400, detail={"code": "EMAIL_REQUIRED", "message": "Email is required"})
    return email_clean


async def _assert_email_available(db: AsyncSession, email: str, *, exclude_member_id: Optional[int] = None) -> None:
    q = select(Member).where(func.lower(Member.email) == email.lower())
    if exclude_member_id is not None:
        q = q.where(Member.id != exclude_member_id)
    res = await db.execute(q)
    existing_email_owner = res.scalar_one_or_none()
    if existing_email_owner:
        raise HTTPException(status_code=400, detail={"code": "EMAIL_ALREADY_USED", "message": "Email already exists"})


LINK_REQUIRED_ALLOWED_TASK_TYPES = {"comments", "shares", "posts", "retweets"}

PLATFORM_URL_DOMAIN_RULES: dict[str, tuple[str, ...]] = {
    "twitter/x": ("x.com", "twitter.com"),
    "instagram": ("instagram.com",),
    "facebook": ("facebook.com", "fb.com"),
    "tiktok": ("tiktok.com",),
    "linkedin": ("linkedin.com",),
    "reddit": ("reddit.com",),
    "youtube": ("youtube.com", "youtu.be"),
    "telegram": ("t.me", "telegram.me"),
    "discord": ("discord.com", "discord.gg"),
}


def _normalize_platform_key(platform: str | None) -> str:
    value = (platform or "").strip().lower()
    if value in {"twitter", "x", "twitter/x"}:
        return "twitter/x"
    return value


def _supports_link_requirement(task_type: str | None) -> bool:
    value = (task_type or "").strip().lower()
    return value in LINK_REQUIRED_ALLOWED_TASK_TYPES


def _host_matches_domain(host: str, domain: str) -> bool:
    return host == domain or host.endswith(f".{domain}")


def _validate_submission_url_for_task(url_value: str, platform: str | None) -> str:
    normalized = (url_value or "").strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="Task URL is required")

    parsed = urlparse(normalized)
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Task URL must start with http:// or https://")
    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="Task URL is invalid")

    host = parsed.netloc.split("@")[-1].split(":")[0].lower()
    platform_key = _normalize_platform_key(platform)
    allowed_domains = PLATFORM_URL_DOMAIN_RULES.get(platform_key)
    if allowed_domains and not any(_host_matches_domain(host, domain) for domain in allowed_domains):
        raise HTTPException(
            status_code=400,
            detail=f"Task URL does not match expected domain for {platform or 'this platform'}",
        )

    return normalized


def _serialize_member_task(
    task: MemberTask,
    *,
    target_description: str | None = None,
    target_link_required: bool | None = None,
) -> dict:
    return {
        "id": task.id,
        "member_id": task.member_id,
        "project_name": task.project_name,
        "platform": task.platform,
        "task_type": task.task_type,
        "target_description": target_description,
        "reward_amount": task.reward_amount,
        "reward_currency": task.reward_currency,
        "screenshot_url": task.screenshot_url,
        "submission_url": task.submission_url,
        "link_required": bool(task.link_required) if task.link_required is not None else bool(target_link_required),
        "status": task.status,
        "scheduled_for": task.scheduled_for,
        "due_at": task.due_at,
        "completed_at": task.completed_at,
        "reviewed_at": task.reviewed_at,
        "reviewed_by": task.reviewed_by,
        "auto_details": task.auto_details,
        "auto_confidence_level": float(task.auto_confidence_level) if task.auto_confidence_level is not None else None,
        "auto_mistake": task.auto_mistake,
        "created_at": task.created_at,
        "member": {
            "id": task.member.id,
            "wallet_address": task.member.wallet_address,
            "telegram_username": task.member.telegram_username,
            "google_email": task.member.google_email,
            "email": task.member.email,
        }
        if task.member
        else None,
        "project_id": task.project_id,
        "project_platform_links": (task.project.platform_links if task.project else None),
        "partner_social_links": (
            task.project.partner.social_links if task.project and task.project.partner else None
        ),
    }


async def _get_member_or_block(member_id: int, db: AsyncSession) -> Member:
    res = await db.execute(select(Member).where(Member.id == member_id))
    member = res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    _ensure_member_not_blocked(member)
    return member


def _target_description_subquery():
    # Pick the first matching target (by id) for a task's (project_id, platform, task_type)
    return (
        select(Target.description)
        .where(Target.project_id == MemberTask.project_id)
        .where(Target.platform == MemberTask.platform)
        .where(Target.type == MemberTask.task_type)
        .order_by(Target.id.asc())
        .limit(1)
        .scalar_subquery()
    )


def _target_link_required_subquery():
    # Pick the first matching target (by id) for a task's (project_id, platform, task_type)
    return (
        select(func.coalesce(Target.link_required, False))
        .where(Target.project_id == MemberTask.project_id)
        .where(Target.platform == MemberTask.platform)
        .where(Target.type == MemberTask.task_type)
        .order_by(Target.id.asc())
        .limit(1)
        .scalar_subquery()
    )

# Availability validation helpers
WEEKDAY_KEYS = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}
TIME_RE = re.compile(r'^(?:[01]\d|2[0-3]):[0-5]\d$')

def validate_availability(obj) -> Optional[str]:
    """
    Validate availability structure. Returns None if valid, otherwise error message string.

    Expected format:
    {
      "Mon": [{"start": "09:00", "end": "10:00"}, ...],
      "Tue": [{"start": "13:00", "end": "14:00"}],
      ...
    }
    """
    if not isinstance(obj, dict):
        return "availability must be an object mapping weekday keys to arrays of time slots"

    for day, slots in obj.items():
        if day not in WEEKDAY_KEYS:
            return f"invalid weekday key: {day!r}; expected one of {sorted(list(WEEKDAY_KEYS))}"
        if not isinstance(slots, list):
            return f"slots for {day!r} must be a list of {{start,end}} objects"
        for slot in slots:
            if not isinstance(slot, dict):
                return f"each slot for {day!r} must be an object with 'start' and 'end' strings"
            if 'start' not in slot or 'end' not in slot:
                return f"each slot for {day!r} must contain 'start' and 'end'"
            start = slot.get('start')
            end = slot.get('end')
            if not isinstance(start, str) or not isinstance(end, str):
                return f"'start' and 'end' must be strings in HH:MM format for {day!r}"
            if not TIME_RE.match(start) or not TIME_RE.match(end):
                return f"invalid time format for {day!r} slot: start={start!r}, end={end!r}; expected HH:MM 24-hour"
            # simple ordering check
            try:
                sh, sm = map(int, start.split(':'))
                eh, em = map(int, end.split(':'))
                if (eh, em) <= (sh, sm):
                    return f"for {day!r} slot start must be before end (start={start}, end={end})"
            except Exception:
                return f"invalid time values for {day!r} slot"

    return None

async def get_db():
    async with SessionLocal() as session:
        yield session

def _jwt_email_from_auth(authorization: str | None) -> str | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        data = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        return data.get("sub")
    except Exception:
        return None

async def log_member_connection(db: AsyncSession, member_id: int, request: Request) -> None:
    """Log member connection details for troubleshooting"""
    try:
        user_agent = request.headers.get("user-agent", "")
        # Extract OS and browser from user-agent (simplified)
        os_name = "Unknown"
        browser = "Unknown"
        
        if "Windows" in user_agent:
            os_name = "Windows"
        elif "Mac" in user_agent:
            os_name = "macOS"
        elif "Linux" in user_agent:
            os_name = "Linux"
        elif "Android" in user_agent:
            os_name = "Android"
        elif "iOS" in user_agent or "iPhone" in user_agent:
            os_name = "iOS"
            
        if "Chrome" in user_agent and "Edg" not in user_agent:
            browser = "Chrome"
        elif "Firefox" in user_agent:
            browser = "Firefox"
        elif "Safari" in user_agent and "Chrome" not in user_agent:
            browser = "Safari"
        elif "Edg" in user_agent:
            browser = "Edge"
        
        # Get IP address
        ip_address = request.client.host if request.client else None
        if "x-forwarded-for" in request.headers:
            ip_address = request.headers["x-forwarded-for"].split(",")[0].strip()
        
        # Check if combination exists
        check_query = text("""
            SELECT id FROM member_connections 
            WHERE member_id = :member_id 
            AND os = :os 
            AND browser = :browser 
            AND ip_address = :ip_address 
            AND user_agent = :user_agent
        """)
        
        result = await db.execute(check_query, {
            "member_id": member_id,
            "os": os_name,
            "browser": browser,
            "ip_address": ip_address,
            "user_agent": user_agent
        })
        row = result.first()
        
        if row:
            # Update existing
            update_query = text("""
                UPDATE member_connections 
                SET dt_last_used = :dt_last_used 
                WHERE id = :id
            """)
            await db.execute(update_query, {
                "id": row[0],
                "dt_last_used": datetime.now(timezone.utc)
            })
        else:
            # Insert new
            insert_query = text("""
                INSERT INTO member_connections 
                (member_id, os, browser, ip_address, user_agent, dt_last_used)
                VALUES (:member_id, :os, :browser, :ip_address, :user_agent, :dt_last_used)
            """)
            await db.execute(insert_query, {
                "member_id": member_id,
                "os": os_name,
                "browser": browser,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "dt_last_used": datetime.now(timezone.utc)
            })
        
        await db.commit()
    except Exception as e:
        logger.error(f"Error logging member connection for member_id={member_id}: {str(e)}")
        await db.rollback()

async def log_holdings_error(db: AsyncSession, member_id: int, error_type: str, error_message: str, request: Request) -> None:
    """Log holdings read errors with member_id"""
    try:
        user_agent = request.headers.get("user-agent", "")
        ip_address = request.client.host if request.client else None
        if "x-forwarded-for" in request.headers:
            ip_address = request.headers["x-forwarded-for"].split(",")[0].strip()
        
        insert_query = text("""
            INSERT INTO errors 
            (member_id, error_type, error_message, user_agent, ip_address, created_at)
            VALUES (:member_id, :error_type, :error_message, :user_agent, :ip_address, :created_at)
        """)
        await db.execute(insert_query, {
            "member_id": member_id,
            "error_type": error_type,
            "error_message": error_message,
            "user_agent": user_agent,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc)
        })
        await db.commit()
    except Exception as e:
        logger.error(f"Error logging holdings error for member_id={member_id}: {str(e)}")
        await db.rollback()


async def log_error_safe(
    member_id: int,
    error_type: str,
    error_message: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
    page_url: str | None = None,
    additional_context: dict | None = None,
) -> None:
    """
    Log an error using a fresh DB session to avoid session state issues.
    This is safe to call even when the main session has been rolled back.
    """
    fresh_session = None
    try:
        fresh_session = SessionLocal()
        err = Error(
            error_type=error_type,
            error_message=error_message,
            member_id=member_id,
            ip_address=ip_address,
            user_agent=user_agent,
            page_url=page_url,
            additional_context=additional_context or {},
        )
        fresh_session.add(err)
        await fresh_session.commit()
        logger.info(f"Logged {error_type} error for member_id={member_id}")
    except Exception as e:
        logger.error(f"Failed to log {error_type} error for member_id={member_id}: {str(e)}")
        if fresh_session:
            try:
                await fresh_session.rollback()
            except Exception:
                pass
    finally:
        if fresh_session:
            try:
                await fresh_session.close()
            except Exception:
                pass

class TaskReviewDecision(BaseModel):
    decision: str
    note: str | None = None


class AutoMistakeUpdate(BaseModel):
    auto_mistake: bool


def _ensure_member_not_blocked(member: Member) -> None:
    blocked_statuses = {"BOT", "SUSPENDED"}
    status_val = (member.status or "").upper()
    bot_val = (member.bot_status or "").upper()
    if status_val in blocked_statuses or bot_val in blocked_statuses:
        # Map blocked reasons to subtle status codes for UI:
        # BOT -> ACTIVE-2, SUSPENDED -> ACTIVE-3
        mapped_status = None
        if bot_val == 'BOT' or status_val == 'BOT':
            mapped_status = 'ACTIVE-2'
        elif status_val == 'SUSPENDED' or bot_val == 'SUSPENDED':
            mapped_status = 'ACTIVE-3'
        else:
            mapped_status = 'ACTIVE-2'

        # normalize bot_status string (strip stray quotes)
        bot_status_clean = (member.bot_status or '')
        bot_status_clean = bot_status_clean.strip().strip("'\"")

        raise HTTPException(
            status_code=403,
            detail={
                "code": "WALLET_IN_REVIEW",
                "message": "Please contact support.",
                "status": mapped_status,
                "member_id": member.id,
            },
        )

# Member endpoints
@router.get("/members", response_model=List[MemberOut])
async def list_members(
    db: AsyncSession = Depends(get_db),
    _admin_email: str = Depends(require_admin_email),
):
    """List all members"""
    res = await db.execute(select(Member))
    members = res.scalars().all()
    return members

@router.get("/members/me", response_model=MemberOut)
async def get_current_member(
    wallet_address: Optional[str] = Query(None),
    google_id: Optional[str] = Query(None),
    telegram_id: Optional[str] = Query(None),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
    authorization: str | None = Header(default=None, alias="Authorization"),
):
    """Get current member by wallet, google_id, or telegram_id"""
    # Auth model:
    # - wallet lookup: require member token and enforce it matches the queried wallet
    # - google/telegram lookup: admin-only
    claims = get_auth_claims(authorization)
    if wallet_address:
        wallet_address = wallet_address.lower()
        token_wallet = require_member_wallet(claims)
        if wallet_address.lower() != token_wallet:
            raise HTTPException(status_code=403, detail="Not allowed for this wallet")
    elif google_id or telegram_id:
        _ = require_admin_email(claims)

    member = None
    if wallet_address:
        res = await db.execute(select(Member).where(func.lower(Member.wallet_address) == wallet_address))
        member = res.scalar_one_or_none()
    if not member and google_id:
        res = await db.execute(select(Member).where(Member.google_id == google_id))
        member = res.scalar_one_or_none()
    if not member and telegram_id:
        res = await db.execute(select(Member).where(Member.telegram_id == telegram_id))
        member = res.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    _ensure_member_not_blocked(member)
    
    # Log connection
    if request:
        try:
            await log_member_connection(db, member.id, request)
        except Exception as e:
            logger.error(f"Failed to log member connection: {str(e)}")
    
    # If wallet provided, refresh holdings (default network key 'bsc-testnet')
    if wallet_address:
        try:
            await refresh_holdings_for_member(db, member.id, wallet_address, network_key="bsc-testnet")
        except Exception as e:
            # Log the holdings error with member_id
            logger.error(f"Failed to refresh holdings for member_id={member.id}: {str(e)}")
            if request:
                try:
                    await log_holdings_error(db, member.id, "holdings_read_error", str(e), request)
                except Exception as log_err:
                    logger.error(f"Failed to log holdings error: {str(log_err)}")
            # Non-fatal: continue returning the member
    
    # Attach member rights
    try:
        res_rights = await db.execute(select(MemberRights).where(MemberRights.member_id == member.id))
        rights = res_rights.scalar_one_or_none()
        member.member_rights = rights
    except Exception:
        member.member_rights = None

    return member

@router.post("/members", response_model=MemberOut, status_code=201)
async def create_member(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new member profile.
    Can be called in two modes:
    1. Admin creation (requires admin_email header, no hCaptcha needed): POST with MemberIn
    2. Public onboarding (requires valid hCaptcha token): POST with MemberInWithHCaptcha
    """
    # Parse request body
    try:
        body = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
    
    # Determine authorization mode
    admin_email = request.headers.get("admin-email")
    is_admin_mode = bool(admin_email)
    
    # Validate hCaptcha for non-admin mode
    if not is_admin_mode:
        hcaptcha_token = body.get("hcaptcha_token")
        if not hcaptcha_token:
            await log_hcaptcha_failure(
                db, None, "Missing hCaptcha token in member creation",
                request, []
            )
            raise HTTPException(
                status_code=400,
                detail="hCaptcha token is required for member onboarding"
            )
        
        hcaptcha_result = await validate_hcaptcha_token(
            hcaptcha_token,
            request.client.host if request.client else None
        )
        
        if not hcaptcha_result.get("success"):
            await log_hcaptcha_failure(
                db, None,
                f"hCaptcha validation failed: {hcaptcha_result.get('error-codes', [])}",
                request,
                hcaptcha_result.get("error-codes", [])
            )
            raise HTTPException(
                status_code=400,
                detail="hCaptcha validation failed"
            )
    else:
        # Admin mode: require admin email
        from ...core.authz import require_admin_email as req_admin
        try:
            verified_admin = await req_admin(admin_email)
        except:
            raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Extract member data (remove hcaptcha_token from member fields)
    member_data = {k: v for k, v in body.items() if k != "hcaptcha_token"}
    
    try:
        member = MemberIn(**member_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid member data: {str(e)}")

    # Normalize and require email; enforce uniqueness
    member.email = await _normalize_email_or_error(member.email)
    await _assert_email_available(db, member.email)
    
    # Check if member already exists by wallet, google_id, or telegram_id
    existing = None
    if member.wallet_address:
        member.wallet_address = member.wallet_address.lower()
        res = await db.execute(select(Member).where(func.lower(Member.wallet_address) == member.wallet_address))
        existing = res.scalar_one_or_none()
    if not existing and member.google_id:
        res = await db.execute(select(Member).where(Member.google_id == member.google_id))
        existing = res.scalar_one_or_none()
    if not existing and member.telegram_id:
        res = await db.execute(select(Member).where(Member.telegram_id == member.telegram_id))
        existing = res.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Member already exists")
    
    db_member = Member(**member.dict())
    db.add(db_member)
    try:
        await db.commit()
        await db.refresh(db_member)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    # If wallet provided on create, refresh holdings
    try:
        if db_member.wallet_address:
            await refresh_holdings_for_member(db, db_member.id, db_member.wallet_address, network_key="bsc-testnet")
    except Exception:
        pass
    return db_member

@router.get("/members/{member_id}", response_model=MemberOut)
async def get_member_by_id(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    _claims: dict = Depends(require_admin_or_member_owns_member_id),
):
    """Get a single member by numeric ID"""
    res = await db.execute(select(Member).where(Member.id == member_id))
    member = res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.patch("/members/{member_id}", response_model=MemberOut)
async def update_member(
    member_id: int,
    member: MemberUpdate,
    db: AsyncSession = Depends(get_db),
    _claims: dict = Depends(require_admin_or_member_owns_member_id),
):
    """Update member profile"""
    res = await db.execute(select(Member).where(Member.id == member_id))
    db_member = res.scalar_one_or_none()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    _ensure_member_not_blocked(db_member)
    data = member.dict(exclude_unset=True)

    # Enforce email verification for sensitive updates (allow setting/changing email without prior verification)
    if (not getattr(db_member, "email_verified", False)):
        sensitive_keys = [k for k in data.keys() if k != "email"]
        if len(sensitive_keys) > 0:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "EMAIL_NOT_VERIFIED",
                    "message": "Please verify your email to update your profile"
                }
            )

    if 'wallet_address' in data and data['wallet_address']:
        data['wallet_address'] = data['wallet_address'].lower()

    # Enforce email presence and uniqueness for profile updates
    if not getattr(db_member, "email", None) and 'email' not in data:
        raise HTTPException(
            status_code=400,
            detail={"code": "EMAIL_REQUIRED", "message": "Please add your email in profile settings"}
        )
    if 'email' in data:
        data['email'] = await _normalize_email_or_error(data['email'])
        await _assert_email_available(db, data['email'], exclude_member_id=member_id)
    
    # Validate Telegram username must start with @
    if 'telegram' in data and data['telegram']:
        if not data['telegram'].startswith('@'):
            raise HTTPException(status_code=400, detail="Telegram username must start with @")

    # Validate availability payload when present
    if 'availability' in data:
        err = validate_availability(data['availability'])
        if err is not None:
            example = {
                "Mon": [{"start": "09:00", "end": "10:00"}, {"start": "13:00", "end": "14:00"}],
                "Tue": [{"start": "13:00", "end": "14:00"}],
                "Wed": [{"start": "13:00", "end": "14:00"}],
                "Fri": [{"start": "09:00", "end": "11:00"}]
            }
            raise HTTPException(status_code=400, detail={
                "error": "Invalid availability format",
                "message": err,
                "example": example
            })

    for key, value in data.items():
        setattr(db_member, key, value)
    
    try:
        await db.commit()
        await db.refresh(db_member)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    # If wallet present after update, refresh holdings
    try:
        if db_member.wallet_address:
            await refresh_holdings_for_member(db, db_member.id, db_member.wallet_address, network_key="bsc-testnet")
    except Exception:
        pass
    return db_member

@router.delete("/members/delete")
async def delete_member(
    member_id: Optional[int] = Query(None),
    telegram_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a member by id or telegram_id.
    Only available in non-production environments.
    """
    # Check if running in production
    if settings.ENV.lower() == "production":
        raise HTTPException(
            status_code=403,
            detail="Function not available in production"
        )
    
    # Require at least one identifier
    if not member_id and not telegram_id:
        raise HTTPException(
            status_code=400,
            detail="Must provide either member_id or telegram_id"
        )
    
    # Find the member
    member = None
    if member_id:
        res = await db.execute(select(Member).where(Member.id == member_id))
        member = res.scalar_one_or_none()
    elif telegram_id:
        res = await db.execute(select(Member).where(Member.telegram_id == telegram_id))
        member = res.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    try:
        await db.delete(member)
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB delete failed: {exc}")
    
    return {
        "message": "Member deleted successfully",
        "deleted_member_id": member.id,
        "telegram_id": member.telegram_id
    }


# Member tasks endpoints
@router.get("/members/{member_id}/tasks/pending", response_model=List[MemberTaskOut])
async def list_pending_tasks(member_id: int, db: AsyncSession = Depends(get_db)):
    """List future pending tasks for a member (scheduled_for > today)"""
    await _get_member_or_block(member_id, db)
    target_desc_sq = _target_description_subquery().label("target_description")
    target_link_required_sq = _target_link_required_subquery().label("target_link_required")
    res = await db.execute(
        select(MemberTask, target_desc_sq, target_link_required_sq)
        .options(
            selectinload(MemberTask.member),
            selectinload(MemberTask.project).selectinload(Project.partner),
        )
        .where(MemberTask.member_id == member_id, MemberTask.status == "pending")
    )
    rows = res.all()
    return [
        _serialize_member_task(
            task,
            target_description=target_description,
            target_link_required=target_link_required,
        )
        for task, target_description, target_link_required in rows
    ]

@router.get("/members/{member_id}/tasks/completed", response_model=List[MemberTaskOut])
async def list_completed_tasks(member_id: int, db: AsyncSession = Depends(get_db)):
    """List completed tasks for a member"""
    await _get_member_or_block(member_id, db)
    # Return tasks that have a completed_at timestamp (or other completed statuses)
    target_desc_sq = _target_description_subquery().label("target_description")
    target_link_required_sq = _target_link_required_subquery().label("target_link_required")
    completed_statuses = ["in review", "rewards pending", "rewards sent"]
    res = await db.execute(
        select(MemberTask, target_desc_sq, target_link_required_sq)
        .options(
            selectinload(MemberTask.member),
            selectinload(MemberTask.project).selectinload(Project.partner),
        )
        .where(
            MemberTask.member_id == member_id,
            or_(
                MemberTask.completed_at.isnot(None),
                MemberTask.status.in_(completed_statuses),
            ),
        )
    )
    rows = res.all()
    return [
        _serialize_member_task(
            task,
            target_description=target_description,
            target_link_required=target_link_required,
        )
        for task, target_description, target_link_required in rows
    ]

@router.get("/members/{member_id}/tasks/active", response_model=List[MemberTaskOut])
async def list_active_tasks(member_id: int, db: AsyncSession = Depends(get_db)):
    """List tasks with status = 'active' for a member"""
    await _get_member_or_block(member_id, db)
    target_desc_sq = _target_description_subquery().label("target_description")
    target_link_required_sq = _target_link_required_subquery().label("target_link_required")
    res = await db.execute(
        select(MemberTask, target_desc_sq, target_link_required_sq)
        .options(
            selectinload(MemberTask.member),
            selectinload(MemberTask.project).selectinload(Project.partner),
        )
        .where(MemberTask.member_id == member_id, MemberTask.status == "active")
    )
    rows = res.all()
    return [
        _serialize_member_task(
            task,
            target_description=target_description,
            target_link_required=target_link_required,
        )
        for task, target_description, target_link_required in rows
    ]

@router.get("/members/{member_id}/tasks/missed", response_model=List[MemberTaskOut])
async def list_missed_tasks(member_id: int, db: AsyncSession = Depends(get_db)):
    """List tasks with status = 'missed' for a member"""
    await _get_member_or_block(member_id, db)
    target_desc_sq = _target_description_subquery().label("target_description")
    target_link_required_sq = _target_link_required_subquery().label("target_link_required")
    res = await db.execute(
        select(MemberTask, target_desc_sq, target_link_required_sq)
        .options(
            selectinload(MemberTask.member),
            selectinload(MemberTask.project).selectinload(Project.partner),
        )
        .where(MemberTask.member_id == member_id, MemberTask.status == "missed")
    )
    rows = res.all()
    return [
        _serialize_member_task(
            task,
            target_description=target_description,
            target_link_required=target_link_required,
        )
        for task, target_description, target_link_required in rows
    ]

@router.post("/members/{member_id}/tasks", response_model=MemberTaskOut, status_code=201)
async def create_member_task(
    member_id: int,
    task: MemberTaskIn,
    db: AsyncSession = Depends(get_db)
):
    """Create a new task for a member"""
    res = await db.execute(select(Member).where(Member.id == member_id))
    db_member = res.scalar_one_or_none()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db_task = MemberTask(member_id=member_id, **task.dict())
    db.add(db_task)
    try:
        await db.commit()
        await db.refresh(db_task)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    return db_task


# Testing helper: ensure TESTING_project and add sample tasks for member
@router.post("/testing/tasks")
async def add_testing_tasks(member_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    # Ensure member exists
    res = await db.execute(select(Member).where(Member.id == member_id))
    member = res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Ensure TESTING_project exists
    res = await db.execute(select(Project).where(Project.name == "TESTING_project"))
    project = res.scalar_one_or_none()
    if not project:
        project = Project(name="TESTING_project", country="NA")
        db.add(project)
        await db.flush()

    examples = [
        {"platform": "Twitter/X", "task_type": "repost", "reward_amount": 1.0, "reward_currency": "USDT"},
        {"platform": "YouTube", "task_type": "view", "reward_amount": 2.0, "reward_currency": "USDT"},
        {"platform": "TikTok", "task_type": "like", "reward_amount": 0.005, "reward_currency": "ETH"},
    ]
    created_ids: list[int] = []
    for ex in examples:
        mt = MemberTask(
            member_id=member.id,
            project_id=project.id,
            project_name=project.name,
            platform=ex["platform"],
            task_type=ex["task_type"],
            reward_amount=ex["reward_amount"],
            reward_currency=ex["reward_currency"],
            status="pending",
        )
        db.add(mt)
        await db.flush()
        created_ids.append(mt.id)
    await db.commit()
    return {"created": created_ids, "count": len(created_ids)}


# Dashboard summary for a member
@router.get("/members/{member_id}/dashboard")
async def get_member_dashboard(member_id: int, db: AsyncSession = Depends(get_db)):
    # Member points, rank, active pending tasks count
    res = await db.execute(select(Member).where(Member.id == member_id))
    member = res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Active tasks = pending count
    res = await db.execute(select(MemberTask).where(MemberTask.member_id == member_id, MemberTask.status == 'pending'))
    pending = res.scalars().all()
    active_tasks = len(pending)

    return {
        "points": member.points or 0,
        "rank": member.rank or 0,
        "active_tasks": active_tasks,
    }


# Upload screenshot and store in S3. Updates member_task.screenshot_url to point to GET endpoint.
@router.post("/members/tasks/{task_id}/screenshot", response_model=ScreenshotOut)
async def upload_task_screenshot(task_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db), request: Request = None):
    # Validate task
    res = await db.execute(select(MemberTask).where(MemberTask.id == task_id))
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Capture scalar task fields we will need later so we don't touch ORM objects
    # after a possible rollback which can expire instances and trigger lazy loads.
    task_member_id = task.member_id

    ensure_bucket_configured()
    content = await file.read()
    sha256 = hashlib.sha256(content).hexdigest()

    sc = Screenshot(
        task_id=task_id,
        member_id=task_member_id,
        filename=file.filename,
        content_type=file.content_type,
        data=None,
    )
    db.add(sc)
    await db.flush()

    s3_bucket = settings.SCREENSHOTS_S3_BUCKET
    s3_key = build_screenshot_key(sc.id, sha256)
    try:
        upload_result = await to_thread.run_sync(
            lambda: upload_bytes(
                bucket=s3_bucket,
                key=s3_key,
                content=content,
                content_type=file.content_type,
            )
        )
    except Exception as exc:
        # Rollback any pending DB changes for screenshot
        try:
            await db.rollback()
        except Exception:
            pass

        # Extract request context for error logging
        ip = None
        ua = None
        page = None
        if request:
            try:
                ip = request.client.host if request.client else None
            except Exception:
                pass
            ua = request.headers.get("user-agent") if request.headers else None
            page = request.headers.get("referer") or request.headers.get("referrer") if request.headers else None

        # Log error using a fresh session (safe even if main session is corrupted)
        await log_error_safe(
            member_id=task_member_id,
            error_type="s3_upload",
            error_message=str(exc),
            ip_address=ip,
            user_agent=ua,
            page_url=page,
            additional_context={
                "filename": file.filename,
                "content_type": file.content_type,
                "s3_bucket": s3_bucket,
                "s3_key": s3_key,
                "env": settings.ENV,
                "aws_region": settings.AWS_REGION,
                "screenshots_s3_prefix": settings.SCREENSHOTS_S3_PREFIX,
                "screenshots_s3_fallback": settings.SCREENSHOTS_S3_FALLBACK,
                "ocr_sqs_queue_url": settings.OCR_SQS_QUEUE_URL,
                "task_id": task_id,
            },
        )

        raise HTTPException(status_code=500, detail=f"S3 upload failed: {exc}")

    # Support local fallback when credentials are not available in dev/local
    sc.s3_bucket = upload_result.get("bucket", s3_bucket)
    sc.s3_key = upload_result.get("key", s3_key)
    sc.sha256 = sha256

    # Update task screenshot_url to a stable API path
    task.screenshot_url = f"/api/v1/screenshots/{sc.id}"
    try:
        await db.commit()
        await db.refresh(sc)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")

    return {
        "id": sc.id,
        "task_id": sc.task_id,
        "member_id": sc.member_id,
        "filename": sc.filename,
        "content_type": sc.content_type,
        "url": task.screenshot_url,
        "created_at": sc.created_at,
    }


@router.get("/screenshots/{screenshot_id}")
async def get_screenshot(screenshot_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Screenshot).where(Screenshot.id == screenshot_id))
    sc = res.scalar_one_or_none()
    if not sc:
        raise HTTPException(status_code=404, detail="Screenshot not found")
    if sc.s3_bucket and sc.s3_key:
        try:
            payload = await to_thread.run_sync(
                lambda: download_bytes(bucket=sc.s3_bucket, key=sc.s3_key)
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"S3 download failed: {exc}")
        return Response(content=payload, media_type=sc.content_type or 'application/octet-stream')
    if sc.data is None:
        raise HTTPException(status_code=404, detail="Screenshot data not found")
    return Response(content=sc.data, media_type=sc.content_type or 'application/octet-stream')

@router.put("/members/tasks/{task_id}", response_model=MemberTaskOut)
async def update_member_task(
    task_id: int,
    task: MemberTaskUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a member task (upload screenshot, change status)"""
    # Eager-load member to avoid async lazy-load during response serialization
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.id == task_id)
    )
    db_task = res.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    prev_status = db_task.status
    for key, value in task.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    
    if task.status and task.status != 'pending' and not db_task.completed_at:
        db_task.completed_at = datetime.utcnow()
    
    try:
        await db.commit()
        await db.refresh(db_task)
        # Touch relationship to ensure it's loaded
        _ = db_task.member
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    if db_task.status == 'in review' and prev_status != 'in review':
        res = await db.execute(
            select(Screenshot)
            .where(Screenshot.task_id == db_task.id)
            .order_by(Screenshot.id.desc())
            .limit(1)
        )
        sc = res.scalar_one_or_none()
        if sc:
            try:
                await to_thread.run_sync(enqueue_ocr_job, db_task.id)
            except Exception as exc:
                logger.warning("Failed to enqueue OCR job for task %s: %s", db_task.id, exc)
    return db_task


# Member holdings (latest + history)
@router.get("/holdings", response_model=List[MemberHoldingOut])
async def list_all_holdings(
    limit: int = Query(2000, ge=1, le=20000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _admin_email: str = Depends(require_admin_email),
):
    res = await db.execute(
        select(MemberHolding)
        .order_by(MemberHolding.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return res.scalars().all()

@router.get("/members/{member_id}/holdings", response_model=List[MemberHoldingOut])
async def list_member_holdings(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    _claims: dict = Depends(require_admin_or_member_owns_member_id),
):
    res = await db.execute(select(MemberHolding).where(MemberHolding.member_id == member_id))
    return res.scalars().all()


@router.get("/members/{member_id}/holdings/history", response_model=List[MemberHoldingHistoryOut])
async def list_member_holdings_history(
    member_id: int,
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    _claims: dict = Depends(require_admin_or_member_owns_member_id),
):
    res = await db.execute(
        select(MemberHoldingHistory)
        .where(MemberHoldingHistory.member_id == member_id)
        .order_by(MemberHoldingHistory.recorded_at.desc())
        .limit(limit)
    )
    return res.scalars().all()


async def _resolve_network_id(db: AsyncSession, network_id: int | None, network_key: str | None) -> int:
    if network_id is not None:
        return network_id
    if network_key:
        res = await db.execute(select(SupportedNetwork).where(SupportedNetwork.key == network_key))
        net = res.scalar_one_or_none()
        if not net:
            raise HTTPException(status_code=400, detail=f"Unknown network key: {network_key}")
        return net.id
    raise HTTPException(status_code=400, detail="network_id or network_key is required")


@router.post("/members/{member_id}/holdings", response_model=MemberHoldingOut)
async def upsert_member_holdings(
    member_id: int,
    body: MemberHoldingIn,
    db: AsyncSession = Depends(get_db),
    _admin_email: str = Depends(require_admin_email),
):
    # Validate member exists
    res = await db.execute(select(Member).where(Member.id == member_id))
    member = res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    net_id = await _resolve_network_id(db, body.network_id, body.network_key)

    # Find existing latest holding by composite (member_id, wallet_address, network_id)
    res = await db.execute(
        select(MemberHolding).where(
            (MemberHolding.member_id == member_id) &
            (MemberHolding.wallet_address == body.wallet_address) &
            (MemberHolding.network_id == net_id)
        )
    )
    latest = res.scalar_one_or_none()

    if latest:
        latest.jbc_balance = body.jbc_balance or latest.jbc_balance
        latest.jbc_v2_balance = body.jbc_v2_balance or latest.jbc_v2_balance
        latest.vejbc_balance = body.vejbc_balance or latest.vejbc_balance
    else:
        latest = MemberHolding(
            member_id=member_id,
            wallet_address=body.wallet_address,
            network_id=net_id,
            jbc_balance=body.jbc_balance or 0,
            jbc_v2_balance=body.jbc_v2_balance or 0,
            vejbc_balance=body.vejbc_balance or 0,
        )
        db.add(latest)
        await db.flush()

    # Always append to history
    hist = MemberHoldingHistory(
        member_id=member_id,
        wallet_address=body.wallet_address,
        network_id=net_id,
        jbc_balance=body.jbc_balance or 0,
        jbc_v2_balance=body.jbc_v2_balance or 0,
        vejbc_balance=body.vejbc_balance or 0,
    )
    db.add(hist)

    try:
        await db.commit()
        await db.refresh(latest)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    return latest

@router.post("/members/tasks/{task_id}/complete", response_model=MemberTaskOut)
async def complete_member_task(
    task_id: int,
    body: CompleteTaskWithHCaptcha,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a task as completed (in review).
    Requires:
    - Valid hCaptcha token
    - Screenshot must have been uploaded for the task
    - Submission URL when target requires it
    """
    # Eager-load member to avoid async lazy-load during response serialization
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.id == task_id)
    )
    db_task = res.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Enforce email verification before allowing task completion
    try:
        member = db_task.member
    except Exception:
        member = None
    if member and not getattr(member, "email_verified", False):
        raise HTTPException(
            status_code=403,
            detail={
                "code": "EMAIL_NOT_VERIFIED",
                "message": "Please verify your email to complete tasks"
            }
        )
    
    # Check for screenshot first
    res = await db.execute(
        select(Screenshot)
        .where(Screenshot.task_id == db_task.id)
        .order_by(Screenshot.id.desc())
        .limit(1)
    )
    screenshot = res.scalar_one_or_none()
    if not screenshot:
        await log_hcaptcha_failure(
            db, db_task.member_id,
            f"Task completion attempted without screenshot (task_id={task_id})",
            request, []
        )
        raise HTTPException(
            status_code=400,
            detail="Screenshot is required to complete a task"
        )

    # Resolve whether link submission is required for this task from target config.
    target_link_required = False
    if db_task.project_id:
        target_req_res = await db.execute(
            select(Target.link_required)
            .where(Target.project_id == db_task.project_id)
            .where(Target.platform == db_task.platform)
            .where(Target.type == db_task.task_type)
            .order_by(Target.id.asc())
            .limit(1)
        )
        target_link_required = bool(target_req_res.scalar_one_or_none() or False)

    # Persist a snapshot to the task for stable admin/member views.
    effective_link_required = bool(db_task.link_required) or target_link_required
    if not _supports_link_requirement(db_task.task_type):
        effective_link_required = False
    db_task.link_required = effective_link_required

    if effective_link_required:
        if not body.submission_url or not str(body.submission_url).strip():
            raise HTTPException(status_code=400, detail="Task URL is required for this target")
        db_task.submission_url = _validate_submission_url_for_task(body.submission_url, db_task.platform)
    elif body.submission_url and str(body.submission_url).strip():
        # Optional URL is still accepted and validated when provided.
        db_task.submission_url = _validate_submission_url_for_task(body.submission_url, db_task.platform)
    
    # Validate hCaptcha token
    if not body.hcaptcha_token:
        await log_hcaptcha_failure(
            db, db_task.member_id,
            f"Task completion attempted without hCaptcha token (task_id={task_id})",
            request, []
        )
        raise HTTPException(
            status_code=400,
            detail="hCaptcha token is required to complete a task"
        )
    
    hcaptcha_result = await validate_hcaptcha_token(
        body.hcaptcha_token,
        request.client.host if request.client else None
    )
    
    if not hcaptcha_result.get("success"):
        await log_hcaptcha_failure(
            db, db_task.member_id,
            f"hCaptcha validation failed during task completion (task_id={task_id}): {hcaptcha_result.get('error-codes', [])}",
            request,
            hcaptcha_result.get("error-codes", [])
        )
        raise HTTPException(
            status_code=400,
            detail="hCaptcha validation failed"
        )
    
    # All validations passed, mark task as completed
    db_task.status = 'in review'
    db_task.completed_at = datetime.utcnow()
    try:
        await db.commit()
        await db.refresh(db_task)
        # Touch relationship to ensure it's loaded
        _ = db_task.member
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    
    # Enqueue OCR job if screenshot exists
    try:
        await to_thread.run_sync(enqueue_ocr_job, db_task.id)
    except Exception as exc:
        logger.warning("Failed to enqueue OCR job for task %s: %s", db_task.id, exc)
    
    return db_task

@router.post("/members/tasks/{task_id}/review")
async def review_member_task(
    task_id: int,
    body: TaskReviewDecision,
    db: AsyncSession = Depends(get_db),
    authorization: str | None = Header(default=None, alias="Authorization")
):
    """Record an admin review decision for a task and log the action."""
    res = await db.execute(select(MemberTask).where(MemberTask.id == task_id))
    db_task = res.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    # touch reviewed_at; keep status unchanged to avoid unintended workflow changes
    try:
        email = _jwt_email_from_auth(authorization)
        db_task.reviewed_at = datetime.utcnow()
        db_task.reviewed_by = email
        await db.commit()
        await db.refresh(db_task)
    except Exception:
        try:
            await db.rollback()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Failed to record review timestamp")

    await log_admin_activity(
        db,
        admin_email=email,
        action="task_review",
        target_type="member_task",
        target_id=db_task.id,
        decision=body.decision,
        details={"note": body.note},
    )
    return {"status": "ok"}

@router.get("/members/tasks/in-review", response_model=List[MemberTaskOut])
async def list_tasks_in_review(db: AsyncSession = Depends(get_db)):
    """List all tasks that are in review status (for admin approval)"""
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.status == 'in review')
        .order_by(MemberTask.completed_at.desc())
    )
    tasks = res.scalars().all()
    return tasks

@router.get("/members/tasks/approved", response_model=List[MemberTaskOut])
async def list_approved_tasks(
    limit: int = Query(1000, ge=1, le=1000, description="Number of recently approved tasks to return"),
    db: AsyncSession = Depends(get_db)
):
    """List recently approved tasks (rewards pending status)"""
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.status == 'rewards pending')
        .order_by(MemberTask.reviewed_at.desc())
        .limit(limit)
    )
    tasks = res.scalars().all()
    return tasks


@router.get("/members/tasks/missed", response_model=List[MemberTaskOut])
async def list_missed_tasks_global(
    limit: int = Query(1000, ge=1, le=1000, description="Number of recently missed tasks to return"),
    db: AsyncSession = Depends(get_db)
):
    """List recently missed tasks (admin overview)"""
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.status == 'missed')
        .order_by(MemberTask.completed_at.desc())
        .limit(limit)
    )
    tasks = res.scalars().all()
    return tasks

@router.get("/members/tasks/rejected", response_model=List[MemberTaskOut])
async def list_rejected_tasks(
    limit: int = Query(1000, ge=1, le=1000, description="Number of recently rejected tasks to return"),
    db: AsyncSession = Depends(get_db)
):
    """List recently rejected tasks"""
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.status == 'rejected')
        .order_by(MemberTask.reviewed_at.desc())
        .limit(limit)
    )
    tasks = res.scalars().all()
    return tasks


@router.get("/members/tasks/auto-ocr/metrics")
async def get_auto_ocr_metrics(db: AsyncSession = Depends(get_db)):
    total_in_review = await db.scalar(select(func.count()).select_from(MemberTask).where(MemberTask.status == 'in review'))
    auto_approved = await db.scalar(
        select(func.count()).select_from(MemberTask).where(
            MemberTask.reviewed_by == 'AUTO_OCR',
            MemberTask.status == 'rewards pending',
        )
    )
    auto_rejected = await db.scalar(
        select(func.count()).select_from(MemberTask).where(
            MemberTask.reviewed_by == 'AUTO_OCR',
            MemberTask.status == 'rejected',
        )
    )
    manual_reviewed = await db.scalar(
        select(func.count()).select_from(MemberTask).where(
            MemberTask.reviewed_at.isnot(None),
            MemberTask.reviewed_by.isnot(None),
            MemberTask.reviewed_by != 'AUTO_OCR',
        )
    )
    auto_mistakes = await db.scalar(
        select(func.count()).select_from(MemberTask).where(MemberTask.auto_mistake.is_(True))
    )

    total_in_review = int(total_in_review or 0)
    auto_approved = int(auto_approved or 0)
    auto_rejected = int(auto_rejected or 0)
    manual_reviewed = int(manual_reviewed or 0)
    auto_mistakes = int(auto_mistakes or 0)

    auto_approval_rate = (auto_approved / total_in_review) if total_in_review else 0.0
    false_positive_rate = (auto_mistakes / (auto_approved + auto_rejected)) if (auto_approved + auto_rejected) else 0.0

    return {
        "total_in_review": total_in_review,
        "auto_approved": auto_approved,
        "auto_rejected": auto_rejected,
        "manual_reviewed": manual_reviewed,
        "auto_mistakes": auto_mistakes,
        "auto_approval_rate": auto_approval_rate,
        "false_positive_rate": false_positive_rate,
    }

@router.post("/members/tasks/{task_id}/approve", response_model=MemberTaskOut)
async def approve_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    authorization: str | None = Header(default=None, alias="Authorization")
):
    """Approve a task that is in review (admin action)"""
    # Require admin authentication
    email = _jwt_email_from_auth(authorization)
    if not email:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.id == task_id)
    )
    db_task = res.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if db_task.status != 'in review':
        raise HTTPException(status_code=400, detail=f"Task is not in review status (current: {db_task.status})")
    
    db_task.status = 'rewards pending'
    db_task.reviewed_at = datetime.utcnow()
    db_task.reviewed_by = email
    try:
        await db.commit()
        await db.refresh(db_task)
        # Eagerly access member to ensure it's loaded
        _ = db_task.member
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    # Log approval
    await log_admin_activity(
        db,
        admin_email=email,
        action="task_approve",
        target_type="member_task",
        target_id=db_task.id,
        decision="approved",
        details=None,
    )
    return db_task

@router.post("/members/tasks/{task_id}/reject", response_model=MemberTaskOut)
async def reject_task(
    task_id: int,
    reason: Optional[str] = Query(None, description="Reason for rejection"),
    db: AsyncSession = Depends(get_db),
    authorization: str | None = Header(default=None, alias="Authorization")
):
    """Reject a task that is in review (admin action)"""
    # Require admin authentication
    email = _jwt_email_from_auth(authorization)
    if not email:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.id == task_id)
    )
    db_task = res.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if db_task.status != 'in review':
        raise HTTPException(status_code=400, detail=f"Task is not in review status (current: {db_task.status})")
    
    db_task.status = 'rejected'
    db_task.completed_at = None
    db_task.reviewed_at = datetime.utcnow()
    db_task.reviewed_by = email
    # Store rejection reason if provided (you may want to add a field for this)
    try:
        await db.commit()
        await db.refresh(db_task)
        # Eagerly access member to ensure it's loaded
        _ = db_task.member
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    # Log rejection
    await log_admin_activity(
        db,
        admin_email=email,
        action="task_reject",
        target_type="member_task",
        target_id=db_task.id,
        decision="rejected",
        details={"reason": reason} if reason else None,
    )
    return db_task


@router.post("/members/tasks/{task_id}/auto-mistake", response_model=MemberTaskOut)
async def mark_auto_mistake(
    task_id: int,
    body: AutoMistakeUpdate,
    db: AsyncSession = Depends(get_db),
    _admin_email: str = Depends(require_admin_email),
):
    res = await db.execute(
        select(MemberTask)
        .options(selectinload(MemberTask.member))
        .where(MemberTask.id == task_id)
    )
    db_task = res.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.auto_mistake = body.auto_mistake
    try:
        await db.commit()
        await db.refresh(db_task)
        _ = db_task.member
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {exc}")
    return db_task


# ===== Email Verification Endpoints =====

@router.post("/members/send-verification-email")
async def send_verification_email_endpoint(
    member_id: int = Body(..., embed=True),
    email: Optional[EmailStr] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    claims: dict = Depends(get_auth_claims)
):
    """Send email verification code to member's email"""
    from jbc_lg_shared.email_utils import generate_verification_code, send_verification_email
    from datetime import datetime, timezone, timedelta
    logger.info("send-verification-email body=%s claims=%s", {"member_id": member_id}, {k: claims.get(k) for k in ("sub", "typ", "exp")})
    
    # Verify token type and ownership
    if claims.get("typ") != "member":
        raise HTTPException(status_code=403, detail="Member token required")
    wallet = str(claims.get("sub") or "").lower()
    if not wallet:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    
    # Get member
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member_wallet = (member.wallet_address or "").lower()
    if not member_wallet or member_wallet != wallet:
        raise HTTPException(status_code=403, detail="Not authorized to verify this member")
    
    email_to_send: Optional[str] = None
    if email:
        email_clean = await _normalize_email_or_error(email)
        await _assert_email_available(db, email_clean, exclude_member_id=member_id)
        email_to_send = email_clean
        member.email_verification_pending = email_clean
        if member.email and member.email != email_clean:
            member.email_verified = False
            member.email_verified_at = None
    else:
        if not member.email:
            raise HTTPException(status_code=400, detail="Member has no email configured")
        email_to_send = member.email
    
    if member.email_verified:
        return {"success": True, "message": "Email already verified"}
    
    # Check if verification was sent recently (rate limiting)
    if member.email_verification_sent_at:
        time_since_last = datetime.now(timezone.utc) - member.email_verification_sent_at
        if time_since_last < timedelta(minutes=1):
            raise HTTPException(
                status_code=429, 
                detail=f"Please wait {60 - int(time_since_last.total_seconds())} seconds before requesting another code"
            )
    
    # Generate and save verification code
    verification_code = generate_verification_code(6)
    member.email_verification_code = verification_code
    member.email_verification_sent_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    # Send email
    result = send_verification_email(
        to_email=email_to_send,
        verification_code=verification_code,
        member_name=member.telegram_username
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=f"Failed to send email: {result.get('error')}")
    
    return {"success": True, "message": "Verification code sent to your email"}


@router.post("/members/verify-email")
async def verify_email_endpoint(
    member_id: int = Body(..., embed=True),
    verification_code: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    claims: dict = Depends(get_auth_claims)
):
    """Verify email with verification code"""
    from datetime import datetime, timezone, timedelta
    
    logger.info("verify-email body=%s claims=%s", {"member_id": member_id}, {k: claims.get(k) for k in ("sub", "typ", "exp")})

    # Verify token type and ownership
    if claims.get("typ") != "member":
        raise HTTPException(status_code=403, detail="Member token required")
    wallet = str(claims.get("sub") or "").lower()
    if not wallet:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    
    # Get member
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member_wallet = (member.wallet_address or "").lower()
    if not member_wallet or member_wallet != wallet:
        raise HTTPException(status_code=403, detail="Not authorized to verify this member")
    
    if member.email_verified:
        return {"success": True, "message": "Email already verified"}
    
    if not member.email_verification_code:
        raise HTTPException(status_code=400, detail="No verification code sent. Please request a code first.")
    
    # Check if code expired (15 minutes)
    if member.email_verification_sent_at:
        time_since_sent = datetime.now(timezone.utc) - member.email_verification_sent_at
        if time_since_sent > timedelta(minutes=15):
            raise HTTPException(status_code=400, detail="Verification code expired. Please request a new one.")
    
    # Verify code
    if member.email_verification_code != verification_code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Mark as verified
    if member.email_verification_pending:
        member.email = member.email_verification_pending
        member.email_verification_pending = None
    member.email_verified = True
    member.email_verified_at = datetime.now(timezone.utc)
    member.email_verification_code = None  # Clear the code
    member.email_verification_sent_at = None
    
    await db.commit()
    
    return {"success": True, "message": "Email verified successfully"}


# ===== Bot Management Endpoints (Admin only) =====

class UnflagMemberRequest(BaseModel):
    member_id: int
    reason: Optional[str] = None


class UnflagScreenshotRequest(BaseModel):
    screenshot_id: int


@router.post("/admin/members/unflag-bot")
async def unflag_member_as_bot(
    request: UnflagMemberRequest,
    db: AsyncSession = Depends(get_db),
    admin_email: str = Depends(require_admin_email)
):
    """Admin endpoint to unflag a member marked as bot"""
    from ...services.bot_detection import apply_bot_action
    
    # Get member
    result = await db.execute(select(Member).where(Member.id == request.member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Apply unquarantine action
    reason = request.reason or f"Unflagged by admin {admin_email}"
    await apply_bot_action(
        db=db,
        member_id=member.id,
        action="UNQUARANTINE",
        reason=reason,
        evidence={"unflagged_by": admin_email},
        created_by=admin_email
    )
    
    await db.commit()
    
    await log_admin_activity(
        db=db,
        admin_email=admin_email,
        action="unflag_bot",
        target_type="member",
        target_id=member.id,
        decision="unflagged",
        details={"reason": reason}
    )
    
    return {"success": True, "message": f"Member {member.id} unflagged successfully"}


@router.post("/admin/screenshots/unflag-duplicate")
async def unflag_screenshot_duplicate(
    request: UnflagScreenshotRequest,
    db: AsyncSession = Depends(get_db),
    admin_email: str = Depends(require_admin_email)
):
    """Admin endpoint to unflag a screenshot marked as duplicate"""
    
    # Get screenshot
    result = await db.execute(select(Screenshot).where(Screenshot.id == request.screenshot_id))
    screenshot = result.scalar_one_or_none()
    if not screenshot:
        raise HTTPException(status_code=404, detail="Screenshot not found")
    
    # Unflag
    screenshot.is_flagged_duplicate = False
    screenshot.duplicate_of_screenshot_id = None
    
    await db.commit()
    
    await log_admin_activity(
        db=db,
        admin_email=admin_email,
        action="unflag_screenshot",
        target_type="screenshot",
        target_id=screenshot.id,
        decision="unflagged",
        details=None
    )
    
    return {"success": True, "message": f"Screenshot {screenshot.id} unflagged successfully"}


@router.get("/admin/bot-detection/summary")
async def get_bot_detection_summary(
    db: AsyncSession = Depends(get_db),
    _admin_email: str = Depends(require_admin_email)
):
    """Get summary of bot detection stats"""
    
    query = text("""
        SELECT 
            bot_status,
            COUNT(*) as count
        FROM members
        GROUP BY bot_status
    """)
    
    result = await db.execute(query)
    status_counts = {row.bot_status: row.count for row in result}
    
    # Get recent bot events
    events_query = text("""
        SELECT 
            event_type,
            COUNT(*) as count
        FROM member_bot_events
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY event_type
    """)
    
    events_result = await db.execute(events_query)
    recent_events = {row.event_type: row.count for row in events_result}
    
    return {
        "member_status_counts": status_counts,
        "recent_events_24h": recent_events
    }


# ===== Connection Tracking Endpoint =====

class TrackConnectionRequest(BaseModel):
    os: Optional[str] = None
    browser: Optional[str] = None
    user_agent: Optional[str] = None
    fingerprint_hash: Optional[str] = None
    onboarding_hash: Optional[str] = None


@router.post("/members/{member_id}/track-connection")
async def track_member_connection(
    member_id: int,
    request: Request,
    body: TrackConnectionRequest,
    db: AsyncSession = Depends(get_db),
    member_id_from_auth: int = Depends(require_member_owns_member_id)
):
    """Track member connection for bot detection"""
    from datetime import datetime, timezone
    
    # Verify member owns this ID
    if member_id_from_auth != member_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Extract IP address from request
    ip_address = request.client.host if request.client else None
    if not ip_address and request.headers.get("x-forwarded-for"):
        ip_address = request.headers.get("x-forwarded-for").split(",")[0].strip()
    
    # Check if connection exists
    check_query = text("""
        SELECT id FROM member_connections
        WHERE member_id = :member_id
          AND os = :os
          AND browser = :browser
          AND ip_address = :ip_address
        LIMIT 1
    """)
    
    result = await db.execute(check_query, {
        "member_id": member_id,
        "os": body.os,
        "browser": body.browser,
        "ip_address": ip_address
    })
    
    existing = result.scalar_one_or_none()
    
    if existing:
        # Update last used time
        update_query = text("""
            UPDATE member_connections
            SET dt_last_used = :now,
                fingerprint_hash = COALESCE(:fingerprint_hash, fingerprint_hash),
                onboarding_hash = COALESCE(:onboarding_hash, onboarding_hash)
            WHERE id = :id
        """)
        await db.execute(update_query, {
            "id": existing,
            "now": datetime.now(timezone.utc),
            "fingerprint_hash": body.fingerprint_hash,
            "onboarding_hash": body.onboarding_hash
        })
    else:
        # Create new connection record
        insert_query = text("""
            INSERT INTO member_connections 
            (member_id, os, browser, ip_address, user_agent, fingerprint_hash, onboarding_hash, dt_created, dt_last_used)
            VALUES (:member_id, :os, :browser, :ip_address, :user_agent, :fingerprint_hash, :onboarding_hash, :now, :now)
        """)
        await db.execute(insert_query, {
            "member_id": member_id,
            "os": body.os,
            "browser": body.browser,
            "ip_address": ip_address,
            "user_agent": body.user_agent,
            "fingerprint_hash": body.fingerprint_hash,
            "onboarding_hash": body.onboarding_hash,
            "now": datetime.now(timezone.utc)
        })
    
    await db.commit()
    
    return {"success": True}