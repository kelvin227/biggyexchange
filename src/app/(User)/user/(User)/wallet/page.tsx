import React from "react";
//import { Payment } from "./columns";
//import { TransactionTable } from "./trans";
import { auth } from "@/auth";
import Wallet from "../../../../../components/wallet-holder";
import { prisma } from "@/lib/db";
import { getBalance, getBnbBalance, getEthBalance, getPrice, getSolBalance, getTestEthBal } from "@/functions/blockchain/wallet.utils";


export default async function Transaction() {
    let solBalance: number | string = 0;
    let solTestNetBalance: number | string = 0;
    let solPrice: number | string = 0;
    let soltestnetPrice: number | string = 0;
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
          const solanaWallet = await prisma.solanaWallets.findUnique({
              where: { userId: user?.id },
              select: { address: true},
          });
          if (solanaWallet === null){
            console.log("no solana wallet")
          }

        const Ethbalance = await getEthBalance(wallet?.address || "");

        const testNetEthBalance = await getTestEthBal(wallet?.address || "");

        const price = await getPrice()

        const testNetEthPrice = parseFloat(testNetEthBalance.message) * price.prices?.eth;


        const EthPrice = parseFloat(Ethbalance.message) * price.prices?.eth;

        const bnbBalance = await getBnbBalance(wallet?.address || "");

        const BnbPrice = parseFloat(bnbBalance.message) * price.prices?.bnb;

        const usdtbnbBalance = await getBalance( wallet?.address || "");

        if(solanaWallet != null){
        solBalance =  await getSolBalance(solanaWallet?.address || "", "mainnet");
        solTestNetBalance = await getSolBalance(solanaWallet?.address || "", "testnet");
        solPrice = parseFloat(solBalance.toString()) * price.prices?.sol;
        soltestnetPrice = parseFloat(solTestNetBalance.toString()) * price.prices?.sol;
        }        


 return (
<Wallet 
email={email} 
address={wallet?.address || "empty"} 
solanaAddress={solanaWallet?.address || "empty"}
Ethbalance={Ethbalance.message}
bnbBalance={bnbBalance.message} 
EthPrice={EthPrice.toFixed(2)}
testNetEthBalance={testNetEthBalance.message}
testNetEthPrice={testNetEthPrice.toFixed(2)}
bnbPrice={BnbPrice.toFixed(2)}
usdtbnbBalance={usdtbnbBalance.message}
solBalance={solBalance.toString() ?? "0"}
solTestNetBalance={solTestNetBalance.toString() ?? "0"}
solPrice={solPrice.toFixed(2) || "0"}
soltestnetPrice={soltestnetPrice.toFixed(2) || "0"}
/>
 );
}

