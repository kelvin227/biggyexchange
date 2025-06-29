import React from "react";
import KycHolder from "@/components/kyc_holder";
import { prisma } from "@/lib/db";

export default async function Kycpage() {
  
      const kycRequests = await prisma.kyc.findMany({
        include: {
          user: {
            select: {
              email: true, // Include the user's email
            },
          },
        },
      });
    
  return <KycHolder kyc={kycRequests}/>;
}
