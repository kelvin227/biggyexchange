import React from "react";
//import { Payment } from "./columns";
//import { TransactionTable } from "./trans";
import { auth } from "@/auth";
import Wallet from "./wallet-holder";
import { prisma } from "@/lib/db";


export default async function Transaction() {
  ///const data = await getData();
  const session= await auth();
      const email = session?.user?.email as string;

      const user = await prisma.user.findUnique({
              where: { email },
              select: { id: true }
          });
          if (!user) {
              console.log(user)
          }          
          const wallet = await prisma.wallets.findUnique({
              where: { userId: user?.id },
              select: { address: true},
          });

 return (
<Wallet email={email} address={wallet?.address || "empty"}/>
 );
}

