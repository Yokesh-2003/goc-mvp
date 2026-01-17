export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const cookieStore = await cookies();

    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/?error=missing_code", url.origin)
      );
    }

    const verifier = cookieStore.get("tiktok_code_verifier")?.value;
    if (!verifier) {
      return NextResponse.redirect(
        new URL("/?error=missing_verifier", url.origin)
      );
    }

    const tokenRes = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_ID!, // ✅ FIXED
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
      console.error("TikTok token error:", tokenData);
      return NextResponse.redirect(
        new URL("/?error=token_failed", url.origin)
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL("/?error=unauthorized", url.origin)
      );
    }

    await supabase.from("creator_accounts").upsert({
      user_id: user.id,
      platform: "tiktok",
      platform_user_id: tokenData.open_id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
    });

    const response = NextResponse.redirect(
      new URL("/dashboard", url.origin)
    );

    response.cookies.delete("tiktok_code_verifier");

    return response;
  } catch (error) {
    console.error("TikTok OAuth fatal error:", error);
    return NextResponse.redirect(
      new URL("/?error=server_error", new URL(req.url).origin)
    );
  }
}
