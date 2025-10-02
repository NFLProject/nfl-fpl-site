import dynamic from "next/dynamic";

const AppClient = dynamic(() => import("./AppClient"), { ssr: false });

export default function PlayPage() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Play</h1>
      <AppClient />
    </section>
  );
}
