import { NextRequest, NextResponse } from "next/server";
import { Web3 } from "web3";

// Optional:
// import { prisma } from "@/lib/prisma";
// import { processSellPayout } from "@/lib/sell/processSellPayout";

const web3 = new Web3();

/**
 * Moralis signs webhooks as:
 * sha3(JSON.stringify(body) + secret)
 *
 * Official docs say to:
 * 1. Read x-signature
 * 2. Recompute using request body + Streams secret
 * 3. Compare
 */
function verifyMoralisSignature(
  rawBodyObject: unknown,
  providedSignature: string | null,
  secret: string
): boolean {
  if (!providedSignature) return false;

  const expectedSignature = web3.utils.sha3(
    JSON.stringify(rawBodyObject) + secret
  );

  if (!expectedSignature) return false;

  return expectedSignature === providedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const streamsSecret = process.env.MORALIS_STREAMS_SECRET;

    if (!streamsSecret) {
      console.error("Missing MORALIS_STREAMS_SECRET");
      return NextResponse.json(
        { message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const signature = req.headers.get("x-signature");

    // Important:
    // We parse JSON once and verify against JSON.stringify(parsedBody),
    // matching the official Moralis verification flow.
    let body: any;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const isValid = verifyMoralisSignature(body, signature, streamsSecret);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid Moralis signature" },
        { status: 401 }
      );
    }

    // Moralis test webhooks should still include x-signature and should be
    // verified the same way. A simple approach is to accept empty/test payloads
    // and skip app-specific processing.
    const isEmptyPayload =
      !body ||
      (typeof body === "object" && Object.keys(body).length === 0);

    if (isEmptyPayload) {
      return NextResponse.json({ ok: true, test: true });
    }

    // ---- DEBUG LOGGING ----
    console.log("Moralis webhook verified");
    console.log(JSON.stringify(body, null, 2));

    /**
     * At this point, you can:
     * 1. Store the raw payload in DB
     * 2. Match it to a pending sell transaction
     * 3. Mark tx as crypto_confirmed
     * 4. Trigger internal payout logic
     *
     * Example pseudo-flow:
     */

    // Example EVM payload handling
    // Moralis webhook payloads can contain txs / erc20Transfers / nftTransfers / logs
    const txs = Array.isArray(body?.txs) ? body.txs : [];
    const erc20Transfers = Array.isArray(body?.erc20Transfers)
      ? body.erc20Transfers
      : [];

    // Example: process native coin transfers
    for (const tx of txs) {
      const txHash = tx?.hash || tx?.transactionHash || null;
      const from = tx?.fromAddress || tx?.from || null;
      const to = tx?.toAddress || tx?.to || null;
      const value = tx?.value || null;
      const chainId = body?.chainId || tx?.chainId || null;

      console.log("Native tx:", { txHash, from, to, value, chainId });

      // Example DB save:
      await prisma.webhookEvent.create({
        data: {
          provider: "moralis",
          eventType: "native_transfer",
          chainId: String(chainId ?? ""),
          txHash: txHash ?? "",
          payload: body,
        },
      });

      // Example transaction matching:
      // const sellTx = await prisma.sellTransaction.findFirst({
      //   where: {
      //     txHash,
      //     status: "crypto_submitted",
      //   },
      // });
      //
      // if (sellTx) {
      //   await prisma.sellTransaction.update({
      //     where: { id: sellTx.id },
      //     data: { status: "crypto_confirmed" },
      //   });
      //
      //   await processSellPayout(sellTx.reference);
      // }
    }

    // Example: process ERC20 transfers
    for (const transfer of erc20Transfers) {
      const txHash = transfer?.transactionHash || null;
      const from = transfer?.from || null;
      const to = transfer?.to || null;
      const value = transfer?.value || null;
      const tokenAddress = transfer?.address || transfer?.tokenAddress || null;
      const chainId = body?.chainId || null;

      console.log("ERC20 transfer:", {
        txHash,
        from,
        to,
        value,
        tokenAddress,
        chainId,
      });

      // Example DB save:
      // await prisma.webhookEvent.create({
      //   data: {
      //     provider: "moralis",
      //     eventType: "erc20_transfer",
      //     chainId: String(chainId ?? ""),
      //     txHash: txHash ?? "",
      //     payload: body,
      //   },
      // });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Moralis webhook error:", error);

    // Non-2xx responses can trigger retries, so only return error status
    // when you really want the event retried.
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}