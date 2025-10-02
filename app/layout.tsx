export const metadata = {
  title: "NFL Fantasy (FPL-style)",
  description: "FPL-style NFL fantasy with salary cap & chips.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-6 items-center">
            <a href="/" className="font-semibold">NFL Fantasy (FPL-style)</a>
            <a href="/how-it-works" className="text-sm">How it works</a>
            <a href="/rules" className="text-sm">Rules</a>
            <a href="/pricing" className="text-sm">Pricing</a>
            <a href="/play" className="ml-auto px-3 py-1 rounded-lg bg-black text-white text-sm">Play</a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="mt-16 border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} NFL FPL • <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
