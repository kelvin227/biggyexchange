import React from "react";
import { auth } from "@/auth";
import HeaderCom from "@/components/header_com";
import { getundeliveredNotifications } from "@/functions/user";
import { prisma } from "@/lib/db";


export default async function Header(){
    const session = await auth();

    const notificationIsRead = await getundeliveredNotifications(session?.user?.email as string)

    const getPP = await prisma.user.findUnique({
      where:{email: session?.user?.email as string}
    });

    const kyc = await prisma.user.findUnique({
          where: { email: session?.user?.email as string },
          select: { kycverified: true },
        });
    

  return(
  // eslint-disable-next-line
    <HeaderCom notificationIsRead={notificationIsRead.notifications as any} img={getPP?.image as string} kyc={kyc?.kycverified as boolean}/>

  )

}


