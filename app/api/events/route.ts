import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export interface EventWithStats extends Event {
  total_rsvps: number;
  confirmed: number;
  cancelled: number;
  registered: number;
}

export async function GET() {
  try {
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (eventsError) throw new Error(eventsError.message);
    if (!events) return NextResponse.json({ success: true, data: [] });

    // Fetch RSVP counts for all events in one query
    const { data: rsvps, error: rsvpError } = await supabaseAdmin
      .from("rsvps")
      .select("event_id, status");

    if (rsvpError) throw new Error(rsvpError.message);

    // Aggregate counts per event
    const countMap = new Map<
      string,
      { total_rsvps: number; confirmed: number; cancelled: number; registered: number }
    >();

    for (const rsvp of rsvps ?? []) {
      const eventId = rsvp.event_id as string;
      const status = rsvp.status as string;

      if (!countMap.has(eventId)) {
        countMap.set(eventId, { total_rsvps: 0, confirmed: 0, cancelled: 0, registered: 0 });
      }
      const counts = countMap.get(eventId)!;
      counts.total_rsvps++;
      if (status === "confirmed") counts.confirmed++;
      else if (status === "cancelled") counts.cancelled++;
      else if (status === "registered") counts.registered++;
    }

    const enriched: EventWithStats[] = (events as Event[]).map((event) => ({
      ...event,
      ...(countMap.get(event.id) ?? {
        total_rsvps: 0,
        confirmed: 0,
        cancelled: 0,
        registered: 0,
      }),
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
