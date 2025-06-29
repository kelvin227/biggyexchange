"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
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
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Login, SignUp } from "../../../actions/authactions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

const formData = [
  {
    name: "email",
    type: "email",
    placeHolder: "jondoe1982@gmail.com",
    label: "email",
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
    label: "Referral Code",
  },
];
const formDataFr = [
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
const formDataChi = [
  {
    name: "email",
    type: "email",
    placeHolder: "johndoe@gmail.com",
    label: "电子邮件",
  },
  {
    name: "password",
    type: "password",
    placeHolder: "*****",
    label: "密码",
  },
  {
    name: "referralCode",
    type: "text",
    placeHolder: "输入推荐码",
    label: "推荐码",
  },
];

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  referralCode: z
  .string().min(8, "referral code must be 8 characters long")
  .regex(/^\S+$/, "Spaces are not allowed"),
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
});

const signinFormData = [
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

const signinFormDataFr = [
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
  }
]
const signinFormDataChi = [
  {
    name: "email",
    type: "email",
    placeHolder: "jondo982@gmail.com",
    label: "电子邮件",
  },
  {
    name: "password",
    type: "password",
    placeHolder: "*****",
    label: "密码",
  }
]
const sidemenudata = [
  {
    welcome: "Welcome to BiggyExchange",
    already: "Already have an account?",
    button: "Sign In",
  },
]
const sidemenudataFr = [
  {
    welcome: "Bienvenue sur BiggyExchange",
    already: "Vous avez déjà un compte?",
    button: "Se connecter",
  },
]
const sidemenudataChi = [
  {
    welcome: "欢迎来到 BiggyExchange",
    already: "已经有账户?",
    button: "登入",
  },
]

const sidemenudata2 = [
  {
    welcome: "Welcome to BiggyExchange",
    already: "Don't have an account?",
    button: "sign up",
  },
]
const sidemenudata2Fr = [
  {
    welcome: "Bienvenue sur BiggyExchange",
    already: "vous n'avez pas de compte ?",
    button: "s'inscrire",
  },
]

const sidemenudata2Chi = [
  {
    welcome: "歡迎來到 Socio",
    already: "沒有賬戶？",
    button: "報名",
  },
]
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
      <div className="h-12 bg-gray-200 rounded-full" />
    </div>
    <div className="h-12 bg-gray-200 rounded-full" />
    <div className="flex items-center gap-2">
      <div className="h-5 w-32 bg-gray-200 rounded-full" />
    </div>
  </div>
);


const AuthForm = () => {
   const [Lang, setLang] = useState('En');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      referralCode: "",
      password: "",
    },
  });

  const signinForm = useForm<z.infer<typeof SigninformSchema>>({
    resolver: zodResolver(SigninformSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const [show, setShow] = useState(true);
  const [loadAni, setloadAni] = useState(false);

  const [isClicked, SetisClicked] = useState(false);
  const handleclicked = () => {
    SetisClicked(!isClicked);
    setShow(!show);
    setloadAni(!loadAni);
  };
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine the correct signin form data based on the current language
  const signdata =
    Lang === "En"
      ? signinFormData
      : Lang === "Fr"
      ? signinFormDataFr
      : Lang === "Chi"
      ? signinFormDataChi
      : signinFormData;

      const signupdata =
    Lang === "En"
      ? formData
      : Lang === "Fr"
      ? formDataFr
      : Lang === "Chi"
      ? formDataChi
      : formData;

    const sidemenudatalang =
    Lang === "En"
      ? sidemenudata
      : Lang === "Fr"
      ? sidemenudataFr
      : Lang === "Chi"
      ? sidemenudataChi
      : sidemenudata;

      const sidemenudata2lang =
    Lang === "En"
      ? sidemenudata2
      : Lang === "Fr"
      ? sidemenudata2Fr
      : Lang === "Chi"
      ? sidemenudata2Chi
      : sidemenudata2;

  useEffect(() => {
    // Check if window is defined (i.e., we are on the client-side)
    if (typeof window !== 'undefined') {
      // Get data from local storage
      const storedValue = localStorage.getItem('userLanguage');
      if (storedValue) {
        setLang(storedValue);
        router.refresh();
      }
        }

    // Simulate page loading
    const timer = setTimeout(() => setIsPageLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [router]);
  const handleSubmitForm = async (data: z.infer<typeof formSchema>) => {
     setIsSubmitting(true);
    const response = await SignUp(
      data.email,
      data.password,
      data.referralCode as string
    );
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

  const handleSignInForm = async (data: z.infer<typeof SigninformSchema>) => {
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
  <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-black via-zinc-900 to-yellow-900">
    {/* Language Selector */}
    {/* <div className="absolute top-6 right-6 z-30">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex gap-2 items-center px-4 py-2 rounded-full bg-black/80 hover:bg-black shadow border border-yellow-600">
          <FaEarthAmericas className="text-yellow-400" />
          <FaChevronDown className="text-yellow-200" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-black border border-yellow-700">
          <DropdownMenuItem onClick={() => handleLang("En")} className="text-yellow-300 hover:bg-yellow-900/30">English</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLang("Fr")} className="text-yellow-300 hover:bg-yellow-900/30">French</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLang("Chi")} className="text-yellow-300 hover:bg-yellow-900/30">Chinese</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div> */}

    {/* Left Panel */}
    <div className="relative flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-yellow-900 text-yellow-300 px-8 py-16 lg:rounded-r-[3rem] shadow-2xl">
      <Image
        alt="Socio Logo"
        src="https://kalajtomdzamxvkl.public.blob.vercel-storage.com/logo2-6X2L1QaE3Zc3GrRsCHvW0JY0kcA7bx.png"
        className=" mb-6 drop-shadow-lg"
        width={96}
        height={96}
      />
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold drop-shadow text-yellow-400">{(show && !loadAni ? sidemenudata2lang : sidemenudatalang)[0].welcome}</h1>
        <p className="text-lg text-yellow-200">{(show && !loadAni ? sidemenudata2lang : sidemenudatalang)[0].already}</p>
        <Button
          size="lg"
          className="rounded-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black border border-yellow-400 font-semibold shadow mt-4 transition"
          variant="outline"
          onClick={handleclicked}
        >
          {(show && !loadAni ? sidemenudata2lang : sidemenudatalang)[0].button}
        </Button>
      </div>
    </div>

    {/* Right Panel (Form) */}
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className={clsx(
        "backdrop-blur-lg bg-black/80 border border-yellow-700 shadow-2xl rounded-3xl",
        "w-full max-w-md mx-auto flex flex-col gap-8 p-10 min-h-[500px] justify-center"
      )}>
        {(isPageLoading || isSubmitting) ? (
          <AuthSkeleton />
        ) : show && !loadAni ? (
          <Form {...signinForm}>
            <form onSubmit={signinForm.handleSubmit(handleSignInForm)} className="flex flex-col gap-8">
              <h1 className="text-4xl font-bold text-yellow-400 tracking-tight drop-shadow text-center mb-2">
                {Lang === "Fr" ? "Se connecter" : Lang === "Chi" ? "登入" : "Sign In"}
              </h1>
              <div className="flex flex-col gap-6">
                {signdata.map((formField, index) => (
                  <FormField
                    key={index}
                    control={signinForm.control}
                    name={(formField.name as "password") || "email"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-semibold text-yellow-300 tracking-wider">
                          {formField.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-2xl text-lg bg-black/80 border border-yellow-600 text-yellow-100 placeholder-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all p-5 shadow-sm"
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
              </div>
              <Button
                size="lg"
                className="rounded-full py-5 mt-2 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Loading...
                  </span>
                ) : (Lang === "Fr" ? "Se connecter" : Lang === "Chi" ? "登入" : "Sign In")}
              </Button>
              <Label className="text-yellow-400 text-sm text-right cursor-pointer hover:underline">
                <Link href={"/reset"}>
                  {Lang === "Fr" ? "mot de passe oublié?" : Lang === "Chi" ? "忘密码" : "Forgot Password?"}
                </Link>
              </Label>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitForm)} className="flex flex-col gap-8">
              <h1 className="text-4xl font-bold text-yellow-400 tracking-tight drop-shadow text-center mb-2">
                {Lang === "Fr" ? "s'inscrire" : Lang === "Chi" ? "報名" : "Sign Up"}
              </h1>
              <div className="flex flex-col gap-6">
                {signupdata.map((formField, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={(formField.name as "password") || "username"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-semibold text-yellow-300 tracking-wider">
                          {formField.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-2xl text-lg bg-black/80 border border-yellow-600 text-yellow-100 placeholder-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all p-5 shadow-sm"
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
              </div>
              <Button
                size="lg"
                className="rounded-full py-5 mt-2 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                type="submit"
              >
                {Lang === "Fr" ? "s'inscrire" : Lang === "Chi" ? "報名" : "Sign Up"}
              </Button>
              <Label className="flex items-center gap-2 text-yellow-400 text-sm mt-2">
                <Checkbox className="bg-black border-yellow-600" id="agree" />
                <span>
                  {Lang === "Fr"
                    ? "j'accepte les termes et conditions"
                    : Lang === "Chi"
                    ? "我同意條款和條件"
                    : "I agree to the terms and conditions"}
                </span>
              </Label>
            </form>
          </Form>
        )}
      </div>
    </div>
  </div>
);
};

export default AuthForm;
