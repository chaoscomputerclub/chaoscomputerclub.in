import { createServerFn } from "@tanstack/react-start";
import { contests, proofs, announcements } from "./fixtures";

export const getPublicPortalData = createServerFn({ method: "GET" }).handler(async () => {
  const backendUrl = process.env["BACKEND_URL"] || "http://127.0.0.1:8002/api";

  // 1. Prioritize CCC FastAPI PostgreSQL Backend
  try {
    const healthRes = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(1500) });
    if (healthRes.ok) {
      const [apiContests, standings, apiAnnouncements] = await Promise.all([
        fetch(`${backendUrl}/contests`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${backendUrl}/scoreboards/chaos-arena-2026`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${backendUrl}/feed/announcements`).then((r) => (r.ok ? r.json() : [])),
      ]);

      const problems = (apiContests || []).flatMap((c: any) =>
        (c.problems || []).map((p: any) => ({
          contest_id: c.id,
          problem_index: p.problem_index,
          title: p.title,
          topic: p.topic,
          points: p.points,
          solved_count: p.solved_count,
          first_ac_seconds: p.first_ac_seconds,
          editorial_summary: p.editorial_summary,
        }))
      );

      return {
        contests: apiContests && apiContests.length ? apiContests : contests,
        problems: problems || [],
        standings: standings || [],
        announcements: apiAnnouncements && apiAnnouncements.length ? apiAnnouncements : announcements,
        proofs: proofs || [],
      };
    }
  } catch {
    // FastAPI not reachable during static build or offline mode — fallback to local fixtures
  }

  // 2. Offline fixture fallback
  return {
    contests,
    problems: contests.flatMap((c) =>
      (c.problems || []).map((p) => ({
        contest_id: c.id,
        problem_index: p.index,
        title: p.title,
        topic: p.topic,
        points: p.points,
        solved_count: p.solved_count,
        first_ac_seconds: p.first_ac_seconds,
        editorial_summary: p.editorial,
      }))
    ),
    standings: contests[0]?.standings || [],
    announcements,
    proofs,
  };
});
