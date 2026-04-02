import { sendSupportMail } from "@/functions/user";
import { prisma } from "@/lib/db";
import { generateIssueNumberTx } from "@/lib/utils";

export async function POST(req: Request) {

    const body = await req.json();

    let issue;
    let attempts = 0;
    let mail;
    let mailAttempts = 0;

    const name = await prisma.user.findUnique({
        where: {email: body.email},
        select: {name: true}
    })

    if(!name){
        return Response.json(
            { success: false, message: "User not found" },
            { status: 404 }
        );
    }

while (!issue && attempts < 3) {
  try {
    const issueNumber = await generateIssueNumberTx(prisma);

    issue = await prisma.supportIssue.create({
      data: {
        issueNumber,
        name: name.name as string,
        email: body.email,
        issueType: body.subject,
        transactionReference: body.transactionReference,
        message: body.message,
      },
    });

    while (!mail && mailAttempts < 3) {
  try {

    mail = await sendSupportMail(
      name.name as string,
      body.email,
      issueNumber,
      body.subject,
      "light"
    );


    return Response.json({
      success: true,
      issueNumber,
      issue,
    });
  } catch (err: any) {
    if (err.code === "P2021") {
      // duplicate issueNumber → retry
      mailAttempts++;
    } else {
      throw err;
    }
  }
}
  } catch (err: any) {
    if (err.code === "P2002") {
      // duplicate issueNumber → retry
      attempts++;
    } else {
      throw err;
    }
  }
}
}