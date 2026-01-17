import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";

export async function GET() {
  const cookieStore = await cookies(); // ✅ FIX

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  cookieStore.set({
    name: "tiktok_code_verifier",
    value: verifier,
    httpOnly: true,
    secure: false, // true only in prod (https)
    path: "/",
    maxAge: 300,
  });

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_ID!,
    response_type: "code",
    scope: "user.info.basic,video.list",
    redirect_uri: "http://localhost:3000/api/auth/tiktok/callback",
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`
  );
}
