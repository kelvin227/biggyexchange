"use client"
import type { PutBlobResult } from '@vercel/blob';
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitKyc } from '@/functions/user';
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle } from "lucide-react";

// Translation object
const translations = {
  En: {
    kycVerification: "KYC Verification",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    country: "Country",
    selectCountry: "Select your country",
    idCardNumber: "ID Card Number",
    idCardNumberPlaceholder: "Enter your ID card number",
    uploadFront: "Upload ID Card (Front)",
    uploadBack: "Upload ID Card (Back)",
    submit: "Submit KYC",
    submitting: "Submitting...",
    kycApproved: "KYC Approved",
    kycApprovedMsg: "Congratulations, {name}! Your KYC verification has been successfully approved.",
    kycApprovedDesc: "You can now access all the features and services available on our platform. Thank you for verifying your identity.",
    kycPending: "KYC Pending",
    kycPendingMsg: "Thank you, {name}, for submitting your KYC details. Your verification is currently under review.",
    kycPendingDesc: "Please allow up to 48 hours for the verification process to complete. We will notify you once your KYC has been approved.",
    kycRejected: "KYC Rejected",
    kycRejectedMsg: "Sorry, {name}. Your KYC verification has been rejected.",
    kycRejectedDesc: "Please review your submitted details and try again. If you need assistance, contact our support team.",
    resubmit: "Resubmit KYC",
    requiredFullName: "Full name is required",
    requiredCountry: "Country is required",
    requiredIdCard: "ID card number is required",
    requiredFront: "No front ID card file selected",
    requiredBack: "No back ID card file selected",
    uploadFrontFailed: "Failed to upload front ID card",
    uploadBackFailed: "Failed to upload back ID card",
  },
  Chi: {
    kycVerification: "KYC 審核",
    fullName: "姓名",
    fullNamePlaceholder: "請輸入您的姓名",
    country: "國家",
    selectCountry: "選擇您的國家",
    idCardNumber: "身份證號碼",
    idCardNumberPlaceholder: "請輸入您的身份證號碼",
    uploadFront: "上傳身份證（正面）",
    uploadBack: "上傳身份證（背面）",
    submit: "提交 KYC",
    submitting: "提交中...",
    kycApproved: "KYC 已通過",
    kycApprovedMsg: "恭喜，{name}！您的 KYC 審核已成功通過。",
    kycApprovedDesc: "您現在可以使用我們平台上的所有功能和服務。感謝您的身份驗證。",
    kycPending: "KYC 審核中",
    kycPendingMsg: "感謝您，{name}，提交 KYC 資料。您的審核正在進行中。",
    kycPendingDesc: "請耐心等待最多 48 小時完成審核。我們會在 KYC 通過後通知您。",
    kycRejected: "KYC 未通過",
    kycRejectedMsg: "很抱歉，{name}，您的 KYC 審核未通過。",
    kycRejectedDesc: "請檢查您的資料並重新提交。如需協助，請聯繫客服。",
    resubmit: "重新提交 KYC",
    requiredFullName: "姓名為必填項",
    requiredCountry: "國家為必選項",
    requiredIdCard: "身份證號碼為必填項",
    requiredFront: "請選擇身份證正面照片",
    requiredBack: "請選擇身份證背面照片",
    uploadFrontFailed: "上傳身份證正面失敗",
    uploadBackFailed: "上傳身份證背面失敗",
  }
};

function getText(
  t: Record<string, string>,
  key: string,
  params?: Record<string, string>
) {
  let text = t[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}

export default function KycPageholder ({email, kycss}: {email: string, kycss: string}) {
  const [Lang, setLang] = useState('En');
  const t = translations[Lang as "En" | "Chi"];
  const idCardFrontRef = useRef<HTMLInputElement>(null);
  const idCardBackRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [kycApproved, setKycApproved] = useState(false);
  const [kycPending, setKycPending] = useState(false);
  const [kycRejected, setKycRejected] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    country: "",
    idCardNumber: "",
    idCardFront: null,
    idCardBack: null,
  });

  useEffect(() => {
    if (kycss === "approved") {
      setKycApproved(true);
    } else if (kycss === "pending") {
      setKycPending(true);
    } else if (kycss === "rejected") {
      setKycRejected(true);
    }
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('userLanguage');
      if (storedValue) {
        setLang(storedValue);
      }
    }
  }, [kycss]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "idCardFront" | "idCardBack") => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form fields
    if (!formData.fullName.trim()) {
      toast(getText(t, "requiredFullName"));
      setIsLoading(false);
      return;
    }
    if (!formData.country) {
      toast(getText(t, "requiredCountry"));
      setIsLoading(false);
      return;
    }
    if (!formData.idCardNumber.trim()) {
      toast(getText(t, "requiredIdCard"));
      setIsLoading(false);
      return;
    }

    try {
      // Upload front ID card
      if (!idCardFrontRef.current?.files) {
        throw new Error(getText(t, "requiredFront"));
      }
      const frontFile = idCardFrontRef.current.files[0];
      const frontResponse = await fetch(`/api/kyc?filename=${frontFile.name}`, {
        method: "POST",
        body: frontFile,
      });
      if (!frontResponse.ok) {
        throw new Error(getText(t, "uploadFrontFailed"));
      }
      const newBlobFront = (await frontResponse.json()) as PutBlobResult;

      // Upload back ID card
      if (!idCardBackRef.current?.files) {
        throw new Error(getText(t, "requiredBack"));
      }
      const backFile = idCardBackRef.current.files[0];
      const backResponse = await fetch(`/api/kyc?filename=${backFile.name}`, {
        method: "POST",
        body: backFile,
      });
      if (!backResponse.ok) {
        throw new Error(getText(t, "uploadBackFailed"));
      }
      const newBlobBack = (await backResponse.json()) as PutBlobResult;
      // Submit KYC details
      const response = await SubmitKyc(
        email,
        formData.fullName,
        formData.country,
        formData.idCardNumber,
        newBlobFront.url,
        newBlobBack.url
      );

      if (response.success) {
        toast.success(response.message);
        setKycPending(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (kycApproved) {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-50 border border-green-300 shadow-lg rounded-lg text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold text-green-700 mb-2">{t.kycApproved}</h1>
        <p className="text-gray-700 mb-4">
          {getText(t, "kycApprovedMsg", { name: formData.fullName || "" })}
        </p>
        <p className="text-gray-600">
          {t.kycApprovedDesc}
        </p>
      </div>
    );
  }

  if (kycPending) {
    return (
      <div className="max-w-md mx-auto p-6 bg-yellow-50 border border-yellow-300 shadow-lg rounded-lg text-center">
        <div className="flex justify-center mb-4">
          <Clock className="text-yellow-500 w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold text-yellow-700 mb-2">{t.kycPending}</h1>
        <p className="text-gray-700 mb-4">
          {getText(t, "kycPendingMsg", { name: formData.fullName || "" })}
        </p>
        <p className="text-gray-600">
          {t.kycPendingDesc}
        </p>
      </div>
    );
  }

  if (kycRejected) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-300 shadow-lg rounded-lg text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="text-red-500 w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold text-red-700 mb-2">{t.kycRejected}</h1>
        <p className="text-gray-700 mb-4">
          {getText(t, "kycRejectedMsg", { name: formData.fullName || "" })}
        </p>
        <p className="text-gray-600 mb-6">
          {t.kycRejectedDesc}
        </p>
        <Button
          onClick={() => {
            setKycRejected(false);
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded-md"
        >
          {t.resubmit}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 light:bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">{t.kycVerification}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="block text-sm font-medium light:text-gray-700">
            {t.fullName}
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder={t.fullNamePlaceholder}
            value={formData.fullName}
            onChange={handleInputChange}
            className="mt-1 block w-full"
            required
          />
        </div>

        {/* Country */}
        <div>
          <Label htmlFor="country" className="block text-sm font-medium light:text-gray-700">
            {t.country}
          </Label>
          <Select
            value={formData.country}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
          >
            <SelectTrigger className="mt-1 block w-full">
              <SelectValue placeholder={t.selectCountry} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nepal">Nepal</SelectItem>
              <SelectItem value="China">China</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Vietnam">Vietnam</SelectItem>
              <SelectItem value="US">US</SelectItem>
              <SelectItem value="UK">UK</SelectItem>
              <SelectItem value="Japan">Japan</SelectItem>
              <SelectItem value="Pakistan">Pakistan</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="Nigeria">Nigeria</SelectItem>
              <SelectItem value="Bangladesh">Bangladesh</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ID Card Number */}
        <div>
          <Label htmlFor="idCardNumber" className="block text-sm font-medium light:text-gray-700">
            {t.idCardNumber}
          </Label>
          <Input
            id="idCardNumber"
            name="idCardNumber"
            type="text"
            placeholder={t.idCardNumberPlaceholder}
            value={formData.idCardNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full"
            required
          />
        </div>

        {/* ID Card Front Image */}
        <div>
          <Label htmlFor="idCardFront" className="block text-sm font-medium light:text-gray-700">
            {t.uploadFront}
          </Label>
          <Input
            id="idCardFront"
            name="idCardFront"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "idCardFront")}
            className="mt-1 block w-full"
            ref={idCardFrontRef}
            required
          />
        </div>

        {/* ID Card Back Image */}
        <div>
          <Label htmlFor="idCardBack" className="block text-sm font-medium light:text-gray-700">
            {t.uploadBack}
          </Label>
          <Input
            id="idCardBack"
            name="idCardBack"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "idCardBack")}
            ref={idCardBackRef}
            className="mt-1 block w-full"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-md" disabled={isLoading}>
            {isLoading ? t.submitting : t.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}