import { NextRequest, NextResponse } from "next/server";
import { updateRegistration } from "@/lib/zeffy/store";

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
  let payload: ZeffyPayload;
  try {
    payload = (await request.json()) as ZeffyPayload;
  } catch {
    return NextResponse.json({ received: true, skipped: true }, { status: 200 });
  }

  console.log("[zeffy-webhook] Received:", JSON.stringify(payload));

  if (payload.order_status !== "paid") {
    console.log("[zeffy-webhook] Skipping — order_status is not 'paid':", payload.order_status);
    return NextResponse.json({ received: true, skipped: true }, { status: 200 });
  }

  const email =
    payload.order?.email ??
    payload.formData?.email ??
    payload.order?.answers?.[0]?.email;

  if (!email) {
    console.log("[zeffy-webhook] Skipping — no email found in payload");
    return NextResponse.json({ received: true, skipped: true, reason: "no_email" }, { status: 200 });
  }

  console.log("[zeffy-webhook] Processing:", email);

  const payment_confirmed_at = new Date().toISOString();
  const transaction_id = payload.transaction_id ?? `zeffy_${Date.now()}`;

  const updated = await updateRegistration(email, {
    status: "Complete",
    payment_confirmed_at,
    transaction_id,
  });

  console.log("[zeffy-webhook] Complete:", { email, updated: !!updated });

  return NextResponse.json({
    received: true,
    skipped: false,
    updated: !!updated,
    email,
  });
}
