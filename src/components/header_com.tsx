"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, Wallet, BadgeCheck } from "lucide-react";
import { NavItems, NavItemsChi } from "@/app/(User)/app/(User)/user_config";
import { LogOut } from "../../actions/authactions";
import { FaEarthAmericas } from "react-icons/fa6";
import NotiBell from "./NotiBell";

// Add translation object at the top
const translations = {
  En: {
    notifications: "Notifications",
    sentYou: "@prima has sent you 3.45 Usdt. Check your available balance",
    btcLow: "Your BTC funds are running low",
    myWallet: "My Wallet",
    assets: "Assets",
    transactionHistory: "Transaction history",
    paymentSettings: "Payment settings",
    myAccount: "My Account",
    profile: "Profile",
    kyc: "KYC",
    taskCenter: "Task Center",
    security: "Security",
    support: "Support",
    logout: "Logout",
    name: "Biggy Exchange",
  },
  Chi: {
    notifications: "通知",
    sentYou: "@prima 已向您發送 3.45 USDT，請檢查您的可用餘額",
    btcLow: "您的BTC資金不足",
    myWallet: "我的錢包",
    assets: "資產",
    transactionHistory: "交易記錄",
    paymentSettings: "支付設置",
    myAccount: "我的賬戶",
    profile: "個人資料",
    kyc: "實名認證",
    taskCenter: "任務中心",
    security: "安全",
    support: "支持",
    logout: "登出",
    name: "Buggy Exchange",
  },
};

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export default function HeaderCom({ notificationIsRead, img, kyc }: { notificationIsRead:  Notification[], img: string, kyc: boolean}) {
  const [Lang, setLang] = useState("En");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if window is defined (i.e., we are on the client-side)
    if (typeof window !== "undefined") {
      // Get data from local storage
      const storedValue = localStorage.getItem("userLanguage");
      if (storedValue) {
        setLang(storedValue);
      }
    }
  }, []);
  const t = translations[Lang as "En" | "Chi"];
  const handleLang = (lang: string) => {
    setLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("userLanguage", lang);
    }
    window.location.reload();
  };

  let NavItem;
  if (Lang === "Chi") {
    NavItem = NavItemsChi;
  } else {
    NavItem = NavItems;
  }


  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 justify-between">
      <div className="flex items-center gap-4">
        <Button onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </Button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="">
            <div className="pt-4 overflow-y-auto h-fit w-full flex flex-col gap-1">
              {NavItem.map((navItem, idx) => (
                <Link
                  key={idx}
                  href={navItem.href}
                  onClick={() => setIsOpen(false)}
                  className={`h-full relative flex items-center whitespace-nowrap rounded-md ${"hover:bg-neutral-200  hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"}`}
                >
                  <div className="relative font-base text-sm py-1.5 px-2 flex flex-row items-center space-x-2 rounded-md duration-100">
                    <span>{navItem.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
          prefetch={false}
        >
          <span className="w-8 h-8 border bg-accent rounded-full">
            <Avatar>
              <AvatarImage
                src="https://ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com/android-chrome-192x192-gBKKTUt6bYkbJOjBX6mZnCbaSGhriD.png"
                alt="Socio Logo"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </span>
          <span>{t.name}</span>
        </Link>
      </div>

      <div className="ml-4 flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex gap-2 items-center">
            <FaEarthAmericas />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleLang("En")}>
              English
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => handleLang("Fr")}>French</DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => handleLang("Chi")}>
              Chinese
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          {/* eslint-disable-next-line */}
        <NotiBell tnotifications={t.notifications} tsentYou={t.sentYou} tbtcLow={t.btcLow} notification={notificationIsRead as any} />
        <BadgeCheck
          className={
            kyc
              ? "text-green-500 hidden sm:hidden md:block lg:block xlg:block"
              : "hidden sm:hidden md:block lg:block xlg:block text-red-500"
          }
        ></BadgeCheck>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Wallet />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t.myWallet}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={"/wallet"}>
              <DropdownMenuLabel className="hover:bg-gray-800">
                {t.assets}
              </DropdownMenuLabel>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={"/wallet/transaction"}>{t.transactionHistory}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={"/wallet/payment/crypto"}>{t.paymentSettings}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full "
            >
              <Avatar
                className={
                  kyc
                    ? "border-2 border-green-500 sm:border-2 sm:border-green-500 md:border-0 md:border-green-500 lg:border-0 lg:border-green-500"
                    : "border-2 border-red-500 sm:border-2 sm:border-red-500 md:border-0 md:border-red-500 lg:border-0 lg:border-red-500"
                }
              >
                <AvatarImage
                  src={img}
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t.myAccount}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile/overview">{t.profile}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={"/profile/user_kyc"}>{t.kyc}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={"/profile/task"}>{t.taskCenter}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={"/profile/security"}>{t.security}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>{t.support}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await LogOut();
              }}
            >
              {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
