import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { AgentMessage } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params;

    const { data, error } = await supabaseAdmin
      .from("agent_messages")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data: (data ?? []) as AgentMessage[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
