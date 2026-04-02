import { getPaystackBalance } from "@/functions/paystack/paystackFunctions";
import { prisma } from "@/lib/db";
import { getAdminWalletByCoin } from "../../../../../actions/admiondashboardaction";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, cryptoType, cryptoAmount, nairaAmount } = body;

    if (!email || !cryptoType || !cryptoAmount || !nairaAmount) {
      console.log(email, cryptoType, cryptoAmount, nairaAmount);
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { accountDetails: true }
    });
    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.accountDetails[0].bankName|| !user.accountDetails[0].accountNumber || !user.accountDetails[0].accountName) {
      return Response.json(
        { message: "User bank account is not set" },
        { status: 400 }
      );
    }

    const adminBalance = await getPaystackBalance();

    const ngnWallet = adminBalance.available_balance;



if (!ngnWallet) {
  throw new Error("NGN wallet not found");
}

console.log(ngnWallet < nairaAmount, "comparing admin balance with user requested amount")


    if (ngnWallet < nairaAmount) {
      return Response.json(
        { message: "Insufficient admin payout balance" },
        { status: 400 }
      );
    }

    console.log("getting admin wallet");
    const adminWallet = await getAdminWalletByCoin(cryptoType);

    if (!adminWallet) {
      return Response.json(
        { message: "Admin wallet not configured for this coin" },
        { status: 500 }
      );
    }
    console.log("admin wallet retrieved:", adminWallet.walletAddress);


    console.log("creating transaction reference");
    const reference = `sell_${Date.now()}_${user.id}`;


    console.log("Creating transaction record in DB");

    const transaction = await prisma.transaction.create({
        data:{
            userId: user.id,
            cryptoType: cryptoType,
            cryptoAmount: cryptoAmount?.toString(),
            PlatformReference: reference,
            nairaAmount: nairaAmount,
            status: "pending",
        }
    })
    
    if(!transaction){
       return Response.json(
        { message: "Failed to create a transaction record" },
        { status: 500 }
      );
    }
    console.log("transaction record created in DB with id:", transaction.id);
    console.log("sell transaction initialized with reference:", reference);

    return Response.json({
      message: "Sell transaction initialized",
      reference: reference,
      walletAddress: adminWallet.walletAddress,
      status: "pending",
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}