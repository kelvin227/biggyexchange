import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { sendtestEth } from "@/functions/blockchain/wallet.utils";
import { pusherServer } from "@/lib/pusher";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "Missing Paystack secret key" },
        { status: 500 },
      );
    }

    // 🔥 Get raw body as text
    const rawBody = await req.text();

    // 🔐 Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const signature = req.headers.get("x-paystack-signature");

    if (!signature || hash !== signature) {
      console.log("[Paystack Webhook] signature verification failed", {
        signature,
        hash,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("[Paystack Webhook] signature verified successfully");

    // Parse JSON after verifying signature
    const event = JSON.parse(rawBody);

    // 🔔 Log received webhook for debugging
    console.log(
      "[Paystack Webhook] received event:",
      event.event,
      "reference:",
      event.data?.reference,
      "rawBody length",
      rawBody.length,
    );

    // We only care about successful payments
    if (event.event !== "charge.success") {
      console.log("[Paystack Webhook] ignoring event type", event.event);
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const reference = event.data.reference;
    const amountPaid = event.data.amount; // in kobo
    const currency = event.data.currency;

    // 🔎 Find transaction in DB
    const transaction = await prisma.transaction.findUnique({
      where: { PaymentReference: reference },
    });

    if (!transaction) {
      console.log(
        "[Paystack Webhook] no transaction found for reference",
        reference,
      );
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    // 🚫 Prevent duplicate processing
    if (transaction.status !== "pending") {
      console.log(
        "[Paystack Webhook] transaction already processed",
        transaction.id,
        transaction.status,
      );
      return NextResponse.json(
        { message: "Transaction already processed" },
        { status: 200 },
      );
    }

    // ✅ Verify amount matches (important)
    const expectedAmount = parseFloat(transaction.nairaAmount) * 100;
    if (expectedAmount !== amountPaid) {
      console.log("[Paystack Webhook] amount mismatch", {
        expectedAmount,
        amountPaid,
      });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    if (currency !== "NGN") {
      console.log("[Paystack Webhook] invalid currency", currency);
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    // 🔄 Mark transaction as paid
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "paid" },
    });

    await pusherServer.trigger(`transaction-${reference}`, "status-update", {
      status: "paid",
    });
    console.log("[Paystack Webhook] transaction marked paid", transaction.id);

    // 🚀 At this point you will:
    // 1. Send Sepolia ETH
    const cryptoAmount = transaction.cryptoAmount;

    const walletAddress = await prisma.wallets.findUnique({
      where: { userId: transaction.userId },
    });

    if (!walletAddress) {
      console.log(
        "[Paystack Webhook] wallet address missing for user",
        transaction.userId,
      );
      return NextResponse.json(
        { error: "User wallet address not found" },
        { status: 404 },
      );
    }
    console.log(
      "[Paystack Webhook] wallet address found",
      walletAddress.address,
    );
    // const adminemail = await prisma.user.findFirst({
    //     where: { roles: "admin" }
    // })

    //const email = adminemail?.email;

    await pusherServer.trigger(`transaction-${reference}`, "status-update", {
      status: "Sending crypto",
    });

    const sendCrypto = await sendtestEth(
      cryptoAmount,
      walletAddress.address,
      "trustgain76@gmail.com",
    );
    console.log("[Paystack Webhook] sendtestEth result", sendCrypto);

    if (!sendCrypto) {
      console.log("[Paystack Webhook] crypto send failed");
      return NextResponse.json(
        { error: "Failed to send crypto" },
        { status: 500 },
      );
    }
    if (!sendCrypto.success) {
      console.log(
        "[Paystack Webhook] crypto send unsuccessful",
        sendCrypto.message,
      );
      return NextResponse.json(
        { error: "Failed to send crypto" },
        { status: 500 },
      );
    }
    // 2. Update status to "sent"
    const updateTransactionSent = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "Sent", txHash: sendCrypto.Txhash },
    });
    console.log(
      "[Paystack Webhook] transaction status updated to Sent",
      transaction.id,
      "txHash",
      sendCrypto.Txhash,
    );

    if (!updateTransactionSent) {
      console.log(
        "[Paystack Webhook] error updating transaction status to Sent",
        transaction.id,
      );
      return NextResponse.json(
        { message: "Error updating Transaction Status" },
        { status: 500 },
      );
    }
    await pusherServer.trigger(`transaction-${reference}`, "status-update", {
      status: "Sending crypto",
      txHash: sendCrypto.Txhash,
    });
    // (We will connect this next)

    return NextResponse.json({ message: "Payment verified" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
