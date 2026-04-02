// app/api/ask-agent/route.ts
import { ChatResponse } from '@/components/support/supportComp';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  try {
    const res = await fetch(`https://kazel27-codegatorai.hf.space/support/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data: ChatResponse = await res.json();
    console.log(data);
    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Failed to reach agent' }, { status: 500 });
  }
}