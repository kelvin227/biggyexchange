import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
/* eslint-disable */
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, referralCode } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and password are required.' }),
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email already in use.' }),
        { status: 409 }
      );
    }

    let referredById = null;
    if (referralCode) {
      const referredBy = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (!referredBy) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid referral code.' }),
          { status: 400 }
        );
      }
      referredById = referredBy.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        referralCode: generateUniqueReferralCode(),
        referredBy: referredById,
      },
    });

    const wallet = await createWallet(password, email);
    if (!wallet) {
      await prisma.user.delete({ where: { id: newUser.id } });
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create a wallet.' }),
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully!',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error('Sign-up error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to create user. Please try again.' }),
      { status: 500 }
    );
  }
}

function generateUniqueReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createWallet(password: string, email: string): Promise<any | null> {
  console.log(`Creating wallet for ${email}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { walletAddress: `0x${Math.random().toString(16).slice(2, 12)}` };
}
