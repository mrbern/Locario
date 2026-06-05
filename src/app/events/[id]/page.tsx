"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getEventPlanLabel,
  getEventPlanPrice,
} from "@/data/event-plans";
import type { NearioEvent } from "@/types/event";

function eventHasImage(event: NearioEvent) {
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

function formatEventDate(dateValue: string) {
  if (!dateValue) {
    return "Datum offen";
  }

  return new Date(dateValue).toLocaleDateString("de-CH", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatEventTime(dateValue: string) {
  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDateTime(dateValue: string) {
  if (!dateValue) {
    return "Nicht angegeben";
  }

  return new Date(dateValue).toLocaleString("de-CH", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [event, setEvent] = useState<NearioEvent | null>(null);
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

      const data = (await response.json()) as NearioEvent;
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
          <div className="relative isolate min-h-[26rem] overflow-hidden">
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

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />
            <div className="absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-slate-950 to-transparent" />

            <div className="relative z-20 flex min-h-[26rem] flex-col justify-end p-6 sm:p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-4 py-2 text-sm font-black text-cyan-100 backdrop-blur">
                  {event.category}
                </span>

                <span className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-black text-slate-200 backdrop-blur">
                  {event.city}
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

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                {event.description}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
                  >
                    Tickets öffnen
                  </a>
                )}

                {event.website && (
                  <a
                    href={event.website}
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Eventbeschreibung
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Darum geht es
              </h2>

              <p className="mt-5 whitespace-pre-line break-words text-slate-300">
                {event.description}
              </p>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Veranstalter
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                {event.organizerName}
              </h2>

              <p className="mt-4 text-slate-300">
                Dieses Event wird von {event.organizerName} veranstaltet und auf
                Neario regional sichtbar gemacht.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                  {event.category}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-300">
                  {event.city}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-300">
                  {getEventPlanPrice(event.plan)}
                </span>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 lg:sticky lg:top-28">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Eventdaten
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Wann und wo?
              </h2>

              <div className="mt-6 grid gap-4">
                <InfoBox title="Start" value={formatFullDateTime(event.startsAt)} />

                <InfoBox
                  title="Ende"
                  value={
                    event.endsAt ? formatFullDateTime(event.endsAt) : "Nicht angegeben"
                  }
                />

                <InfoBox
                  title="Uhrzeit"
                  value={
                    event.endsAt
                      ? `${formatEventTime(event.startsAt)} – ${formatEventTime(
                          event.endsAt
                        )}`
                      : formatEventTime(event.startsAt) || "Nicht angegeben"
                  }
                />

                <InfoBox title="Stadt" value={event.city} />

                <InfoBox
                  title="Location"
                  value={event.locationName || "Nicht angegeben"}
                />

                <InfoBox
                  title="Adresse"
                  value={event.address || "Nicht angegeben"}
                />
              </div>

              <div className="mt-6 grid gap-3">
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                  >
                    Tickets öffnen
                  </a>
                )}

                {event.website && (
                  <a
                    href={event.website}
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
                <p className="font-black text-cyan-100">Neario Hinweis</p>

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