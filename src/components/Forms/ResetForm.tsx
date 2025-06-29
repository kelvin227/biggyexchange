"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
// import { Button } from '../ui/button';
import { Input } from "../ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FaChevronDown, FaEarthAmericas } from "react-icons/fa6";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { checkcode, sendcode, updatePassword } from "@/functions/user";



const signinFormData = [
    {
        name: "email",
        type: "email",
        placeHolder: "jondo982@gmail.com",
        label: "Email",
    }
];

const SigninformSchema = z.object({
    email: z.string().email("Invalid email address").trim(),
    password: z.string(),
});

// Skeleton Loader Component
const AuthSkeleton = () => (
    <div className="w-full max-w-xl flex flex-col gap-8 p-10 animate-pulse">
        <div className="flex w-full justify-between items-center">
            <div className="h-10 w-32 bg-gray-200 rounded-full" />
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="flex flex-col gap-6">
            <div className="h-12 bg-gray-200 rounded-full" />
            <div className="h-12 bg-gray-200 rounded-full" />
        </div>
    </div>
);
const SideAuthSkeleton = () => (
    <div className="flex max-w-xl w-full gap-5 flex-col justify-center bg-linear-[135deg,#f75959_0%,#f35587_100%] p-10 items-center animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-full" />
        <div className="w-60 h-10 bg-gray-200 rounded-full" />
        <div className="w-80 h-8 bg-gray-200 rounded-full" />
        <div className=" w-24 h-12 bg-gray-200 rounded-full" />
    </div>
)


const ResetForm = () => {

    const signinForm = useForm<z.infer<typeof SigninformSchema>>({
        resolver: zodResolver(SigninformSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const router = useRouter();

    const [code, setCode] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [codeshow, setCodeShow] = useState(false);
    const [changepassDialog, setchangepassDialog] = useState<boolean>(false)
    const [pass, setPass] = useState<string>("")
    const [confirmPass, setconfirmPass] = useState<string>("");

    const handleclicked = () => {
        router.replace("/auth");
    };
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Simulate page loading
        const timer = setTimeout(() => setIsPageLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleSignInForm = async (data: z.infer<typeof SigninformSchema>) => {
        setIsSubmitting(true);
        setEmail(data.email)
        const response = await sendcode(data.email);
        setIsSubmitting(false);

        if (response?.success) {
            toast.success(response.message);
            setCodeShow(true)
        } else {
            toast.error(response?.message);
        }
    };
    const handleverify = async (code: string) => {
        if (email === "") {
            toast.error("error while setting email address")
        } else {
            const verifyCode = await checkcode(email, code);
            if (verifyCode.success) {
                toast.success(verifyCode.message);
                setchangepassDialog(true);
                setCodeShow(false)
            } else {
                toast.error(verifyCode?.message);
            }
        }
    }
    const changePassword = async (pass: string) => {
        const changePassword = await updatePassword(email, pass)
        if (changePassword.success) {
            toast.success(changePassword.message)
            handleclicked();
        } else {
            toast.error(changePassword.message)
        }
    }

    const handleInputChangepass = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setPass(e.target.value);
    };
    const handleInputChangeconfirmpass = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setconfirmPass(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCode(e.target.value);
    };

    return (
        <div className="w-full max-w-xl flex flex-col-reverse lg:flex-row shadow-xl lg:max-w-6xl">
            {(isPageLoading || isSubmitting) ? (
                <AuthSkeleton />
            ) : (
                // doesnt have a motion effect
                <div className="w-full">
                    <div className={codeshow || changepassDialog ? "hidden" : "w-full"}>
                        <Form {...signinForm}>
                            <form
                                onSubmit={signinForm.handleSubmit(handleSignInForm)}
                                className="bg-white w-full flex flex-col gap-8 p-10"
                            >
                                <div className="flex w-full justify-between">
                                    <h1 className="text-4xl font-light">Reset Your Password</h1>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="flex gap-2 items-center">
                                            <FaEarthAmericas />
                                            <FaChevronDown />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>English</DropdownMenuItem>
                                            <DropdownMenuItem>French</DropdownMenuItem>
                                            <DropdownMenuItem>Chinese</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                {signinFormData.map((formField, index) => (
                                    <FormField
                                        key={index}
                                        control={signinForm.control}
                                        name={(formField.name as "password") || "email"}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-xs">
                                                    {formField.label}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="rounded-full text-md bg-gray-200/80 p-6"
                                                        type={formField.type}
                                                        placeholder={formField.placeHolder}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button
                                    size={"lg"}
                                    className="rounded-full py-6 bg-linear-[135deg,#f75959_0%,#f35587_100%] cursor-pointer"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            Loading...
                                        </span>
                                    ) : (
                                        "Send Code"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                    {/* dialog for the code verfication process */}
                    <div className={codeshow && !changepassDialog ? "flex flex-col items-center justify-center min-h-[300px] light:bg-white rounded-lg shadow-lg p-8" : "hidden"}>
                        <h2 className="text-xl font-bold mb-4">Enter Verification Code</h2>
                        <p className="mb-4 text-gray-600 text-center">
                            Please enter the 6-digit verification code sent to your email address.
                        </p>
                        <form
                            className="flex flex-col items-center gap-4 w-full max-w-xs"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                // TODO: Call your verify code function here
                                await handleverify(code);
                                // Example:
                                // const result = await verifyCode(email, code);
                                // if (result.success) { ... }
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
                                Verify
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setCodeShow(false)}
                            >
                                Cancel
                            </Button>
                        </form>
                    </div>
                    {/* dialog for the Changing password process */}
                                <div className={changepassDialog && !codeshow ? "flex flex-col items-center justify-center min-h-[300px] light:bg-white rounded-lg shadow-lg p-8" : "hidden"}>
                                    <h2 className="text-xl font-bold mb-4">Change Password</h2>
                                    <p className="mb-4 text-gray-600 text-center">
                                        Enter your new password below. Make sure it is strong and secure.
                                    </p>
                                    <form
                                        className="flex flex-col items-center gap-4 w-full max-w-xs"
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            
                                            if (pass !== confirmPass) {
                                                toast.error("Passwords do not match");
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
                                            placeholder="New Password"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={confirmPass}
                                            onChange={handleInputChangeconfirmpass}
                                            minLength={6}
                                            required
                                            placeholder="Confirm New Password"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Button type="submit" className="w-full bg-green-600 text-white rounded-md">
                                            Change Password
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setchangepassDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </form>
                                </div>
                </div>

            )}

            {(isPageLoading || isSubmitting) ? (
                <SideAuthSkeleton />
            ) : (
                <div className="flex text-white w-full gap-5 flex-col justify-center bg-linear-[135deg,#f75959_0%,#f35587_100%] p-10 items-center">
                    <Image
                        src="https://kalajtomdzamxvkl.public.blob.vercel-storage.com/logo2-6X2L1QaE3Zc3GrRsCHvW0JY0kcA7bx.png"
                        className="w-24 h-24"
                        alt="Socio Logo"
                        width={24}
                        height={24}
                    />
                    <h1 className="text-3xl text-center font-bold">Welcome to Socio</h1>
                    <p>Have you Remembered Your password?</p>
                    <Button
                        size={"lg"}
                        className="rounded-full bg-transparent hover:text-red-500"
                        variant={"outline"}
                        onClick={handleclicked}
                    >
                        Go Back
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ResetForm;
