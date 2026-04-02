// app/api/bank/resolve/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accountNumber, bankCode } = await req.json();

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { message: "Account number and bank code are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/accounts/resolve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_number: accountNumber,
          account_bank: bankCode
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { message: data.message || "Could not resolve account" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      accountName: data.data.account_name,
      accountNumber: data.data.account_number,
    });
  } catch (error) {
    console.error("Resolve account error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}