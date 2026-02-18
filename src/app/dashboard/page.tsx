"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { EVENT_CONFIG, CATEGORIES, CATEGORY_COLORS, MAX_POINTS } from "@/lib/config";
import type { RiderResult } from "@/lib/types";
import type { Category } from "@/lib/config";

type SyncState = "idle" | "syncing" | "success" | "error";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [result, setResult] = useState<RiderResult | null>(null);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const sync = useCallback(async () => {
    setSyncState("syncing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data: RiderResult = await res.json();
      setResult(data);
      setSyncState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setSyncState("error");
    }
  }, []);

  // Auto-sync on mount
  useEffect(() => {
    if (status === "authenticated" && syncState === "idle") {
      sync();
    }
  }, [status, syncState, sync]);

  if (status === "loading" || !session) {
    return <LoadingScreen />;
  }

  const completedSet = new Set(result?.completedSegmentIds ?? []);
  const percentage = result
    ? Math.round((result.totalPoints / MAX_POINTS) * 100)
    : 0;

  const segmentsByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    segments: EVENT_CONFIG.segments
      .filter((s) => s.category === cat)
      .map((s) => ({ ...s, completed: completedSet.has(s.id) })),
    colors: CATEGORY_COLORS[cat],
  }));

  const completedCount = completedSet.size;
  const totalSegments = EVENT_CONFIG.segments.length;

  return (
    <main className="relative min-h-screen">
      {/* Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 0%, #dcfce7 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 90%, #fcecd8 0%, transparent 60%), #fdfcf8",
        }}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto border-b border-bone-100">
        <Link href="/" className="font-display text-xl font-black text-spring-800">
          🐰 Bunny Hop
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/leaderboard"
            className="text-sm font-semibold text-bone-700 hover:text-spring-700 transition-colors"
          >
            Leaderboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm font-semibold text-bone-500 hover:text-red-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header with profile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "Rider"}
              width={64}
              height={64}
              className="rounded-full border-4 border-spring-200 shadow-md"
            />
          )}
          <div>
            <h1 className="font-display text-3xl font-black text-stone-900">
              {session.user?.name ?? "Rider"}
            </h1>
            <p className="text-bone-500 text-sm mt-0.5">
              Your Bunny Hop scorecard · {EVENT_CONFIG.eventDate}
            </p>
          </div>
          <div className="sm:ml-auto">
            <button
              onClick={sync}
              disabled={syncState === "syncing"}
              className="flex items-center gap-2 bg-spring-600 hover:bg-spring-700 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2 rounded-full transition-all"
            >
              {syncState === "syncing" ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Syncing…
                </>
              ) : (
                <>
                  <RefreshIcon />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error state */}
        {syncState === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <strong>Sync failed:</strong> {errorMsg || "Please try again."}
          </div>
        )}

        {syncState === "syncing" && !result && <LoadingCard />}

        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Score hero card */}
            <div className="card p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1">
                  <p className="text-sm font-semibold uppercase tracking-widest text-bone-500 mb-1">
                    Total Score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-6xl font-black text-spring-600">
                      {result.totalPoints}
                    </span>
                    <span className="text-bone-400 font-mono text-xl">
                      / {MAX_POINTS} pts
                    </span>
                  </div>
                  <div className="mt-4 progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-bone-500 mt-2">
                    {completedCount} of {totalSegments} segments completed ({percentage}%)
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-display text-5xl font-black text-stone-800">
                    {percentage}%
                  </div>
                  <div className="text-xs text-bone-500 uppercase tracking-wide font-semibold">
                    Complete
                  </div>
                </div>
              </div>
              {result.fetchedAt && (
                <p className="text-xs text-bone-400 mt-4 border-t border-bone-100 pt-4">
                  Last synced:{" "}
                  {new Date(result.fetchedAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              )}
            </div>

            {/* Checkpoint grid */}
            <div>
              <h2 className="font-display text-2xl font-black text-stone-900 mb-6">
                Checkpoint Breakdown
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {segmentsByCategory.map(({ category, segments, colors }) => {
                  const catCompleted = segments.filter((s) => s.completed).length;
                  const catPoints = segments
                    .filter((s) => s.completed)
                    .reduce((sum, s) => sum + s.points, 0);

                  return (
                    <div key={category} className="card p-5">
                      {/* Category badge */}
                      <div className={`inline-flex items-center gap-2 ${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-semibold mb-4 border ${colors.border}`}>
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        {category}
                        <span className="ml-1 opacity-60">
                          {catCompleted}/{segments.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {segments.map((seg) => (
                          <SegmentRow
                            key={seg.id}
                            name={seg.name}
                            points={seg.points}
                            completed={seg.completed}
                            colors={colors}
                          />
                        ))}
                      </div>

                      <div className={`mt-4 pt-3 border-t border-bone-100 text-sm flex justify-between ${colors.text} font-semibold`}>
                        <span>Earned</span>
                        <span className="font-mono">{catPoints} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA to leaderboard */}
            <div className="text-center py-4">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 bg-stone-900 text-white font-semibold px-6 py-3 rounded-full hover:bg-stone-700 transition-all shadow-lg"
              >
                View Full Leaderboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SegmentRow({
  name,
  points,
  completed,
  colors,
}: {
  name: string;
  points: number;
  completed: boolean;
  colors: (typeof CATEGORY_COLORS)[Category];
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
        completed ? `${colors.bg} border ${colors.border}` : "bg-bone-50 border border-bone-100 opacity-50"
      }`}
    >
      {/* Checkbox icon */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          completed
            ? `${colors.dot} border-transparent`
            : "border-bone-300 bg-white"
        }`}
      >
        {completed && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span
        className={`text-sm font-medium flex-1 ${
          completed ? "text-stone-800" : "text-bone-500"
        }`}
      >
        {name}
      </span>
      <span
        className={`font-mono text-xs font-bold ${
          completed ? colors.text : "text-bone-400"
        }`}
      >
        {points}pt
      </span>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="card p-8 animate-pulse">
      <div className="h-4 bg-bone-200 rounded w-32 mb-4" />
      <div className="h-16 bg-bone-100 rounded w-48 mb-4" />
      <div className="h-2 bg-bone-100 rounded w-full mb-2" />
      <div className="h-3 bg-bone-100 rounded w-48" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-4xl animate-hop inline-block">🐰</div>
      <p className="text-bone-500 font-semibold">Loading your scorecard…</p>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
