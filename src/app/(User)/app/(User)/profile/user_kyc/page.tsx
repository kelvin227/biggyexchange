import { auth } from "@/auth";
import KycPageholder from "@/components/kyc_pageholder";
import { getKycStatus } from "@/functions/user";





const UKyc= async() => {
  const session= await auth();
  const kyc = await getKycStatus(session?.user?.email as string);
  let kycs ="";
  if (kyc?.message === "approved") {
    kycs = "approved";
  } else if (kyc?.message === "pending") {
    kycs = "pending";

  }
  else if (kyc?.message === "rejected") {
    kycs = "rejected";
    } else {
    kycs = "not submitted";
  }
  return (
  <div>
    <KycPageholder kycss={kycs} email={session?.user?.email as string} />
  </div>
  );

};
export default UKyc;