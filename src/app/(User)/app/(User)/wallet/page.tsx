import React from "react";
//import { Payment } from "./columns";
//import { TransactionTable } from "./trans";
import { auth } from "@/auth";
import Wallet from "./wallet-holder";
import { prisma } from "@/lib/db";
import { getBalance, getBnbBalance, getEthBalance, getPrice } from "@/functions/blockchain/wallet.utils";


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

        const Ethbalance = await getEthBalance(wallet?.address || "");

        const price = await getPrice()


        const EthPrice = parseInt(Ethbalance.message) * price.prices?.eth;

        const bnbBalance = await getBnbBalance(wallet?.address || "");

        const BnbPrice = parseFloat(bnbBalance.message) * price.prices?.bnb;

        const usdtbnbBalance = await getBalance( wallet?.address || "");


          


 return (
<Wallet 
email={email} 
address={wallet?.address || "empty"} 
Ethbalance={Ethbalance.message}
bnbBalance={bnbBalance.message} 
EthPrice={EthPrice.toFixed(2)}
bnbPrice={BnbPrice.toFixed(2)}
usdtbnbBalance={usdtbnbBalance.message}
/>
 );
}

