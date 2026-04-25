import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventReminderAgent } from "@/lib/agents/event-reminder-agent";

const bodySchema = z.object({
  eventId: z.string().uuid(),
  reminderType: z.enum(["T7", "T1"]),
  memberId: z.string().uuid().optional(),
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

    const { eventId, reminderType, memberId } = parsed.data;
    const agent = new EventReminderAgent();

    if (memberId) {
      const result = await agent.sendReminder(memberId, eventId, reminderType);
      return NextResponse.json({ success: true, data: result });
    }

    const result = await agent.sendBulkReminders(eventId, reminderType);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
