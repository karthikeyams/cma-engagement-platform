import { NextRequest, NextResponse } from "next/server";
import { updateRegistration, appendWebhookLog } from "@/lib/zeffy/store";

// Zeffy payload shape varies by form version — no Zod, use optional chaining
interface ZeffyOrder {
  email?: string;
  answers?: Array<{ email?: string }>;
}

interface ZeffyFormData {
  email?: string;
}

interface ZeffyPayload {
  order_status?: string;
  order?: ZeffyOrder;
  formData?: ZeffyFormData;
  transaction_id?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const received_at = new Date().toISOString();
  const steps: string[] = [];
  let payload: ZeffyPayload;

  try {
    payload = (await request.json()) as ZeffyPayload;
  } catch {
    appendWebhookLog({
      id: `wh_${Date.now()}`,
      received_at,
      payload: {},
      email: null,
      result: "error",
      reason: "invalid_json",
      steps: ["Received POST", "Failed to parse JSON body"],
    });
    return NextResponse.json({ received: true, skipped: true }, { status: 200 });
  }

  steps.push(`Received POST — order_status: "${payload.order_status ?? "missing"}"`);
  console.log("[zeffy-webhook] Received:", JSON.stringify(payload));

  if (payload.order_status !== "paid") {
    steps.push(`Skipped — order_status is not "paid"`);
    appendWebhookLog({
      id: `wh_${Date.now()}`,
      received_at,
      payload: payload as Record<string, unknown>,
      email: null,
      result: "skipped",
      reason: `order_status="${payload.order_status ?? "missing"}"`,
      steps,
    });
    return NextResponse.json({ received: true, skipped: true }, { status: 200 });
  }

  steps.push('order_status === "paid" ✓');

  const email =
    payload.order?.email ??
    payload.formData?.email ??
    payload.order?.answers?.[0]?.email;

  if (!email) {
    steps.push("No email found in payload — skipped");
    appendWebhookLog({
      id: `wh_${Date.now()}`,
      received_at,
      payload: payload as Record<string, unknown>,
      email: null,
      result: "skipped",
      reason: "no_email",
      steps,
    });
    return NextResponse.json({ received: true, skipped: true, reason: "no_email" }, { status: 200 });
  }

  steps.push(`Email extracted: ${email}`);
  console.log("[zeffy-webhook] Processing:", email);

  const payment_confirmed_at = new Date().toISOString();
  const transaction_id = payload.transaction_id ?? `zeffy_${Date.now()}`;

  steps.push(`Looking up registration in Supabase…`);

  const updated = await updateRegistration(email, {
    status: "Complete",
    payment_confirmed_at,
    transaction_id,
  });

  if (updated) {
    steps.push(`Updated registration → status: "Complete"`);
    steps.push(`transaction_id: ${transaction_id}`);
  } else {
    steps.push(`No registration found for ${email}`);
  }

  console.log("[zeffy-webhook] Complete:", { email, updated: !!updated });

  appendWebhookLog({
    id: `wh_${Date.now()}`,
    received_at,
    payload: payload as Record<string, unknown>,
    email,
    result: updated ? "updated" : "not_found",
    transaction_id,
    steps,
  });

  return NextResponse.json({
    received: true,
    skipped: false,
    updated: !!updated,
    email,
  });
}
