"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const adminLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Übersicht",
  },
  {
    href: "/admin/firmen",
    label: "Firmen",
    description: "Verwalten",
  },
  {
    href: "/admin/firmenanfragen",
    label: "Firmenanfragen",
    description: "Prüfen",
  },
  {
    href: "/admin/events",
    label: "Events",
    description: "Verwalten",
  },
  {
  href: "/admin/eventanfragen",
  label: "Eventanfragen",
  description: "Prüfen",
  },
  {
    href: "/admin/leads",
    label: "Leads",
    description: "Kundenanfragen",
  },
  {
    href: "/admin/suchanfragen",
    label: "Suchanfragen",
    description: "Analyse",
  },
  {
    href: "/admin/einstellungen",
    label: "Einstellungen",
    description: "Später",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await fetch("/api/admin-logout", {
        method: "POST",
      });

      window.location.href = "/admin-login";
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:sticky lg:top-28 lg:h-fit">
      <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-200">
          Neario Admin
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
          Verwaltung
        </h2>

        <p className="mt-2 text-sm text-slate-300">
          Firmen, Events, Anfragen, Leads und Suchdaten zentral steuern.
        </p>
      </div>

      <nav className="mt-5 grid gap-2">
        {adminLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl border px-4 py-3 transition ${
                isActive
                  ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                  : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <span className="block font-black">{link.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {link.description}
              </span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-6 w-full rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? "Meldet ab..." : "Abmelden"}
      </button>
    </aside>
  );
}