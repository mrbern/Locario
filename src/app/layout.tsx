import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Locario | Lokale Firmen & Events entdecken",
  description:
    "Locario ist ein lokales Portal für regionale Firmen, KMUs, Dienstleister, Händler und Events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="bg-slate-950 text-white antialiased">
        <Header />

        {children}

        <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 px-6 py-12 text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-10rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute right-[-10rem] bottom-[-10rem] h-[26rem] w-[26rem] rounded-full bg-blue-600/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div>
                <Link href="/" className="group inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
                    N
                  </div>

                  <div>
                    <p className="text-2xl font-black tracking-tight">
                      Locario
                    </p>
                    <p className="-mt-1 text-xs font-medium text-slate-400">
                      Lokale Firmen & Events
                    </p>
                  </div>
                </Link>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                  Locario verbindet lokale Suchanfragen mit passenden regionalen
                  Firmen, KMUs, Dienstleistern, Händlern und Events.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/suche"
                    className="rounded-2xl border border-white/15 px-5 py-3 text-center text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    Suche starten
                  </Link>

                  <Link
                    href="/events"
                    className="rounded-2xl border border-white/15 px-5 py-3 text-center text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    Events ansehen
                  </Link>

                  <Link
                    href="/fuer-firmen"
                    className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-5 py-3 text-center text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                  >
                    Firma eintragen
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                  Plattform
                </p>

                <nav className="mt-5 grid gap-3 text-sm font-semibold text-slate-300">
                  <Link href="/" className="transition hover:text-cyan-200">
                    Startseite
                  </Link>

                  <Link
                    href="/suche"
                    className="transition hover:text-cyan-200"
                  >
                    Suche
                  </Link>

                  <Link
                    href="/firmen"
                    className="transition hover:text-cyan-200"
                  >
                    Firmen
                  </Link>

                  <Link
                    href="/events"
                    className="transition hover:text-cyan-200"
                  >
                    Events
                  </Link>

                  <Link
                    href="/fuer-firmen"
                    className="transition hover:text-cyan-200"
                  >
                    Für Firmen
                  </Link>
                </nav>
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                  Rechtliches
                </p>

                <nav className="mt-5 grid gap-3 text-sm font-semibold text-slate-300">
                  <Link
                    href="/impressum"
                    className="transition hover:text-cyan-200"
                  >
                    Impressum
                  </Link>

                  <Link
                    href="/datenschutz"
                    className="transition hover:text-cyan-200"
                  >
                    Datenschutz
                  </Link>

                  <Link href="/agb" className="transition hover:text-cyan-200">
                    AGB
                  </Link>
                </nav>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 md:flex-row md:items-center">
              <p>
                © {new Date().getFullYear()} Locario. Alle Rechte vorbehalten.
              </p>

              <p>
                Lokale KI-Suche, Events und digitale Sichtbarkeit für regionale
                Anbieter.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
