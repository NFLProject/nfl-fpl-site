"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL as string;

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ultra-reliable navigation helper
  function go(path: string) {
    try {
      router.replace(path);        // App Router
      // Safety net if something blocks SPA nav
      setTimeout(() => {
        if (location.pathname !== path) window.location.assign(path);
      }, 50);
    } catch {
      window.location.assign(path);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (!API) throw new Error("Missing NEXT_PUBLIC_API_URL");
      const r = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const data = await r.json();
      const userId = data.userId ?? data.user_id ?? data.id;
      if (!userId) throw new Error("No user id returned");

      localStorage.setItem("userId", String(userId));

      // prefetch & go to team naming
      router.prefetch("/team");
      go("/team");
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">GridCap</h1>
      <p className="text-slate-600 mt-1">Same players. Smarter fantasy.</p>
      <form onSubmit={register} className="mt-8 space-y-4 rounded-2xl border bg-white p-6 shadow">
        <label className="block text-sm">
          Name
          <input className="mt-1 w-full rounded-xl border px-3 py-2"
                 value={name} onChange={e=>setName(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Email
          <input className="mt-1 w-full rounded-xl border px-3 py-2"
                 type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="w-full rounded-xl bg-brand text-white py-2 disabled:opacity-50" disabled={loading}>
          {loading ? "Creating…" : "Get started"}
        </button>
      </form>
    </main>
  );
}
