/* eslint-disable */
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash");
  const secretHash = process.env.FLW_SECRET_HASH;

  // Reject requests without the signature header
  if (!signature || signature !== secretHash) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const { event, data } = payload;

  // Acknowledge immediately — Flutterwave times out after 60 seconds
  // and retries 3 times at 30-minute intervals if you don't respond with 200
  const response = NextResponse.json({ received: true }, { status: 200 });

  // Handle the event asynchronously after acknowledging
  handleEvent(event, data).catch((err) =>
    console.error("Webhook processing error:", err)
  );

  return response;
}

async function handleEvent(event: string, data: any) {
  switch (event) {
    case "transfer.completed":
      await handleTransferCompleted(data);
      break;

    default:
      console.log(`Unhandled event type: ${event}`);
  }
}

async function handleTransferCompleted(data: any) {
  const { id, reference, status, amount, complete_message, fullname } = data;

  // Idempotency check — prevent double-processing the same event
//   const alreadyProcessed = await checkIfProcessed(id);
//   if (alreadyProcessed) {
//     console.log(`Webhook ${id} already processed, skipping.`);
//     return;
//   }

    const transfer = await prisma.transaction.findUnique({
        where: { PaymentReference: reference },
    })
    if (!transfer) {
        console.log(`No transaction found for reference ${reference}`);
        return;
    }

  if (status === "SUCCESSFUL") {
    console.log(`Transfer ${reference} of ${amount} to ${fullname} succeeded.`);
    // e.g. update your DB: await db.transfers.update({ reference, status: "completed" })
    await prisma.transaction.update({
        where: { PaymentReference: reference },
        data: { status: "completed" },
    })
  } else if (status === "FAILED") {
    await prisma.transaction.update({
        where: { PaymentReference: reference },
        data: { status: "failed" },
    })
    console.log(`Transfer ${reference} failed: ${complete_message}`);
    // e.g. notify your team, trigger a retry, update your DB
  }

  // Mark as processed to handle retries safely
  //await markAsProcessed(id);
}

// --- Replace these with real DB calls in production ---
const processedIds = new Set<number>();

async function checkIfProcessed(id: number): Promise<boolean> {
  return processedIds.has(id);
}

async function markAsProcessed(id: number): Promise<void> {
  processedIds.add(id);
  // await db.processedWebhooks.create({ webhookId: id })
}
