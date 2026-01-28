import React from "react";
import { auth } from "@/auth";
import OTC_handler from "@/components/otchandler";


export default async function Header(){
    const session = await auth();
  return(
    <OTC_handler email={session?.user?.email as string} />

  )

}


