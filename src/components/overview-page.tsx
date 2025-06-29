"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  BadgeCheck,
  ChevronRight,
  LayoutList,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  emailVerified?: boolean | null;
  emailVerifiedAt?: Date | null;
  kycverified?: boolean | null;
  kycverifiedAt?: Date | null;
  image?: string | null;
  updatedAt: Date;
  password: string;
  referralCode?: string | null;
  referredBy?: string | null;
  phoneNo?: string | null;
  name?: string | null;
  userName?: string | null;
  roles?: string | null;
  isBlocked?: boolean | null;
  // Relations (arrays) are omitted for simplicity, add if needed
}

// Translation object
const translations = {
  En: {
    profile: "Profile",
    security: "Security",
    kyc: "KYC",
    tasksCenter: "Tasks center",
  },
  Chi: {
    profile: "個人資料",
    security: "安全",
    kyc: "實名認證",
    tasksCenter: "任務中心",
  }
};

const Overview_page = ({email, profile}: {email: string, profile: User}) => {
    const [Lang, setLang] = useState<"En" | "Chi">("En");
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
          const storedValue = localStorage.getItem('userLanguage');
          if (storedValue === "En" || storedValue === "Chi") {
            setLang(storedValue);
          }
        }
    }, []);
    const t = translations[Lang];

  return (
    <div className="w-full">
      <div className="hover:shadow-lg hover:shadow-blue-500/50">
        <Link href={"/profile"}>
        <Card>
          <div className="flex flex box p-2">
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                <AvatarImage
                  src={profile.image || ""}
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Button>
            <div className="grid grid-box">
              <CardContent>{t.profile}</CardContent>
              <CardContent>{email}</CardContent>
            </div>
          </div>
        </Card>
        </Link>
      </div>

      <div className="flex flex-box pt-4 gap-6">
        <div className=" w-full relative hover:shadow-lg hover:shadow-blue-500/50">
          <Link href={"/profile/security"}>
            <Card className="w-full">
              <CardContent className="flex flex-box gap-2">
                <ShieldCheck />
                {t.security}
                <div className="absolute right-0">
                  <ChevronRight className="justify-end" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="w-full relative hover:shadow-lg hover:shadow-blue-500/50">
          <Link href={"/profile/user_kyc"}>
            <Card className="w-full">
              <CardContent className="flex flex-box gap-2">
                <BadgeCheck />
                {t.kyc}
                <div className="absolute right-0">
                  <ChevronRight className="justify-end" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="w-full relative hover:shadow-lg hover:shadow-blue-500/50">
          <Link href={"/profile/task"}>
            <Card className="w-full">
              <CardContent className="flex flex-box gap-2 ">
                <LayoutList />
                {t.tasksCenter}
                <div className="absolute right-0">
                  <ChevronRight className="justify-end" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Overview_page