import { auth } from "@/auth";
import Profile_pageholder from "@/components/profile-pageholder";
import { getUserByEmail } from "@/functions/user";
import { User } from "@prisma/client";
import React from "react";
// import { useCopyToClipboard } from "@uidotdev/usehooks";

// const randomHash = crypto.randomUUID();

export default async function Profile() {
  const session= await auth()
  const profile = await getUserByEmail(session?.user?.email as string)
  //   const [copiedText, copyToClipboard] = useCopyToClipboard();
  // const hasCopiedText = Boolean(copiedText);
  return (
    <Profile_pageholder user={profile as User} />
    
  );
};
