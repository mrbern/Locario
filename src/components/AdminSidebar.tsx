"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type AdminLink = {
  href: string;
  label: string;
  description: string;
};

type AdminLinkGroup = {
  title: string;
  links: AdminLink[];
};

const adminLinkGroups: AdminLinkGroup[] = [
  {
    title: "Cockpit",
    links: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Übersicht",
      },
    ],
  },
  {
    title: "Verwaltung",
    links: [
      {
        href: "/admin/firmen",
        label: "Firmen",
        description: "Tabelle",
      },
      {
        href: "/admin/standorte",
        label: "Standorte",
        description: "Filialen",
      },
      {
        href: "/admin/events",
        label: "Events",
        description: "Tabelle",
      },
    ],
  },
  {
    title: "Inbox",
    links: [
      {
        href: "/admin/firmenanfragen",
        label: "Firmenanfragen",
        description: "Prüfen",
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
    ],
  },
  {
    title: "Analyse",
    links: [
      {
        href: "/admin/suchanfragen",
        label: "Suchanfragen",
        description: "Akquise",
      },
    ],
  },
  {
    title: "System",
    links: [
      {
        href: "/admin/einstellungen",
        label: "Einstellungen",
        description: "Setup",
      },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

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
    <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:sticky lg:top-8 lg:h-fit">
      <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20">
            L
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase tracking-wide text-cyan-200">
              Locario
            </p>

            <h2 className="truncate text-xl font-black tracking-tight text-white">
              Admin
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          Backend für Firmen, Events, Anfragen, Leads und Suchdaten.
        </p>
      </div>

      <nav className="mt-5 space-y-5">
        {adminLinkGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-[0.7rem] font-black uppercase tracking-[0.18em] text-slate-500">
              {group.title}
            </p>

            <div className="grid gap-1.5">
              {group.links.map((link) => {
                const isActive = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group rounded-2xl border px-3 py-3 transition ${
                      isActive
                        ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100 shadow-lg shadow-cyan-950/20"
                        : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block truncate font-black">
                          {link.label}
                        </span>

                        <span
                          className={`mt-0.5 block truncate text-xs ${
                            isActive ? "text-cyan-200/80" : "text-slate-500"
                          }`}
                        >
                          {link.description}
                        </span>
                      </div>

                      <span
                        className={`shrink-0 text-sm font-black transition ${
                          isActive
                            ? "text-cyan-200"
                            : "text-slate-600 group-hover:text-cyan-300"
                        }`}
                      >
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 grid gap-2 border-t border-white/10 pt-5">
        <Link
          href="/"
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.06] hover:text-white"
        >
          Öffentliche Seite öffnen
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? "Meldet ab..." : "Abmelden"}
        </button>
      </div>
    </aside>
  );
}