import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NFL Fantasy (FPL-style)",
  description: "Salary cap, chips, shared players — MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <a href="/" className="font-semibold">NFL Fantasy — FPL style</a>
            <a href="/how-it-works">How it works</a>
            <a href="/rules">Rules</a>
            <a href="/pricing">Pricing</a>
            <a href="/play" className="ml-auto px-3 py-1.5 rounded-lg bg-black text-white">Play</a>
          </nav>
        </header>
        {children}
        <footer className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-500">
          © {new Date().getFullYear()} NFL FPL • <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a>
        </footer>
      </body>
    </html>
  );
}
