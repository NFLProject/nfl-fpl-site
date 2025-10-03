"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentGW, getLeague, getUserId } from "./session";
import { getSquadCount } from "./api";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    const id = getUserId();
    if (!id) router.replace(`/?next=${encodeURIComponent(path)}`);
  }, [router, path]);
  return <>{children}</>;
}

export function LeagueGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const { leagueId, entryId } = getLeague();
    if (!leagueId || !entryId) router.replace("/league");
  }, [router]);
  return <>{children}</>;
}

export function SquadGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const userId = getUserId();
    const { leagueId } = getLeague();
    const gw = getCurrentGW();
    if (!userId || !leagueId) return;

    getSquadCount(userId, leagueId, gw).then((count) => {
      if (count < 15) router.replace(`/market?gw=${gw}`);
      else setOk(true);
    }).catch(() => router.replace(`/market?gw=${gw}`));
  }, [router]);

  if (!ok) return (
    <div className="p-8 text-center text-slate-500">Checking your squad…</div>
  );
  return <>{children}</>;
}
