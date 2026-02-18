"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { EVENT_CONFIG, CATEGORY_COLORS, CATEGORIES, MAX_POINTS } from "@/lib/config";
import type { LeaderboardEntry } from "@/lib/types";
import type { Category } from "@/lib/config";

const REFRESH_INTERVAL = 60_000; // 60 seconds

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) return;
      const data: LeaderboardEntry[] = await res.json();
      setEntries(data);
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL / 1000);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 10% 0%, #dcfce7 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 100%, #fcecd8 0%, transparent 55%), #fdfcf8",
        }}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto border-b border-bone-100">
        <Link href="/" className="font-display text-xl font-black text-spring-800">
          🐰 Bunny Hop
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-spring-700 bg-spring-50 border border-spring-200 px-4 py-1.5 rounded-full hover:bg-spring-100 transition-colors"
            >
              My Scorecard
            </Link>
          ) : (
            <button
              onClick={() => signIn("strava")}
              className="text-sm font-semibold text-white bg-[#fc4c02] px-4 py-1.5 rounded-full hover:bg-[#e04000] transition-colors"
            >
              Connect with Strava
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-5xl font-black text-stone-900 leading-tight">
              Leaderboard
            </h1>
            <p className="text-bone-500 mt-1 text-sm">
              {EVENT_CONFIG.eventDate} · {entries.length} rider{entries.length !== 1 ? "s" : ""} scored
            </p>
          </div>

          {/* Refresh status */}
          <div className="flex items-center gap-3 text-sm text-bone-500">
            <RefreshDot />
            <span>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "Loading…"}
            </span>
            <span className="font-mono text-xs bg-bone-100 px-2 py-0.5 rounded-full">
              {countdown}s
            </span>
            <button
              onClick={fetchLeaderboard}
              className="text-spring-600 hover:text-spring-800 transition-colors"
              title="Refresh now"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>

        {/* Category legend */}
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map((cat) => {
            const c = CATEGORY_COLORS[cat];
            return (
              <div key={cat} className={`flex items-center gap-2 ${c.bg} ${c.text} px-3 py-1 rounded-full text-xs font-semibold border ${c.border}`}>
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                {cat}
                <span className="opacity-60">
                  ({EVENT_CONFIG.segments.filter((s) => s.category === cat).length})
                </span>
              </div>
            );
          })}
          <div className="text-xs text-bone-400 flex items-center ml-2">
            ● = completed &nbsp;○ = missed
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSkeleton />
        ) : entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <LeaderboardRow
                key={entry.athleteId}
                entry={entry}
                isExpanded={expandedId === entry.athleteId}
                onToggle={() =>
                  setExpandedId(
                    expandedId === entry.athleteId ? null : entry.athleteId
                  )
                }
                isMe={session?.athleteId === entry.athleteId}
                animationDelay={idx * 40}
              />
            ))}
          </div>
        )}

        {/* Max points note */}
        <p className="text-center text-xs text-bone-400 mt-8">
          Maximum score: {MAX_POINTS} points across {EVENT_CONFIG.segments.length} segments
        </p>
      </div>
    </main>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  isExpanded,
  onToggle,
  isMe,
  animationDelay,
}: {
  entry: LeaderboardEntry;
  isExpanded: boolean;
  onToggle: () => void;
  isMe: boolean;
  animationDelay: number;
}) {
  const completedSet = new Set(entry.completedSegmentIds);
  const percentage = Math.round((entry.totalPoints / MAX_POINTS) * 100);

  const medalEmoji =
    entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;

  return (
    <div
      className={`card overflow-hidden opacity-0 animate-fade-up transition-shadow ${
        isMe ? "ring-2 ring-spring-400" : ""
      } ${isExpanded ? "shadow-md" : "hover:shadow-sm"}`}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: "forwards" }}
    >
      {/* Main row */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-4"
        aria-expanded={isExpanded}
      >
        {/* Rank */}
        <div className="w-8 shrink-0 text-center">
          {medalEmoji ? (
            <span className="text-xl">{medalEmoji}</span>
          ) : (
            <span className="font-mono font-bold text-sm text-bone-400">
              #{entry.rank}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="shrink-0">
          {entry.profilePhoto ? (
            <Image
              src={entry.profilePhoto}
              alt={entry.name}
              width={40}
              height={40}
              className="rounded-full border-2 border-bone-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-spring-100 border-2 border-spring-200 flex items-center justify-center text-spring-600 font-bold text-sm">
              {entry.name[0]}
            </div>
          )}
        </div>

        {/* Name + dots */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-stone-900 truncate">{entry.name}</span>
            {isMe && (
              <span className="text-xs bg-spring-100 text-spring-700 border border-spring-200 px-2 py-0.5 rounded-full font-semibold shrink-0">
                You
              </span>
            )}
          </div>
          {/* Checkpoint dots */}
          <div className="flex flex-wrap gap-1">
            {EVENT_CONFIG.segments.map((seg) => {
              const done = completedSet.has(seg.id);
              const c = CATEGORY_COLORS[seg.category as Category];
              return (
                <span
                  key={seg.id}
                  title={`${seg.name} (${seg.points}pt)${done ? " ✓" : ""}`}
                  className={`w-3 h-3 rounded-full border transition-colors ${
                    done
                      ? `${c.dot} border-transparent`
                      : "bg-transparent border-bone-300"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Score */}
        <div className="text-right shrink-0 ml-2">
          <div className="font-display font-black text-2xl text-spring-600">
            {entry.totalPoints}
          </div>
          <div className="text-xs text-bone-400 font-mono">{percentage}%</div>
        </div>

        {/* Expand caret */}
        <div className={`shrink-0 text-bone-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
          <ChevronIcon />
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-5 border-t border-bone-100 animate-fade-in">
          <div className="pt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
            {CATEGORIES.map((cat) => {
              const catSegs = EVENT_CONFIG.segments.filter(
                (s) => s.category === cat
              );
              const colors = CATEGORY_COLORS[cat];
              return (
                <div key={cat}>
                  <div className={`text-xs font-bold uppercase tracking-wider ${colors.text} mb-2`}>
                    {cat}
                  </div>
                  {catSegs.map((seg) => {
                    const done = completedSet.has(seg.id);
                    return (
                      <div key={seg.id} className="flex items-center gap-2 py-1 text-sm">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            done
                              ? `${colors.dot} border-transparent`
                              : "border-bone-300 bg-white"
                          }`}
                        >
                          {done && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className={done ? "text-stone-700" : "text-bone-400 line-through"}>
                          {seg.name}
                        </span>
                        <span className={`ml-auto font-mono text-xs ${done ? colors.text : "text-bone-300"}`}>
                          {done ? `+${seg.points}` : seg.points}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Utilities ────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
          <div className="w-8 h-5 bg-bone-200 rounded" />
          <div className="w-10 h-10 rounded-full bg-bone-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-bone-200 rounded w-40" />
            <div className="h-3 bg-bone-100 rounded w-32" />
          </div>
          <div className="h-8 w-12 bg-bone-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-16 text-center">
      <div className="text-5xl mb-4 animate-hop inline-block">🐰</div>
      <h3 className="font-display text-2xl font-black text-stone-800 mb-2">
        No riders yet
      </h3>
      <p className="text-bone-500 max-w-sm mx-auto text-sm">
        Be the first to connect with Strava and claim a spot on the leaderboard!
      </p>
      <button
        onClick={() => signIn("strava")}
        className="mt-6 btn-strava inline-flex"
      >
        <StravaIcon /> Connect with Strava
      </button>
    </div>
  );
}

function RefreshDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spring-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-spring-500" />
    </span>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
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

function StravaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0 5 13.828h4.172" />
    </svg>
  );
}
