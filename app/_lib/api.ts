export const API = process.env.NEXT_PUBLIC_API_URL!;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

export type Player = {
  id: number;
  name: string;
  pos: "QB" | "RB" | "WR" | "TE" | "K" | "DST";
  team: string;
  price_m: number; // millions
};

export async function getPlayers(): Promise<Player[]> {
  return req<Player[]>("/players");
}

// Adjust this path if your backend uses a different name:
export async function getSquadCount(userId: number, leagueId: number, gw: number): Promise<number> {
  try {
    const data = await req<{ picks: { player_id: number }[] }>(
      `/squad?user_id=${userId}&league_id=${leagueId}&gw=${gw}`
    );
    return Array.isArray(data?.picks) ? data.picks.length : 0;
  } catch {
    return 0;
  }
}

export async function setSquad(userId: number, leagueId: number, gw: number, picks: number[]) {
  return req<{ ok: boolean }>("/squad/set", {
    method: "POST",
    body: JSON.stringify({ userId, leagueId, gameweek: gw, picks }),
  });
}
