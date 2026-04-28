import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateRegistration } from "@/lib/zeffy/store";

const schema = z.object({
  email: z.string().email(),
  transaction_id: z.string().optional(),
  amount: z.number().optional(),
  form_name: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { email, transaction_id } = parsed.data;
  const payment_confirmed_at = new Date().toISOString();

  const updated = await updateRegistration(email, {
    status: "Complete",
    payment_confirmed_at,
    transaction_id: transaction_id ?? null,
  });

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Registration not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      email: updated.email,
      name: updated.name,
      status: updated.status,
      payment_confirmed_at: updated.payment_confirmed_at,
      transaction_id: updated.transaction_id,
    },
  });
}
