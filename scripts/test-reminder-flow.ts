/**
 * test-reminder-flow.ts
 * End-to-end test for the Event Reminder Agent.
 * Run: npm run test:reminder
 */

// Load env vars before any imports that need them
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { EventReminderAgent } from "../lib/agents/event-reminder-agent";
import { supabaseAdmin } from "../lib/supabase/server";
import type { Event, RSVP } from "../lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

const DIVIDER = "─".repeat(60);

async function main() {
  console.log("\n" + DIVIDER);
  console.log("  CMA Engagement Platform — Event Reminder Agent Test");
  console.log(DIVIDER + "\n");

  const agent = new EventReminderAgent();

  // ── Step 1: Fetch the Gita Jnana Yajna event
  console.log("📅 Step 1: Fetching Gita Jnana Yajna event...");
  const { data: eventData, error: eventError } = await db
    .from("events")
    .select("*")
    .ilike("title", "%Gita%")
    .limit(1)
    .single();

  if (eventError || !eventData) {
    console.error("❌ Could not find Gita Jnana Yajna event:", eventError?.message);
    process.exit(1);
  }
  const event = eventData as Event;
  console.log(`   ✓ Found: "${event.title}" (${event.id})\n`);

  // ── Step 2: Fetch 3 members who have RSVPd
  console.log("👥 Step 2: Fetching RSVPs for this event...");
  const { data: rsvpData, error: rsvpError } = await db
    .from("rsvps")
    .select("*")
    .eq("event_id", event.id)
    .in("status", ["registered", "confirmed"])
    .limit(3);

  if (rsvpError || !rsvpData || rsvpData.length === 0) {
    console.error("❌ No RSVPs found:", rsvpError?.message);
    process.exit(1);
  }
  const rsvps = rsvpData as RSVP[];
  console.log(`   ✓ Found ${rsvps.length} RSVPs to process\n`);

  // ── Step 3: Send T7 reminders to all 3 members
  console.log("📨 Step 3: Sending T7 reminders...\n");
  const reminderResults: Array<{ success: boolean; memberId: string; error?: string }> = [];

  for (let i = 0; i < rsvps.length; i++) {
    const rsvp = rsvps[i];
    console.log(`   [${i + 1}/${rsvps.length}] Sending reminder to member ${rsvp.member_id}...`);

    try {
      const result = await agent.sendReminder(rsvp.member_id, event.id, "T7");
      reminderResults.push({ success: true, memberId: rsvp.member_id });

      console.log(`\n   ┌─ Reminder for ${result.member.name} (${result.member.preferred_channel})`);
      console.log("   │");
      result.message.split("\n").forEach((line) => {
        console.log(`   │  ${line}`);
      });
      console.log("   └─ [agentMessageId: " + result.agentMessageId + "]\n");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ Failed for ${rsvp.member_id}: ${message}\n`);
      reminderResults.push({ success: false, memberId: rsvp.member_id, error: message });
    }
  }

  // ── Step 4: processConfirmation — YES for member 1
  const member1 = rsvps[0];
  console.log(DIVIDER);
  console.log(`\n✅ Step 4: Processing YES confirmation for ${member1.member_id.slice(0, 8)}…`);

  const yesResult = await agent.processConfirmation(member1.member_id, event.id, "YES");
  console.log(`\n   RSVP status     : ${yesResult.updatedRSVP.status}`);
  console.log(`   Engagement score: ${yesResult.updatedEngagementScore}`);
  console.log("\n   Acknowledgment:");
  yesResult.acknowledgment.split("\n").forEach((line) => {
    console.log(`   > ${line}`);
  });

  // ── Step 5: processConfirmation — NO for member 2
  const member2 = rsvps[1];
  console.log(`\n❌ Step 5: Processing NO cancellation for ${member2.member_id.slice(0, 8)}…`);

  const noResult = await agent.processConfirmation(member2.member_id, event.id, "NO");
  console.log(`\n   RSVP status     : ${noResult.updatedRSVP.status}`);
  console.log(`   Engagement score: ${noResult.updatedEngagementScore}`);
  console.log("\n   Acknowledgment:");
  noResult.acknowledgment.split("\n").forEach((line) => {
    console.log(`   > ${line}`);
  });

  // ── Summary
  const sent = reminderResults.filter((r) => r.success).length;
  const failed = reminderResults.filter((r) => !r.success).length;

  console.log("\n" + DIVIDER);
  console.log("  SUMMARY");
  console.log(DIVIDER);
  console.log(`  Reminders sent    : ${sent}`);
  console.log(`  Reminders failed  : ${failed}`);
  console.log(`  Confirmations     : 1 YES (${member1.member_id.slice(0, 8)}…)`);
  console.log(`  Cancellations     : 1 NO  (${member2.member_id.slice(0, 8)}…)`);
  console.log(`  Final RSVP status : member1=${yesResult.updatedRSVP.status}, member2=${noResult.updatedRSVP.status}`);
  console.log(`  Engagement scores : member1=${yesResult.updatedEngagementScore}, member2=${noResult.updatedEngagementScore}`);
  console.log(DIVIDER + "\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
