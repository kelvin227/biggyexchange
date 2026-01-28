/* eslint-disable */
import { auth } from "@/auth";
import { getAllAds, getUserads, getUserByEmail } from "@/functions/user";
import React from "react";
import AtokHolder from "@/components/atok_holder";
import { prisma } from "@/lib/db";
import { getPrice } from "@/functions/blockchain/wallet.utils";
// import { useCopyToClipboard } from "@uidotdev/usehooks";

// const randomHash = crypto.randomUUID();

export default async function Marketplace() {
  const session = await auth();
  const profile = session?.user?.email as string;
  const username = await getUserByEmail(profile);
  const data = await getAllAds();
  const userads = await getUserads(profile);
  if (!username) {
    throw new Error("an unexpected error occurred can't get username");
  }
  const fetchadpriceatok = await prisma.adsTransaction.findFirst({
    where: {
      AND: [{ status: "completed" }, { coin: "atok" }],
    },
    orderBy: { createdAt: "desc" }, // Fetch the latest by creation date
    select: { price: true },
  });
  const fetchadpricesocio = await prisma.adsTransaction.findFirst({
    where: {
      AND: [{ status: "completed" }, { coin: "socio" }],
    },
    orderBy: { createdAt: "desc" }, // Fetch the latest by creation date
    select: { price: true },
  });
  const fetchadpricewow = await prisma.adsTransaction.findFirst({
    where: {
      AND: [{ status: "completed" }, { coin: "wow" }],
    },
    orderBy: { createdAt: "desc" }, // Fetch the latest by creation date
    select: { price: true },
  });
  const fetchadpricesidra = await prisma.adsTransaction.findFirst({
    where: {
      AND: [{ status: "completed" }, { coin: "sidra" }],
    },
    orderBy: { createdAt: "desc" }, // Fetch the latest by creation date
    select: { price: true },
  });
  const fetchadpriceruby = await prisma.adsTransaction.findFirst({
    where: {
      AND: [{ status: "completed" }, { coin: "ruby" }],
    },
    orderBy: { createdAt: "desc" }, // Fetch the latest by creation date
    select: { price: true },
  });
  const fetchadpriceopincur = await prisma.adsTransaction.findFirst({
    where: {
      AND: [{ status: "completed" }, { coin: "opincur" }],
    },
    orderBy: { createdAt: "desc" }, // Fetch the latest by creation date
    select: { price: true },
  });
  const fetchadpricestar = await prisma.adsTransaction.findFirst({
    where: {
      AND: [{ status: "completed" }, { coin: "star" }],
    },
    orderBy: { createdAt: "desc" }, // Fetch the latest by creation date
    select: { price: true },
  });

  const crpytoprice = await getPrice();

  return (
    <AtokHolder
      ETH={crpytoprice.prices?.eth as string}
      USDT={crpytoprice.prices?.usdt as string}
      BTC={crpytoprice.prices?.btc as string}
      TON={crpytoprice.prices?.ton as string}
      SOL={crpytoprice.prices?.sol as string}
      Pi={crpytoprice.prices?.pi as string}
    />
  );
}
