import { EVENT_CONFIG } from "./config";
import type {
  StravaActivity,
  StravaAthlete,
  StravaSegmentEffort,
} from "./types";

const STRAVA_API = "https://www.strava.com/api/v3";

// ─── Token refresh ───────────────────────────────────────────────────────────

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export async function refreshStravaToken(
  refreshToken: string
): Promise<TokenResponse> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh token: ${res.statusText}`);
  }

  return res.json();
}

// ─── Athlete ─────────────────────────────────────────────────────────────────

export async function fetchStravaAthlete(
  accessToken: string
): Promise<StravaAthlete> {
  const res = await fetch(`${STRAVA_API}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch athlete: ${res.statusText}`);
  }

  return res.json();
}

// ─── Activities ──────────────────────────────────────────────────────────────

/**
 * Fetches all activities on the event date (UTC window) and returns
 * the unique set of Strava segment IDs that the rider completed.
 */
export async function fetchCompletedSegmentIds(
  accessToken: string
): Promise<string[]> {
  const eventDate = new Date(EVENT_CONFIG.eventDate + "T00:00:00Z");
  const after = Math.floor(eventDate.getTime() / 1000);
  const before = after + 86400; // +24 hours

  // Fetch activities in the event window (paginated just in case)
  const activities = await fetchActivitiesInWindow(accessToken, after, before);

  // Collect all segment effort segment IDs from those activities
  const completedIds = new Set<string>();

  for (const activity of activities) {
    // Fetch detailed activity (segment_efforts only present in detailed view)
    const detailed = await fetchDetailedActivity(accessToken, activity.id);
    for (const effort of detailed.segment_efforts ?? []) {
      completedIds.add(String(effort.segment.id));
    }
  }

  // Filter to only the segments we care about
  const configIds = new Set(EVENT_CONFIG.segments.map((s) => s.id));
  return [...completedIds].filter((id) => configIds.has(id));
}

async function fetchActivitiesInWindow(
  accessToken: string,
  after: number,
  before: number
): Promise<{ id: number }[]> {
  const url = new URL(`${STRAVA_API}/athlete/activities`);
  url.searchParams.set("after", String(after));
  url.searchParams.set("before", String(before));
  url.searchParams.set("per_page", "100");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch activities: ${res.statusText}`);
  }

  return res.json();
}

async function fetchDetailedActivity(
  accessToken: string,
  activityId: number
): Promise<{ segment_efforts: StravaSegmentEffort[] }> {
  const res = await fetch(`${STRAVA_API}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch activity ${activityId}: ${res.statusText}`
    );
  }

  return res.json();
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Given a list of completed segment IDs, calculate the total score.
 * Each segment is counted at most once.
 */
export function calculateScore(completedSegmentIds: string[]): number {
  const completedSet = new Set(completedSegmentIds);
  return EVENT_CONFIG.segments.reduce((total, segment) => {
    return completedSet.has(segment.id) ? total + segment.points : total;
  }, 0);
}
