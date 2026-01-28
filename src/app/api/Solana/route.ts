import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { createSolanaWallet } from "@/functions/blockchain/wallet.utils";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();

//follow user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, } = body;

     const existingUser = await prisma.user.findUnique({
                where: {email: email}
            })
            if(!existingUser){
                return {success: false, message: "User does not exist"}
            }

    const isMatch = bcrypt.compareSync(password, existingUser.password);
            if(!isMatch){
                return {success: false, message: "Incorrect password"}
            }

    const solanaWallet = await createSolanaWallet(password, email);

    if (!solanaWallet) {
      return NextResponse.json({ success: false, message: "Failed to create Solana wallet" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}