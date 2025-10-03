"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export function useUser() {
  const [userId, setUserId] = useState<string>("");
  const [me, setMe] = useState<any>(null);

  // Load from localStorage on first mount
  useEffect(() => {
    const uid = (typeof window !== "undefined" && localStorage.getItem("userId")) || "";
    if (uid) setUserId(uid);
  }, []);

  // Persist and fetch profile when userId changes
  useEffect(() => {
    if (!userId) return;
    try {
      localStorage.setItem("userId", userId);
    } catch {}
    (async () => {
      try {
        const m = await api("/me", { userId });
        setMe(m);
      } catch {
        // ignore – user might not exist yet
      }
    })();
  }, [userId]);

  function logout() {
    try {
      localStorage.removeItem("userId");
      localStorage.removeItem("leagueId");
      localStorage.removeItem("entryId");
    } catch {}
    setUserId("");
    setMe(null);
  }

  return { userId, setUserId, me, setMe, logout };
}
