"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL as string;

function getUserId(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem("userId");
  return v ? Number(v) : null;
}
function getCurrentGW(): number {
  if (typeof window === "undefined") return 1;
  return Number(localStorage.getItem("gw") || 1);
}

export default function TeamPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const id = getUserId();
    if (!id) router.replace("/"); // must register/login first
    setUserId(id);
  }, [router]);

  async function createAndContinue() {
    if (!userId) return;
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch(`${API}/league/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, teamName }),
      });
      if (!r.ok) throw new Error(await r.text().catch(() => "Create failed"));
      const data = await r.json();
      const leagueId = data.leagueId ?? data.league_id ?? data.league?.id;
      const entryId  = data.entryId  ?? data.entry_id  ?? data.entry?.id;
      if (!leagueId || !entryId) throw new Error("Missing league/entry in response");

      localStorage.setItem("leagueId", String(leagueId));
      localStorage.setItem("entryId", String(entryId));

      // Go pick players
      router.replace(`/market?gw=${getCurrentGW()}`);
    } catch (e: any) {
      setErr(e?.message || "Could not set up your team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Name your team</h1>
      <p className="text-slate-600 mt-1">We’ll create your league and then you’ll pick 15 players.</p>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow">
        <label className="block text-sm">
          Team name
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="e.g. Marc's Marauders"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </label>
        {err && <div className="text-sm text-red-600 mt-3">{err}</div>}
        <button
          onClick={createAndContinue}
          disabled={!teamName || loading}
          className="mt-4 w-full rounded-xl bg-brand text-white py-2 disabled:opacity-50"
        >
          {loading ? "Setting up…" : "Continue"}
        </button>
      </div>
    </main>
  );
}
