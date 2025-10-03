"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../_lib/api";
import { useUser } from "../_lib/useUser";

function Section({ title, children, right }: any) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function PickPage() {
  const router = useRouter();
  const { userId, me } = useUser();

  const [leagueId, setLeagueId] = useState<string>("");
  const [entryId, setEntryId] = useState<string>("");
  const [players, setPlayers] = useState<any[]>([]);

  const [gw, setGw] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [starters, setStarters] = useState<number[]>([]);
  const [captain, setCaptain] = useState<number | null>(null);
  const [vice, setVice] = useState<number | null>(null);
  const [chip, setChip] = useState<string>("");

  const [standings, setStandings] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) { router.push("/"); return; }
    const lid = localStorage.getItem("leagueId") || "";
    const eid = localStorage.getItem("entryId") || "";
    setLeagueId(lid);
    setEntryId(eid);
  }, [userId, router]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/players");
        setPlayers(Array.isArray(res) ? res : []);
      } catch (e: any) {
        alert(`Load players failed: ${e.message}`);
      }
    })();
  }, []);

  const budgetUsed = useMemo(() => {
    const priceById = new Map(players.map((p) => [p.id, p.price || 0]));
    return selectedIds.reduce((sum, id) => sum + (priceById.get(id) || 0), 0);
  }, [selectedIds, players]);

  function togglePick(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 15 ? [...prev, id] : prev));
  }
  function toggleStarter(id: number) {
    setStarters((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 9 ? [...prev, id] : prev));
  }

  async function saveSquad() {
    if (selectedIds.length !== 15) return alert("Pick exactly 15 players first.");
    try {
      await api("/squad/set", { method: "POST", userId, body: { gameweek: gw, player_ids: selectedIds } });
      alert("Squad saved");
    } catch (e: any) { alert(`Save squad failed: ${e.message}`); }
  }

  async function saveLineup() {
    if (starters.length !== 9 || !captain || !vice) return alert("Set 9 starters plus captain & vice.");
    try {
      await api("/lineup/set", {
        method: "POST",
        userId,
        body: { gameweek: gw, starters, captain_id: captain, vice_captain_id: vice, chip: chip || null },
      });
      alert("Lineup saved");
    } catch (e: any) { alert(`Save lineup failed: ${e.message}`); }
  }

  async function loadStandings() {
    try {
      const res = await api(`/standings/${leagueId}`);
      setStandings(Array.isArray(res) ? res : []);
    } catch (e: any) { alert(`Standings failed: ${e.message}`); }
  }

  const posGroups = useMemo(() => {
    const g: Record<string, any[]> = { QB: [], RB: [], WR: [], TE: [], K: [], DST: [] };
    for (const p of players) if (g[p.position]) g[p.position].push(p);
    return g;
  }, [players]);

  return (
    <section className="max-w-6xl mx-auto">
      <div className="mb-4 text-sm text-slate-600">
        Signed in as <b>{me?.name || `User ${userId}`}</b>
        <span className="ml-4">League: <b>{leagueId || "-"}</b></span>
        <span className="ml-4">Entry: <b>{entryId || "-"}</b></span>
      </div>

      <Section
        title="Build Squad (15 players)"
        right={<div className="text-sm">Budget used: <b>{budgetUsed.toFixed(1)}</b> / 100.0</div>}
      >
        <div className="mb-4 flex gap-4 items-center">
          <label className="text-sm">Gameweek</label>
          <input className="w-20 border rounded px-2 py-1" type="number" min={1} value={gw} onChange={(e) => setGw(Number(e.target.value) || 1)} />
          <button className="px-3 py-1.5 rounded-lg bg-black text-white disabled:opacity-50"
            disabled={!userId || !entryId || selectedIds.length !== 15} onClick={saveSquad}>
            Save Squad
          </button>
          <span className="text-sm text-slate-500">Pick exactly 15 players.</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(posGroups).map(([pos, list]) => (
            <div key={pos} className="bg-gray-50 border rounded-xl p-3">
              <div className="font-semibold mb-2">{pos}</div>
              <div className="space-y-2 max-h-72 overflow-auto pr-2">
                {list.map((p: any) => {
                  const picked = selectedIds.includes(p.id);
                  return (
                    <div key={p.id} className={`flex items-center justify-between border rounded-lg px-3 py-2 ${picked ? "bg-black text-white border-black" : "bg-white"}`}>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs opacity-80">{p.team} · £{(p.price || 0).toFixed(1)}m</div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-black text-white" onClick={() => togglePick(p.id)}>
                        {picked ? "Remove" : "Pick"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Set Lineup (9 starters + C/VC)">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2">Your Squad</div>
            <div className="space-y-2 max-h-80 overflow-auto pr-2">
              {selectedIds.map((id) => {
                const p = players.find((x: any) => x.id === id);
                if (!p) return null;
                const isStarter = starters.includes(id);
                return (
                  <div key={id} className={`flex items-center justify-between border rounded-lg px-3 py-2 ${isStarter ? "bg-emerald-600 text-white border-emerald-700" : "bg-white"}`}>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs opacity-80">{p.position} · {p.team}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-lg border" onClick={() => toggleStarter(id)}>{isStarter ? "Unset" : "Start"}</button>
                      <button className="px-3 py-1.5 rounded-lg border" onClick={() => setCaptain(id)} disabled={!isStarter}>C</button>
                      <button className="px-3 py-1.5 rounded-lg border" onClick={() => setVice(id)} disabled={!isStarter}>VC</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Starters (9)</div>
            <div className="space-y-2">
              {starters.map((id) => {
                const p = players.find((x: any) => x.id === id);
                return (
                  <div key={id} className="flex items-center justify-between border rounded-lg px-3 py-2 bg-white">
                    <div>
                      <div className="font-medium">{p?.name}</div>
                      <div className="text-xs text-slate-500">{p?.position} · {p?.team}</div>
                    </div>
                    <div className="text-xs">
                      {captain === id && <span className="px-2 py-1 rounded-full bg-gray-100 border mr-2">Captain</span>}
                      {vice === id && <span className="px-2 py-1 rounded-full bg-gray-100 border">Vice</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Chip</label>
                <select className="w-full border rounded-xl px-3 py-2" value={chip} onChange={(e) => setChip(e.target.value)}>
                  <option value="">None</option>
                  <option value="BB">Bench Boost</option>
                  <option value="TC">Triple Captain</option>
                  <option value="WC">Wildcard</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-3">
                <button className="px-3 py-1.5 rounded-lg bg-black text-white disabled:opacity-50"
                  disabled={starters.length !== 9 || !captain || !vice || !userId} onClick={saveLineup}>
                  Save Lineup
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Standings">
        <div className="flex items-end gap-3 mb-3">
          <div>
            <label className="block text-sm text-slate-600">League ID</label>
            <input className="mt-1 w-44 border rounded-xl px-3 py-2" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} />
          </div>
          <button className="px-3 py-1.5 rounded-lg border" onClick={loadStandings} disabled={!leagueId}>
            Refresh Standings
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-6">#</th>
                <th className="py-2 pr-6">Team</th>
                <th className="py-2 pr-6">Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => (
                <tr key={row.entry_id} className="border-b last:border-0">
                  <td className="py-2 pr-6">{idx + 1}</td>
                  <td className="py-2 pr-6">{row.team_name}</td>
                  <td className="py-2 pr-6 font-semibold">{row.points}</td>
                </tr>
              ))}
              {!standings.length && (
                <tr><td className="py-3 text-slate-500" colSpan={3}>No standings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="flex gap-3">
        <a className="px-3 py-1.5 rounded-lg border" href="/league">← Back to League</a>
        <a className="px-3 py-1.5 rounded-lg border" href="/">Home</a>
      </div>
    </section>
  );
}
