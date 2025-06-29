"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Translation object
const translations = {
  En: {
    referralProgram: "Referral Program",
    yourReferralCode: "Your Referral Code",
    copy: "Copy",
    copied: "Referral code copied to clipboard!",
    referredUsers: "Referred Users",
    name: "Name",
    email: "Email",
    dateReferred: "Date Referred",
    noName: "No name set",
    noReferred: "No referred users yet.",
  },
  Chi: {
    referralProgram: "推薦計劃",
    yourReferralCode: "您的推薦碼",
    copy: "複製",
    copied: "推薦碼已複製！",
    referredUsers: "已推薦用戶",
    name: "姓名",
    email: "電子郵箱",
    dateReferred: "推薦日期",
    noName: "暫無姓名",
    noReferred: "暫無被推薦用戶。",
  }
};

export default function ReferralPage({ refer, refferedUsers }: { refer: string, refferedUsers: any[] }) {
  const [Lang, setLang] = useState('En');

  const t = translations[Lang as "En" | "Chi"];

  const handleCopy = () => {
    navigator.clipboard.writeText(refer);
    alert(t.copied);
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
    <div className="max-w-4xl mx-auto p-6 light:bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">{t.referralProgram}</h1>

      {/* Referral Code Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t.yourReferralCode}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              value={refer}
              readOnly
              className="w-full light:bg-gray-100 cursor-not-allowed"
            />
            <Button onClick={handleCopy} className="bg-blue-500 text-white">
              {t.copy}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referred Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.referredUsers}</CardTitle>
        </CardHeader>
        <CardContent>
          {refferedUsers.length > 0 ? (
            <table className="min-w-full light:bg-white border border-gray-300 rounded-lg shadow-lg">
              <thead>
                <tr className="light:bg-gray-100">
                  <th className="p-4 text-left">{t.name}</th>
                  <th className="p-4 text-left">{t.email}</th>
                  <th className="p-4 text-left">{t.dateReferred}</th>
                </tr>
              </thead>
              <tbody>
                {refferedUsers.map((user, index) => (
                  <tr key={index}>
                    <td className="p-4 border-b">{!user.name ? t.noName : user.name}</td>
                    <td className="p-4 border-b">{user.email}</td>
                    <td className="p-4 border-b">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">{t.noReferred}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}