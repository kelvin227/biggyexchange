import { auth } from "@/auth";
import Security from "@/components/sercurity_holder";
import { prisma } from "@/lib/db";

export default async function Home() {
  const session = await auth();

  const emailverified = await prisma.user.findUnique({
    where:{email: session?.user?.email as string},
    select:{emailVerified: true}
  })

  return (
    <div>
      <Security email={session?.user?.email as string} verified={emailverified?.emailVerified as boolean} />
    </div>
  );
}


