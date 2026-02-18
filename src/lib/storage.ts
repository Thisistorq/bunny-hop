/**
 * File-based persistence layer.
 * Results are stored as a JSON file at DATA_DIR/results.json.
 * On Vercel, write to /tmp (ephemeral but fine for this use case).
 * For persistent storage across deploys, point DATA_DIR to a mounted volume
 * or replace this module with a lightweight DB (e.g. Vercel KV).
 */

import fs from "fs";
import path from "path";
import type { RiderResult } from "./types";

// ─── Path resolution ─────────────────────────────────────────────────────────

function dataDir(): string {
  // Prefer explicit env override, then fall back to /tmp on Vercel or a local
  // ./data directory during development.
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.VERCEL) return "/tmp";
  const localDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
  return localDir;
}

function resultsPath(): string {
  return path.join(dataDir(), "results.json");
}

// ─── Read / write helpers ─────────────────────────────────────────────────────

function readAll(): Record<string, RiderResult> {
  const p = resultsPath();
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, RiderResult>): void {
  fs.writeFileSync(resultsPath(), JSON.stringify(data, null, 2), "utf-8");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Upsert a rider's result. Keyed by athleteId. */
export function saveRiderResult(result: RiderResult): void {
  const all = readAll();
  all[String(result.athleteId)] = result;
  writeAll(all);
}

/** Get a single rider's result, or null if not found. */
export function getRiderResult(athleteId: number): RiderResult | null {
  const all = readAll();
  return all[String(athleteId)] ?? null;
}

/** Get all rider results, sorted by totalPoints descending. */
export function getAllResults(): RiderResult[] {
  const all = readAll();
  return Object.values(all).sort((a, b) => b.totalPoints - a.totalPoints);
}
