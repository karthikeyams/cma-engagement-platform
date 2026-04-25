import { BaseAgent } from "@/lib/agents/base-agent";
import type { Member, Event, RSVP } from "@/lib/types";
import { format } from "date-fns";

export type ReminderType = "T7" | "T1";
export type ConfirmationResponse = "YES" | "NO" | "MAYBE";

export interface SendReminderResult {
  message: string;
  agentMessageId: string;
  member: Member;
  event: Event;
}

export interface BulkReminderResult {
  sent: number;
  failed: number;
  results: Array<{ memberId: string; success: boolean; error?: string }>;
}

export interface ConfirmationResult {
  updatedRSVP: RSVP;
  acknowledgment: string;
  updatedEngagementScore: number;
}

const REMINDER_SYSTEM_PROMPT = `You are a warm, personable community coordinator for Chinmaya Mission Atlanta (CMA), a Vedanta spiritual organization. Your role is to send thoughtful, personalized event reminders to members. Your tone is caring, community-oriented, and spiritually grounded — never corporate or generic.

When writing reminders:
- Address the member by first name
- Reference the specific event naturally
- For T7 reminders: express enthusiasm, share brief context about the event, and ask them to confirm attendance by replying YES to confirm or NO if they can no longer attend
- For T1 reminders: create gentle urgency, remind them it is tomorrow, and ask for a quick confirmation
- Keep messages under 150 words
- End with 'Jai Shri Ram' or 'Om Namah Shivaya' appropriate to the event type
- Never mention unrelated programs or make it feel like a mass email`;

const ACKNOWLEDGMENT_SYSTEM_PROMPT = `You are a CMA community coordinator. Write a brief, warm acknowledgment (under 60 words) of a member's RSVP response. If confirming, express delight. If cancelling, express understanding and invite them to future events. Always end with a blessing.`;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class EventReminderAgent extends BaseAgent {
  readonly agentType = "event_reminder" as const;

  async sendReminder(
    memberId: string,
    eventId: string,
    reminderType: ReminderType
  ): Promise<SendReminderResult> {
    const [member, event] = await Promise.all([
      this.getMemberProfile(memberId),
      this.getEventDetails(eventId),
    ]);

    if (!member) throw new Error(`Member not found: ${memberId}`);
    if (!event) throw new Error(`Event not found: ${eventId}`);

    const firstName = member.name.split(" ")[0];
    const eventDate = format(new Date(event.event_date), "EEEE, MMMM d 'at' h:mm a");
    const interests = member.interests?.join(", ") ?? "general programs";

    const userContext = `
Member: ${member.name} (first name: ${firstName})
Preferred channel: ${member.preferred_channel}
Interests: ${interests}
Engagement tier: ${member.tier}

Event: ${event.title}
Date: ${eventDate}
Location: ${event.location ?? "CMA Ashram"}
Type: ${event.type}
Description: ${event.description ?? ""}

Reminder type: ${reminderType === "T7" ? "T7 — event is one week away" : "T1 — event is tomorrow"}

Write a personalized ${reminderType === "T7" ? "one-week-out" : "day-before"} reminder message for this member.
    `.trim();

    const message = await this.generateMessage(REMINDER_SYSTEM_PROMPT, userContext);

    const now = new Date().toISOString();
    const logged = await this.logMessage({
      memberId,
      eventId,
      channel: member.preferred_channel === "whatsapp" ? "whatsapp" : "email",
      direction: "outbound",
      subject:
        member.preferred_channel !== "whatsapp"
          ? `Reminder: ${event.title} — ${reminderType === "T7" ? "Coming Up Next Week" : "Tomorrow!"}`
          : null,
      content: message,
      status: "sent",
      sentAt: now,
    });

    // T1 reminders upgrade unconfirmed RSVPs to confirmed
    if (reminderType === "T1") {
      await this.supabase
        .from("rsvps")
        .update({ status: "confirmed", confirmed_at: now, updated_at: now })
        .eq("member_id", memberId)
        .eq("event_id", eventId)
        .eq("status", "registered");
    }

    return { message, agentMessageId: logged.id, member, event };
  }

  async sendBulkReminders(
    eventId: string,
    reminderType: ReminderType
  ): Promise<BulkReminderResult> {
    const { data, error } = await this.supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", eventId)
      .in("status", ["registered", "confirmed"]);

    if (error) throw new Error(`Failed to fetch RSVPs: ${error.message}`);

    const rsvps = (data ?? []) as unknown as RSVP[];
    if (rsvps.length === 0) return { sent: 0, failed: 0, results: [] };

    const results: BulkReminderResult["results"] = [];
    let sent = 0;
    let failed = 0;

    for (const rsvp of rsvps) {
      try {
        await this.sendReminder(rsvp.member_id, eventId, reminderType);
        results.push({ memberId: rsvp.member_id, success: true });
        sent++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ memberId: rsvp.member_id, success: false, error: message });
        failed++;
      }
      await delay(500);
    }

    return { sent, failed, results };
  }

  async processConfirmation(
    memberId: string,
    eventId: string,
    response: ConfirmationResponse
  ): Promise<ConfirmationResult> {
    const [member, event] = await Promise.all([
      this.getMemberProfile(memberId),
      this.getEventDetails(eventId),
    ]);

    if (!member) throw new Error(`Member not found: ${memberId}`);
    if (!event) throw new Error(`Event not found: ${eventId}`);

    const now = new Date().toISOString();
    const newStatus =
      response === "YES" ? "confirmed" : response === "NO" ? "cancelled" : "registered";

    const { data: rsvpData, error: rsvpError } = await this.supabase
      .from("rsvps")
      .update({
        status: newStatus,
        confirmed_at: response === "YES" ? now : null,
        updated_at: now,
      })
      .eq("member_id", memberId)
      .eq("event_id", eventId)
      .select()
      .single();

    if (rsvpError) throw new Error(`Failed to update RSVP: ${rsvpError.message}`);
    const updatedRSVP = rsvpData as unknown as RSVP;

    // Log the inbound response
    await this.logMessage({
      memberId,
      eventId,
      channel: member.preferred_channel === "whatsapp" ? "whatsapp" : "email",
      direction: "inbound",
      subject: null,
      content: response,
      status: "received",
      sentAt: now,
    });

    // Generate acknowledgment
    const firstName = member.name.split(" ")[0];
    const ackContext = `
Member: ${firstName}
Event: ${event.title} on ${format(new Date(event.event_date), "MMMM d")}
Their response: ${response === "YES" ? "Confirming attendance" : response === "NO" ? "Cancelling — cannot attend" : "Maybe — not sure yet"}
    `.trim();

    const acknowledgment = await this.generateMessage(
      ACKNOWLEDGMENT_SYSTEM_PROMPT,
      ackContext
    );

    // Log the outbound acknowledgment
    await this.logMessage({
      memberId,
      eventId,
      channel: member.preferred_channel === "whatsapp" ? "whatsapp" : "email",
      direction: "outbound",
      subject: null,
      content: acknowledgment,
      status: "sent",
      sentAt: now,
    });

    // Update last_active_at and recalculate engagement score
    const scoreDelta = response === "YES" ? 5 : response === "NO" ? -2 : 0;
    const newScore = Math.min(100, Math.max(0, member.engagement_score + scoreDelta));

    await this.supabase
      .from("members")
      .update({ last_active_at: now })
      .eq("id", memberId);

    await this.supabase
      .from("members")
      .update({ engagement_score: newScore })
      .eq("id", memberId);

    return { updatedRSVP, acknowledgment, updatedEngagementScore: newScore };
  }
}
