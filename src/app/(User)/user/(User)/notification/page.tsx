import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import NotificationPage from "@/components/noti";


export default async function Transaction() {
  const session= await auth();
      const email = session?.user?.email as string; 

      const userid = await prisma.user.findUnique({
        where:{email},
        select:{id: true}
      })

      if(!userid){
        console.error("user does not exist")
      }

      
      const notification = await prisma.notification.findMany({
        where:{userId: userid?.id}
      })
      
 return (
// eslint-disable-next-line
<NotificationPage notification={notification as any}/>
 );
}

