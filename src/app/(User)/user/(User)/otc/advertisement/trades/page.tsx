/* eslint-disable */
import { auth } from "@/auth";
import React from "react";
import PendingTrades from "@/components/trade-holder";
import { prisma } from "@/lib/db";
import { getadstransactions, gettraderequests, gettraderequestsinfo } from "@/functions/user";
// import { useCopyToClipboard } from "@uidotdev/usehooks";

// const randomHash = crypto.randomUUID();

export default async function Profile() {
  const session= await auth()
  const profile = session?.user?.email as string
  
  const user = await prisma.user.findUnique({
        where: { email: profile },
        select: { id: true }, // Select only the user ID
      });

      const trade = await gettraderequests(profile);

      if (!user) {
        // Handle the case where user is null, e.g., redirect or return an error component
        return <div>User not found.</div>;
      }

      const response = await getadstransactions(user.id);
      const info = await gettraderequestsinfo(user.id);
      
            if (!response?.success) {
              throw new Error("an unexpected error occurred can't get trades");
              
            } 
            if (!info.success) {
              throw new Error("an unexpected error occurred can't get trade info");
                //const moreinfo = info.info;
                //setstatus(moreinfo?.status as string);
              }
      
  return (
    <PendingTrades email={profile} id={user.id as string} trades={trade.traderequests as any} tradeinfo ={info.info as any} adstrans={response.gettrans as any}/>
    
  );
};
