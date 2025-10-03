export function getUserId(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem("userId");
  return v ? Number(v) : null;
}
export function getLeague(): { leagueId: number | null; entryId: number | null } {
  if (typeof window === "undefined") return { leagueId: null, entryId: null };
  const leagueId = localStorage.getItem("leagueId");
  const entryId = localStorage.getItem("entryId");
  return { leagueId: leagueId ? Number(leagueId) : null, entryId: entryId ? Number(entryId) : null };
}
export function getCurrentGW(): number {
  if (typeof window === "undefined") return 1;
  const v = localStorage.getItem("gw");
  return v ? Number(v) : 1;
}
