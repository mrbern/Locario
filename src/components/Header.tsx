"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 text-white md:px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
            N
          </div>

          <div>
            <p className="text-2xl font-black tracking-tight">Locario</p>
            <p className="-mt-1 hidden text-xs font-medium text-slate-400 sm:block">
              Lokale Firmen & Events
            </p>
          </div>
        </Link>

        <nav className="hidden items-center rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-2 text-sm font-semibold text-slate-300 shadow-xl shadow-slate-950/20 md:flex">
          <Link
            href="/suche"
            className="rounded-xl px-4 py-2 transition hover:bg-white/10 hover:text-white"
          >
            Suche
          </Link>

          <Link
            href="/firmen"
            className="rounded-xl px-4 py-2 transition hover:bg-white/10 hover:text-white"
          >
            Firmen
          </Link>

          <Link
            href="/events"
            className="rounded-xl px-4 py-2 transition hover:bg-white/10 hover:text-white"
          >
            Events
          </Link>

          <Link
            href="/fuer-firmen"
            className="rounded-xl px-4 py-2 transition hover:bg-white/10 hover:text-white"
          >
            Für Firmen
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/fuer-firmen"
            onClick={closeMenu}
            className="hidden rounded-2xl bg-gradient-to-br from-cyan-300 to-cyan-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 sm:inline-flex"
          >
            Firma eintragen
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition hover:border-cyan-300/30 hover:bg-white/10 md:hidden"
            aria-label={isMenuOpen ? "Menü schliessen" : "Menü öffnen"}
            aria-expanded={isMenuOpen}
          >
            <span className="grid gap-1.5">
              <span
                className={`block h-0.5 w-5 rounded-full bg-white transition ${
                  isMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-white transition ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-white transition ${
                  isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-5 py-4 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-3">
            <MobileNavLink href="/suche" label="Suche" onClick={closeMenu} />

            <MobileNavLink href="/firmen" label="Firmen" onClick={closeMenu} />

            <MobileNavLink href="/events" label="Events" onClick={closeMenu} />

            <MobileNavLink
              href="/fuer-firmen"
              label="fuer-firmen & Veranstalter"
              onClick={closeMenu}
            />

            <Link
              href="/fuer-firmen"
              onClick={closeMenu}
              className="mt-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-5 py-4 text-center text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              Firma eintragen
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-black text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
    >
      {label}
    </Link>
  );
}

