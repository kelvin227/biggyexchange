import { auth } from "@/auth";
import ReferralPage from "@/components/refer-pageholder";
import { getUserByEmail } from "@/functions/user";
import { prisma } from "@/lib/db";


// type KycPageholderProps = {
//   email: string;
//   mess: string;
// };

const Refer= async() => {
  const session= await auth();
  const refer = await getUserByEmail(session?.user?.email as string);

  const referredUsers = await prisma.user.findMany({
      where: { referredBy: refer?.referralCode as string },
      omit: {
        id: true,
        password: true
      }
      
    });

  return (
  <div>
    <ReferralPage refer={refer?.referralCode as string} refferedUsers={referredUsers} />
  </div>
  );

};


export default Refer;