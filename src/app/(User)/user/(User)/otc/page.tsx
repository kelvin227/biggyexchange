/* eslint-disable */
import { auth } from "@/auth";
import { getUserByEmail } from "@/functions/user";
import React from "react";
import MarketPlaceComponent from "@/components/atok_holder";
import { prisma } from "@/lib/db";
import { getPrice } from "@/functions/blockchain/wallet.utils";

// const randomHash = crypto.randomUUID();

export default async function Marketplace() {
  const session = await auth();
  const profile = session?.user?.email as string;
  const username = await getUserByEmail(profile);
  if (!username) {
    throw new Error("an unexpected error occurred can't get username");
  }

  const crpytoprice = await getPrice();

  return (
    <MarketPlaceComponent
    email={profile.toString()}
      eth={crpytoprice.prices?.eth as string}
      usdt={crpytoprice.prices?.usdt as string}
      bnb={crpytoprice.prices?.bnb as string}
      sol={crpytoprice.prices?.sol as string}
    />
  );
}
