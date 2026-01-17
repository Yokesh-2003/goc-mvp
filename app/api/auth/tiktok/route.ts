export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // ✅ FIX: await cookies()
  const cookieStore = await cookies();
  const supabase = createSupabaseServer();

  try {
    // 1️⃣ Get auth code
    const code = url.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(
        new URL("/?error=missing_code", url.origin)
      );
    }

    // 2️⃣ Get PKCE verifier
    const verifier = cookieStore.get("tiktok_code_verifier")?.value;
    if (!verifier) {
      return NextResponse.redirect(
        new URL("/?error=missing_verifier", url.origin)
      );
    }

    // 3️⃣ Supabase auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL("/?error=unauthorized", url.origin)
      );
    }

    // 4️⃣ Exchange TikTok token
    const tokenRes = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          code,
          grant_type: "authorization_code",
          redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
          code_verifier: verifier,
        }),
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("TikTok Token Error:", tokenData);
      return NextResponse.redirect(
        new URL("/?error=token_failed", url.origin)
      );
    }

    // 5️⃣ Save to Supabase
    const { error: dbError } = await supabase
      .from("creator_accounts")
      .upsert({
        user_id: user.id,
        platform: "tiktok",
        platform_user_id: tokenData.open_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000
        ).toISOString(),
      });

    if (dbError) {
      console.error("DB Error:", dbError);
      throw dbError;
    }

    // 6️⃣ Cleanup + redirect
    const response = NextResponse.redirect(
      new URL("/dashboard", url.origin)
    );
    response.cookies.delete("tiktok_code_verifier");

    return response;
  } catch (err) {
    console.error("TikTok OAuth Fatal Error:", err);
    return NextResponse.redirect(
      new URL("/?error=server_error", url.origin)
    );
  }
}
