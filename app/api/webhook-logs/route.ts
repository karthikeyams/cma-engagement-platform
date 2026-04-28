import { NextResponse } from "next/server";
import { getWebhookLog, clearWebhookLog } from "@/lib/zeffy/store";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ success: true, data: getWebhookLog() });
}

export async function DELETE(): Promise<NextResponse> {
  clearWebhookLog();
  return NextResponse.json({ success: true, data: [] });
}
