import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from "bcryptjs"
import crypto from "crypto";
import { prisma } from "@/lib/db";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hashPassword(password: string){
  const saltRound = 10
  const salt = bcrypt.genSaltSync(saltRound);
  const hash = bcrypt.hashSync(password, salt);

  return hash
}
export function generateReferralCode(length = 8) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}
export function stripAppSubdomain(host: string): string {
  // Remove port if present
  const [hostname, port] = host.split(':');

  // If hostname starts with "app.", remove it
  const stripped = hostname.startsWith('app.') ? hostname.slice(4) : hostname;

  // Return the modified host (with port if present)
  return port ? `${stripped}:${port}` : stripped;
}

export function generateVerificationCode(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}


export function createWebhookHash(data: {
  provider: string;
  txHash?: string | null;
  eventType: string;
  chainId?: string | null;
}) {
  const base = `${data.provider}:${data.txHash ?? ""}:${data.eventType}:${data.chainId ?? ""}`;

  return crypto.createHash("sha256").update(base).digest("hex");
}

export async function generateIssueNumberTx(tx:typeof prisma | any) {
  const year = new Date().getFullYear();

  const counter = await tx.issueCounter.upsert({
    where: { year },
    update: {
      lastValue: {
        increment: 1,
      },
    },
    create: {
      year,
      lastValue: 1,
    },
  });

  const paddedNumber = String(counter.lastValue).padStart(4, "0");

  return `BGX-${year}-${paddedNumber}`;
}