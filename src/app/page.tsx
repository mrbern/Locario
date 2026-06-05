"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function goToSearch(searchQuery: string) {
    const cleanedQuery = searchQuery.trim();

    if (!cleanedQuery) {
      router.push("/suche");
      return;
    }

    router.push(`/suche?q=${encodeURIComponent(cleanedQuery)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToSearch(query);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-14rem] top-[8rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[10rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-5 py-12 sm:px-6 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/30">
            <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/70" />
            <span className="truncate">
              Lokales Portal für Firmen und Events
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
            Entdecke, was in deiner{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Region
            </span>{" "}
            läuft.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
            Neario verbindet lokale Firmen, regionale Anbieter und Events an
            einem Ort. Suche nach dem, was du brauchst, oder entdecke
            Veranstaltungen in deiner Nähe.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] border border-white/10 bg-white/10 p-2 shadow-2xl shadow-cyan-950/40 backdrop-blur md:flex md:rounded-[1.75rem]"
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-2xl bg-white px-4 py-4 text-base font-semibold text-slate-950 outline-none placeholder:text-slate-500 md:rounded-3xl md:px-5 md:text-lg"
              placeholder="Was suchst du? Zum Beispiel: Werkstatt Wattenwil"
            />

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-8 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 md:mt-0 md:w-auto md:rounded-3xl"
            >
              Suchen
            </button>
          </form>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <PortalCard
            href="/firmen"
            eyebrow="Lokale Anbieter"
            title="Firmen finden"
            description="Entdecke regionale Firmen, Dienstleister, Händler und KMUs. Filtere nach Ort, Kategorie und Suchbegriff."
            primaryAction="Firmen entdecken"
            secondaryText="Werkstatt, Bäckerei, Elektriker, Kies, Garage und mehr"
            variant="firmen"
          />

          <PortalCard
            href="/events"
            eyebrow="Regionale Veranstaltungen"
            title="Events entdecken"
            description="Finde Konzerte, Märkte, Vereinsanlässe, Partys, Kultur, Sport und lokale Highlights in deiner Umgebung."
            primaryAction="Events ansehen"
            secondaryText="Wochenendtipps, Vereinsfeste, Märkte, Konzerte und mehr"
            variant="events"
          />
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Für Nutzer"
            description="Schnell finden, was lokal relevant ist: Firmen, Angebote und Veranstaltungen."
          />

          <InfoCard
            title="Für Firmen"
            description="Mehr Sichtbarkeit durch moderne Profile, Suchbegriffe, Bilder und Leads."
          />

          <InfoCard
            title="Für Veranstalter"
            description="Events können später wochenweise beworben und hervorgehoben werden."
          />
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl shadow-slate-950/20 md:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Mitmachen
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-tight md:text-4xl">
            Du willst mit deiner Firma oder deinem Event auf Neario sichtbar
            werden?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Neario wird Schritt für Schritt zur lokalen Plattform für regionale
            Sichtbarkeit, Werbung und Anfragen.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/fuer-firmen"
              className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
            >
              Firma eintragen
            </Link>

            <Link
              href="/events"
              className="rounded-3xl border border-white/15 px-7 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Events ansehen
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function PortalCard({
  href,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryText,
  variant,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryText: string;
  variant: "firmen" | "events";
}) {
  const isEvents = variant === "events";

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl shadow-slate-950/30 transition hover:-translate-y-1 md:p-8 ${
        isEvents
          ? "border-amber-300/20 bg-amber-300/10 hover:border-amber-300/40"
          : "border-cyan-300/20 bg-cyan-300/10 hover:border-cyan-300/40"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full blur-3xl ${
            isEvents ? "bg-amber-300/20" : "bg-cyan-300/20"
          }`}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.16),transparent_18rem)]" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-sm font-black uppercase tracking-wide ${
                isEvents ? "text-amber-200" : "text-cyan-200"
              }`}
            >
              {eyebrow}
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              {title}
            </h2>
          </div>

          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-slate-950 shadow-lg transition group-hover:scale-105 ${
              isEvents
                ? "bg-gradient-to-br from-amber-200 to-amber-400 shadow-amber-500/20"
                : "bg-gradient-to-br from-cyan-300 to-blue-500 shadow-cyan-500/20"
            }`}
          >
            {isEvents ? "E" : "F"}
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-slate-300">{description}</p>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
          <p className="text-sm font-bold text-slate-200">{secondaryText}</p>
        </div>

        <div className="mt-7 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition group-hover:bg-cyan-300">
          {primaryAction}
        </div>
      </div>
    </Link>
  );
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-slate-950/20">
      <h3 className="text-xl font-black">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}