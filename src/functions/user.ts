"use server";
/* eslint-disable */
import { prisma } from "@/lib/db";
import { EmailTemplate } from "@/components/emails/support";
import { VerificationEmail } from "@/components/emails/verificationCode";
import { Resend } from "resend";
import { generateVerificationCode, hashPassword } from "@/lib/utils";
import TradeUpdateEmail from "@/components/emails/trade_update";
import { sendusdttrade } from "./blockchain/wallet.utils";
import { CancelMailTemplate } from "@/components/emails/cancelmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSupportMail(
  name: string,
  email: string,
  issueNumber: string,
  issueType: string,
  theme: "dark" | "light" = "dark"
) {
  const data = await resend.emails.send({
    from: "donnotreply <noreply@sociootc.com>",
    to: [email],
    subject: "Support Issue Created - " + issueNumber,
    react: EmailTemplate({
      firstName: name,
      issueNumber,
      issueType,
      theme,

    }),
  });

  if (!data) {
    return { success: false, message: "unable to send email" };
  }

  return { success: true, message: "email sent successfully" };
}
export async function sendtradeCancelledmails(
  email: string,
  id: string,
  amount: string,
  Coins: string,
  status: string,
  UserName: string
) {
  const data = await resend.emails.send({
    from: "donnotreply <noreply@sociootc.com>",
    to: [email],
    subject: "Merchant Has Cancelled Your Trade Request- Action Required",
    react: CancelMailTemplate({
      firstName: email,
      tradeId: id,
      tradeAmount: amount,
      tradeCurrency: Coins,
      tradeStatus: status,
      merchantName: UserName,
    }),
  });

  if (!data) {
    return { success: false, message: "unable to send email" };
  }

  return { success: true, message: "email sent successfully" };
}
export async function sendverificationmail(email: string, code: string) {
  const data = await resend.emails.send({
    from: "Verification Mail <noreply@sociootc.com>",
    to: [email],
    subject: "Your verification Code has arrived",
    react: VerificationEmail({ firstName: email, code }),
  });

  if (!data) {
    return { success: false, message: "unable to send email" };
  }

  return { success: true, message: "email sent successfully" };
}

export async function sendtradeupdate(
  email: string,
  coin: string,
  amount: string,
  tradeId: string
) {
  const data = await resend.emails.send({
    from: "Trade Request update <noreply@sociootc.com>",
    to: [email],
    subject: "Buyer has sent {Coins}",
    react: TradeUpdateEmail({ firstName: email, coin, amount, tradeId }),
  });

  if (!data) {
    return { success: false, message: "unable to send email" };
  }

  return { success: true, message: "email sent successfully" };
}
//
export async function sendPasswordChangedMail(
  email: string,
){

};

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
    omit: {
      id: true,
      password: true,
    },
  });

  return user;
}

export async function getUser(value: string){
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: value },
        { id: value }
      ]
    },
    // Remove 'omit' if not supported by Prisma, or replace with 'select' or 'exclude' as needed
    omit:{
      password: true
    }
  });

  return user;
}

export async function getUserByID(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      password: true,
    },
  });

  return user;
}

export async function updateUserProfile(
  email: string,
  value: string,
  field: "username" | "name" | "phoneNo"
) {
  try {
    // Fetch the user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Validate the new value
    if (!value || value.trim() === "") {
      return { success: false, message: `${field} cannot be empty` };
    }

    // Check if the new value is already taken (only for username)
    if (field === "username") {
      const existingUser = await prisma.user.findUnique({
        where: { userName: value }, // Correct field name in the database
      });
      if (existingUser && existingUser.email !== email) {
        return { success: false, message: "Username is already taken" };
      }

      // Check if the new username is the same as the current username
      if (user.userName === value) {
        return {
          success: false,
          message: "New username is the same as the current username",
        };
      }
    }

    // Map "username" to "userName" for the database field
    const updateField = field === "username" ? "userName" : field;

    // Update the user's field in the database
    await prisma.user.update({
      where: { email },
      data: { [updateField]: value },
    });

    return { success: true, message: `${field} updated successfully` };
  } catch (error) {
    console.error(`Error updating user ${field}:`, error);
    return {
      success: false,
      message: `An error occurred while updating the ${field}`,
    };
  }
}
export async function updateUserProfilePic(email: string, Value: string) {
  try {
    // Fetch the user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Validate the new value
    if (!Value || Value.trim() === "") {
      return {
        success: false,
        message: `please select a profile picture cannot be empty`,
      };
    }

    const update = await prisma.user.update({
      where: { email },
      data: { image: Value },
    });
    if (!update) {
      return {
        success: false,
        message: "unable to update your profile picture",
      };
    }
    return { success: true, message: "profile picture updated successfully" };
  } catch (error) {}
}

export async function updatewallet(
  email: string,
  accountName: string,
  accountNumber: string,
  bankName: string,
  bankCode: string,
) {
  ///get the user info like email, username, and id
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return { success: false, message: "error fetching user details" };
  }
  const userid = user.id;

  const acc = await prisma.accountDetails.findUnique({
    where: { userid }
  })
  if(!acc){
    const createAcc = await prisma.accountDetails.create({
      data: {
      accountName,
      bankName,
      accountNumber,
      bankCode,
      userid
    }
    })

    if(!createAcc){
      return {success: false, message: "Failed to store bank account details"}
    }
    return {
      success: true,
      message: "account details store successfully"
    }
  }
}


export async function SubmitKyc(
  email: string,
  FullName: string,
  country: string,
  idCardNumber: string,
  idCardFront: string,
  idCardBack: string
) {
  try {
    // Fetch the user by email
    const users = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
    if (!users) {
      return { success: false, message: "User not found" };
    }

    // Validate the new value
    if (!FullName || FullName.trim() === "") {
      return { success: false, message: "Full name cannot be empty" };
    }
    if (!country || country.trim() === "") {
      return { success: false, message: "Country cannot be empty" };
    }
    if (!idCardNumber || idCardNumber.trim() === "") {
      return { success: false, message: "ID card number cannot be empty" };
    }
    const kyc = await prisma.kyc.findUnique({
      where: { userid: users.id },
    });
    const userid = users.id;
    // Check if the new value is already taken (only for username)
    // Update the user's KYC details in the database
    if (kyc) {
      await prisma.kyc.update({
        where: { userid: kyc.userid },
        data: {
          FullName,
          userid: kyc.userid,
          country,
          IDNO: idCardNumber,
          documentURL1: idCardFront,
          documentURL2: idCardBack,
          Status: "pending",
          //user: { connect: { email } }, // Connect to the user by email
        },
      });
    } else {
      // Create a new KYC record if it doesn't exist
      await prisma.kyc.create({
        data: {
          FullName,
          userid: userid,
          country,
          IDNO: idCardNumber,
          documentURL1: idCardFront,
          documentURL2: idCardBack,
          Status: "pending",
          //user: { connect: { email } }, // Connect to the user by email
        },
      });
    }

    return { success: true, message: "KYC details submitted successfully" };
  } catch (error) {
    console.error(`Error submitting KYC details for user ${email}:`, error);
    return {
      success: false,
      message: `An error occurred while submitting KYC details`,
    };
  }
}

export async function getKycStatus(email: string) {
  try {
    const users = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
    // Fetch the user's KYC status by email
    const kyc = await prisma.kyc.findUnique({
      where: { userid: users?.id },
      select: { Status: true, userid: true },
    });

    if (!kyc) {
      return { success: false, message: "KYC details not found" };
    }

    return { success: true, message: kyc.Status };
  } catch (error) {
    console.error(`Error fetching KYC status for user ${email}:`, error);
    return {
      success: false,
      message: `An error occurred while fetching KYC status`,
    };
  }
}


export async function getKycDetails(email: string) {
  try {
    const users = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
    // Fetch the user's KYC status by email
    const kyc = await prisma.kyc.findUnique({
      where: { userid: users?.id },
      select: {
        FullName: true,
        country: true,
        IDNO: true,
        documentURL1: true,
        documentURL2: true,
        Status: true,
      },
    });

    if (!kyc) {
      return { success: false, message: "KYC details not found" };
    }

    return { success: true, message: "kyc" };
  } catch (error) {
    console.error(`Error fetching KYC status for user ${email}:`, error);
    return {
      success: false,
      message: `An error occurred while fetching KYC status`,
    };
  }
}


export async function blockuser(email: string) {
  // Fetch the user by email
  try {
    const block = await prisma.user.update({
      where: { email }, // Replace with the actual user ID
      data: { isBlocked: true }, // Set isBlocked to true
    });
    if (!block) {
      return { success: false, message: "failed to blocked user" };
    }
    return { success: true, message: "User blocked successfully" };
  } catch (error) {
    console.error("Error blocking user:", error);
    throw new Error("Failed to block user");
  }
}

export async function unblockuser(email: string) {
  try {
    const unblock = await prisma.user.update({
      where: { email }, // Replace with the actual user ID
      data: { isBlocked: false }, // Set isBlocked to true
    });
    if (!unblock) {
      return { success: false, message: "Failed to Unblocked user" };
    }
    return { success: true, message: "User Unblocked Successfully" };
  } catch (error) {
    throw new Error("Failed to Unblock user");
  }
}

export async function approvekyc(email: string) {
  try {
    const users = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    const approve = await prisma.kyc.update({
      where: { userid: users?.id }, // Replace with the actual user ID
      data: { Status: "approved" }, // Set isBlocked to true
    });
    if (!approve) {
      return { success: false, message: "Failed to approve user KYC" };
    }
    const userkyc = await prisma.user.update({
      where: { email },
      data: { kycverified: true },
    });
    return { success: true, message: "User KYC Approved Successfully" };
  } catch (error) {
    throw new Error("Failed to approve user KYC" + error);
  }
}

export async function rejectkyc(email: string, reason: string) {
  try {
    const users = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!users) {
      return { success: false, message: "unable to fetc user details" };
    }

    const reject = await prisma.kyc.update({
      where: { userid: users.id }, // Replace with the actual user ID
      data: { Status: "rejected", Rejection_reason: reason }, // Set isBlocked to true
    });
    if (!reject) {
      return { success: false, message: "Failed to reject user KYC" };
    }
    return { success: true, message: "User KYC recjected Successfully" };
  } catch (error) {
    throw new Error("Failed to reject user KYC" + error);
  }
}


export async function getp2ptransaction(email: string) {
  try {
    const userId = await prisma.user.findUnique({
      where: { email },
      select: { id: true }, // Select only the user ID
    });
    // Fetch transactions with pagination and search
    const transactions = await prisma.adsTransaction.findMany({
      where: { userId: userId?.id }, // Filter by transaction type
    });
    if (!transactions) {
      return { success: false, message: "No transactions found for the user" };
    }
    return { success: true, message: transactions };
    // Get the total count of transactions for pagination
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function searchTransaction(id: string) {
  try {
    // Fetch transactions with pagination and search
    const transaction = await prisma.adsTransaction.findFirst({
      where: {
        OR: [{ id }, { orderId: id }],
      },
    });

    return transaction;
    //return{ success: true, message: "User KYC  Successfully"}
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function addModerator(email: string, name: string, roles: string) {
  try {
    // Fetch the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      if (user.roles === "moderator") {
        return { success: false, message: "User is already a moderator" };
      }
    }

    // Validate the new value
    if (!name || name.trim() === "") {
      return { success: false, message: "Name cannot be empty" };
    }
    if (!roles || roles.trim() === "") {
      return { success: false, message: "Role cannot be empty" };
    }

    // Check if the new value is already taken (only for username)
    if (roles !== "moderator") {
      return { success: false, message: "Role must be moderator" };
    }

    //hash the password before storing it in the database
    const hashedPassword = hashPassword("password"); // Replace "password" with the actual password
    // Update the user's field in the database
    await prisma.user.create({
      data: {
        email,
        name,
        roles,
        password: hashedPassword, // Set a default password or handle it as needed
        isBlocked: false, // Set isBlocked to false by default
        userName: email.split("@")[0], // Set a default username based on the email
        image: "https://example.com/default-avatar.png", // Set a default avatar URL
      },
    });

    return { success: true, message: `Moderator added successfully` };
  } catch (error) {
    console.error(`Error adding moderator for user ${email}:`, error);
    return {
      success: false,
      message: `An error occurred while adding moderator`,
    };
  }
}
export async function addNotification(
  email: string,
  title: string,
  message: string
) {
  try {
    // Validate input
    if (!email || !title || !message) {
      return { success: false, message: "All fields are required" };
    }
    const user = await prisma.user.findUnique({
      where:{email}
    })

    const userId = user?.id as string;

    // Create a new notification in the database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        isRead: false, // Default to unread
      },
    });

    return {
      success: true,
      message: "Notification added successfully",
      notification,
    };
  } catch (error) {
    console.error("Error adding notification:", error);
    return { success: false, message: "Failed to add notification" };
  }
}

export async function getundeliveredNotifications(email: string) {
  try {
    // Fetch the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }, // Select only the user ID
    });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const userId = user.id; // Get the user ID
    // Fetch notifications for the user
    const notifications = await prisma.notification.findMany({
      where: { 
        AND:[
          {userId},
          {isRead: false}
        ]
       },
      orderBy: { createdAt: "desc" }, // Sort by creation date (latest first)
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, message: "Failed to fetch notifications" };
  }
}

export async function gettraderequests(email: string) {
  try {
    // Fetch the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }, // Select only the user ID
    });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const userId = user.id; // Get the user ID
    // Fetch ads for the user
    const traderequests = await prisma.traderequest.findMany({
      where: {
        OR: [{ merchantId: userId }, { userId: userId }],
      },
      orderBy: { createdAt: "desc" }, // Sort by creation date (latest first)
    });

    return { success: true, traderequests };
  } catch (error) {
    console.error("Error fetching traderequests:", error);
    return { success: false, message: "Failed to fetch traderequests" };
  }
}

export async function gettraderequestsinfo(id: string) {
  try {
    // Fetch ads for the user
    const info = await prisma.traderequest.findMany({
      where: {
        OR: [{ merchantId: id }, { userId: id }],
      },
            orderBy: { createdAt: "desc" }, // Sort by creation date (latest first)

    });

    return { success: true, info };
  } catch (error) {
    console.error("Error fetching traderequests:", error);
    return { success: false, message: "Failed to fetch traderequests" };
  }
}


export async function getadstransactions(ids: string) {
  try {
    const gettrans = await prisma.adsTransaction.findMany({
      where: {
        OR: [{ merchantID: ids }, { userId: ids }],
      },
    });

    if (!gettrans) {
      return { success: false, message: "unable to get transaction info" };
    }
    return { success: true, gettrans };
  } catch (error) {
    console.log(error);
  }
}
// add notification for the value below
export async function confirmbuyer(
  id: string,
  receipt: string,
  email: string,
  amount: string,
  Coins: string
) {
  try {
    const gettrans = await prisma.adsTransaction.update({
      where: { orderId: id },
      data: {
        merchantconfirm: "sent",
        receipt,
      },
    });
    if (!gettrans) {
      return { success: false, message: "unable to update transaction" };
    }
    const tradeemail = await sendtradeupdate(email, Coins, amount, id);
    return { success: true, gettrans };
  } catch (error) {
    console.log(error);
  }
}

export async function confirmseen(
  tradeid: string,
  id: string,
  Amount: string,
  Price: string,
  selectedType: string,
  userid: string,
  merchantid: string
) {
  try {
    const Op = Number(Price) * Number(Amount);
    if (selectedType !== "buy") {
      const gettradeprocessinfo = await prisma.tradeprocess.findUnique({
        where: {orderid: id}
      })
      if(!gettradeprocessinfo){
        const createtradeprocessinfo = await prisma.tradeprocess.create({
          data:{tradeid,
          orderid: id,
          confirmseen: "notstarted",
          sendusdt: "pending",
          checkusdtsent: "notstarted",
          sendfeeusdt: "notstarted",
          checkusdtfeesent: "notstarted"}

        })
      }
      if(gettradeprocessinfo?.sendusdt === "completed"){
      const gettrans = await prisma.adsTransaction.update({
      where: { orderId: id },
      data: {
        customerconfirm: "sent"
      }
    })
    if (!gettrans) {
      return { success: false, message: "unable to update transaction" }
    }
    return{
      success: true,
      message: "transaction status updated"
    }
      }
      const send = await sendusdttrade(Op.toString(), userid, merchantid);
      if (!send) {
        return { success: false, message: "unable to send usdt" };
      }
      const gettrans = await prisma.adsTransaction.update({
        where: { orderId: id },
        data: {
          customerconfirm: "sent",
        },
      });
      if (!gettrans) {
        return { success: false, message: "unable to update transaction" };
      }
      return {
        success: true,
        message: "buyer has comfired the coin",
        transactionhash: send?.transactionhash,
        feehash: send?.feetransactionhash
      };
    } else {
      const gettradeprocessinfo = await prisma.tradeprocess.findUnique({
        where: {orderid: id}
      })
      if(!gettradeprocessinfo){
        await prisma.tradeprocess.create({
          data: {
            tradeid,
          orderid: id,
          confirmseen: "notstarted",
          sendusdt: "pending",
          checkusdtsent: "notstarted",
          sendfeeusdt: "notstarted",
          checkusdtfeesent: "notstarted"
        }

        })
      }
      if(gettradeprocessinfo?.sendusdt === "completed"){
      const gettrans = await prisma.adsTransaction.update({
      where: { orderId: id },
      data: {
        customerconfirm: "sent"
      }
    })
    if (!gettrans) {
      return { success: false, message: "unable to update transaction" }
    }
    return{
      success: true,
      message: "transaction status updated"
    }
      }
      const send = await sendusdttrade(Op.toString(), merchantid, userid);
      if (!send) {
        return { success: false, message: "unable to send usdt" };
      }
      const gettrans = await prisma.adsTransaction.update({
      where: { orderId: id },
      data: {
        customerconfirm: "sent"
      }
    })
    if (!gettrans) {
      return { success: false, message: "unable to update transaction" }
    }
    await prisma.tradeprocess.update({
      where: {orderid: id},
      data:{confirmseen:"completed"}
    })
      return {
        success: true,
        message: "buyer has comfirmed the coin",
        transactionhash: send?.transactionhash,
        feehash: send?.feetransactionhash
      };
    }
  } catch (error) {
    console.log(error);
  }
}

export async function completetrans(id: string) {
  try {
    const gettrans = await prisma.adsTransaction.update({
      where: { orderId: id },
      data: {
        status: "completed",
      },
    });
    if (!gettrans) {
      return { success: false, message: "unable to update transaction" };
    }
    return { success: true, gettrans };
  } catch (error) {
    console.log(error);
  }
}

export async function createdispute(
  userid: string,
  email: string,
  tradeid: string,
  dispute_reason: string
) {
  try {
    const dispute = await prisma.dispute.create({
      data: {
        userid,
        useremail: email,
        tradeid,
        orderid: tradeid,
        status: "pending",
        dispute_reason,
      },
    });

    if (!dispute) {
      return { success: false, message: "unable to create dispute order" };
    }
    return { success: true, message: "order created successfully" };
  } catch (error) {
    console.log(error);
  }
}

export async function getalldispute() {
  try {
    const dispute = await prisma.dispute.findMany({
      where: { status: "pending" },
    });
    if (!dispute) {
      return { success: false, message: "unable to get all dispute" };
    }
    return {
      success: true,
      message: "dispute fetched successfully",
      data: dispute,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function sendreminder(email: string) {}

export async function sendcode(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      console.log(user);
      return { success: false, message: "unable to get user" };
    }
    if(user.emailVerified){
      return{ success: false, message: "email has already been verified"}
    }
    const getCode = generateVerificationCode();
    if (!getCode) {
      console.log(getCode);
      return {
        success: false,
        message: "unable to generate verification code",
      };
    }
    const code = getCode;
    const uploadCode = await prisma.verificationToken.create({
      data: {
        token: code,
        email,
      },
    });
    if (!uploadCode) {
      console.log(uploadCode);
      return { success: false, message: "unable to upload code" };
    }
    const sendmail = await sendverificationmail(email, code);
    if (!sendmail) {
      console.log(sendmail);
      return { success: false, message: "unable to send verification mail" };
    }
    return { success: true, message: "verfication mail sent successfully" };
  } catch (error) {
    console.log(error);
  }
}

export async function checkcode(email: string, vcode: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return { success: false, message: "user not found" };
  }
  const code = await prisma.verificationToken.findFirst({
    where: { email },
    select: { token: true, expires: true },
  });
  if (!code) {
    return { success: false, message: "unable to get token" };
  }
  if (vcode !== code.token) {
    return { success: false, message: "incorrect verification code" };
  }
  // Check if code has expired (more than 5 minutes ago)
  const now = new Date();
  const expires = new Date(code.expires);
  const fiveMinutes = 5 * 60 * 1000;
  if (now.getTime() > expires.getTime() + fiveMinutes) {
    return { success: false, message: "Your verification code has expired" };
  }
    const updateverification = await prisma.user.update({
      where: { email },
      data: { emailVerified: true, emailVerifiedAt: now },
    });
    if (!updateverification) {
      return {
        success: false,
        message: "unable to verify email please try again later",
      };
    }

  await prisma.verificationToken.delete({
    where: { email },
  });

  return { success: true, message: "Verfied" };
}

export async function updatePassword(email: string, newPass: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return { success: false, message: "no user found" };
  }
  const hashPass = hashPassword(newPass);
  if (!hashPass) {
    return { success: false, message: "unable to encrypt password" };
  }
  const changepass = await prisma.user.update({
    where: { email },
    data: { password: hashPass },
  });
  if (!changepass) {
    return { success: false, message: "unable to update password" };
  }
  return { success: true, message: "password Updated Successfully" };
}
