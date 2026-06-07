"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { companies as demoCompanies } from "@/data/companies";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const exampleSearches = [
    "Werkstatt Wattenwil",
    "Bäckerei Wattenwil",
    "Ich brauche Kies",
    "Coiffeur Zürich",
    "Nissan kaufen",
    "Elektriker Luzern",
  ];

  const featuredCompanies = demoCompanies.slice(0, 3);

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
        <div className="absolute left-[-10rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-12rem] top-[8rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[20rem] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-950/30">
              <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/70" />
              <span className="truncate">
                Lokale KI-Suche für regionale Firmen
              </span>
            </div>

            <h1 className="mt-6 max-w-5xl text-4xl font-black tracking-tight sm:text-5xl md:mt-7 md:text-7xl">
              Finde lokale Firmen{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
                genau dann,
              </span>{" "}
              wenn du sie brauchst.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:mt-7 md:text-lg md:leading-8">
              Suche einfach nach dem, was du brauchst. Locario zeigt passende
              Anbieter aus deiner Region und Umgebung.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/10 p-2 shadow-2xl shadow-cyan-950/40 backdrop-blur md:mt-10 md:flex md:rounded-[1.75rem]"
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-2xl bg-white px-4 py-4 text-base font-semibold text-slate-950 outline-none placeholder:text-slate-500 md:rounded-3xl md:px-5 md:text-lg"
                placeholder="Was suchst du?"
              />

              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-8 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 md:mt-0 md:w-auto md:rounded-3xl"
              >
                Suchen
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2 md:mt-6 md:gap-3">
              {exampleSearches.map((search, index) => (
                <button
                  key={search}
                  type="button"
                  onClick={() => goToSearch(search)}
                  className={`rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 md:px-4 md:text-sm ${
                    index > 3 ? "hidden sm:inline-flex" : ""
                  }`}
                >
                  {search}
                </button>
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:flex md:mt-10 md:gap-4">
              <Link
                href="/fuer-firmen"
                className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 md:rounded-3xl md:px-7"
              >
                Firma eintragen
              </Link>

              <Link
                href="/firmen"
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10 md:rounded-3xl md:px-7"
              >
                Firmen entdecken
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3 md:mt-10">
              <MiniStat value="Lokal" label="Ort & Umgebung" />
              <MiniStat value="KI" label="natürliche Suche" />
              <MiniStat value="Leads" label="direkte Anfragen" />
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-cyan-300/20 via-blue-500/10 to-transparent blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="text-sm font-bold text-cyan-100">
                  Beispielsuche
                </p>

                <div className="mt-4 rounded-2xl bg-white p-4 text-slate-950 shadow-xl">
                  <p className="text-sm font-semibold text-slate-500">
                    Nutzer sucht
                  </p>
                  <p className="mt-1 text-xl font-black">
                    Werkstatt in Wattenwil
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <SearchPreviewCard
                  eyebrow="Direkt im Ort"
                  company="Auto Meier AG"
                  city="Wattenwil"
                  description="Werkstatt, Garage, Reparaturen und Fahrzeugservice."
                  highlight
                />

                <div className="flex items-center gap-3 py-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <p className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-300">
                    In der Umgebung
                  </p>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <SearchPreviewCard
                  eyebrow="Nachbardorf"
                  company="Garage Beispiel GmbH"
                  city="Seftigen"
                  description="Autoservice und Reparaturen in der Region."
                />

                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm font-bold text-slate-300">
                    Was Locario besser macht
                  </p>

                  <div className="mt-4 grid gap-3">
                    <CheckItem text="Fachbegriff muss wirklich passen" />
                    <CheckItem text="Ort und Nachbardörfer werden berücksichtigt" />
                    <CheckItem text="Firmen erscheinen modern und klickstark" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 grid gap-4 md:mt-24 md:grid-cols-3 md:gap-6">
          <ValueCard
            value="01"
            title="Natürlich suchen"
            description="Nutzer schreiben einfach, was sie brauchen. Keine komplizierten Kategorien."
          />

          <ValueCard
            value="02"
            title="Regional passende Treffer"
            description="Locario berücksichtigt Ort, Umgebung, Suchbegriffe und Leistungen."
          />

          <ValueCard
            value="03"
            title="Neue Kundenanfragen"
            description="Firmen erhalten sichtbare Profile und direkte Kontaktmöglichkeiten."
          />
        </section>

        <section className="mt-10 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6 text-center shadow-2xl shadow-cyan-950/20 md:hidden">
          <h2 className="text-2xl font-black tracking-tight">
            Locario verbindet lokale Suche mit regionalen Firmen.
          </h2>

          <p className="mt-3 text-sm text-slate-300">
            Suche jetzt nach passenden Firmen oder trage dein Unternehmen ein.
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              href="/suche"
              className="rounded-2xl bg-white px-5 py-4 text-center font-black text-slate-950"
            >
              Suche starten
            </Link>

            <Link
              href="/fuer-firmen"
              className="rounded-2xl border border-white/15 px-5 py-4 text-center font-bold text-white"
            >
              Firma eintragen
            </Link>
          </div>
        </section>

        <section className="mt-24 hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/30 backdrop-blur md:block md:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                Für regionale Firmen
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Deine Firma erscheint dort, wo Kunden wirklich suchen.
              </h2>

              <p className="mt-5 text-slate-300">
                Locario ist kein klassisches Branchenbuch. Firmen werden passend
                zu konkreten Suchanfragen angezeigt, mit Profil, Beschreibung,
                Suchbegriffen, Kontaktinformationen und je nach Paket mit
                Werbeangebot.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/fuer-firmen"
                  className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                >
                  Als Firma mitmachen
                </Link>

                <Link
                  href="/firmen"
                  className="rounded-3xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  Firmen ansehen
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <FeatureItem
                title="Mehr lokale Sichtbarkeit"
                description="Deine Firma wird sichtbar, wenn Menschen in deiner Region aktiv nach deinem Angebot suchen."
              />

              <FeatureItem
                title="Moderne Darstellung statt alter Verzeichnisse"
                description="Profil, Kategorien, Suchbegriffe, Angebote und direkte Kontaktmöglichkeiten werden hochwertig dargestellt."
              />

              <FeatureItem
                title="Wertvolle Nachfrage-Daten"
                description="Suchanfragen ohne Treffer zeigen, welche Branchen, Produkte oder Dienstleistungen in einer Region fehlen."
              />
            </div>
          </div>
        </section>

        <section className="mt-24 hidden md:block">
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                Regionale Anbieter
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Beispiel-Firmen auf Locario
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                So können lokale Anbieter mit Profil, Suchbegriffen,
                Kontaktinformationen und Werbung sichtbar werden.
              </p>
            </div>

            <Link
              href="/firmen"
              className="rounded-3xl bg-white px-5 py-3 text-center font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              Alle Firmen ansehen
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredCompanies.map((company, index) => (
              <Link
                key={company.id}
                href={`/firmen/${company.id}`}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.09]"
              >
                <div className="relative h-44 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-slate-950" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_18rem)]" />
                  <div className="absolute bottom-5 left-5 rounded-2xl border border-white/15 bg-slate-950/50 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                    Anbieter #{index + 1}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    <p className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                      {company.category}
                    </p>

                    <p className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-semibold text-slate-300">
                      {company.city}
                    </p>
                  </div>

                  <h3 className="mt-4 text-2xl font-black">{company.name}</h3>

                  <p className="mt-4 text-slate-300">{company.description}</p>

                  {company.ad && (
                    <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-cyan-200">
                        Werbung
                      </p>

                      <h4 className="mt-2 font-black text-white">
                        {company.ad.title}
                      </h4>

                      <p className="mt-1 text-sm text-slate-300">
                        {company.ad.description}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 inline-flex rounded-2xl bg-white px-4 py-3 font-black text-slate-950 transition group-hover:bg-cyan-300">
                    Firma ansehen
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-24 hidden overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-8 text-center shadow-2xl shadow-cyan-950/20 md:block md:p-12">
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-200">
            Locario für den regionalen Markt
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
            Lokale Suche, moderne Werbung und echte Kundenanfragen an einem Ort.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Starte mit deiner Region, erfasse passende Firmen und baue Schritt
            für Schritt eine starke lokale Werbeplattform auf.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/fuer-firmen"
              className="rounded-3xl bg-white px-7 py-4 text-center font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              Firma eintragen
            </Link>

            <Link
              href="/firmen"
              className="rounded-3xl border border-white/15 px-7 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Firmen entdecken
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 md:rounded-3xl md:p-5">
      <p className="text-xl font-black text-cyan-200 md:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-slate-400 md:text-sm">{label}</p>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
}

function SearchPreviewCard({
  eyebrow,
  company,
  city,
  description,
  highlight = false,
}: {
  eyebrow: string;
  company: string;
  city: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 ${
        highlight
          ? "border-cyan-300/30 bg-cyan-300/10"
          : "border-white/10 bg-slate-950/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {eyebrow}
        </p>

        <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
          {city}
        </p>
      </div>

      <h3 className="mt-3 text-xl font-black">{company}</h3>

      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}

function ValueCard({
  value,
  title,
  description,
}: {
  value: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.09] md:rounded-[2rem] md:p-6">
      <p className="text-3xl font-black text-cyan-200 md:text-5xl">{value}</p>

      <h3 className="mt-3 text-xl font-black md:mt-5 md:text-2xl">{title}</h3>

      <p className="mt-2 text-sm text-slate-300 md:mt-3 md:text-base">
        {description}
      </p>
    </article>
  );
}

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 transition hover:border-cyan-300/30 hover:bg-slate-900/80">
      <h3 className="text-xl font-black">{title}</h3>

      <p className="mt-3 text-slate-300">{description}</p>
    </article>
  );
}
