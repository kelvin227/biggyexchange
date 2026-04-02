"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { checkcode, sendcode, updatePassword } from "@/functions/user";
import { KeyRound, Mail, ShieldCheck, LockKeyhole, Router } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Security({
  email,
  verified,
}: {
  email: string;
  verified: boolean;
}) {
  const [codeDialog, setCodeDialog] = useState(false);
  const [changePassDialog, setChangePassDialog] = useState(false);
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const router = useRouter();

  const sendCode = async () => {
    const sendVcode = await sendcode(email);

    if (sendVcode?.success) {
      toast.success(sendVcode.message);
      setCodeDialog(true);
    } else {
      toast.error(sendVcode?.message);
    }
  };

  const handleVerify = async () => {
    const verifyCode = await checkcode(email, code);

    if (verifyCode.success) {
      toast.success(verifyCode.message);
      setCodeDialog(false);
      router.refresh();
    } else {
      toast.error(verifyCode?.message);
    }
  };

  const handleChangePassword = async () => {
    if (pass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    const response = await updatePassword(email, pass);

    if (response.success) {
      toast.success(response.message);
      setChangePassDialog(false);
      setPass("");
      setConfirmPass("");
    } else {
      toast.error(response.message);
    }
  };

  const resetDialogs = () => {
    setCodeDialog(false);
    setChangePassDialog(false);
    setCode("");
    setPass("");
    setConfirmPass("");
  };

  return (
    <div className="w-full space-y-6">
      {!codeDialog && !changePassDialog && (
        <>
          <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold">Security Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your account verification, password, and transaction
                  security.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                    <Mail className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      Email Address Verification
                    </CardTitle>
                    <CardDescription>
                      Verify your email address to secure your account.
                    </CardDescription>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>

                <div>
                  {verified ? (
                    <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Verified
                    </div>
                  ) : (
                    <Button onClick={sendCode}>Verify Email</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                    <LockKeyhole className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <CardTitle className="text-base">Login Password</CardTitle>
                    <CardDescription>
                      Change your login password to keep your account safe.
                    </CardDescription>
                  </div>
                </div>

                <Button onClick={() => setChangePassDialog(true)}>
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <KeyRound className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <CardTitle className="text-base">Pin Code</CardTitle>
                    <CardDescription>
                      Manage your transaction pin for extra protection.
                    </CardDescription>
                  </div>
                </div>

                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {codeDialog && (
        <div className="mx-auto max-w-md rounded-2xl border bg-background p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Enter Verification Code</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please enter the 6-digit verification code sent to your email
              address.
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await handleVerify();
            }}
          >
            <input
              type="text"
              name="code"
              value={code}
              maxLength={6}
              required
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-lg tracking-[0.3em] outline-none transition focus:ring-2 focus:ring-primary"
            />

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full">
                Verify
              </Button>
              <Button type="button" variant="outline" onClick={resetDialogs}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {changePassDialog && !codeDialog && (
        <div className="mx-auto max-w-md rounded-2xl border bg-background p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Change Password</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your new password below. Make sure it is strong and secure.
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await handleChangePassword();
            }}
          >
            <input
              type="password"
              name="newPassword"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              minLength={6}
              required
              placeholder="New Password"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
            />

            <input
              type="password"
              name="confirmPassword"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              minLength={6}
              required
              placeholder="Confirm New Password"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
            />

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full">
                Update Password
              </Button>
              <Button type="button" variant="outline" onClick={resetDialogs}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}