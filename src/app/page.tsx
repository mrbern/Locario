"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const searchSuggestions = [
  "Restaurant Wattenwil",
  "Events Wochenende",
  "Bäckerei in der Nähe",
  "Werkstatt Belp",
  "Kies kaufen",
  "Konzert Thun",
];

const userBenefits = [
  {
    title: "Natürlich suchen",
    description:
      "Suche wie du sprichst: zum Beispiel „Ich brauche Kies“, „Werkstatt in Wattenwil“ oder „Events am Wochenende“.",
  },
  {
    title: "Regionale Anbieter finden",
    description:
      "Locario zeigt passende lokale Firmen, Dienstleister, Händler und Anbieter aus deiner Region.",
  },
  {
    title: "Events entdecken",
    description:
      "Finde Märkte, Konzerte, Vereinsanlässe, Partys, Kultur, Sport und lokale Highlights.",
  },
];

const businessBenefits = [
  {
    title: "Starter",
    description:
      "Ein einfaches Firmenprofil für regionale Sichtbarkeit mit Kontaktangaben, Beschreibung und Suchbegriffen.",
  },
  {
    title: "Pro",
    description:
      "Business-Tarif mit Partner-Dashboard, Leadformular, Leadverwaltung und aktiver Werbeanzeige.",
  },
  {
    title: "Premium",
    description:
      "Maximale Präsenz mit bevorzugter Platzierung und stärkster Sichtbarkeit in passenden Treffern.",
  },
];

const eventBenefits = [
  {
    title: "Event einreichen",
    description:
      "Veranstalter können Events über Locario einreichen und ein passendes Wochenpaket auswählen.",
  },
  {
    title: "Admin prüft",
    description:
      "Event-Anfragen werden geprüft und können direkt als öffentliches Event erstellt werden.",
  },
  {
    title: "Regional sichtbar",
    description:
      "Das Event erscheint mit Datum, Ort, Beschreibung, Website und Ticketlink auf der Events-Seite.",
  },
];

const platformStats = [
  {
    label: "Firmen",
    value: "Regional",
  },
  {
    label: "Events",
    value: "Aktuell",
  },
  {
    label: "Suche",
    value: "Smart",
  },
];

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
      <BackgroundGlow />

      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/30">
            <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/70" />
            <span className="truncate">
              Lokales Portal für Firmen, Suche und Events
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
            Finde, was in deiner{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Region wichtig ist.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
            Locario verbindet lokale Firmen, regionale Anbieter und Events an
            einem Ort. Suche direkt nach dem, was du brauchst, oder entdecke
            neue Angebote und Veranstaltungen in deiner Nähe.
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
              aria-label="Suchbegriff"
            />

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-8 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 md:mt-0 md:w-auto md:rounded-3xl"
            >
              Suchen
            </button>
          </form>

          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
            {searchSuggestions.map((suggestion, suggestionIndex) => (
              <button
                key={`${normalizeKey(suggestion)}-${suggestionIndex}`}
                type="button"
                onClick={() => goToSearch(suggestion)}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-6xl gap-6 lg:grid-cols-2">
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
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Für Nutzer
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Lokal suchen, schneller finden.
              </h2>

              <p className="mt-5 text-slate-300">
                Locario hilft dir, regionale Anbieter und Veranstaltungen
                einfacher zu entdecken, ohne lange auf verschiedenen Seiten
                suchen zu müssen.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[24rem]">
              {platformStats.map((stat, statIndex) => (
                <StatCard
                  key={`${normalizeKey(stat.label)}-${statIndex}`}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {userBenefits.map((benefit, benefitIndex) => (
              <InfoCard
                key={`${normalizeKey(benefit.title)}-${benefitIndex}`}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-200">
              Für Firmen
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Sichtbar werden, wenn Menschen lokal suchen.
            </h2>

            <p className="mt-5 text-slate-300">
              Firmen können auf Locario mit Profil, Kategorien, Bild,
              Suchbegriffen und je nach Paket mit Leads, Dashboard und Werbung
              sichtbar werden.
            </p>

            <div className="mt-8 grid gap-4">
              {businessBenefits.map((benefit, benefitIndex) => (
                <BusinessCard
                  key={`${normalizeKey(benefit.title)}-${benefitIndex}`}
                  title={benefit.title}
                  description={benefit.description}
                />
              ))}
            </div>

            <Link
              href="/fuer-firmen"
              className="mt-8 inline-flex rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
            >
              Firma eintragen
            </Link>
          </section>

          <section className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 shadow-2xl shadow-amber-950/20 md:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-amber-200">
              Für Veranstalter
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Events regional bewerben.
            </h2>

            <p className="mt-5 text-slate-300">
              Veranstalter können Events einreichen. Im Admin werden sie
              geprüft, angenommen und als öffentliches Event erstellt.
            </p>

            <div className="mt-8 grid gap-4">
              {eventBenefits.map((benefit, benefitIndex) => (
                <BusinessCard
                  key={`${normalizeKey(benefit.title)}-${benefitIndex}`}
                  title={benefit.title}
                  description={benefit.description}
                  amber
                />
              ))}
            </div>

            <Link
              href="/fuer-firmen"
              className="mt-8 inline-flex rounded-3xl bg-gradient-to-r from-amber-300 to-orange-400 px-7 py-4 text-center font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5"
            >
              Event einreichen
            </Link>
          </section>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl shadow-slate-950/20 md:p-12">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Locario
          </p>

          <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">
            Eine moderne lokale Plattform für Firmen, Events und regionale
            Sichtbarkeit.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Suche direkt los, entdecke Anbieter oder bring deine Firma oder dein
            Event auf Locario.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => goToSearch("")}
              className="rounded-3xl bg-white px-8 py-4 text-center font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              Suche starten
            </button>

            <Link
              href="/fuer-firmen"
              className="rounded-3xl border border-white/15 px-8 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Sichtbar werden
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-[-14rem] top-[8rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-[10rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
    </div>
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

      <div className="relative flex h-full flex-col">
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

        <div
          className={`mt-7 inline-flex w-fit rounded-2xl px-5 py-3 text-sm font-black text-slate-950 transition ${
            isEvents
              ? "bg-white group-hover:bg-amber-300"
              : "bg-white group-hover:bg-cyan-300"
          }`}
        >
          {primaryAction}
        </div>
      </div>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-left">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-cyan-100">{value}</p>
    </article>
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
    <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08]">
      <h3 className="text-2xl font-black">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </article>
  );
}

function BusinessCard({
  title,
  description,
  amber = false,
}: {
  title: string;
  description: string;
  amber?: boolean;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <h3
        className={`text-2xl font-black ${
          amber ? "text-amber-100" : "text-cyan-100"
        }`}
      >
        {title}
      </h3>

      <p className="mt-2 text-slate-300">{description}</p>
    </article>
  );
}
