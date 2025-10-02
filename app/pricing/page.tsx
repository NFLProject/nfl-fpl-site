export default function Pricing() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Pricing</h1>
      <p className="text-gray-600 mb-6">Beta is free. Team-based leagues & pro features coming soon.</p>
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="font-semibold mb-2">Free (Beta)</h2>
        <ul className="list-disc ml-6 space-y-1 text-sm">
          <li>Unlimited private leagues</li>
          <li>FPL-style gameplay</li>
          <li>Manual stats upload</li>
        </ul>
      </div>
    </section>
  );
}
