import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  fetchStravaAthlete,
  fetchCompletedSegmentIds,
  calculateScore,
  refreshStravaToken,
} from "@/lib/strava";
import { saveRiderResult, getRiderResult } from "@/lib/storage";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let accessToken = session.accessToken;

    // Refresh token if expired
    if (Date.now() / 1000 > session.expiresAt - 60) {
      const refreshed = await refreshStravaToken(session.refreshToken);
      accessToken = refreshed.access_token;
    }

    const [athlete, completedSegmentIds] = await Promise.all([
      fetchStravaAthlete(accessToken),
      fetchCompletedSegmentIds(accessToken),
    ]);

    const totalPoints = calculateScore(completedSegmentIds);

    const result = {
      athleteId: athlete.id,
      name: `${athlete.firstname} ${athlete.lastname}`,
      profilePhoto: athlete.profile_medium || athlete.profile,
      totalPoints,
      completedSegmentIds,
      fetchedAt: new Date().toISOString(),
    };

    saveRiderResult(result);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[strava/sync]", err);
    return NextResponse.json(
      { error: "Failed to sync Strava data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = getRiderResult(session.athleteId);
  if (!result) {
    return NextResponse.json({ error: "Not synced yet" }, { status: 404 });
  }

  return NextResponse.json(result);
}
