import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { RSVP, Member } from "@/lib/types";

export interface RSVPWithMember extends RSVP {
  member_name: string;
  member_email: string;
  member_phone: string | null;
  member_preferred_channel: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params;

    const { data: rsvps, error: rsvpError } = await supabaseAdmin
      .from("rsvps")
      .select("*")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: true });

    if (rsvpError) throw new Error(rsvpError.message);
    if (!rsvps || rsvps.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch member details for all RSVPs
    const memberIds = (rsvps as RSVP[]).map((r) => r.member_id);
    const { data: members, error: memberError } = await supabaseAdmin
      .from("members")
      .select("id, name, email, phone, preferred_channel")
      .in("id", memberIds);

    if (memberError) throw new Error(memberError.message);

    const memberMap = new Map<string, Pick<Member, "id" | "name" | "email" | "phone" | "preferred_channel">>();
    for (const m of members ?? []) {
      memberMap.set(m.id, m as Pick<Member, "id" | "name" | "email" | "phone" | "preferred_channel">);
    }

    const enriched: RSVPWithMember[] = (rsvps as RSVP[]).map((rsvp) => {
      const member = memberMap.get(rsvp.member_id);
      return {
        ...rsvp,
        member_name: member?.name ?? "Unknown",
        member_email: member?.email ?? "",
        member_phone: member?.phone ?? null,
        member_preferred_channel: member?.preferred_channel ?? "email",
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
