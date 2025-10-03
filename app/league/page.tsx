"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// If you already have an API helper, you can delete this line and import from there.
const API = process.env.NEXT_PUBLIC_API_URL as string;

// Small helpers so this file is self-contained
function getUserId(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem("userId");
  return v ? Number(v) : null;
}
function getCurrentGW(): number {
  if (typeof window === "undefined") return 1;
  const v = localStorage.getItem("gw");
  return v ? Number(v) : 1;
}

export default function LeaguePage() {
  const router = useRouter();

  // Gate: if no userId, send to home
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    const id = getUserId();
    if (!id) {
      router.replace("/?next=/league");
    } else {
      setUserId(id);
    }
  }, [router]);

  const [teamName, setTeamName] = useState("");
  const [joinLeagueId, setJoinLeagueId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const gw = getCurrentGW();

  // --- CREATE LEAGUE ---
  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/league/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, teamName }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "Create failed"));

      const data = await res.json();
      // handle different key styles defensively
      const leagueId =
        data.leagueId ?? data.league_id ?? data.id ?? data.league?.id;
      const entryId =
        data.entryId ?? data.entry_id ?? data.entry?.id;

      if (!leagueId || !entryId)
        throw new Error("Missing league/entry id in response");

      localStorage.setItem("leagueId", String(leagueId));
      localStorage.setItem("entryId", String(entryId));

      // 👉 STEP 6: redirect to the Player Market once league is ready
      router.replace(`/market?gw=${gw}`);
    } catch (e: any) {
      setErr(e?.message || "Could not create league");
    } finally {
      setLoading(false);
    }
  }

  // --- JOIN LEAGUE ---
  async function onJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setErr(null);
    setLoading(true);
    try {
      const numericLeagueId = Number(joinLeagueId);
      if (!numericLeagueId) throw new Error("Enter a valid League ID");

      const res = await fetch(`${API}/league/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, leagueId: numericLeagueId, teamName }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "Join failed"));

      const data = await res.json();
      const leagueId =
        data.leagueId ?? data.league_id ?? numericLeagueId;
      const entryId =
        data.entryId ?? data.entry_id ?? data.entry?.id;

      if (!leagueId || !entryId)
        throw new Error("Missing league/entry id in response");

      localStorage.setItem("leagueId", String(leagueId));
      localStorage.setItem("entryId", String(entryId));

      // 👉 STEP 6 again: once joined, go pick players
      router.replace(`/market?gw=${gw}`);
    } catch (e: any) {
      setErr(e?.message || "Could not join league");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        League setup
      </h1>
      <p className="text-slate-600 mt-1">
        Create a new league or join an existing one. You’ll pick players next.
      </p>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Create league */}
        <form
          onSubmit={onCreate}
          className="rounded-2xl border bg-white p-5 shadow-card"
        >
          <h2 className="text-lg font-semibold">Create a league</h2>
          <p className="text-sm text-slate-600 mt-1">
            Choose your team name. We’ll make the league and your entry.
          </p>
          <label className="block text-sm mt-4">
            Team name
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="e.g. Marc's Marauders"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading || !teamName}
            className="mt-4 w-full rounded-xl bg-brand px-4 py-2 font-medium text-white shadow disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create League"}
          </button>
        </form>

        {/* Join league */}
        <form
          onSubmit={onJoin}
          className="rounded-2xl border bg-white p-5 shadow-card"
        >
          <h2 className="text-lg font-semibold">Join a league</h2>
          <p className="text-sm text-slate-600 mt-1">
            Enter the League ID and your team name.
          </p>
          <label className="block text-sm mt-4">
            League ID
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="e.g. 12345"
              value={joinLeagueId}
              onChange={(e) => setJoinLeagueId(e.target.value)}
              inputMode="numeric"
              required
            />
          </label>
          <label className="block text-sm mt-3">
            Team name
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="e.g. Marc's Marauders"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading || !joinLeagueId || !teamName}
            className="mt-4 w-full rounded-xl bg-ink px-4 py-2 font-medium text-white shadow disabled:opacity-50"
          >
            {loading ? "Joining…" : "Join League"}
          </button>
        </form>
      </div>

      <div className="mt-6 text-sm text-slate-500">
        Tip: After creating or joining, you’ll be tak
