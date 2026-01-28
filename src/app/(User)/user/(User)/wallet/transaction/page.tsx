import React from "react";
import { TransactionTable } from "./trans";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export default async function Transaction() {
const session= await auth();
      const email = session?.user?.email as string;

      const user = await prisma.user.findUnique({
              where: { email },
              select: { id: true }
          });
          if (!user) {
              console.log("error: User not found");
          }
          
          const wallet = await prisma.wallets.findUnique({
              where: { userId: user?.id },
              select: { address: true},
          });
          if(!wallet){
            console.log("error: Wallet not found");
          }

 return (
<TransactionTable address={wallet?.address as string} email={email} id={user?.id as string}/>
 );
}
