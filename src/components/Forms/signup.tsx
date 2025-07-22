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
import { Checkbox } from "../ui/checkbox"; // Adjust path as needed
import { toast } from "sonner";
import { SignUp } from "../../../actions/authactions"; // Adjust path as needed
import { useRouter } from "next/navigation";
import Image from "next/image";
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

// Sign Up Form Data
const signupFieldsEn: AuthFormDataItem[] = [
  {
    name: "email",
    type: "email",
    placeHolder: "jondoe1982@gmail.com",
    label: "Email",
  },
  {
    name: "password",
    type: "password",
    placeHolder: "*****",
    label: "Password",
  },
  {
    name: "referralCode",
    type: "text",
    placeHolder: "Enter referral code",
    label: "Referral Code(optional)",
  },
];
const signupFieldsFr: AuthFormDataItem[] = [
  {
    name: "email",
    type: "email",
    placeHolder: "johndoe24@gmai.com",
    label: "E-mail",
  },
  {
    name: "password",
    type: "password",
    placeHolder: "*****",
    label: "Mot de passe",
  },
  {
    name: "referralCode",
    type: "text",
    placeHolder: "Entrez le code de parrainage",
    label: "Code de parrainage",
  },
];
const signupFieldsChi: AuthFormDataItem[] = [
  {
    name: "email",
    type: "email",
    placeHolder: "johndoe@gmail.com",
    label: "电子邮件",
  },
  { name: "password", type: "password", placeHolder: "*****", label: "密码" },
  {
    name: "referralCode",
    type: "text",
    placeHolder: "输入推荐码",
    label: "推荐码",
  },
];

// Sign Up Zod Schema
const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  referralCode: z.string(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must not exceed 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

const sidebarDataSignUpPromptEn = {
  welcome: "Welcome to BiggyExchange",
  already: "Already have an account?",
  button: "Sign In",
};
const sidebarDataSignUpPromptFr = {
  welcome: "Bienvenue sur BiggyExchange",
  already: "Vous n'avez pas de compte ?",
  button: "S'inscrire",
};
const sidebarDataSignUpPromptChi = {
  welcome: "歡迎來到 Socio",
  already: "沒有賬戶？",
  button: "報名",
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

// --- Sign Up Form Component ---
interface SignUpFormComponentProps {
  lang: string;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isSubmitting: boolean;
}

const SignUpForm: React.FC<SignUpFormComponentProps> = ({
  lang,
  setIsSubmitting,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      referralCode: "",
      password: "",
      agreeToTerms: false,
    },
  });

  const router = useRouter();

  const currentSignupFields =
    lang === "En"
      ? signupFieldsEn
      : lang === "Fr"
        ? signupFieldsFr
        : lang === "Chi"
          ? signupFieldsChi
          : signupFieldsEn; // Default to English

  const handleSignUp = async (data: z.infer<typeof SignUpSchema>) => {
    setIsSubmitting(true);
    const response = await SignUp(data.email, data.password, data.referralCode);
    setIsSubmitting(false);

    if (response.success) {
      toast(response.message, {
        className: "bg-green-500 text-white",
      });
      router.replace("/user_dashboard");
    } else {
      toast(response.message, {
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSignUp)}
        className="flex flex-col gap-8"
      >
        <h1 className="text-4xl font-bold text-yellow-400 tracking-tight drop-shadow text-center mb-2">
          {lang === "Fr" ? "S'inscrire" : lang === "Chi" ? "報名" : "Sign Up"}
        </h1>
        <div className="flex flex-col gap-6">
          {currentSignupFields.map((formField) => (
            <FormField
              key={`signup-${formField.name}`} // Unique key for sign-up fields
              control={form.control}
              name={formField.name} // Directly use formField.name
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
                        className="rounded-2xl text-lg bg-black/80 border border-yellow-600 text-yellow-100 placeholder-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all p-5 shadow-sm"
                        type={formField.type}
                        placeholder={formField.placeHolder}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          {/* Terms and Conditions Checkbox */}
          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({
              field,
            }: {
              field: import("react-hook-form").ControllerRenderProps<
                z.infer<typeof SignUpSchema>,
                "agreeToTerms"
              >;
            }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="bg-black border-yellow-600"
                    id="agree"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel
                    htmlFor="agree"
                    className="text-yellow-400 text-sm cursor-pointer"
                  >
                    {lang === "Fr"
                      ? "j'accepte les termes et conditions"
                      : lang === "Chi"
                        ? "我同意條款和條件"
                        : "I agree to the terms and conditions"}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
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
            "S'inscrire"
          ) : lang === "Chi" ? (
            "報名"
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
    </Form>
  );
};

// --- Main AuthForm Component ---
const SignUpPage = () => {
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
      ? sidebarDataSignUpPromptEn
      : lang === "Fr"
        ? sidebarDataSignUpPromptFr
        : lang === "Chi"
          ? sidebarDataSignUpPromptChi
          : sidebarDataSignUpPromptEn; // Default to English
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-black via-zinc-900 to-yellow-900">
      {/* Left Panel */}
      <div className="relative flex-1 flex flex-col items-center justify-center mt-50 lg:mt-0 xl:mt-0 bg-gradient-to-br from-black via-zinc-900 to-yellow-900 text-yellow-300 px-8 py-16 lg:rounded-r-[3rem] shadow-2xl">
        <Image
          alt="Logo"
          src="https://ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com/BiggyExchnage%20Logo-LucbbNrqPh1QVTvE07OudDj4ugPAbQ.png"
          className="mb-6 drop-shadow-lg"
          width={120}
          height={120}
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
            onClick={() => router.push("/auth")}
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
            <SignUpForm
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

export default SignUpPage;
