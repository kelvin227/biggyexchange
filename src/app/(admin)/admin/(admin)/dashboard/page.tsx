import { auth } from '@/auth';
import PagePlaceholder from '@/components/page-placeholder';
import { getUserByEmail } from '@/functions/user';
import { prisma } from '@/lib/db';
import { percentagechange, percentagechangekyc, percentagechangetrade } from '../../../../../../actions/admiondashboardaction';
/* eslint-disable */

export default async function Home() {
  // This is a placeholder for the Kelvin page.
  const session = await auth();
  // You can fetch data or perform any other operations here if needed.
  const role = await getUserByEmail(session?.user?.email as string);

  const countuser = await prisma.user.count({
    where:{roles:"user"}
  });

  const PC = await percentagechange();
  const PCKyc = await percentagechangekyc();
  const PCCT = await percentagechangetrade();


  const currentYear = new Date().getFullYear();
    // Parallelize these fetches
  const [getbuy] = await Promise.all([
    prisma.adsTransaction.findMany({
      where: {
        AND: [
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

      const gettransaction = await prisma.adsTransaction.findMany({
        where:{
          AND: [
            {
              status: "completed",
              type: { in: ["buy", "sell"]}
            }
          ]
        },
        orderBy:{
          createdAt: "desc"
        },
        take: 10
      });
            const getptrans = await prisma.adsTransaction.findMany({
        where:{
          AND: [
            {
              status: "pending",
              type: { in: ["buy", "sell"]}
            }
          ]
        },
        orderBy:{
          createdAt: "desc"
        },
        take: 10
      });

  if (role?.roles === 'admin') {
    return <PagePlaceholder pageName={session?.user?.email as string} usercount={countuser} percentage={PC.percentageIncrease} kyccount={PCKyc.countkyc} percentagekyc={PCKyc.percentageIncrease} CTcount={PCCT.countct} percentageCT={PCCT.percentageIncrease} barchartdata={monthlyAggregates as any} fivecompletedtrans={gettransaction as any} fiveptrans={getptrans as any}/>;
  }else{
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <h1 className="text-2xl font-bold">You are not authorized to view this page.</h1>
      </div>
    );
  }
}
