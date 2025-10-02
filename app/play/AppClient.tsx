// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * AppClient (standalone, safe to paste)
 * - Works with your FastAPI backend
 * - Reads base URL from NEXT_PUBLIC_API_URL
 * - Shows clear alerts on any failure (no silent errors)
 * - No external imports beyond React
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/* ---------------------------- tiny fetch helper ---------------------------- */
async function api(
  path: string,
  {
    method = "GET",
    body,
    userId,
  }: { method?: string; body?: any; userId?: string | number } = {}
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "X-User": String(userId) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    // Next edge/runtime safe
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      msg = (j && (j.detail || j.message)) || JSON.stringify(j);
    } catch {}
    throw new Error(msg);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* -------------------------------- UI bits --------------------------------- */
function Section({ title, right, children }: any) {
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

function Input({ label, ...props }: any) {
  return (
    <label className="block mb-3">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring"
        {...props}
      />
    </label>
  );
}

function Button({ children, className = "", ...props }: any) {
  return (
    <button
      className={`px-4 py-2 rounded-xl shadow bg-black text-white hover:opacity-90 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Pill({ children }: any) {
  return (
    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 border mr-2">
      {children}
    </span>
  );
}

/* --------------------------------- App ------------------------------------ */
function App() {
  const [userId, setUserId] = useState<string>("");
  const [me, setMe] = useState<any>(null);

  const [regName, setRegName] = useState("Marc");
  const [regEmail, setRegEmail] = useState("marc+demo@example.com");
  const [teamName, setTeamName] = useState("Marc's Marauders");

  const [leagueId, setLeagueId] = useState<string>("");
  const [entryId, setEntryId] = useState<number | null>(null);

  const [players, setPlayers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // 15-man squad
  const [gw, setGw] = useState<number>(1);

  const [starters, setStarters] = useState<number[]>([]); // exactly 9 starters
  const [captain, setCaptain] = useState<number | null>(null);
  const [vice, setVice] = useState<number | null>(null);
  const [chip, setChip] = useState<string>(""); // "", "BB", "TC", "WC"

  const [standingsData, setStandingsData] = useState<any[]>([]);

  const budgetUsed = useMemo(() => {
    const priceById = new Map(players.map((p) => [p.id, p.price || 0]));
    return selectedIds.reduce((sum, id) => sum + (priceById.get(id) || 0), 0);
  }, [selectedIds, players]);

  /* ----------------------------- initial data load ------------------------- */
  async function ensureDemoSeed() {
    // Optional backend helper; ignore if not present
    try {
      await api("/demo/seed_all", { method: "POST" });
    } catch {}
  }

  async function loadPlayers() {
    try {
      const res = await api("/players");
      setPlayers(Array.isArray(res) ? res : []);
    } catch (e: any) {
      alert(`Failed to load players: ${e.message}`);
    }
  }

  useEffect(() => {
    if (!BASE_URL) return;
    loadPlayers();
  }, []);

  /* --------------------------------- Auth --------------------------------- */
  async function doRegister() {
    try {
      await ensureDemoSeed();
      const res = await api("/register", {
        method: "POST",
        body: { name: regName, email: regEmail },
      });
      setUserId(String(res.id));
      setMe({ id: res.id, name: regName, email: regEmail });
      alert("Registered!");
    } catch (e: any) {
      alert(`Register failed: ${e.message}`);
    }
  }

  async function loadMe() {
    try {
      const res = await api("/me", { userId });
      setMe(res);
    } catch (e: any) {
      alert(`Load account failed: ${e.message}`);
    }
  }

  /* -------------------------------- League -------------------------------- */
  async function createLeague() {
    try {
      const res = await api("/league/create", {
        method: "POST",
        userId,
        body: { name: "UK NFL FPL League", team_name: teamName },
      });
      setLeagueId(String(res.league_id));
      setEntryId(res.entry_id);
      alert(`League created! ID: ${res.league_id}`);
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
      setEntryId(res.entry_id);
      alert("Joined league!");
    } catch (e: any) {
      alert(`Join league failed: ${e.message}`);
    }
  }

  /* ------------------------------- Squad pick ------------------------------ */
  function togglePick(pid: number) {
    setSelectedIds((prev) => {
      if (prev.includes(pid)) return prev.filter((x) => x !== pid);
      if (prev.length >= 15) return prev;
      return [...prev, pid];
    });
  }

  async function saveSquad() {
    if (selectedIds.length !== 15)
      return alert("Please pick exactly 15 players first.");
    try {
      await api("/squad/set", {
        method: "POST",
        userId,
        body: { gameweek: Number(gw), player_ids: selectedIds },
      });
      alert("Squad saved");
    } catch (e: any) {
      alert(`Save squad failed: ${e.message}`);
    }
  }

  /* -------------------------------- Lineup -------------------------------- */
  function toggleStarter(pid: number) {
    setStarters((prev) => {
      if (prev.includes(pid)) return prev.filter((x) => x !== pid);
      if (prev.length >= 9) return prev;
      return [...prev, pid];
    });
  }

  async function saveLineup() {
    if (!captain || !vice) return alert("Set captain & vice first.");
    if (starters.length !== 9) return alert("You must set exactly 9 starters.");
    try {
      await api("/lineup/set", {
        method: "POST",
        userId,
        body: {
          gameweek: Number(gw),
          starters,
          captain_id: captain,
          vice_captain_id: vice,
          chip: chip || null,
        },
      });
      alert("Lineup saved");
    } catch (e: any) {
      alert(`Save lineup failed: ${e.message}`);
    }
  }

  /* ------------------------------ Standings -------------------------------- */
  async function loadStandings() {
    if (!leagueId) return;
    try {
      const res = await api(`/standings/${leagueId}`);
      setStandingsData(Array.isArray(res) ? res : []);
    } catch (e: any) {
      alert(`Load standings failed: ${e.message}`);
    }
  }

  /* ------------------------------- Admin / QA ------------------------------ */
  const [newGwId, setNewGwId] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [statsJson, setStatsJson] = useState(
    '[{"player_id": 1, "pass_yd": 250, "pass_td": 2}]'
  );

  async function createGW() {
    const body = {
      id: Number(newGwId),
      name: `GW${newGwId}`,
      deadline_at:
        deadline || new Date(Date.now() + 3600 * 1000).toISOString(),
    };
    try {
      await api("/gameweeks/create", { method: "POST", userId, body });
      alert("GW created");
    } catch (e: any) {
      alert(`Create GW failed: ${e.message}`);
    }
  }

  async function uploadStats() {
    let stats;
    try {
      stats = JSON.parse(statsJson);
    } catch {
      return alert("Invalid JSON in Stats field.");
    }
    try {
      await api("/stats/upload", {
        method: "POST",
        userId,
        body: { gameweek: Number(gw), stats },
      });
      alert("Stats uploaded");
    } catch (e: any) {
      // Many MVP backends don't include this endpoint; warn nicely.
      alert(
        `Upload stats failed: ${e.message}\n(If 404, your backend doesn't expose /stats/upload in this MVP.)`
      );
    }
  }

  async function computeGW() {
    try {
      const res = await api(`/compute/${gw}`, { method: "POST" });
      alert("GW computed\n" + JSON.stringify(res?.gw_points ?? {}, null, 2));
      await loadStandings();
    } catch (e: any) {
      alert(
        `Compute failed: ${e.message}\n(If 404, your backend doesn't expose /compute in this MVP.)`
      );
    }
  }

  /* ----------------------------- derived groups ---------------------------- */
  const posGroups = useMemo(() => {
    const g: Record<string, any[]> = { QB: [], RB: [], WR: [], TE: [], K: [], DST: [] };
    for (const p of players) {
      if (g[p.position]) g[p.position].push(p);
    }
    return g;
  }, [players]);

  /* ------------------------------- render UI ------------------------------- */
  if (!BASE_URL) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          <b>Missing NEXT_PUBLIC_API_URL</b>
          <p className="text-sm mt-2">
            Set this in Vercel (or .env.local) to your backend URL, e.g.{" "}
            <code>https://nfl-fpl-backend.onrender.com</code>, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-5 border-b bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="font-bold text-lg">NFL Fantasy (FPL-Style) — MVP</div>
          <div className="text-sm text-gray-600">
            {me ? (
              <>
                Signed in as <b>{me.name}</b>
              </>
            ) : (
              "Not signed in"
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-5">
        {/* Register / Login */}
        <Section title="Register / Login">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Name"
                value={regName}
                onChange={(e: any) => setRegName(e.target.value)}
              />
              <Input
                label="Email"
                value={regEmail}
                onChange={(e: any) => setRegEmail(e.target.value)}
              />
              <Button onClick={doRegister}>Register</Button>
              {userId && (
                <span className="ml-3 text-sm">
                  User ID:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">{userId}</code>
                </span>
              )}
            </div>
            <div>
              <Input
                label="Existing User ID"
                value={userId}
                onChange={(e: any) => setUserId(e.target.value)}
              />
              <Button onClick={loadMe}>Load Account</Button>
              {me && <Pill>{me.email}</Pill>}
            </div>
          </div>
        </Section>

        {/* League */}
        <Section title="League">
          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div>
              <Input
                label="Team Name"
                value={teamName}
                onChange={(e: any) => setTeamName(e.target.value)}
              />
              <Button disabled={!userId} onClick={createLeague}>
                Create League
              </Button>
            </div>
            <div>
              <Input
                label="League ID"
                value={leagueId}
                onChange={(e: any) => setLeagueId(e.target.value)}
              />
              <Button disabled={!userId || !leagueId} onClick={joinLeague}>
                Join League
              </Button>
            </div>
            <div className="text-sm">
              <div>
                League ID: <b>{leagueId || "-"}</b>
              </div>
              <div>
                Entry ID: <b>{entryId || "-"}</b>
              </div>
            </div>
          </div>
        </Section>

        {/* Squad */}
        <Section
          title="Build Squad (15 players)"
          right={
            <div className="text-sm">
              Budget used: <b>{budgetUsed.toFixed(1)}</b> / 100.0
            </div>
          }
        >
          <div className="mb-4 flex gap-4 items-center">
            <label className="text-sm">Gameweek</label>
            <input
              className="w-20 border rounded px-2 py-1"
              type="number"
              min={1}
              value={gw}
              onChange={(e: any) => setGw(Number(e.target.value) || 1)}
            />
            <Button
              disabled={!userId || !entryId || selectedIds.length !== 15}
              onClick={saveSquad}
            >
              Save Squad
            </Button>
            <span className="text-sm text-gray-500">
              Pick exactly 15 players.
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(posGroups).map(([pos, list]) => (
              <div key={pos} className="bg-gray-50 border rounded-xl p-3">
                <div className="font-semibold mb-2">{pos}</div>
                <div className="space-y-2 max-h-72 overflow-auto pr-2">
                  {list.map((p: any) => {
                    const picked = selectedIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between border rounded-lg px-3 py-2 ${
                          picked
                            ? "bg-black text-white border-black"
                            : "bg-white"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs opacity-80">
                            {p.team} · £{(p.price || 0).toFixed(1)}m
                          </div>
                        </div>
                        <Button onClick={() => togglePick(p.id)}>
                          {picked ? "Remove" : "Pick"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Lineup */}
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
                    <div
                      key={id}
                      className={`flex items-center justify-between border rounded-lg px-3 py-2 ${
                        isStarter
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-white"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs opacity-80">
                          {p.position} · {p.team}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => toggleStarter(id)}>
                          {isStarter ? "Unset" : "Start"}
                        </Button>
                        <Button onClick={() => setCaptain(id)} disabled={!isStarter}>
                          C
                        </Button>
                        <Button onClick={() => setVice(id)} disabled={!isStarter}>
                          VC
                        </Button>
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
                    <div
                      key={id}
                      className="flex items-center justify-between border rounded-lg px-3 py-2 bg-white"
                    >
                      <div>
                        <div className="font-medium">{p?.name}</div>
                        <div className="text-xs text-gray-500">
                          {p?.position} · {p?.team}
                        </div>
                      </div>
                      <div className="text-xs">
                        {captain === id && <Pill>Captain</Pill>}
                        {vice === id && <Pill>Vice</Pill>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Chip
                  </label>
                  <select
                    className="w-full border rounded-xl px-3 py-2"
                    value={chip}
                    onChange={(e: any) => setChip(e.target.value)}
                  >
                    <option value="">None</option>
                    <option value="BB">Bench Boost</option>
                    <option value="TC">Triple Captain</option>
                    <option value="WC">Wildcard</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-3">
                  <Button
                    disabled={
                      starters.length !== 9 || !captain || !vice || !userId
                    }
                    onClick={saveLineup}
                  >
                    Save Lineup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Standings */}
        <Section title="Standings">
          <div className="flex items-center gap-3 mb-3">
            <Input
              label="League ID"
              value={leagueId}
              onChange={(e: any) => setLeagueId(e.target.value)}
            />
            <Button onClick={loadStandings} disabled={!leagueId}>
              Refresh Standings
            </Button>
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
                {standingsData.map((row, idx) => (
                  <tr key={row.entry_id} className="border-b last:border-0">
                    <td className="py-2 pr-6">{idx + 1}</td>
                    <td className="py-2 pr-6">{row.team_name}</td>
                    <td className="py-2 pr-6 font-semibold">{row.points}</td>
                  </tr>
                ))}
                {!standingsData.length && (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={3}>
                      No standings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Admin (Testing Only) */}
        <Section title="Admin (Testing Only)">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Input
                label="New GW ID"
                type="number"
                value={newGwId}
                onChange={(e: any) => setNewGwId(Number(e.target.value) || 1)}
              />
              <Input
                label="Deadline (ISO)"
                value={deadline}
                onChange={(e: any) => setDeadline(e.target.value)}
                placeholder="2025-10-02T20:00:00Z"
              />
              <Button disabled={!userId} onClick={createGW}>
                Create GW
              </Button>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                Stats JSON
              </label>
              <textarea
                className="w-full border rounded-xl p-3 h-40"
                value={statsJson}
                onChange={(e: any) => setStatsJson(e.target.value)}
              />
              <div className="flex gap-3 mt-2">
                <Button disabled={!userId} onClick={uploadStats}>
                  Upload Stats
                </Button>
                <Button onClick={computeGW}>Compute GW</Button>
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}

/* ---------------------------- exported wrapper ---------------------------- */
export default function AppClient() {
  return <App />;
}
