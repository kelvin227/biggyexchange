import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { getPrice } from "@/functions/blockchain/wallet.utils";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const paystackurl = "https://api.paystack.co/transaction/initialize";
    let cryptoAmount;
    const rate = 1343; // Example fixed rate, replace with dynamic rate fetching logic if needed
    const body = await req.json();
    const { email, nairaAmount,cryptoType } = body;

    if (!email || !nairaAmount || !cryptoType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User does not exist" },
        { status: 404 }
      );
    }


    const conertedDollar = parseFloat(nairaAmount) / rate; // Convert Naira to USD based on rate 

    const price = await getPrice();

    if (cryptoType.toLowerCase() === "bnb"){
        cryptoAmount = price.prices?.bnb / conertedDollar
    } else if (cryptoType.toLowerCase() === "sol"){
        cryptoAmount = price.prices?.sol / conertedDollar
    } else if (cryptoType.toLowerCase() === "eth"){
        cryptoAmount = price.prices?.eth / conertedDollar
    } 

    if (!cryptoAmount) {
        console.log("Failed to calculate crypto amount");
        return NextResponse.json(
          { success: false, message: "Failed to calculate crypto amount" },
          { status: 500 }
        );
      }

    //create a transaction record in the database
    const transaction = await prisma.transaction.create({
        data:{
            userId: existingUser.id,
            cryptoType: cryptoType,
            cryptoAmount: cryptoAmount?.toString(),
            nairaAmount: nairaAmount,
            status: "pending",
        }
    })

    const response =await fetch(paystackurl, {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      amount: parseFloat(nairaAmount) * 100,
    }),
  });

  if(response.status == 200){
    const data = await response.json();
    const paymentReference = data.data.reference;
    const authorizationUrl = data.data.authorization_url;
    const accesscode = data.data.access_code;
    await prisma.transaction.update({
        where: { id: transaction.id },
        data: { PaymentReference: paymentReference }
    })

    return NextResponse.json(
        { success: true, authorizationUrl, accesscode },
        { status: 200 }
      );
  }

  console.log("Failed to initialize transaction with Paystack", await response.text());


    return NextResponse.json(
      { success: false, message: "Failed to initialize transaction" },
      { status: 500 }
    );

  } catch (error) {
    console.error("POST /api/solana error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
