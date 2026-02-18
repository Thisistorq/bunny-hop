"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EVENT_CONFIG, CATEGORIES, CATEGORY_COLORS, MAX_POINTS } from "@/lib/config";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-spring-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const segmentsByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    segments: EVENT_CONFIG.segments.filter((s) => s.category === cat),
    colors: CATEGORY_COLORS[cat],
    totalPoints: EVENT_CONFIG.segments
      .filter((s) => s.category === cat)
      .reduce((sum, s) => sum + s.points, 0),
  }));

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* ── Decorative background ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, #dcfce7 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, #fcecd8 0%, transparent 60%), #fdfcf8",
        }}
      />

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="font-display text-xl font-black tracking-tight text-spring-800">
          🐰 Bunny Hop
        </span>
        <a
          href="/leaderboard"
          className="text-sm font-semibold text-bone-700 hover:text-spring-700 transition-colors"
        >
          Leaderboard →
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        {/* Bouncing bunny */}
        <div className="text-7xl mb-6 animate-hop inline-block" role="img" aria-label="bunny">
          🐰
        </div>

        <div className="inline-block bg-spring-100 text-spring-700 text-xs font-mono font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border border-spring-200">
          {new Date(EVENT_CONFIG.eventDate + "T12:00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

        <h1 className="font-display text-6xl md:text-8xl font-black text-stone-900 leading-[0.95] tracking-tight mb-6">
          The
          <br />
          <span
            className="relative inline-block"
            style={{
              WebkitTextStroke: "2px #22c55e",
              color: "transparent",
            }}
          >
            Bunny Hop
          </span>
        </h1>

        <p className="text-xl text-bone-700 max-w-xl mx-auto leading-relaxed mb-12 font-body">
          {EVENT_CONFIG.description}
        </p>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
          {[
            { value: EVENT_CONFIG.segments.length, label: "Checkpoints" },
            { value: MAX_POINTS, label: "Total Points" },
            { value: CATEGORIES.length, label: "Categories" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-4xl font-black text-spring-600">{value}</div>
              <div className="text-sm text-bone-600 font-semibold uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => signIn("strava")}
          className="btn-strava text-lg"
        >
          <StravaIcon />
          Connect with Strava
        </button>
        <p className="text-xs text-bone-500 mt-3">
          We only read your activities. We never post on your behalf.
        </p>
      </section>

      <div className="terrain-divide" />

      {/* ── Checkpoint preview ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display text-4xl font-black text-stone-900 mb-3 text-center">
          The Checkpoints
        </h2>
        <p className="text-center text-bone-600 mb-12 max-w-lg mx-auto">
          Complete as many segments as you can on event day. Each segment can
          only be scored once, no matter how many times you ride it.
        </p>

        <div className="grid md:grid-cols-3 gap-6 stagger">
          {segmentsByCategory.map(({ category, segments, colors, totalPoints }) => (
            <div key={category} className="card p-6 opacity-0 animate-fade-up">
              {/* Category header */}
              <div className={`inline-flex items-center gap-2 ${colors.bg} ${colors.text} px-3 py-1.5 rounded-full text-sm font-semibold mb-4 border ${colors.border}`}>
                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                {category}
              </div>

              <div className="space-y-3">
                {segments.map((seg) => (
                  <div
                    key={seg.id}
                    className="flex items-center justify-between py-2 border-b border-bone-100 last:border-0"
                  >
                    <div>
                      <div className="font-semibold text-stone-800 text-sm">{seg.name}</div>
                      {seg.description && (
                        <div className="text-xs text-bone-500 mt-0.5">{seg.description}</div>
                      )}
                    </div>
                    <div className={`font-mono font-bold text-sm ${colors.text} ml-3 shrink-0`}>
                      {seg.points}pt
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-4 pt-4 border-t border-bone-100 text-sm font-semibold ${colors.text} flex justify-between`}>
                <span>{segments.length} segment{segments.length !== 1 ? "s" : ""}</span>
                <span>{totalPoints} pts possible</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="terrain-divide" />

      {/* ── How it works ── */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-4xl font-black text-stone-900 mb-12">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Ride on event day", body: "Head out on April 12th and ride any of the checkpoint segments." },
            { step: "2", title: "Strava records it", body: "Your GPS tracks are automatically recorded by the Strava app as usual." },
            { step: "3", title: "We score it", body: "Sign in with Strava, we fetch your activities, and your score appears instantly." },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-spring-500 text-white font-display font-black text-xl flex items-center justify-center mb-4 shadow-lg shadow-spring-200">
                {step}
              </div>
              <h3 className="font-display font-black text-lg text-stone-900 mb-2">{title}</h3>
              <p className="text-bone-600 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <button
            onClick={() => signIn("strava")}
            className="btn-strava"
          >
            <StravaIcon />
            Get My Score
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-bone-200 py-8 px-6 text-center text-xs text-bone-400">
        <p>The Bunny Hop · Powered by Strava · Not affiliated with Strava, Inc.</p>
      </footer>
    </main>
  );
}

function StravaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0 5 13.828h4.172" />
    </svg>
  );
}
