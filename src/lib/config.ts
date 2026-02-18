// ─────────────────────────────────────────────────────────────────────────────
//  EVENT CONFIG — edit this file to configure The Bunny Hop
//  All segment IDs are real Strava segment IDs.
// ─────────────────────────────────────────────────────────────────────────────

export type Category = "Road" | "Dirt" | "Bonus";

export interface Segment {
  id: string;         // Strava segment ID
  name: string;
  points: number;
  category: Category;
  description?: string;
}

export interface EventConfig {
  eventName: string;
  tagline: string;
  description: string;
  eventDate: string;  // ISO date string: "2026-04-04"
  segments: Segment[];
}

export const EVENT_CONFIG: EventConfig = {
  eventName: "The Bunny Hop",
  tagline: "Spring's Greatest Cycling Adventure",
  description:
    "Saddle up for The Bunny Hop — a self-guided cycling adventure through rolling roads, muddy trails, and secret climbs. Complete as many checkpoints as you can on event day to rack up points and claim your place on the leaderboard.",
  eventDate: "2026-02-17",

  segments: [
    // ── Road segments ──────────────────────────────────────────────────────
    {
      id: "1152863",
      name: "Vineyard",
      points: 10,
      category: "Road",
      description: "test segment",
    },
    {
      id: "234567",
      name: "Valley Sprint",
      points: 10,
      category: "Road",
      description: "Flat-out effort through the valley floor.",
    },
    {
      id: "345678",
      name: "Orchard Loop",
      points: 15,
      category: "Road",
      description: "Rolling roads past spring blossoms.",
    },

    // ── Dirt segments ──────────────────────────────────────────────────────
    {
      id: "456789",
      name: "Muddy Singletrack",
      points: 20,
      category: "Dirt",
      description: "Technical singletrack through the woods — expect mud.",
    },
    {
      id: "567890",
      name: "Gravel Grind",
      points: 20,
      category: "Dirt",
      description: "Five kilometres of chunky gravel.",
    },
    {
      id: "678901",
      name: "Forest Trail",
      points: 25,
      category: "Dirt",
      description: "Root-strewn descent through old-growth forest.",
    },

    // ── Bonus segments ─────────────────────────────────────────────────────
    {
      id: "789012",
      name: "Secret Climb",
      points: 50,
      category: "Bonus",
      description: "Find it. Climb it. Say nothing.",
    },
    {
      id: "890123",
      name: "Summit Surprise",
      points: 40,
      category: "Bonus",
      description: "The highest point of the day — worth every metre.",
    },
  ],
};

// ── Derived helpers ──────────────────────────────────────────────────────────

/** All unique categories in display order */
export const CATEGORIES: Category[] = ["Road", "Dirt", "Bonus"];

/** Tailwind colour classes per category */
export const CATEGORY_COLORS: Record<
  Category,
  { bg: string; text: string; border: string; dot: string }
> = {
  Road:  { bg: "bg-spring-100",  text: "text-spring-800",  border: "border-spring-300",  dot: "bg-spring-500"  },
  Dirt:  { bg: "bg-earth-100",   text: "text-earth-800",   border: "border-earth-300",   dot: "bg-earth-500"   },
  Bonus: { bg: "bg-purple-100",  text: "text-purple-800",  border: "border-purple-300",  dot: "bg-purple-500"  },
};

/** Total possible points */
export const MAX_POINTS = EVENT_CONFIG.segments.reduce(
  (sum, s) => sum + s.points,
  0
);
