"use client";
/* eslint-disable */
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
} from "../ui/form"; // Adjust path as needed
import { Input } from "../ui/input"; // Adjust path as needed
import { Button } from "../ui/button"; // Adjust path as needed
import { Label } from "../ui/label"; // Adjust path as needed
import { toast } from "sonner";
import { Login } from "../../../actions/authactions"; // Adjust path as needed
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// --- Data & Schemas ---

// Define the type for form field data for both sign-up and sign-in
type AuthFormFieldName = "email" | "password" | "referralCode";

interface AuthFormDataItem {
  name: AuthFormFieldName;
  type: string;
  placeHolder: string;
  label: string;
}

// Sign In Form Data
const signinFieldsEn: AuthFormDataItem[] = [
  {
    name: "email",
    type: "email",
    placeHolder: "jondo982@gmail.com",
    label: "Email",
  },
  {
    name: "password",
    type: "password",
    placeHolder: "*****",
    label: "Password",
  },
];
const signinFieldsFr: AuthFormDataItem[] = [
  {
    name: "email",
    type: "email",
    placeHolder: "jondo982@gmail.com",
    label: "E-mail",
  },
  {
    name: "password",
    type: "password",
    placeHolder: "*****",
    label: "Mot de passe",
  },
];
const signinFieldsChi: AuthFormDataItem[] = [
  {
    name: "email",
    type: "email",
    placeHolder: "jondo982@gmail.com",
    label: "电子邮件",
  },
  { name: "password", type: "password", placeHolder: "*****", label: "密码" },
];

// Sign In Zod Schema
const SignInSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: z.string(),
});

// Sidebar Data
const sidebarDataSignInPromptEn = {
  welcome: "Welcome to BiggyExchange",
  already: "Don't have an account?",
  button: "Sign Up",
};
const sidebarDataSignInPromptFr = {
  welcome: "Bienvenue sur BiggyExchange",
  already: "Vous avez déjà un compte?",
  button: "Se connecter",
};
const sidebarDataSignInPromptChi = {
  welcome: "欢迎来到 BiggyExchange",
  already: "已经有账户?",
  button: "登入",
};

// --- Auth Skeleton Component ---
const AuthSkeleton = () => (
  <div className="w-full max-w-xl flex flex-col gap-8 p-10 animate-pulse">
    <div className="flex w-full justify-between items-center">
      <div className="h-10 w-32 bg-gray-200 rounded-full" />
      <div className="h-8 w-20 bg-gray-200 rounded-full" />
    </div>
    <div className="flex flex-col gap-6">
      <div className="h-12 bg-gray-200 rounded-full" />
      <div className="h-12 bg-gray-200 rounded-full" />
      <div className="h-12 bg-gray-200 rounded-full" />
    </div>
    <div className="h-12 bg-gray-200 rounded-full" />
    <div className="flex items-center gap-2">
      <div className="h-5 w-32 bg-gray-200 rounded-full" />
    </div>
  </div>
);

// --- Password Input Helper Component ---
interface RenderPasswordInputProps {
  field: any; // Using 'any' for simplicity, ideally type with ControllerRenderProps<any, any>
  placeholder?: string;
}

const RenderPasswordInput: React.FC<RenderPasswordInputProps> = ({
  field,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...field}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className="rounded-2xl text-lg bg-black/80 border border-yellow-600 text-yellow-100 placeholder-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all p-5 shadow-sm pr-12"
      />
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

// --- Sign In Form Component ---
interface SignInFormComponentProps {
  lang: string;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isSubmitting: boolean;
}

const SignInForm: React.FC<SignInFormComponentProps> = ({
  lang,
  setIsSubmitting,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const currentSigninFields =
    lang === "En"
      ? signinFieldsEn
      : lang === "Fr"
        ? signinFieldsFr
        : lang === "Chi"
          ? signinFieldsChi
          : signinFieldsEn; // Default to English

  const handleSignIn = async (data: z.infer<typeof SignInSchema>) => {
    setIsSubmitting(true);
    const response = await Login(data.email, data.password, "user");
    setIsSubmitting(false);

    if (response.success) {
      toast.success(response.message);
      router.replace("/user_dashboard");
    } else {
      toast.error(response.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSignIn)}
        className="flex flex-col gap-8"
      >
        <h1 className="text-4xl font-bold text-yellow-400 tracking-tight drop-shadow text-center mb-2">
          {lang === "Fr" ? "Se connecter" : lang === "Chi" ? "登入" : "Sign In"}
        </h1>
        <div className="flex flex-col gap-6">
          {currentSigninFields.map((formField) => (
            <FormField
              key={`signin-${formField.name}`} // Unique key for sign-in fields
              control={form.control}
              name={formField.name as "email" | "password"} // Type assertion for schema fields
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-semibold text-yellow-300 tracking-wider">
                    {formField.label}
                  </FormLabel>
                  <FormControl>
                    {formField.type === "password" ? (
                      <RenderPasswordInput
                        field={field}
                        placeholder={formField.placeHolder}
                      />
                    ) : (
                      <Input
                        {...field}
                        type={formField.type}
                        placeholder={formField.placeHolder}
                        className="rounded-2xl text-lg bg-black/80 border border-yellow-600 text-yellow-100 placeholder-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all p-5 shadow-sm"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <Button
          size="lg"
          className="rounded-full py-5 mt-2 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2" aria-live="polite">
              <svg
                className="animate-spin h-5 w-5 text-black"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Loading...
            </span>
          ) : lang === "Fr" ? (
            "Se connecter"
          ) : lang === "Chi" ? (
            "登入"
          ) : (
            "Sign In"
          )}
        </Button>
        <Label className="text-yellow-400 text-sm text-right cursor-pointer hover:underline">
          <Link href={"/reset"}>
            {lang === "Fr"
              ? "mot de passe oublié?"
              : lang === "Chi"
                ? "忘密码"
                : "Forgot Password?"}
          </Link>
        </Label>
      </form>
    </Form>
  );
};
// --- Main AuthForm Component ---
const AuthForm = () => {
  const [lang, setLang] = useState("En");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Shared loading state for buttons

  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem("userLanguage");
      if (storedValue) {
        setLang(storedValue);
      }
    }
    const timer = setTimeout(() => setIsPageLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Determine sidebar content based on current form and language
  const sidebarContent =
    lang === "En"
      ? sidebarDataSignInPromptEn
      : lang === "Fr"
        ? sidebarDataSignInPromptFr
        : lang === "Chi"
          ? sidebarDataSignInPromptChi
          : sidebarDataSignInPromptEn; // Default to English

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-black via-zinc-900 to-yellow-900">
      {/* Left Panel */}
      <div className="relative flex-1 flex flex-col items-center justify-center mt-40 lg:mt-0 xl:mt-0 bg-gradient-to-br from-black via-zinc-900 to-yellow-900 text-yellow-300 px-8 py-16 lg:rounded-r-[3rem] shadow-2xl">
        <Image
          alt="Logo"
          src="https://ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com/BiggyExchnage%20Logo-LucbbNrqPh1QVTvE07OudDj4ugPAbQ.png"
          className="mb-6 drop-shadow-lg"
          width={96}
          height={96}
        />
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold drop-shadow text-yellow-400">
            {sidebarContent.welcome}
          </h1>
          <p className="text-lg text-yellow-200">{sidebarContent.already}</p>
          <Button
            size="lg"
            className="rounded-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black border border-yellow-400 font-semibold shadow mt-4 transition"
            variant="outline"
            onClick={() => router.push("/signUp")}
            disabled={isSubmitting} // Disable toggle button during submission
          >
            {sidebarContent.button}
          </Button>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className={clsx(
            "backdrop-blur-lg bg-black/80 border border-yellow-700 shadow-2xl rounded-3xl",
            "w-full max-w-md mx-auto flex flex-col gap-8 p-10 min-h-[500px] justify-center"
          )}
        >
          {isPageLoading ? (
            <AuthSkeleton />
          ) : (
            <SignInForm
              lang={lang}
              setIsSubmitting={setIsSubmitting}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
