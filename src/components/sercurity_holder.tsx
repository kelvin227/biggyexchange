// filepath: [sercurity_holder.tsx](http://_vscodecontentref_/4)
"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { checkcode, sendcode, updatePassword } from "@/functions/user";
import { Key, Mail, RectangleEllipsis } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// Translation object
const translations = {
  En: {
    emailVerification: "Email Address Verification",
    verifyEmail: "verify your email address",
    verified: "Verified",
    edit: "Edit",
    loginPassword: "Login password",
    changeLoginPassword: "change your login password",
    changePassword: "Change Password",
    pinCode: "Pin Code",
    changePin: "change your pin code for transaction",
    enterVerificationCode: "Enter Verification Code",
    enterVerificationDesc: "Please enter the 6-digit verification code sent to your email address.",
    verify: "Verify",
    cancel: "Cancel",
    changePasswordTitle: "Change Password",
    changePasswordDesc: "Enter your new password below. Make sure it is strong and secure.",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordsNoMatch: "Passwords do not match",
  },
  Chi: {
    emailVerification: "電子郵件地址驗證",
    verifyEmail: "驗證您的電子郵件地址",
    verified: "已驗證",
    edit: "編輯",
    loginPassword: "登錄密碼",
    changeLoginPassword: "更改您的登錄密碼",
    changePassword: "更改密碼",
    pinCode: "PIN碼",
    changePin: "更改您的交易PIN碼",
    enterVerificationCode: "輸入驗證碼",
    enterVerificationDesc: "請輸入發送到您電子郵件地址的6位驗證碼。",
    verify: "驗證",
    cancel: "取消",
    changePasswordTitle: "更改密碼",
    changePasswordDesc: "請在下方輸入您的新密碼。請確保它足夠強且安全。",
    newPassword: "新密碼",
    confirmNewPassword: "確認新密碼",
    passwordsNoMatch: "密碼不匹配",
  }
};

export default function Security({ email, verified }: { email: string, verified: boolean }) {
    const [codeDialog, setCodeDialog] = useState<boolean>(false);
    const [changepassDialog, setchangepassDialog] = useState<boolean>(false)
    const [code, setCode] = useState<string>("")
    const [pass, setPass] = useState<string>("")
    const [confirmPass, setconfirmPass] = useState<string>("");
    const [Lang, setLang] = useState<string>("En");

    const t = translations[Lang as "En" | "Chi"];

    
    const sendCode = async () => {
        const sendVcode = await sendcode(email);
        if (sendVcode?.success) {
            toast.success(sendVcode?.message);
            setCodeDialog(true);
        } else {
            toast.error(sendVcode?.message)
        }
    }
    const handleverify = async (code: string) => {
        const verifyCode = await checkcode(email, code);
        if (verifyCode.success) {
            toast.success(verifyCode.message);
        } else {
            toast.error(verifyCode?.message);
        }
    }

    const changePassword = async(pass: string) =>{
        const changePassword = await updatePassword(email, pass)
        if(changePassword.success){
            toast.success(changePassword.message)
        }else{
            toast.error(changePassword.message)
        }
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCode(e.target.value);
    };
      const handleInputChangepass = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setPass(e.target.value);
    };
      const handleInputChangeconfirmpass = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setconfirmPass(e.target.value);
    };


    useEffect(() => {
        if (typeof window !== 'undefined') {
          const storedValue = localStorage.getItem('userLanguage');
          if (storedValue) {
            setLang(storedValue);
          }
        }
    }, []);

    return (
        <div>
            <div className={codeDialog || changepassDialog  ? "hidden" : ""}>
                <Card>
                    <div className="flex flex-box">
                        <CardContent>
                            <Mail size={50} />
                        </CardContent>
                        <div className="grid grid-box">
                            <CardTitle>{t.emailVerification}</CardTitle>
                            <CardDescription>{t.verifyEmail}</CardDescription>
                        </div>
                        <div className="absolute right-0">
                            <CardContent>
                                {verified ? <Button disabled={true}>{t.verified}</Button> : <Button onClick={sendCode}>{t.edit}</Button>}
                            </CardContent>
                        </div>
                    </div>
                </Card>

                <div className="pt-6">
                    <Card>
                        <div className="flex flex-box">
                            <CardContent>
                                <RectangleEllipsis size={50} />
                            </CardContent>
                            <div className="grid grid-box">
                                <CardTitle>{t.loginPassword}</CardTitle>
                                <CardDescription>{t.changeLoginPassword}</CardDescription>
                            </div>
                            <div className="absolute right-0">
                                <CardContent>
                                    <Button onClick={() => setchangepassDialog(true)}>{t.changePassword}</Button>
                                </CardContent>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex flex-box">
                            <CardContent>
                                <Key size={50} />
                            </CardContent>
                            <div className="grid grid-box">
                                <CardTitle>{t.pinCode}</CardTitle>
                                <CardDescription>{t.changePin}</CardDescription>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* dialog for the email verification process */}
            <div className={codeDialog ? "flex flex-col items-center justify-center min-h-[300px] light:bg-white rounded-lg shadow-lg p-8" : "hidden"}>
                <h2 className="text-xl font-bold mb-4">{t.enterVerificationCode}</h2>
                <p className="mb-4 text-gray-600 text-center">
                    {t.enterVerificationDesc}
                </p>
                <form
                    className="flex flex-col items-center gap-4 w-full max-w-xs"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await handleverify(code);
                    }}
                >
                    <input
                        type="text"
                        name="code"
                        value={code}
                        maxLength={6}
                        required
                        onChange={handleInputChange}></input>
                    <Button type="submit" className="w-full bg-blue-600 text-white rounded-md">
                        {t.verify}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setCodeDialog(false)}
                    >
                        {t.cancel}
                    </Button>
                </form>
            </div>

            {/* dialog for the Changing password process */}
            <div className={changepassDialog && !codeDialog ? "flex flex-col items-center justify-center min-h-[300px] light:bg-white rounded-lg shadow-lg p-8" : "hidden"}>
                <h2 className="text-xl font-bold mb-4">{t.changePasswordTitle}</h2>
                <p className="mb-4 text-gray-600 text-center">
                    {t.changePasswordDesc}
                </p>
                <form
                    className="flex flex-col items-center gap-4 w-full max-w-xs"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (pass !== confirmPass) {
                            toast.error(t.passwordsNoMatch);
                            return;
                        }
                        await changePassword(pass);
                        setchangepassDialog(false);
                    }}
                >
                    <input
                        type="password"
                        name="newPassword"
                        value={pass}
                        onChange={handleInputChangepass}
                        minLength={6}
                        required
                        placeholder={t.newPassword}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPass}
                        onChange={handleInputChangeconfirmpass}
                        minLength={6}
                        required
                        placeholder={t.confirmNewPassword}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button type="submit" className="w-full bg-green-600 text-white rounded-md">
                        {t.changePassword}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setchangepassDialog(false)}
                    >
                        {t.cancel}
                    </Button>
                </form>
            </div>
        </div>
    );
};