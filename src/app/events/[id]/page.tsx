"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getEventPlanLabel, getEventPlanPrice } from "@/data/event-plans";
import type { LocarioEvent } from "@/types/event";

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

function normalizeTerm(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uniqueTerms(values: string[]) {
  const seenTerms = new Set<string>();
  const terms: string[] = [];

  values.forEach((value) => {
    const cleanedValue = value.trim();
    const normalizedValue = normalizeTerm(cleanedValue);

    if (!cleanedValue || seenTerms.has(normalizedValue)) {
      return;
    }

    seenTerms.add(normalizedValue);
    terms.push(cleanedValue);
  });

  return terms;
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
    weekday: "long",
    day: "2-digit",
    month: "long",
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

function formatFullDateTime(dateValue: string | null | undefined) {
  const date = parseValidDate(dateValue);

  if (!date) {
    return "Nicht angegeben";
  }

  return date.toLocaleString("de-CH", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeRange(event: LocarioEvent) {
  const startTime = formatEventTime(event.startsAt);
  const endTime = formatEventTime(event.endsAt);

  if (startTime && endTime) {
    return `${startTime} – ${endTime}`;
  }

  return startTime || "Nicht angegeben";
}

function valueAlreadyContainsCity(value: string, city: string) {
  const normalizedValue = normalizeTerm(value);
  const normalizedCity = normalizeTerm(city);

  if (!normalizedValue || !normalizedCity) {
    return false;
  }

  return normalizedValue.includes(normalizedCity);
}

function getLocationLine(event: LocarioEvent) {
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

  return parts.filter(Boolean).join(", ");
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

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [event, setEvent] = useState<LocarioEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadEvent();
  }, [id]);

  async function loadEvent() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch(`/api/events/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Event konnte nicht geladen werden."
        );
      }

      const data = (await response.json()) as LocarioEvent;
      setEvent(data);
    } catch (error) {
      setEvent(null);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Laden des Events ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
        <BackgroundGlow />

        <section className="relative mx-auto w-full max-w-5xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-300" />
              Event wird geladen...
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
        <BackgroundGlow />

        <section className="relative mx-auto w-full max-w-4xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
            <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
              Nicht gefunden
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Event nicht gefunden
            </h1>

            {errorMessage && (
              <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 font-semibold text-red-200">
                {errorMessage}
              </div>
            )}

            <p className="mt-4 text-slate-300">
              Dieses Event existiert entweder nicht oder konnte nicht geladen
              werden.
            </p>

            <Link
              href="/events"
              className="mt-8 inline-flex rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
            >
              Zurück zu Events
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const hasImage = eventHasImage(event);
  const ticketHref = getExternalHref(event.ticketUrl);
  const websiteHref = getExternalHref(event.website);
  const locationLine = getLocationLine(event);
  const tags = uniqueTerms(getSafeStringArray(event.tags));

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
      <BackgroundGlow />

      <section className="relative mx-auto w-full max-w-7xl">
        <Link
          href="/events"
          className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
        >
          ← Zurück zu Events
        </Link>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:rounded-[2.5rem]">
          <div className="relative isolate min-h-[28rem] overflow-hidden">
            {hasImage ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="absolute inset-0 z-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-slate-950" />
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.28),transparent_20rem)]" />
              </>
            )}

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/10" />
            <div className="absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-slate-950 to-transparent" />

            <div className="relative z-20 flex min-h-[28rem] min-w-0 flex-col justify-end p-6 sm:p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-4 py-2 text-sm font-black text-cyan-100 backdrop-blur">
                  {event.category || "Event"}
                </span>

                <span className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-black text-slate-200 backdrop-blur">
                  {event.city || "Ort offen"}
                </span>

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-black backdrop-blur ${getEventPlanClassName(
                    event.plan
                  )}`}
                >
                  {getEventPlanLabel(event.plan)}
                </span>

                {!event.isActive && (
                  <span className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm font-black text-red-200 backdrop-blur">
                    Inaktiv
                  </span>
                )}
              </div>

              <p className="mt-6 text-lg font-black text-cyan-200">
                {formatEventDate(event.startsAt)}
              </p>

              <h1 className="mt-3 max-w-5xl break-words text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
                {event.title}
              </h1>

              <p className="mt-5 max-w-3xl break-words text-base leading-7 text-slate-300 md:text-lg md:leading-8">
                {event.description || "Noch keine Beschreibung vorhanden."}
              </p>

              <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-slate-300 sm:flex-row sm:flex-wrap">
                <span className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  🗓 {formatFullDateTime(event.startsAt)}
                </span>

                {locationLine && (
                  <span className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                    📍 {locationLine}
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {ticketHref && (
                  <a
                    href={ticketHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
                  >
                    Tickets öffnen
                  </a>
                )}

                {websiteHref && (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl border border-white/15 bg-white/[0.04] px-7 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    Website öffnen
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <div className="min-w-0 space-y-8">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Eventbeschreibung
              </p>

              <h2 className="mt-3 break-words text-3xl font-black tracking-tight">
                Darum geht es
              </h2>

              <p className="mt-5 whitespace-pre-line break-words leading-7 text-slate-300">
                {event.description || "Noch keine Beschreibung vorhanden."}
              </p>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Veranstalter
              </p>

              <h2 className="mt-3 break-words text-3xl font-black tracking-tight">
                {event.organizerName || "Nicht angegeben"}
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Dieses Event wird von{" "}
                <span className="font-bold text-white">
                  {event.organizerName || "dem Veranstalter"}
                </span>{" "}
                veranstaltet und auf Locario regional sichtbar gemacht.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                  {event.category || "Event"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-300">
                  {event.city || "Ort offen"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-300">
                  {getEventPlanPrice(event.plan)}
                </span>
              </div>

              {tags.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-black uppercase tracking-wide text-slate-500">
                    Zusatzlabels
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={`${normalizeTerm(tag)}-${index}`}
                        className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="min-w-0 space-y-8">
            <section className="w-full max-w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 lg:sticky lg:top-28">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Eventdaten
              </p>

              <h2 className="mt-3 break-words text-3xl font-black tracking-tight">
                Wann und wo?
              </h2>

              <div className="mt-6 grid min-w-0 gap-4">
                <InfoBox
                  title="Start"
                  value={formatFullDateTime(event.startsAt)}
                />

                <InfoBox
                  title="Ende"
                  value={
                    event.endsAt
                      ? formatFullDateTime(event.endsAt)
                      : "Nicht angegeben"
                  }
                />

                <InfoBox title="Uhrzeit" value={getTimeRange(event)} />

                <InfoBox title="Stadt" value={event.city || "Nicht angegeben"} />

                <InfoBox
                  title="Location"
                  value={event.locationName || "Nicht angegeben"}
                />

                <InfoBox
                  title="Adresse"
                  value={event.address || "Nicht angegeben"}
                />

                <InfoBox
                  title="Kategorie"
                  value={event.category || "Nicht angegeben"}
                />
              </div>

              <div className="mt-6 grid gap-3">
                {ticketHref && (
                  <a
                    href={ticketHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                  >
                    Tickets öffnen
                  </a>
                )}

                {websiteHref && (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl bg-white px-6 py-4 text-center font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
                  >
                    Website öffnen
                  </a>
                )}

                <Link
                  href="/events"
                  className="rounded-3xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  Weitere Events ansehen
                </Link>
              </div>

              <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="font-black text-cyan-100">Locario Hinweis</p>

                <p className="mt-2 text-sm text-slate-300">
                  Prüfe vor dem Besuch die Angaben des Veranstalters, falls sich
                  Zeiten, Ort oder Ticketinformationen kurzfristig ändern.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-12rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-[-14rem] top-[10rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-[18rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
    </div>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 min-w-0 break-words font-bold text-white">{value}</p>
    </div>
  );
}