"use client"
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { AtSign, IdCard, ScanFace, ScanQrCode, UserRound } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { User } from '@prisma/client';
import UpdateForm from './Forms/updateForm';
import PicForm from './Forms/PicForm';

// Translation object
const translations = {
  En: {
    username: "Username",
    noUsername: "You have not set a username",
    name: "Name",
    noName: "You have not set a name",
    avatar: "Avatar",
    avatarDesc: "Change your display avatar",
    whatsapp: "Whatsapp number",
    noWhatsapp: "You have not added a whatsapp number",
    invitationCode: "Invitation Code",
    invitationDesc: "Share your invitation Code to get rewards",
    copied: "Copied!",
    copy: "Copy",
    invitationLink: "Invitation Link",
    invitationLinkDesc: "Change your display user name",
  },
  Chi: {
    username: "用戶名",
    noUsername: "您尚未設置用戶名",
    name: "姓名",
    noName: "您尚未設置姓名",
    avatar: "頭像",
    avatarDesc: "更改您的顯示頭像",
    whatsapp: "Whatsapp號碼",
    noWhatsapp: "您尚未添加Whatsapp號碼",
    invitationCode: "邀請碼",
    invitationDesc: "分享您的邀請碼以獲得獎勵",
    copied: "已複製！",
    copy: "複製",
    invitationLink: "邀請鏈接",
    invitationLinkDesc: "更改您的顯示用戶名",
  }
};

export default function Profile_pageholder({user}:{user: User})  {
   const [Lang, setLang] = useState('En');
   const [copiedText, copyToClipboard] = useCopyToClipboard();
   const hasCopiedText = Boolean(copiedText);

   useEffect(() => {
      if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem('userLanguage');
        if (storedValue) {
          setLang(storedValue);
        }
      }
   }, []);

   const t = translations[Lang as "En" | "Chi"];

   return (
    <div>
      <Card>
        <div className="flex flex-box">
          <CardContent>
            <AtSign size={50} />
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>{t.username}</CardTitle>
            <CardDescription>{user?.userName || t.noUsername}</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <UpdateForm email={user?.email} field="username" />
            </CardContent>
          </div> 
        </div>
      </Card>

      <Card>
        <div className="flex flex-box">
          <CardContent>
            <IdCard size={50} />
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>{t.name}</CardTitle>
            <CardDescription>{user?.name || t.noName}</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <UpdateForm email={user?.email} field="name" />
            </CardContent>
          </div> 
        </div>
      </Card>

      <Card>
        <div className="flex flex-box">
          <CardContent>
            <UserRound size={50} />
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>{t.avatar}</CardTitle>
            <CardDescription>{t.avatarDesc}</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <PicForm email={user?.email} />
            </CardContent>
          </div> 
        </div>
      </Card>

      <Card>
        <div className="flex flex-box">
          <CardContent>
            <FaWhatsapp size={50} />
          </CardContent>
          <div className="grid grid-box">
            <CardTitle>{t.whatsapp}</CardTitle>
            <CardDescription>{user?.phoneNo || t.noWhatsapp}</CardDescription>
          </div>
          <div className="absolute right-0">
            <CardContent>
              <UpdateForm email={user?.email} field="phoneNo"/> 
            </CardContent>
          </div> 
        </div>
      </Card>

      <div className="pt-6">
        <Card>
          <div className="flex flex-box">
            <CardContent>
              <ScanFace size={50} />
            </CardContent>
            <div className="grid grid-box">
              <CardTitle>{t.invitationCode}</CardTitle>
              <CardDescription>{t.invitationDesc}</CardDescription>
            </div>
            <div className="absolute right-0">
              <CardContent>
                <div className='border-solid border-2'>
                  {user?.referralCode || "error"}
                </div>
                <Button 
                  disabled={hasCopiedText}
                  className="link"
                  onClick={() => copyToClipboard(user?.referralCode  as string)}>
                  {hasCopiedText ? t.copied : t.copy}
                </Button>
              </CardContent>
            </div> 
          </div>
        </Card>

        <Card>
          <div className="flex flex-box">
            <CardContent>
              <ScanQrCode size={50} />
            </CardContent>
            <div className="grid grid-box">
              <CardTitle>{t.invitationLink}</CardTitle>
              <CardDescription>{t.invitationLinkDesc}</CardDescription>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}