import { NextRequest, NextResponse } from "next/server";
import { getRegistration } from "@/lib/zeffy/store";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Missing email query parameter" },
      { status: 400 }
    );
  }

  const registration = await getRegistration(email);

  if (!registration) {
    return NextResponse.json(
      { success: false, error: "Registration not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: registration });
}
