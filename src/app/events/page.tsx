"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getEventPlanLabel,
  getEventPlanRank,
} from "@/data/event-plans";
import type { LocarioEvent } from "@/types/event";

const eventCategories = [
  "Konzert",
  "Party",
  "Markt",
  "Sport",
  "Verein",
  "Gewerbe",
  "Familie",
  "Kultur",
  "Gastronomie",
  "Kurs",
  "Gesundheit",
  "Senioren",
  "Jugend",
  "Kirche",
  "Dorf",
  "Sonstiges",
];

function getSafeString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function getSafeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => getSafeString(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmedValue);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => getSafeString(item).trim())
          .filter(Boolean);
      }
    } catch {
      return trimmedValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function eventHasImage(event: LocarioEvent) {
  return Boolean(event.imageUrl && event.imageUrl.trim());
}

function getEventPlanClassName(plan: string | undefined) {
  if (plan === "premium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (plan === "highlight") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-300";
}

function parseValidDate(dateValue: string | null | undefined) {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatEventDate(dateValue: string | null | undefined) {
  const date = parseValidDate(dateValue);

  if (!date) {
    return "Datum offen";
  }

  return date.toLocaleDateString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatEventTime(dateValue: string | null | undefined) {
  const date = parseValidDate(dateValue);

  if (!date) {
    return "";
  }

  return date.toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUpcomingEvent(event: LocarioEvent) {
  const startDate = parseValidDate(event.startsAt);

  if (!startDate) {
    return false;
  }

  return startDate.getTime() >= new Date().setHours(0, 0, 0, 0);
}

function isHighlightedEvent(event: LocarioEvent) {
  if (event.plan === "premium" || event.plan === "highlight") {
    return true;
  }

  const highlightUntil = parseValidDate(event.highlightUntil);

  if (!highlightUntil) {
    return false;
  }

  return highlightUntil.getTime() >= Date.now();
}

function valueAlreadyContainsCity(value: string, city: string) {
  const normalizedValue = normalizeText(value);
  const normalizedCity = normalizeText(city);

  if (!normalizedValue || !normalizedCity) {
    return false;
  }

  return normalizedValue.includes(normalizedCity);
}

function getEventLocationLine(event: LocarioEvent) {
  const locationName = event.locationName?.trim() || "";
  const address = event.address?.trim() || "";
  const city = event.city?.trim() || "";

  const parts = [locationName, address];

  if (
    city &&
    !valueAlreadyContainsCity(locationName, city) &&
    !valueAlreadyContainsCity(address, city)
  ) {
    parts.push(city);
  }

  return parts.filter(Boolean).join(", ") || "Ort offen";
}

function getExternalHref(value: string | null | undefined) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return "";
  }

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue;
  }

  return `https://${cleanValue}`;
}

function getEventSearchText(event: LocarioEvent) {
  return normalizeText(
    [
      event.title,
      event.organizerName,
      event.category,
      event.city,
      event.locationName,
      event.address,
      getEventLocationLine(event),
      event.description,
      event.plan,
      event.website,
      event.ticketUrl,
      ...getSafeStringArray(event.tags),
      ...getSafeStringArray(event.searchTerms),
    ].join(" ")
  );
}

function getCitySearchText(event: LocarioEvent) {
  return normalizeText(
    [
      event.city,
      event.locationName,
      event.address,
      getEventLocationLine(event),
    ].join(" ")
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<LocarioEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/events", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Events konnten nicht geladen werden.");
      }

      const data = (await response.json()) as LocarioEvent[];
      setEvents(data);
    } catch {
      setEvents([]);
      setErrorMessage("Events konnten noch nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("");
    setCityQuery("");
  }

  const activeEvents = useMemo(() => {
    return events.filter((event) => event.isActive && isUpcomingEvent(event));
  }, [events]);

  const filteredEvents = useMemo(() => {
    const normalizedSearchQuery = normalizeText(searchQuery);
    const normalizedCityQuery = normalizeText(cityQuery);

    return activeEvents
      .filter((event) => {
        const matchesSearch =
          !normalizedSearchQuery ||
          getEventSearchText(event).includes(normalizedSearchQuery);

        const matchesCategory =
          !selectedCategory || event.category === selectedCategory;

        const matchesCity =
          !normalizedCityQuery ||
          getCitySearchText(event).includes(normalizedCityQuery);

        return matchesSearch && matchesCategory && matchesCity;
      })
      .sort((a, b) => {
        const highlightDifference =
          Number(isHighlightedEvent(b)) - Number(isHighlightedEvent(a));

        if (highlightDifference !== 0) {
          return highlightDifference;
        }

        const planDifference =
          getEventPlanRank(b.plan) - getEventPlanRank(a.plan);

        if (planDifference !== 0) {
          return planDifference;
        }

        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });
  }, [activeEvents, searchQuery, selectedCategory, cityQuery]);

  const highlightedEvents = filteredEvents.filter((event) =>
    isHighlightedEvent(event)
  );

  const regularEvents = filteredEvents.filter(
    (event) => !isHighlightedEvent(event)
  );

  const hasActiveFilters = searchQuery || selectedCategory || cityQuery;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-14rem] top-[10rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[18rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/30">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/70" />
              Locario Events
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
              Events in deiner{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
                Region entdecken.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Finde Veranstaltungen, Märkte, Vereinsanlässe, Konzerte und lokale
              Highlights. Veranstalter können Events wochenweise bewerben.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/fuer-firmen"
                className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              >
                Event bewerben
              </Link>

              <button
                type="button"
                onClick={loadEvents}
                className="rounded-3xl border border-white/15 bg-white/[0.04] px-7 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10"
              >
                Events aktualisieren
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <HeroStat value={activeEvents.length.toString()} label="Events" />

              <HeroStat
                value={highlightedEvents.length.toString()}
                label="Highlights"
              />

              <HeroStat
                value={eventCategories.length.toString()}
                label="Kategorien"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-sm font-bold text-cyan-100">
                Wochenpakete für Veranstalter
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Events können als Basic, Highlight oder Premium für eine Woche
                beworben werden.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                Filter
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Passende Events finden
              </h2>

              <p className="mt-2 text-slate-400">
                Suche nach Event, Kategorie, Veranstalter, Adresse oder Ort.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <InputField
              label="Suche"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Konzert, Markt, Verein..."
            />

            <SelectField
              label="Kategorie"
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Alle Kategorien"
              options={eventCategories}
            />

            <InputField
              label="Ort / Adresse"
              value={cityQuery}
              onChange={setCityQuery}
              placeholder="Zum Beispiel: Belp"
            />
          </div>

          <div className="mt-7 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
            <span className="font-bold text-white">
              {filteredEvents.length}
            </span>{" "}
            Events werden angezeigt.
          </div>
        </section>

        {errorMessage && (
          <div className="mt-8 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 font-semibold text-amber-100">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-slate-300 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-300" />
              Events werden geladen...
            </div>
          </div>
        )}

        {!isLoading && highlightedEvents.length > 0 && (
          <section className="mt-12">
            <div className="mb-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/10" />

              <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-center shadow-lg shadow-cyan-950/20">
                <p className="text-sm font-black text-cyan-100">
                  Event-Highlights
                </p>

                <p className="text-xs text-slate-400">
                  Hervorgehobene Wochenpakete
                </p>
              </div>

              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/10" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {highlightedEvents.map((event) => (
                <EventCard key={event.id} event={event} highlighted />
              ))}
            </div>
          </section>
        )}

        {!isLoading && regularEvents.length > 0 && (
          <section className="mt-12">
            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                Alle Events
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Kommende Veranstaltungen
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {regularEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                Keine Events
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Noch keine passenden Events vorhanden
              </h2>

              <p className="mt-4 text-slate-300">
                Sobald passende Events im Admin erfasst werden, erscheinen sie
                hier. Setze die Filter zurück oder bewirb ein neues Event.
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-3xl bg-white px-6 py-4 font-black text-slate-950 transition hover:bg-slate-200"
                  >
                    Filter zurücksetzen
                  </button>
                )}

                <Link
                  href="/fuer-firmen"
                  className="rounded-3xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  Event bewerben
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-3xl font-black text-cyan-200">{value}</p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function EventCard({
  event,
  highlighted = false,
}: {
  event: LocarioEvent;
  highlighted?: boolean;
}) {
  const hasImage = eventHasImage(event);
  const ticketHref = getExternalHref(event.ticketUrl);
  const websiteHref = getExternalHref(event.website);
  const locationLine = getEventLocationLine(event);

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-[2rem] border shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 ${
        highlighted
          ? "border-cyan-300/30 bg-cyan-300/10"
          : "border-white/10 bg-white/[0.06] hover:border-cyan-300/30 hover:bg-white/[0.09]"
      }`}
    >
      <div className="relative h-44 overflow-hidden">
        {hasImage ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_16rem)]" />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

        <div className="absolute left-5 top-5 rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-2 text-sm font-black text-white backdrop-blur">
          {formatEventDate(event.startsAt)}
        </div>

        <div
          className={`absolute right-5 top-5 rounded-full border px-3 py-1 text-xs font-black backdrop-blur ${getEventPlanClassName(
            event.plan
          )}`}
        >
          {getEventPlanLabel(event.plan)}
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-3 py-1 text-sm font-bold text-cyan-100 backdrop-blur">
            {event.category || "Event"}
          </span>

          <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-sm font-bold text-slate-200 backdrop-blur">
            {event.city || "Ort offen"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm font-bold text-cyan-200">
          {formatEventTime(event.startsAt)}
          {event.endsAt ? ` – ${formatEventTime(event.endsAt)}` : ""}
        </p>

        <h2 className="mt-3 break-words text-2xl font-black tracking-tight">
          {event.title}
        </h2>

        <p className="mt-2 break-words text-sm font-semibold text-slate-400">
          {event.organizerName || "Veranstalter offen"}
        </p>

        <p className="mt-4 line-clamp-4 break-words text-slate-300">
          {event.description || "Noch keine Beschreibung vorhanden."}
        </p>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Ort
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-white">
            {locationLine}
          </p>
        </div>

        <div className="mt-auto grid gap-3 pt-6">
          <Link
            href={`/events/${event.id}`}
            className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
          >
            Details ansehen
          </Link>

          {(ticketHref || websiteHref) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {ticketHref && (
                <a
                  href={ticketHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
                >
                  Tickets
                </a>
              )}

              {websiteHref && (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      >
        <option value="" className="bg-slate-950 text-slate-400">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-slate-950 text-white"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}