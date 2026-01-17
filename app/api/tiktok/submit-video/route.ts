import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase";
import { extractTikTokVideoId } from "@/lib/tiktok";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const { videoUrl } = await req.json();
  const videoId = extractTikTokVideoId(videoUrl);

  if (!videoId) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: account } = await supabase
    .from("creator_accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("platform", "tiktok")
    .single();

  if (!account) {
    return NextResponse.json({ error: "TikTok not connected" }, { status: 400 });
  }

  const res = await fetch("https://open.tiktokapis.com/v2/video/query/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ video_ids: [videoId] }),
  });

  const data = await res.json();
  const video = data?.data?.videos?.[0];

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (video.author_id !== account.platform_user_id) {
    return NextResponse.json({ error: "Not your video" }, { status: 403 });
  }

  await supabase.from("campaign_submissions").insert({
    user_id: user.id,
    platform: "tiktok",
    content_id: videoId,
    content_url: videoUrl,
  });

  return NextResponse.json({
    success: true,
    views: video.view_count,
  });
}
