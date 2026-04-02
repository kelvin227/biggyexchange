import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch banks" },
        { status: 400 }
      );
    }

    const banks = data.data.map((bank: any) => ({
      name: bank.name,
      code: bank.code,
    }));

    return NextResponse.json({ banks });
  } catch (error) {
    console.error("Fetch banks error:", error);
    return NextResponse.json(
      { message: "Server error while fetching banks" },
      { status: 500 }
    );
  }
}