import React from "react";
import { auth } from "@/auth";
import BankDetailsForm from "@/components/otchandler";
import { prisma } from "@/lib/db";



export default async function Header(){
    const session = await auth();
    const getuserid = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      }
    });

    if(!getuserid){
      return(
         <div>
        user not found
      </div>
      )
    }

  return(
    <BankDetailsForm userId={getuserid.id as string} />

  )

}


