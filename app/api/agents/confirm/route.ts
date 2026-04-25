import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventReminderAgent } from "@/lib/agents/event-reminder-agent";

const bodySchema = z.object({
  memberId: z.string().uuid(),
  eventId: z.string().uuid(),
  response: z.enum(["YES", "NO", "MAYBE"]),
});

export async function POST(req: NextRequest) {
  try {
    const json: unknown = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { memberId, eventId, response } = parsed.data;
    const agent = new EventReminderAgent();
    const result = await agent.processConfirmation(memberId, eventId, response);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
