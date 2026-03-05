const STORAGE_KEY = "pulse_visitor_stats";

export interface VisitorStats {
  totalViews: number;
  dailyViews: Record<string, number>; // key = "YYYY-MM-DD"
  firstVisit: string; // ISO date string
  lastVisit: string; // ISO date string
}

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readStats(): VisitorStats | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisitorStats;
  } catch {
    return null;
  }
}

function writeStats(stats: VisitorStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // silently ignore storage errors
  }
}

export function getVisitorStats(): VisitorStats {
  return (
    readStats() ?? {
      totalViews: 0,
      dailyViews: {},
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    }
  );
}

export function recordPageView(): void {
  const now = new Date().toISOString();
  const today = getTodayKey();
  const existing = readStats();

  const stats: VisitorStats = existing ?? {
    totalViews: 0,
    dailyViews: {},
    firstVisit: now,
    lastVisit: now,
  };

  stats.totalViews += 1;
  stats.dailyViews[today] = (stats.dailyViews[today] ?? 0) + 1;
  stats.lastVisit = now;
  if (!stats.firstVisit) {
    stats.firstVisit = now;
  }

  writeStats(stats);
}
