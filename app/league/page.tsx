"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../_lib/api";
import { useUser } from "../_lib/useUser";

export default function LeaguePage() {
  const router = useRouter();
  const { userId, me } = useUser();
  const [teamName, setTeamName] = useState("Marc's Marauders");
  const [leagueId, setLeagueId] = useState("");

  useEffect(() => {
    if (!userId) router.push("/"); // must be logged in
    const saved = (typeof window !== "undefined" && localStorage.getItem("leagueId")) || "";
    if (saved) setLeagueId(saved);
  }, [userId, router]);

  async function createLeague() {
    try {
      const res = await api("/league/create", {
        method: "POST",
        userId,
        body: { name: "UK NFL FPL League", team_name: teamName },
      });
      localStorage.setItem("leagueId", String(res.league_id));
      localStorage.setItem("entryId", String(res.entry_id));
      alert(`League created (ID ${res.league_id}). Next: pick your squad.`);
      router.push("/pick");
    } catch (e: any) {
      alert(`Create league failed: ${e.message}`);
    }
  }

  async function joinLeague() {
    try {
      const res = await api("/league/join", {
        method: "POST",
        userId,
        body: { league_id: Number(leagueId), team_name: teamName },
      });
      localStorage.setItem("leagueId", String(leagueId));
      localStorage.setItem("entryId", String(res.entry_id));
      alert("Joined league. Next: pick your squad.");
      router.push("/pick");
    } catch (e: any) {
      alert(`Join league failed: ${e.message}`);
    }
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">League</h1>
      <p className="text-sm text-slate-600">Signed in as <b>{me?.name || `User ${userId}`}</b></p>

      <div className="bg-white rounded-2xl shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">Create a new league</h2>
        <label className="block">
          <span className="text-sm text-slate-600">Team Name</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
        </label>
        <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={createLeague} disabled={!userId}>
          Create League
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">Join an existing league</h2>
        <label className="block">
          <span className="text-sm text-slate-600">League ID</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} />
        </label>
        <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={joinLeague} disabled={!userId || !leagueId}>
          Join League
        </button>
      </div>

      <div className="flex gap-3">
        <a href="/" className="px-3 py-1.5 rounded-lg border">← Back</a>
        <a href="/pick" className="px-3 py-1.5 rounded-lg border">Skip to Pick</a>
      </div>
    </section>
  );
}
