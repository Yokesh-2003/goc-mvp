"use client";

import { useEffect, useState } from "react";
// Import createClient from @supabase/supabase-js for your logic later

export default function Home() {
  const [bgVisible, setBgVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    // Sequence: BG -> Title -> Button
    setTimeout(() => setBgVisible(true), 100);
    setTimeout(() => setTitleVisible(true), 800);
    setTimeout(() => setBtnVisible(true), 1800);
  }, []);

 const handleConnect = async () => {
  // 1. Visual Impact
  setIsPopping(true);
  setTimeout(() => setIsPopping(false), 600);

  // 2. Small delay so animation feels intentional
  setTimeout(() => {
    window.location.href = "/api/auth/tiktok";
  }, 250);
};


  return (
    <main
      style={{
        height: "100svh", width: "100%", position: "relative",
        overflow: "hidden", display: "grid", gridTemplateRows: "56px 1fr 90px",
        backgroundColor: "#000", color: "rgba(255, 255, 255, 0.7)",
      }}
    >
      {/* BACKGROUND ILLUSTRATION */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/bg.png')", backgroundSize: "cover", backgroundPosition: "center",
        opacity: bgVisible ? 1 : 0, transition: "opacity 2s ease-in-out", zIndex: 1,
        filter: "brightness(0.35) contrast(1.1)",
      }} />

      {/* HEADER */}
      <header style={{ position: "relative", zIndex: 20, height: "56px", display: "flex", alignItems: "center", padding: "0 28px" }}>
        <span className="pop-hover" style={{ cursor: "pointer", fontSize: "14px", opacity: titleVisible ? 1 : 0, transition: "opacity 1s" }}>🎧 Support</span>
        <button className="pop-hover" style={{ marginLeft: "auto", background: "transparent", border: "none", color: "inherit", fontSize: "14px", cursor: "pointer", opacity: titleVisible ? 1 : 0, transition: "opacity 1s" }}>Login</button>
      </header>

      {/* CENTER CTA */}
      <section style={{ position: "relative", zIndex: 20, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          <h1 className={titleVisible ? "glitch-entry" : ""} style={{
            fontSize: "clamp(2.5rem, 7vw, 4rem)", fontStyle: "italic", fontWeight: "900",
            color: "rgba(255, 255, 255, 0.8)", opacity: titleVisible ? 1 : 0,
            transition: "opacity 0.2s steps(3, start)",
          }}>
            Game of Creators <span style={{ color: "#fff" }}>MVP</span> 🚀
          </h1>

          <div style={{ position: "relative", alignSelf: "center" }}>
            {/* MANGA BURST ON PRESS */}
            {isPopping && (
              <div className="burst-wrap">
                <svg viewBox="0 0 100 100">
                  {[...Array(20)].map((_, i) => (
                    <line key={i} x1="50" y1="50" 
                      x2={50 + 50 * Math.cos((i * 18 * Math.PI) / 180)}
                      y2={50 + 50 * Math.sin((i * 18 * Math.PI) / 180)}
                      stroke="white" strokeWidth="1" className="line-anim" />
                  ))}
                </svg>
              </div>
            )}

            <button
              onClick={handleConnect}
              className="aura-btn"
              style={{
                padding: "18px 44px", borderRadius: "999px", fontSize: "15px", fontWeight: 700,
                border: "1px solid rgba(255, 255, 255, 0.2)", cursor: "pointer",
                backgroundColor: "rgba(35, 35, 35, 0.95)", color: "rgba(255, 255, 255, 0.8)",
                opacity: btnVisible ? 1 : 0, transform: btnVisible ? "translateY(0)" : "translateY(15px)",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                position: "relative", zIndex: 2
              }}
            >
              Connect Your Creator Account
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes glitch {
          0% { transform: skew(5deg); opacity: 0.5; }
          50% { transform: skew(-5deg); opacity: 1; }
          100% { transform: skew(0); opacity: 1; }
        }
        .glitch-entry { animation: glitch 0.3s ease-out; }

        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 10px rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 25px rgba(255,255,255,0.2); }
        }
        .aura-btn { animation: breathe 4s infinite ease-in-out; }

        .aura-btn:hover {
          background-color: #fff !important;
          color: #000 !important;
          transform: translateY(-4px) scale(1.03) !important;
          animation: none;
        }

        .burst-wrap {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 350px; height: 350px; pointer-events: none;
        }

        .line-anim {
          stroke-dasharray: 50; stroke-dashoffset: 50;
          animation: draw 0.5s ease-out forwards;
        }

        @keyframes draw {
          0% { stroke-dashoffset: 50; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
      `}</style>
    </main>
  );
}