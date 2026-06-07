"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const userBenefits = [
  {
    title: "Natürlich suchen",
    description:
      "Suche wie du sprichst: zum Beispiel „Ich brauche Kies“, „Werkstatt in Wattenwil“ oder „Nissan kaufen“.",
  },
  {
    title: "Regionale Anbieter finden",
    description:
      "Locario zeigt dir passende lokale Firmen, Dienstleister, Händler und Anbieter aus deiner Region.",
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
    title: "Event anfragen",
    description:
      "Veranstalter können Events über Locario einreichen und ein passendes Wochenpaket auswählen.",
  },
  {
    title: "Admin prüft",
    description:
      "Event-Anfragen werden im Admin geprüft und können direkt als öffentliches Event erstellt werden.",
  },
  {
    title: "Regional sichtbar",
    description:
      "Das Event erscheint auf der Events-Seite mit Datum, Ort, Beschreibung, Website und Ticketlink.",
  },
];

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
              Region läuft.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
            Locario verbindet lokale Firmen, regionale Anbieter und Events an
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

      <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20 md:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Für Nutzer
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Lokal suchen, schneller finden.
            </h2>

            <p className="mt-5 text-slate-300">
              Locario soll dir helfen, regionale Anbieter und Veranstaltungen
              einfacher zu entdecken, ohne lange auf verschiedenen Seiten suchen
              zu müssen.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {userBenefits.map((benefit) => (
              <InfoCard
                key={benefit.title}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-8 shadow-2xl shadow-cyan-950/20">
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
              {businessBenefits.map((benefit) => (
                <BusinessCard
                  key={benefit.title}
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

          <section className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-8 shadow-2xl shadow-amber-950/20">
            <p className="text-sm font-black uppercase tracking-wide text-amber-200">
              Für Veranstalter
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Events regional bewerben.
            </h2>

            <p className="mt-5 text-slate-300">
              Veranstalter können Events einreichen. Im Admin können diese
              geprüft, angenommen und direkt als öffentliches Event erstellt
              werden.
            </p>

            <div className="mt-8 grid gap-4">
              {eventBenefits.map((benefit) => (
                <BusinessCard
                  key={benefit.title}
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
              Event bewerben
            </Link>
          </section>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-slate-950/20 md:p-12">
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

        <div
          className={`mt-7 inline-flex rounded-2xl px-5 py-3 text-sm font-black text-slate-950 transition ${
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

