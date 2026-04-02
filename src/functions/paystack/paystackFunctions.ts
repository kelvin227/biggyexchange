"use server";

export async function createTransferRecipient({
  name,
  accountNumber,
  bankCode,
}: {
  name: string;
  accountNumber: string;
  bankCode: string;
}) {
  const response = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to create transfer recipient");
  }

  return data.data; // contains recipient_code
}

async function initiateTransfer({
  amountInNaira,
  recipientCode,
  reason,
  reference,
}: {
  amountInNaira: number;
  recipientCode: string;
  reason: string;
  reference: string;
}) {
  const amountInKobo = Math.round(amountInNaira * 100);

  const response = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: amountInKobo,
      recipient: recipientCode,
      reason,
      reference,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to initiate transfer");
  }

  return data.data;
}
export async function payUserForSell({
  user,
  amountInNaira,
  transactionReference,
}: {
  user: {
    id: string;
    fullName: string;
    accountNumber: string;
    bankCode: string;
    recipientCode?: string | null;
  };
  amountInNaira: number;
  transactionReference: string;
}) {
  // app/api/get-token/route.ts
  const params = new URLSearchParams({
    client_id: process.env.FLW_CLIENT_ID!,
    client_secret: process.env.FLW_CLIENT_SECRET!,
    grant_type: "client_credentials",
  });

  const res = await fetch(
    "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  const data = await res.json();
  return ({ token: data.access_token })
}

export async function getPaystackBalance() {
  const response = await fetch("https://api.flutterwave.com/v3/balances/NGN", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to fetch balance");
  }

  return data.data;
}