import type { Category } from "./config";

// ─── Strava API types ────────────────────────────────────────────────────────

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;       // URL to profile photo (large)
  profile_medium: string; // URL to profile photo (medium)
  username: string | null;
}

export interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  start_date: string;    // ISO 8601 UTC
  start_date_local: string;
  segment_efforts: StravaSegmentEffort[];
}

export interface StravaSegmentEffort {
  id: number;
  segment: {
    id: number;
    name: string;
  };
  elapsed_time: number;
  start_date: string;
  start_date_local: string;
}

// ─── App types ───────────────────────────────────────────────────────────────

export interface RiderResult {
  athleteId: number;
  name: string;
  profilePhoto: string;
  totalPoints: number;
  completedSegmentIds: string[];  // Strava segment IDs as strings
  fetchedAt: string;              // ISO 8601 timestamp of last sync
}

export interface LeaderboardEntry extends RiderResult {
  rank: number;
}

export interface SegmentStatus {
  segmentId: string;
  name: string;
  points: number;
  category: Category;
  description?: string;
  completed: boolean;
}
