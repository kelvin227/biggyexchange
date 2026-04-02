"use server";

import { prisma } from "@/lib/db";

export async function percentagechange() {
  ////////////////////////////////////////////////////////////////////////////
  // 1. Define Date Ranges (Current Date is June 18, 2025)

  const today = new Date(); // Current date (e.g., June 18, 2025)

  // Current 7-day period (inclusive of today)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7); // 7 days before today (e.g., June 11, 2025)

  // Previous 7-day period (prior to the current 7-day period)
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14); // 14 days before today (e.g., June 4, 2025)

  // 2. Query Prisma for counts within each range

  console.log(
    `Calculating users from ${sevenDaysAgo.toDateString()} to ${today.toDateString()}`
  );
  console.log(
    `Calculating users from ${fourteenDaysAgo.toDateString()} to ${sevenDaysAgo.toDateString()}`
  );

  // Count users registered in the current 7-day period
  const currentUserCount = await prisma.user.count({
    where: {
      roles: "user",
      createdAt: {
        gte: sevenDaysAgo, // Greater than or equal to 7 days ago
        lte: today, // Less than or equal to today
      },
    },
  });

  // Count users registered in the previous 7-day period
  const previousUserCount = await prisma.user.count({
    where: {
      roles: "user",
      createdAt: {
        gte: fourteenDaysAgo, // Greater than or equal to 14 days ago
        lt: sevenDaysAgo, // Less than (strictly before) 7 days ago
      },
    },
  });

  // 3. Calculate the percentage increase

  console.log(`Current 7-day user count: ${currentUserCount}`);
  console.log(`Previous 7-day user count: ${previousUserCount}`);

  let percentageIncrease: number;

  if (previousUserCount === 0) {
    if (currentUserCount > 0) {
      percentageIncrease = 100; // This is a specific choice for infinite growth
      console.log(
        "No users in the previous period, but new users in the current period. Percentage increase is considered infinite (or 100% for simplicity)."
      );
    } else {
      percentageIncrease = 0; // No users in either period
      console.log("No users in either period. Percentage increase is 0%.");
    }
  } else {
    // This is the standard calculation for percentage change
    percentageIncrease =
      ((currentUserCount - previousUserCount) / previousUserCount) * 100;
    console.log(`Percentage change: ${percentageIncrease.toFixed(2)}%`); // Changed "increase" to "change" for clarity
  }

  return {
    currentUserCount,
    previousUserCount,
    percentageIncrease: parseFloat(percentageIncrease.toFixed(2)), // This will be negative if it's a decrease
  };
  ////////////////////////////////////////////////////////
}

export async function percentagechangekyc() {
  ////////////////////////////////////////////////////////////////////////////
    const countkyc = await prisma.kyc.count({
      where:{Status:"pending"}
    });
  // 1. Define Date Ranges (Current Date is June 18, 2025)

  const today = new Date(); // Current date (e.g., June 18, 2025)

  // Current 7-day period (inclusive of today)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7); // 7 days before today (e.g., June 11, 2025)

  // Previous 7-day period (prior to the current 7-day period)
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14); // 14 days before today (e.g., June 4, 2025)

  // 2. Query Prisma for counts within each range

  console.log(
    `Calculating kyc from ${sevenDaysAgo.toDateString()} to ${today.toDateString()}`
  );
  console.log(
    `Calculating kyc from ${fourteenDaysAgo.toDateString()} to ${sevenDaysAgo.toDateString()}`
  );

  // Count users registered in the current 7-day period
  const currentUserCount = await prisma.kyc.count({
    where: {
      Status: "pending",
      createdAt: {
        gte: sevenDaysAgo, // Greater than or equal to 7 days ago
        lte: today, // Less than or equal to today
      },
    },
  });

  // Count users registered in the previous 7-day period
  const previousUserCount = await prisma.kyc.count({
    where: {
      Status: "pending",
      createdAt: {
        gte: fourteenDaysAgo, // Greater than or equal to 14 days ago
        lt: sevenDaysAgo, // Less than (strictly before) 7 days ago
      },
    },
  });

  // 3. Calculate the percentage increase

  console.log(`Current 7-day kyc count: ${currentUserCount}`);
  console.log(`Previous 7-day kyc count: ${previousUserCount}`);

  let percentageIncrease: number;

  if (previousUserCount === 0) {
    if (currentUserCount > 0) {
      percentageIncrease = 100; // This is a specific choice for infinite growth
      console.log(
        "No kyc requests in the previous period, but new kycs requests in the current period. Percentage increase is considered infinite (or 100% for simplicity)."
      );
    } else {
      percentageIncrease = 0; // No users in either period
      console.log("No kyx request in either period. Percentage increase is 0%.");
    }
  } else {
    // This is the standard calculation for percentage change
    percentageIncrease =
      ((currentUserCount - previousUserCount) / previousUserCount) * 100;
    console.log(`Percentage change: ${percentageIncrease.toFixed(2)}%`); // Changed "increase" to "change" for clarity
  }

  return {
    currentUserCount,
    previousUserCount,
    countkyc,
    percentageIncrease: parseFloat(percentageIncrease.toFixed(2)), // This will be negative if it's a decrease
  };
  ////////////////////////////////////////////////////////
}
export async function percentagechangetrade() {
  ////////////////////////////////////////////////////////////////////////////
    const countct = await prisma.adsTransaction.count({
      where:{status:"completed"}
    });
  // 1. Define Date Ranges (Current Date is June 18, 2025)

  const today = new Date(); // Current date (e.g., June 18, 2025)

  // Current 7-day period (inclusive of today)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7); // 7 days before today (e.g., June 11, 2025)

  // Previous 7-day period (prior to the current 7-day period)
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14); // 14 days before today (e.g., June 4, 2025)

  // 2. Query Prisma for counts within each range

  console.log(
    `Calculating completed trades from ${sevenDaysAgo.toDateString()} to ${today.toDateString()}`
  );
  console.log(
    `Calculating completed trades from ${fourteenDaysAgo.toDateString()} to ${sevenDaysAgo.toDateString()}`
  );

  // Count users registered in the current 7-day period
  const currentUserCount = await prisma.adsTransaction.count({
    where: {
      status: "completed",
      createdAt: {
        gte: sevenDaysAgo, // Greater than or equal to 7 days ago
        lte: today, // Less than or equal to today
      },
    },
  });

  // Count users registered in the previous 7-day period
  const previousUserCount = await prisma.adsTransaction.count({
    where: {
      status: "completed",
      createdAt: {
        gte: fourteenDaysAgo, // Greater than or equal to 14 days ago
        lt: sevenDaysAgo, // Less than (strictly before) 7 days ago
      },
    },
  });

  // 3. Calculate the percentage increase

  console.log(`Current 7-day completed trades count: ${currentUserCount}`);
  console.log(`Previous 7-day completed trades count: ${previousUserCount}`);

  let percentageIncrease: number;

  if (previousUserCount === 0) {
    if (currentUserCount > 0) {
      percentageIncrease = 100; // This is a specific choice for infinite growth
      console.log(
        "No Trades were completed in the previous period, but new completed trades in the current period. Percentage increase is considered infinite (or 100% for simplicity)."
      );
    } else {
      percentageIncrease = 0; // No users in either period
      console.log("No completed trades in either period. Percentage increase is 0%.");
    }
  } else {
    // This is the standard calculation for percentage change
    percentageIncrease =
      ((currentUserCount - previousUserCount) / previousUserCount) * 100;
    console.log(`Percentage change: ${percentageIncrease.toFixed(2)}%`); // Changed "increase" to "change" for clarity
  }

  return {
    currentUserCount,
    previousUserCount,
    countct,
    percentageIncrease: parseFloat(percentageIncrease.toFixed(2)), // This will be negative if it's a decrease
  };
  ////////////////////////////////////////////////////////
}

export async function getAdminEthWallet(
){
  try {
  const admin = await prisma.user.findFirst({
    where: {roles: "admin"},
    include: { wallet: true }
  })
  if(!admin){
    return{
      success: false,
      message: "unable to get admin details"
    }
  }
  if(admin.roles != "admin"){
    return {
      success: false,
      message: "the fetched details is not an admin"
    }
  }
  if (!admin.wallet) {
  return {
    success: false,
    message: "Admin wallet not found"
  }
}
  return {success: true, walletaddress: admin.wallet[0].address};
    } catch (error) {
    console.error("Error fetching admin wallet:", error);
    return {
      success: false,
      message: "Server error while fetching admin wallet",
    };
  }
}

export async function getAdminWalletByCoin(
  coin: string,
){
  if(!coin){
    return{success: false, message:"please enter a coin type"}
  }
  switch(coin){
    case "eth":
      const response = await getAdminEthWallet();
      return{
        success: true,
        walletAddress: response.walletaddress,
      }
    case "bnb":
      const bnbresponse = await getAdminEthWallet();
      return{
        success: true,
        walletAddress: bnbresponse.walletaddress,
      }
      default:
        const defaultresponse = await getAdminEthWallet();
        return{
          success: true,
          walletAddress: defaultresponse.walletaddress,
        }

  }
}