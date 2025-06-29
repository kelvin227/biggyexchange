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
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Login } from "../../../actions/authactions";
import { useRouter } from "next/navigation";
import Image from "next/image";


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

const SigninformSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: z.string(),
});

const AdminForm = () => {
  const [pageLoading, setPageLoading] = useState(true);
const [btnLoading, setBtnLoading] = useState(false);

useEffect(() => {
  // Simulate loading, replace with real data fetching if needed
  const timer = setTimeout(() => setPageLoading(false), 1200);
  return () => clearTimeout(timer);
}, []);

  const signinForm = useForm<z.infer<typeof SigninformSchema>>({
    resolver: zodResolver(SigninformSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

 
  const handleSignInForm = async (data: z.infer<typeof SigninformSchema>) => {
    setBtnLoading(true);
    const response = await Login(data.email, data.password, "admin");
    setBtnLoading(false);
  
    if (response.success) {
      toast.success(response.message);
      router.replace("/dashboard");
    } else {
      toast.error(response.message);
    }
  };

  return pageLoading ? (
    <Skeleton />
  ) : (
    <div className="w-full max-w-xl flex flex-col-reverse lg:flex-row shadow-xl lg:max-w-6xl">
      <Form {...signinForm}>
        <form
          onSubmit={signinForm.handleSubmit(handleSignInForm)}
          className="bg-white w-full flex flex-col gap-8 p-10"
        >
          <div className="flex w-full justify-between">
            <h1 className="text-4xl font-light">Sign In</h1>
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
            className="rounded-full py-6 bg-linear-[135deg,#f75959_0%,#f35587_100%] cursor-pointer flex items-center justify-center"
            type="submit"
            disabled={btnLoading}
          >
            {btnLoading ? (
              <svg className="animate-spin h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : null}
            {btnLoading ? "Signing In..." : "Sign In"}
          </Button>
          <Label className="text-pink-500">
            <Checkbox className="bg-gray-100" id="agree" />
            <span>Remember Me</span>
          </Label>
        </form>
      </Form>

      <div className="flex text-white w-full gap-5 flex-col justify-center bg-linear-[135deg,#f75959_0%,#f35587_100%] p-10 items-center">
        <Image
          alt="logo"
          src="https://kalajtomdzamxvkl.public.blob.vercel-storage.com/logo2-6X2L1QaE3Zc3GrRsCHvW0JY0kcA7bx.png"
          className="w-24 h-24"
          width={24}
          height={24}
        />
        <h1 className="text-3xl text-center font-bold">Welcome to Socio</h1>
        <p></p>
      </div>
    </div>
  );
};

function Skeleton() {
  return (
    <div className="w-full max-w-xl flex flex-col-reverse lg:flex-row shadow-xl lg:max-w-6xl animate-pulse">
      <div className="bg-white w-full flex flex-col gap-8 p-10">
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="h-14 bg-gray-200 rounded-full mb-4" />
        <div className="h-14 bg-gray-200 rounded-full mb-4" />
        <div className="h-14 bg-gray-200 rounded-full mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="flex text-white w-full gap-5 flex-col justify-center bg-gradient-to-br from-[#f75959] to-[#f35587] p-10 items-center">
        <div className="w-24 h-24 bg-gray-300 rounded-full mb-4" />
        <div className="h-8 bg-gray-300 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );
}

export default AdminForm;
