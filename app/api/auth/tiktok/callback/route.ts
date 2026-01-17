import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieStore = await cookies(); // ✅ FIX

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code" }, { status: 400 });
  }

  const verifier = cookieStore.get("tiktok_code_verifier")?.value;

  if (!verifier) {
    return NextResponse.json({ error: "Missing verifier" }, { status: 400 });
  }

  // continue token exchange...
}
