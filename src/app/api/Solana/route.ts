import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { createSolanaWallet } from "@/functions/blockchain/wallet.utils";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User does not exist" },
        { status: 404 }
      );
    }

    const isMatch = bcrypt.compareSync(password, existingUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 401 }
      );
    }

    const solanaWallet = await createSolanaWallet(password, email);
    if (!solanaWallet) {
      return NextResponse.json(
        { success: false, message: "Failed to create Solana wallet" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/solana error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
