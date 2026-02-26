import { auth } from "@/auth";
import PagePlaceholder from "@/components/user-pageholder";
import { TransactionTable } from "../wallet/transaction/trans";
import { prisma } from "@/lib/db";
import { getEthBalance, getPrice } from "@/functions/blockchain/wallet.utils";
import React from "react";
/* eslint-disable */

export default async function Home() {
  var bnbBalance = 1;
  const session = await auth();
  const email = session?.user?.email as string;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    console.log("error: User not found");
  }
  const currentYear = new Date().getFullYear();
  // Parallelize these fetches
  const [wallet, getbuy] = await Promise.all([
    prisma.wallets.findUnique({
      where: { userId: user?.id }, // Use user.id directly
      select: { address: true },
    }),
    prisma.adsTransaction.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                merchantID: user?.id,
              },
              // Add userId: user.id here if you want to include user's own buy/sell as client
              // { userId: user.id }
            ],
          },
          {
            createdAt: {
              gte: new Date(currentYear, 0, 1),
              lt: new Date(currentYear + 1, 0, 1),
            },
          },
          { status: "completed" },
          {
            type: {
              in: ["buy", "sell"],
            },
          },
        ],
      },
      select: {
        type: true,
        amount: true,
        createdAt: true,
        merchantID: true,
        userId: true,
        status: true,
      },
    }),
  ]);

  if (!wallet) {
    console.log("error: Wallet not found");
    // Handle appropriately
  }

  // --- Data Transformation Logic ---
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Initialize the structure for all 12 months with default 0 values
  const monthlyAggregates = new Array(12).fill(null).map((_, i) => ({
    month: monthNames[i],
    Buy: 0,
    Sell: 0,
  }));

  // Process each transaction fetched from the database
  interface MonthlyAggregate {
    month: string;
    Buy: number;
    Sell: number;
  }

  interface Transaction {
    type: string;
    amount: string;
    createdAt: Date | string;
    merchantID: string;
    userId: string;
    status: string;
  }

  (getbuy as Transaction[]).forEach((transaction: Transaction) => {
    const date = new Date(transaction.createdAt);
    const monthIndex = date.getMonth(); // getMonth() returns 0 for Jan, 1 for Feb, etc.
    const amount: number = parseFloat(transaction.amount); // Convert string 'amount' to a number

    // Basic validation for amount
    if (isNaN(amount)) {
      console.warn(
        `Skipping transaction with invalid amount: ${transaction.amount}`
      );
      return;
    }

    // Aggregate amounts based on 'type'
    if (transaction.type === "buy") {
      (monthlyAggregates as MonthlyAggregate[])[monthIndex].Buy += amount;
    } else if (transaction.type === "sell") {
      (monthlyAggregates as MonthlyAggregate[])[monthIndex].Sell += amount;
    }
    // Any other 'type' values will simply be ignored
  });

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 1000);
  const userId = await prisma.user.findUnique({
    where: { email },
    select: { id: true }, // Select only the user ID
  });
  // Fetch transactions with pagination and search
  const transactions = await prisma.adsTransaction.findMany({
    where: {
      merchantID: userId?.id,
      createdAt: {
        gte: sevenDaysAgo,
        lte: now,
      },
    }, // Filter by transaction type
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!transactions) {
    throw new Error('Failed to fetch recent transactions');
  }
  const oldtransaction = await prisma.adsTransaction.findMany({
    where: {
      merchantID: userId?.id,
      createdAt: {
        gte: fourteenDaysAgo,
        lte: sevenDaysAgo,
      },
      status: "completed",
    }, // Filter by transaction type
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!oldtransaction) {
      throw new Error('Failed to fetch old transactions');
  }
  const completedtrans = await prisma.adsTransaction.count({
    where: {
      merchantID: userId?.id,
      createdAt: {
        gte: sevenDaysAgo,
        lte: now,
      },
      status: "completed",
    }, // Filter by transaction type
    orderBy: {
      createdAt: "desc",
    },
  });

  const totaltrans = await prisma.adsTransaction.count({
    where: {
      merchantID: userId?.id,
      createdAt: {
        gte: sevenDaysAgo,
        lte: now,
      },
    }, // Filter by transaction type
    orderBy: {
      createdAt: "desc",
    },
  });
  const previouscompletedtrans = await prisma.adsTransaction.count({
    where: {
      merchantID: userId?.id,
      createdAt: {
        gte: fourteenDaysAgo,
        lte: sevenDaysAgo,
      },
      status: "completed",
    }, // Filter by transaction type
    orderBy: {
      createdAt: "desc",
    },
  });
  const previousTotaltrans = await prisma.adsTransaction.count({
    where: {
      merchantID: userId?.id,
      createdAt: {
        gte: fourteenDaysAgo,
        lte: sevenDaysAgo,
      },
    }, // Filter by transaction type
    orderBy: {
      createdAt: "desc",
    },
  });

  interface AdsTransaction {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userName: string;
    userId: string;
    walletAddress: string | null;
    coin: string;
    type: string | null;
    price: string;
    status: string;
    adId: string;
    amount: string;
    customerconfirm: string;
    // Add other fields as needed
  }

  const totalVolume = transactions.reduce(
    (sum: number, transaction: AdsTransaction) =>
      sum + Number(transaction.amount),
    0
  );

  interface OldTransaction {
    amount: string;
    [key: string]: any;
  }

  const oldtotalVolume = oldtransaction.reduce(
    (sum: number, oldtransaction: OldTransaction) =>
      sum + Number(oldtransaction.amount),
    0
  );

  ////get user address
  const coinwallet = await prisma.wallets.findUnique({
    where: { userId: user?.id },
    select: { address: true },
  });

  const address = coinwallet?.address as string;

  const ethprice = await getPrice();


  ////get bnb wallet balance

  const apiKey = '3320c6924e474dec8a44f475f6bf0bc2'; // Use environment variables for security
  const url = `https://bsc-mainnet.nodereal.io/v1/${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    }),
  });

  const data = await response.json();
  
  if (data.result) {
    // Convert hex wei to decimal BNB
    const wei = BigInt(data.result);
    bnbBalance = Number(wei) / 1e18;
  }else{
    throw new Error('Failed to fetch BNB balance');
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  ////get eth wallet balance
  const ethBalance = await getEthBalance(address);

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  

  return (
    <>
      <PagePlaceholder
        pageName={session?.user?.email as string}
        barchartdata={monthlyAggregates as any}
        totalVolume={totalVolume}
        oldtotalVolume={oldtotalVolume}
        completedtrans={completedtrans}
        totaltrans={totaltrans}
        previouscompletedtrans={previouscompletedtrans}
        previousTotaltrans={previousTotaltrans}
        balance={parseInt(ethBalance.message) * ethprice.prices?.eth}
      />
      <div className="container mx-auto py-10">
        <TransactionTable
          email={session?.user?.email as string}
          address={address}
          id={user?.id as string}
        />
      </div>
    </>
  );
}
