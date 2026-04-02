import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, amountInNaira, PlatformReference } = body;

    if (!email || !amountInNaira || !PlatformReference) {
      console.log("missing required field")
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("fetching user from DB with email:", email)
    // Fetch user from DB
    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if (!user) {
      console.log("User not found with email:", email)
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    console.log("User found:", user.email);

    console.log("fetching user account details from DB for user id:", user.id)
    const userAccDetails = await prisma.accountDetails.findUnique({
        where: {
        userid: user.id
        }
    })

      if (!userAccDetails) {
      console.log("User account details not found for user id:", user.id)
      return NextResponse.json(
        { message: "User account details not found" },
        { status: 404 }
      );
    }

    console.log("User account details found for user id:", user.id)

    if (!userAccDetails.accountNumber || !userAccDetails.bankCode || !userAccDetails.accountName) {
      console.log("User bank details are incomplete")
      return NextResponse.json(
        { message: "User bank details are incomplete" },
        { status: 400 }
      );
    }

    const reference = uuidv4();


    console.log("Initiating transfer to user bank account:", userAccDetails.accountNumber);
    const transfer = await fetch("https://api.flutterwave.com/v3/transfers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_bank: userAccDetails.bankCode,
      account_number: userAccDetails.accountNumber,
      amount: Number(amountInNaira),
      narration: `sell payout ${PlatformReference}`,
      currency: "NGN",
      debit_currency: "NGN",
      reference, // unique reference per transfer
    }),
  });

  const data = await transfer.json();

  if (data.status !== "success") {
    console.log("Transfer initiation failed:", data.message);
    console.log("Flutterwave raw response:", JSON.stringify(data, null, 2));
    console.log("Flutterwave status:", transfer.status);
    return NextResponse.json({ error: data.message }, { status: 400 });
  }

    // save transfer info in DB
    // status may be pending / success / otp
    // await prisma.transaction.update(...)
    const updateTransaction = await prisma.transaction.update({
      where: { PlatformReference: PlatformReference },
      data: {
        PaymentReference: reference,
        status: "sending_payment",
      },
    });
    if(!updateTransaction){
      console.log("Failed to update transaction with payment reference for reference:", PlatformReference)
      return NextResponse.json(
        { message: "Failed to update transaction with payment reference" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Payment Sent successfully",
      data: data.data,
    });
  } catch (error: any) {
    console.error("Payout error:", error);
    return NextResponse.json(
      { message: error.message || "Transfer failed" },
      { status: 500 }
    );
  }
}