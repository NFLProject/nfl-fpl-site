"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, BASE_URL } from "./_lib/api";
import { useUser } from "./_lib/useUser";

export default function HomePage() {
  const router = useRouter();
  const { userId, setUserId, me, logout } = useUser();

  const [name, setName] = useState("Marc");
  const [email, setEmail] = useState("marc+demo@example.com");
  const [existing, setExisting] = useState("");

  async function register() {
    try {
      if (!BASE_URL) throw new Error("Missing NEXT_PUBLIC_API_URL");
      const res = await api("/register", { method: "POST", body: { name, email } });
      setUserId(String(res.id));
      alert("Registered! Taking you to League setup…");
      router.push("/league");
    } catch (e: any) {
      alert(`Register failed: ${e.message}`);
    }
  }

  async function login() {
    try {
      if (!existing) return alert("Enter an existing User ID");
      const me = await api("/me", { userId: existing });
      if (!me?.id) throw new Error("User not found");
      setUserId(String(me.id));
      alert("Welcome back! Taking you to League…");
      router.push("/league");
    } catch (e: any) {
      alert(`Login failed: ${e.message}`);
    }
  }

  return (
    <section className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">NFL Fantasy (FPL-style)</h1>
      <p className="text-slate-600">Salary cap. Chips. Same players across teams.</p>

      {!BASE_URL && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          Set <code>NEXT_PUBLIC_API_URL</code> in Vercel settings, then redeploy.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-5 space-y-4">
        <h2 className="text-xl font-semibold">Register</h2>
        <label className="block">
          <span className="text-sm text-slate-600">Name</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Email</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={register}>Register</button>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 space-y-4">
        <h2 className="text-xl font-semibold">Log in with User ID</h2>
        <label className="block">
          <span className="text-sm text-slate-600">User ID</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2" value={existing} onChange={(e) => setExisting(e.target.value)} />
        </label>
        <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={login}>Log in</button>
      </div>

      {userId && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">Signed in as</span>
          <span className="font-medium">{me?.name || "User " + userId}</span>
          <button className="ml-auto px-3 py-1.5 rounded-lg border" onClick={logout}>Log out</button>
          <a href="/league" className="px-3 py-1.5 rounded-lg bg-black text-white">Continue → League</a>
        </div>
      )}
    </section>
  );
}
