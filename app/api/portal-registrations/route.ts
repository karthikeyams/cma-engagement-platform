import { NextResponse } from "next/server";
import { getAllRegistrations, resetAll } from "@/lib/zeffy/store";

export async function GET(): Promise<NextResponse> {
  const registrations = await getAllRegistrations();
  return NextResponse.json({ success: true, data: registrations });
}

export async function DELETE(): Promise<NextResponse> {
  await resetAll();
  const registrations = await getAllRegistrations();
  return NextResponse.json({ success: true, data: registrations });
}
