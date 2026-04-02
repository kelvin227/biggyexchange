// this route should first retrieve the transaction record using the paltformReference then send the required amount of crypto to the admin wallet
// while it wait for the transaction to be completed
// once the transaction is confirmed and conpleted the update the transaction status to crypto_sent

import { prisma } from "@/lib/db";
import { getAdminWalletByCoin } from "../../../../../actions/admiondashboardaction";
import { sendtestEth } from "@/functions/blockchain/wallet.utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { PlatformReference } = body;

    if (!PlatformReference) {
      console.log("Missing required fields platformReference");
      return Response.json(
        { message: "Missing required fields platformReference" },
        { status: 400 },
      );
    }

    console.log("Retrieving transaction with reference:", PlatformReference);
    const getTransaction = await prisma.transaction.findUnique({
      where: { PlatformReference },
      include: { User: { include: { wallet: true } } },
    });
    if (!getTransaction) {
      console.log("Transaction not found for reference:", PlatformReference);
      return Response.json(
        { message: "Transaction not found" },
        { status: 404 },
      );
    }
    console.log("Transaction found:", getTransaction);


    //once the transaction is found then send crypto amount to admin wallet
    console.log("getting admin crypto wallet address for coin:", getTransaction.cryptoType);
    const getadminCryptoWallet = await getAdminWalletByCoin(getTransaction.cryptoType);

    if(!getadminCryptoWallet){
      console.log("Admin wallet not found for coin:", getTransaction.cryptoType);
         return Response.json(
        { message: "Failed to retrieve admin wallet please try again later" },
        { status: 404 },
      );
    }
    console.log("Admin wallet retrieved:", getadminCryptoWallet.walletAddress);


    console.log("sending crypto to admin wallet");
    const sendCrypto = await sendtestEth(getTransaction.cryptoAmount, getadminCryptoWallet.walletAddress as string, getTransaction.User.email);

    if(sendCrypto.success == false){
      console.log("Failed to send crypto to admin wallet");
        return Response.json(
            { message: sendCrypto.message },
            { status: 500 },
      );
    }
    console.log("Crypto sent to admin wallet");

    //next step is to update transaction status and save it as crypto_sent
    console.log("updating transaction status to crypto_sent");
    const updateTransactionStatus = await prisma.transaction.update({
      where: { PlatformReference },
      data: { status: "crypto_sent" },
    })

    
    if(!updateTransactionStatus){
      console.log("Failed to update transaction status for reference:", PlatformReference);
        return Response.json(
            { message: "Failed to update transaction status please contact support" },
            { status: 500 },
      );
    }
    console.log("Transaction status updated to crypto_sent");


     ///next step is to setup the payout logic properly

    return Response.json({
      message: "Crypto sent to admin wallet",
      status: "crypto_sent",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
