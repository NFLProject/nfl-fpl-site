export default function Page() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">NFL Fantasy — FPL style</h1>
      <p className="text-lg text-gray-600 mb-8">
        Salary cap. Chips. Multiple managers can own the same players. Built for friends & leagues.
      </p>
      <div className="flex gap-3">
        <a href="/play" className="px-5 py-3 rounded-xl bg-black text-white">Start Playing</a>
        <a href="/how-it-works" className="px-5 py-3 rounded-xl border">How it works</a>
      </div>
    </section>
  );
}
