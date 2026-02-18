import { NextResponse } from "next/server";
import { getAllResults } from "@/lib/storage";
import type { LeaderboardEntry } from "@/lib/types";

export async function GET() {
  const results = getAllResults();

  const leaderboard: LeaderboardEntry[] = results.map((r, i) => ({
    ...r,
    rank: i + 1,
  }));

  return NextResponse.json(leaderboard, {
    headers: {
      // Cache for 30s at the edge, but revalidate in the background
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
