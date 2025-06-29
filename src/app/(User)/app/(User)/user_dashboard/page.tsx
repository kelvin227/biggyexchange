import { auth } from "@/auth";
import PagePlaceholder from "@/components/user-pageholder";
import { TransactionTable } from "../wallet/transaction/trans";
import { prisma } from "@/lib/db";
/* eslint-disable */



export default async function Home() {
  const session = await auth();
  const email = session?.user?.email as string;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
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
                merchantID: user?.id
              },
              // Add userId: user.id here if you want to include user's own buy/sell as client
              // { userId: user.id }
            ]
          },
          {
            createdAt: {
              gte: new Date(currentYear, 0, 1),
              lt: new Date(currentYear + 1, 0, 1),
            }
          },
          { status: "completed" },
          {
            type: {
              in: ['buy', 'sell']
            }
          }
        ]
      },
      select: { type: true, amount: true, createdAt: true, merchantID: true, userId: true, status: true },
    })
  ]);

  if (!wallet) {
    console.log("error: Wallet not found");
    // Handle appropriately
  }

  // --- Data Transformation Logic ---
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Initialize the structure for all 12 months with default 0 values
    const monthlyAggregates = new Array(12).fill(null).map((_, i) => ({
      month: monthNames[i],
      Buy: 0,
      Sell: 0,
    }));

    // Process each transaction fetched from the database
    getbuy.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const monthIndex = date.getMonth(); // getMonth() returns 0 for Jan, 1 for Feb, etc.
      const amount = parseFloat(transaction.amount); // Convert string 'amount' to a number

      // Basic validation for amount
      if (isNaN(amount)) {
        console.warn(`Skipping transaction with invalid amount: ${transaction.amount}`);
        return;
      }

      // Aggregate amounts based on 'type'
      if (transaction.type === 'buy') {
        monthlyAggregates[monthIndex].Buy += amount;
      } else if (transaction.type === 'sell') {
        monthlyAggregates[monthIndex].Sell += amount;
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
          return { success: false, message: "No transactions found for the user" };
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
          return {
            success: false,
            message: "No old transactions found for the user",
          };
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
    
        const totalVolume = transactions.reduce(
          (sum, transactions) => sum + Number(transactions.amount),
          0
        );
    
        const oldtotalVolume = oldtransaction.reduce(
          (sum, oldtransaction) => sum + Number(oldtransaction.amount),
          0
        );


  return (
    <div>
      <PagePlaceholder pageName={session?.user?.email as string} barchartdata={monthlyAggregates as any} totalVolume={totalVolume} oldtotalVolume={oldtotalVolume} completedtrans={completedtrans} totaltrans={totaltrans} previouscompletedtrans={previouscompletedtrans} previousTotaltrans={previousTotaltrans}/>
      <div className="container mx-auto py-10">
        <TransactionTable email={session?.user?.email as string} address={wallet?.address as string} id={user?.id as string}  />
      </div>
    </div>
  );
}
