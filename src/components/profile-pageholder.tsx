"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  AtSign,
  CalendarDays,
  IdCard,
  Link as LinkIcon,
  MapPin,
  Phone,
  ScanFace,
  UserRound,
} from "lucide-react";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { User } from "@prisma/client";
import UpdateForm from "./Forms/updateForm";
import PicForm from "./Forms/PicForm";

type ProfileUser = User & {
  country?: string | null;
  address?: string | null;
  dateOfBirth?: string | null | Date;
};

export default function ProfilePageHolder({ user }: { user: ProfileUser }) {
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const hasCopiedReferralCode = copiedText === user?.referralCode;
  const referralLink = user?.referralCode
    ? `https://biggyexchange.com/signup?ref=${user.referralCode}`
    : "";

  const hasCopiedReferralLink = copiedText === referralLink;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and referral details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Change your display avatar</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Avatar</p>
              <p className="text-sm text-muted-foreground">
                Upload a profile image for your account
              </p>
            </div>
          </div>
          <PicForm email={user?.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details used across your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ProfileRow
            icon={<AtSign className="h-5 w-5" />}
            title="Username"
            value={user?.userName || "You have not set a username"}
            action={<UpdateForm email={user?.email} field="username" />}
          />

          <ProfileRow
            icon={<IdCard className="h-5 w-5" />}
            title="Full Name"
            value={user?.name || "You have not set your full name"}
            action={<UpdateForm email={user?.email} field="name" />}
          />

          <ProfileRow
            icon={<Phone className="h-5 w-5" />}
            title="Phone Number"
            value={user?.phoneNo || "You have not added a phone number"}
            action={<UpdateForm email={user?.email} field="phoneNo" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral</CardTitle>
          <CardDescription>
            Share your referral details to invite others and earn rewards
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-start gap-3">
              <ScanFace className="mt-1 h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">Referral Code</p>
                <p className="text-sm text-muted-foreground">
                  Your personal invitation code
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-md border bg-muted px-3 py-2 text-sm font-medium">
                {user?.referralCode || "No referral code available"}
              </div>

              <Button
                variant="outline"
                disabled={!user?.referralCode || hasCopiedReferralCode}
                onClick={() => copyToClipboard(user?.referralCode as string)}
              >
                {hasCopiedReferralCode ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-start gap-3">
              <LinkIcon className="mt-1 h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">Referral Link</p>
                <p className="text-sm text-muted-foreground">
                  Share this link so new users can sign up with your referral
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-full overflow-x-auto rounded-md border bg-muted px-3 py-2 text-sm">
                {referralLink || "No referral link available"}
              </div>

              <Button
                variant="outline"
                disabled={!referralLink || hasCopiedReferralLink}
                onClick={() => copyToClipboard(referralLink)}
              >
                {hasCopiedReferralLink ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileRow({
  icon,
  title,
  value,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>

        <div className="min-w-0">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="break-words">{value}</CardDescription>
        </div>
      </div>

      <div className="shrink-0">{action}</div>
    </div>
  );
}