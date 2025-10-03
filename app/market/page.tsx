"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGate, LeagueGate } from "../_lib/guards";
import { getLeague, getUserId } from "../_lib/session";
import { getPlayers, Player, setSquad } from "../_lib/api";

const CAP = 100.0;
const REQUIRED = 15;

export default function MarketPage() {
  return (
    <AuthGate>
      <LeagueGate>
        <MarketBody />
      </LeagueGate>
    </AuthGate>
  );
}

function MarketBody() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState<"ALL" | Player["pos"]>("ALL");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const gw = Number(params.get("gw") || 1);

  const { leagueId } = getLeague();
  const userId = getUserId();

  useEffect(() => {
    setLoading(true);
    getPlayers()
      .then((ps) => setPlayers(ps))
      .catch(() => setErr("Couldn’t load players."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (pos === "ALL" ? players : players.filter((p) => p.pos === pos)),
    [pos, players]
  );

  const budgetUsed = useMemo(
    () =>
      selected.reduce((sum, id) => {
        const p = players.find((x) => x.id === id);
        return sum + (p?.price_m || 0);
      }, 0),
    [selected, players]
  );

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < REQUIRED ? [...prev, id] : prev
    );
  }

  async function save() {
    if (!userId || !leagueId) return;
    if (selected.length !== REQUIRED) {
      setErr(`Pick exactly ${REQUIRED} players.`);
      return;
    }
    if (budgetUsed > CAP) {
      setErr(`You’re over budget (£${budgetUsed.toFixed(1)}m / £${CAP.toFixed(1)}m).`);
      return;
    }
    try {
      await setSquad(userId, leagueId, gw, selected);
      router.replace("/pick");
    } catch (e) {
      setErr("Couldn’t save squad.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Pick your squad</h1>
      <p className="text-slate-600 mt-1">
        Pick exactly {REQUIRED} players within a £{CAP.toFixed(1)}m budget.
      </p>

      <div className="flex items-center gap-3 mt-6">
        {(["ALL","QB","RB","WR","TE","K","DST"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setPos(t as any)}
            className={`px-3 py-1.5 rounded-xl border text-sm ${pos===t ? "bg-brand text-white border-brand" : "hover:bg-slate-50"}`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto text-sm text-slate-600">
          <span className="font-semibold">Selected:</span> {selected.length}/{REQUIRED} &nbsp;•&nbsp; 
          <span className="font-semibold">Budget:</span> £{budgetUsed.toFixed(1)}m / £{CAP.toFixed(1)}m
        </div>
        <button onClick={save} className="px-4 py-2 rounded-xl bg-brand text-white shadow disabled:opacity-50"
          disabled={loading || selected.length !== REQUIRED || budgetUsed > CAP}>
          Save squad
        </button>
      </div>

      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {loading ? (
          <div className="col-span-full p-10 text-center text-slate-500">Loading players…</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500">
            No players yet. (If you’re on an empty DB, seed via backend admin.)
          </div>
        ) : (
          filtered.map((p) => {
            const chosen = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`text-left rounded-2xl border p-4 shadow-card hover:shadow ${chosen ? "bg-ink text-white" : "bg-white"}`}
              >
                <div className="text-xs uppercase opacity-70">{p.pos} • {p.team}</div>
                <div className="text-lg font-semibold mt-1">{p.name}</div>
                <div className={`text-sm mt-1 ${chosen ? "opacity-80" : "text-slate-500"}`}>£ {p.price_m.toFixed(1)}m</div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
