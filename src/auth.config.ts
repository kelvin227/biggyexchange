import Credentials from "next-auth/providers/credentials";
import { generateReferralCode, hashPassword } from "./lib/utils";
import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";
import { NextAuthConfig } from "next-auth";

const providers = [
    Credentials({
    name: "credentials",
    credentials: {
        email: {label: "Email", type: "email"},
        referralCode: {label: "Referral Code", type: "text"},
        password: {label: "Password", type: "password"},
    },
    authorize: async (credentials) => {
        
        if (!credentials?.email || !credentials?.password){
            return null
        };

        const password = credentials.password as string
        const email =  credentials.email as string
        const hashedPassword = hashPassword(password);

        // check for existing user
        let user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });

        if(!user) {
            let referredBy;
            if (credentials?.referralCode){
            referredBy = await prisma.user.findUnique({
                where: {referralCode: credentials?.referralCode as string}
            })
            if (!referredBy){
                return null
            }
        }
            const newreferralCode = generateReferralCode()
            user = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    referralCode: newreferralCode,
                    referredBy: referredBy?.referralCode
                }
            })
        } else {
            const isMatch = bcrypt.compareSync(password, user.password)
            if (!isMatch){
                return null
            }
        }

        return user
        
        
    }

})]

export const authConfig = {
    providers: providers,
} satisfies NextAuthConfig