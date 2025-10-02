// @ts-nocheck
"use client";
import React, { useEffect, useMemo, useState } from "react";

/**
 * AppClient mounts your existing MVP React app inside Next.js at /play.
 * IMPORTANT: Set NEXT_PUBLIC_API_URL in Vercel (or .env.local) to your Render URL, e.g.:
 * NEXT_PUBLIC_API_URL=https://nfl-fpl-backend.onrender.com
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""; // <-- from env

async function api(path, { method = "GET", body, userId } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "X-User": String(userId) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      msg = j.detail || JSON.stringify(j);
    } catch {}
    throw new Error(msg);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function Section({ title, children, right }) {
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

function Input({ label, ...props }) {
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

function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-xl shadow bg-black text-white hover:opacity-90 disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}

function Pill({ children }) {
  return (
    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 border mr-2">
      {children}
    </span>
  );
}

function App() {
  const [userId, setUserId] = useState("");
  const [me, setMe] = useState(null);

  const [regName, setRegName] = useState("Marc");
  const [regEmail, setRegEmail] = useState("marc+demo@example.com");
  const [teamName, setTeamName] = useState("Marc's Marauders");

  const [leagueId, setLeagueId] = useState("");
  const [entryId, setEntryId] = useState<number | null>(null);

  const [players, setPlayers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // 15
  const [gw, setGw] = useState(1);

  const [starters, setStarters] = useState<number[]>([]); // 9
  const [captain, setCaptain] = useState<number | null>(null);
  const [vice, setVice] = useState<number | null>(null);
  const [chip, setChip] = useState(""); // BB | TC | WC

  const [standingsData, setStandingsData] = useState<any[]>([]);

  const budgetUsed = useMemo(() => {
    const map = new Map(players.map((p) => [p.id, p.price || 0]));
    return selectedIds.reduce((a, id) => a + (map.get(id) || 0), 0);
  }, [selectedIds, players]);

  async function ensureDemoSeed() {
    try {
      await api("/demo/seed_all", { method: "POST" });
    } catch {}
  }

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
      alert(`Load failed: ${e.message}`);
    }
  }

  async function loadPlayers() {
    const res = await api("/players");
    setPlayers(res);
  }

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
