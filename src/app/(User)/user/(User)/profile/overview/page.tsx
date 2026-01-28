import { auth } from "@/auth";
import Overview_page from "@/components/overview-page";
/* eslint-disable */
import { getUserByEmail } from "@/functions/user";

export default async function Overview() {
  const session = await auth();
  const profile = await getUserByEmail(session?.user?.email as string)
  return (
    <Overview_page email={session?.user?.email as string} profile={profile as any} />
  );
};
