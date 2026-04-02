import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, accountName, bankName, accountNumber, bankCode } =
      await req.json();

    if (!userId || !accountName || !bankName || !accountNumber || !bankCode) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const saved = await prisma.accountDetails.upsert({
      where: { userid: userId },
      update: {
        accountName,
        bankName,
        accountNumber,
        bankCode,
      },
      create: {
        userid: userId,
        accountName,
        bankName,
        accountNumber,
        bankCode,
      },
    });

    return NextResponse.json({
      message: "Bank details saved successfully",
      data: saved,
    });
  } catch (error: any) {
    console.error("Save account details error:", error);
    return NextResponse.json(
      { message: error.message || "Server error while saving account details" },
      { status: 500 }
    );
  }
}