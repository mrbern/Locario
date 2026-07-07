"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { companies as demoCompanies } from "@/data/companies";
import {
  getPlanBadgeClassName,
  getSmartSearchMeta,
  getUnifiedSearchResults,
  smartSearchExamples,
  type SearchType,
  type SortMode,
  type UnifiedSearchResult,
  type UserLocation,
} from "@/lib/smart-search";
import type { Company } from "@/types/company";
import type { LocarioEvent } from "@/types/event";

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDetectedText(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "";
  }

  return cleanValue
    .split(" ")
    .map((word) => {
      if (word.length <= 2) {
        return word.toUpperCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function uniqueDisplayValues(values: string[]) {
  const seenValues = new Set<string>();
  const uniqueValues: string[] = [];

  values.forEach((value) => {
    const cleanValue = value.trim();
    const normalizedValue = normalizeKey(cleanValue);

    if (!cleanValue || !normalizedValue || seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    uniqueValues.push(cleanValue);
  });

  return uniqueValues;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [initialUrlQuery, setInitialUrlQuery] = useState("");
  const [databaseCompanies, setDatabaseCompanies] = useState<Company[]>([]);
  const [events, setEvents] = useState<LocarioEvent[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [selectedType, setSelectedType] = useState<SearchType>("all");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");

  const [locationMessage, setLocationMessage] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchLogMessage, setSearchLogMessage] = useState("");

  const hasSavedInitialUrlQuery = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlQuery = searchParams.get("q") ?? "";

    if (urlQuery.trim()) {
      setQuery(urlQuery);
      setInitialUrlQuery(urlQuery);
    }

    const savedUserLocation = window.localStorage.getItem(
      "Locario-user-location"
    );

    if (savedUserLocation) {
      try {
        const parsedLocation = JSON.parse(savedUserLocation) as UserLocation;

        if (
          typeof parsedLocation.latitude === "number" &&
          typeof parsedLocation.longitude === "number"
        ) {
          setUserLocation(parsedLocation);
          setLocationMessage("Standortsortierung ist aktiv.");
        }
      } catch {
        window.localStorage.removeItem("Locario-user-location");
      }
    }

    loadSearchData();
  }, []);

  const allCompanies = useMemo(() => {
    return [...demoCompanies, ...databaseCompanies];
  }, [databaseCompanies]);

  const searchMeta = useMemo(() => {
    return getSmartSearchMeta({
      query,
      companies: allCompanies,
      events,
    });
  }, [query, allCompanies, events]);

  const allTypeResults = useMemo(() => {
    return getUnifiedSearchResults({
      query,
      companies: allCompanies,
      events,
      userLocation,
      selectedType: "all",
      sortMode,
    });
  }, [query, allCompanies, events, userLocation, sortMode]);

  const searchResults = useMemo(() => {
    return getUnifiedSearchResults({
      query,
      companies: allCompanies,
      events,
      userLocation,
      selectedType,
      sortMode,
    });
  }, [query, allCompanies, events, userLocation, selectedType, sortMode]);

  const companyResultCount = allTypeResults.filter(
    (result) => result.type === "company"
  ).length;

  const eventResultCount = allTypeResults.filter(
    (result) => result.type === "event"
  ).length;

  const directResults = searchResults.filter(
    (result) => result.locationRank === 0
  );

  const nearbyResults = searchResults.filter(
    (result) => result.locationRank === 1
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!initialUrlQuery.trim()) {
      return;
    }

    if (hasSavedInitialUrlQuery.current) {
      return;
    }

    hasSavedInitialUrlQuery.current = true;

    const matchingResults = getUnifiedSearchResults({
      query: initialUrlQuery,
      companies: allCompanies,
      events,
      userLocation,
      selectedType: "all",
      sortMode: "relevance",
    });

    saveSearchLog(initialUrlQuery, matchingResults.length);
  }, [isLoading, initialUrlQuery, allCompanies, events, userLocation]);

  async function loadSearchData() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [companiesResult, eventsResult] = await Promise.allSettled([
        fetch("/api/companies", {
          method: "GET",
        }).then(async (response) => {
          if (!response.ok) {
            throw new Error("Firmen konnten nicht geladen werden.");
          }

          return (await response.json()) as Company[];
        }),
        fetch("/api/events", {
          method: "GET",
        }).then(async (response) => {
          if (!response.ok) {
            throw new Error("Events konnten nicht geladen werden.");
          }

          return (await response.json()) as LocarioEvent[];
        }),
      ]);

      if (companiesResult.status === "fulfilled") {
        setDatabaseCompanies(companiesResult.value);
      }

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value);
      }

      if (
        companiesResult.status === "rejected" ||
        eventsResult.status === "rejected"
      ) {
        setErrorMessage(
          "Ein Teil der Suchdaten konnte nicht geladen werden. Die Suche funktioniert eingeschränkt weiter."
        );
      }
    } catch {
      setErrorMessage("Die Suchdaten konnten nicht vollständig geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSearchLog(searchQuery: string, resultCount: number) {
    const cleanedQuery = searchQuery.trim();

    if (!cleanedQuery) {
      return;
    }

    try {
      setIsSavingSearch(true);
      setSearchLogMessage("");

      const response = await fetch("/api/search-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: cleanedQuery,
          resultCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Suchanfrage konnte nicht gespeichert werden.");
      }

      setSearchLogMessage("Suchanfrage wurde für die Analyse gespeichert.");

      setTimeout(() => {
        setSearchLogMessage("");
      }, 2500);
    } catch {
      setSearchLogMessage(
        "Suchanfrage konnte nicht gespeichert werden. Die Suche funktioniert trotzdem."
      );

      setTimeout(() => {
        setSearchLogMessage("");
      }, 3500);
    } finally {
      setIsSavingSearch(false);
    }
  }

  async function runSearch(searchQuery: string) {
    const cleanedQuery = searchQuery.trim();

    setQuery(searchQuery);
    setSelectedType("all");

    if (!cleanedQuery) {
      window.history.replaceState(null, "", "/suche");
      return;
    }

    window.history.replaceState(
      null,
      "",
      `/suche?q=${encodeURIComponent(cleanedQuery)}`
    );

    const matchingResults = getUnifiedSearchResults({
      query: cleanedQuery,
      companies: allCompanies,
      events,
      userLocation,
      selectedType: "all",
      sortMode: "relevance",
    });

    await saveSearchLog(cleanedQuery, matchingResults.length);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch(query);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Dein Browser unterstützt die Standorterkennung nicht."
      );
      return;
    }

    setIsDetectingLocation(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(detectedLocation);
        window.localStorage.setItem(
          "Locario-user-location",
          JSON.stringify(detectedLocation)
        );
        setSortMode("distance");
        setLocationMessage(
          "Standort wurde erkannt. Ergebnisse können nach Nähe sortiert werden."
        );
        setIsDetectingLocation(false);
      },
      () => {
        setLocationMessage(
          "Standort konnte nicht erkannt werden oder wurde abgelehnt."
        );
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000 * 60 * 10,
      }
    );
  }

  function clearCurrentLocation() {
    setUserLocation(null);
    setSortMode("relevance");
    window.localStorage.removeItem("Locario-user-location");
    setLocationMessage("Standortsortierung wurde deaktiviert.");
  }

  const detectedLocation = searchMeta.locationFilter.hasLocationFilter
    ? formatDetectedText(searchMeta.locationFilter.targetLocation)
    : "kein Ort erkannt";

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
              Locario Smart Search
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
              Finde, was du{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
                wirklich meinst.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Suche frei nach Produkten, Dienstleistungen, Firmen oder Events.
              Locario erkennt Begriffe, Orte, Synonyme, Zeiträume und passende
              regionale Treffer.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <SearchStat
                value={searchResults.length.toString()}
                label="Treffer"
              />
              <SearchStat
                value={companyResultCount.toString()}
                label="Firmen"
              />
              <SearchStat value={eventResultCount.toString()} label="Events" />
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm font-bold text-cyan-100">
                Smart-Erkennung
              </p>

              <div className="mt-3 grid gap-2 text-sm text-slate-300">
                <p>
                  Absicht:{" "}
                  <span className="font-black text-white">
                    {searchMeta.intent.label}
                  </span>
                </p>

                <p>
                  Ort:{" "}
                  <span className="font-black text-white">
                    {detectedLocation}
                  </span>
                </p>

                <p>
                  Zeitraum:{" "}
                  <span className="font-black text-white">
                    {searchMeta.intent.timeLabel}
                  </span>
                </p>

                <p>
                  Begriffe:{" "}
                  <span className="font-black text-white">
                    {searchMeta.queryWords.length > 0
                      ? searchMeta.queryWords.slice(0, 6).join(", ")
                      : "noch keine"}
                  </span>
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isDetectingLocation}
                  className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDetectingLocation
                    ? "Standort wird erkannt..."
                    : userLocation
                      ? "Standort aktualisieren"
                      : "Standort verwenden"}
                </button>

                {userLocation && (
                  <button
                    type="button"
                    onClick={clearCurrentLocation}
                    className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    Deaktivieren
                  </button>
                )}
              </div>

              {locationMessage && (
                <p className="mt-3 text-sm text-cyan-100">
                  {locationMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 rounded-[2rem] border border-white/10 bg-white/10 p-2 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl md:flex"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-[1.5rem] bg-white px-5 py-5 text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-500"
            placeholder="Zum Beispiel: Ich brauche Kies in Wattenwil"
          />

          <button
            type="submit"
            disabled={isSavingSearch}
            className="mt-2 w-full rounded-[1.5rem] bg-gradient-to-r from-cyan-300 to-cyan-500 px-9 py-5 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:w-auto"
          >
            {isSavingSearch ? "Speichert..." : "Suchen"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          {smartSearchExamples.map((example, exampleIndex) => (
            <button
              key={`${normalizeKey(example)}-${exampleIndex}`}
              type="button"
              onClick={() => runSearch(example)}
              className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-3">
            <FilterButton
              active={selectedType === "all"}
              label="Alles"
              value={allTypeResults.length}
              onClick={() => setSelectedType("all")}
            />

            <FilterButton
              active={selectedType === "companies"}
              label="Firmen"
              value={companyResultCount}
              onClick={() => setSelectedType("companies")}
            />

            <FilterButton
              active={selectedType === "events"}
              label="Events"
              value={eventResultCount}
              onClick={() => setSelectedType("events")}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setSortMode("relevance")}
              className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                sortMode === "relevance"
                  ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                  : "border-white/10 bg-white/[0.06] text-slate-300 hover:border-cyan-300/30 hover:bg-white/[0.08]"
              }`}
            >
              Beste Treffer
            </button>

            <button
              type="button"
              onClick={() => setSortMode("distance")}
              disabled={!userLocation}
              className={`rounded-2xl border px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                sortMode === "distance"
                  ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
                  : "border-white/10 bg-white/[0.06] text-slate-300 hover:border-emerald-300/30 hover:bg-white/[0.08]"
              }`}
            >
              Nach Nähe
            </button>
          </div>
        </div>

        {searchLogMessage && (
          <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm font-semibold text-cyan-100 shadow-xl shadow-cyan-950/20">
            {searchLogMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 font-semibold text-amber-100">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-slate-300 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-300" />
              Suchdaten werden geladen...
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="mt-12 flex flex-col justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-slate-950/20 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                  Suchergebnisse
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  {searchResults.length} Ergebnis
                  {searchResults.length === 1 ? "" : "se"} gefunden
                </h2>

                <p className="mt-2 text-slate-400">
                  Sortiert nach Bedeutung, Ort, Kategorie, Zeitraum, Paketlogik
                  und optional Distanz.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ResultBadge label="Direkt" value={directResults.length} />
                <ResultBadge label="Umgebung" value={nearbyResults.length} />
              </div>
            </div>

            <UnifiedResultGrid results={directResults} />

            {nearbyResults.length > 0 && (
              <section className="mt-14">
                <div className="mb-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/10" />

                  <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-center shadow-lg shadow-cyan-950/20">
                    <p className="text-sm font-black text-cyan-100">
                      In der Umgebung
                    </p>
                    <p className="text-xs text-slate-400">
                      Passende Treffer aus Nachbarorten
                    </p>
                  </div>

                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/10" />
                </div>

                <UnifiedResultGrid results={nearbyResults} />
              </section>
            )}

            {searchResults.length === 0 && <NoResultsBox query={query} />}
          </>
        )}
      </section>
    </main>
  );
}

function SearchStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-3xl font-black text-cyan-200">{value}</p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ResultBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  label,
  value,
  onClick,
}: {
  active: boolean;
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/[0.06] text-slate-300 hover:border-cyan-300/30 hover:bg-white/[0.08]"
      }`}
    >
      <span className="block text-sm font-black">{label}</span>
      <span className="mt-1 block text-2xl font-black">{value}</span>
    </button>
  );
}

function UnifiedResultGrid({ results }: { results: UnifiedSearchResult[] }) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-7 grid gap-6 md:grid-cols-2">
      {results.map((result, resultIndex) => {
        const hasImage = Boolean(result.imageUrl && result.imageUrl.trim());
        const secondaryBadges = uniqueDisplayValues(result.secondaryBadges);
        const resultTags = uniqueDisplayValues(result.tags);
        const reasons = uniqueDisplayValues(result.score.reasons);

        return (
          <Link
            key={`${result.id}-${resultIndex}`}
            href={result.href}
            className="group flex min-w-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.09]"
          >
            <div className="relative h-44 overflow-hidden">
              {hasImage ? (
                <img
                  src={result.imageUrl}
                  alt={result.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <>
                  <div
                    className={`absolute inset-0 ${
                      result.type === "event"
                        ? "bg-gradient-to-br from-amber-400/25 via-cyan-500/15 to-slate-950"
                        : "bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-slate-950"
                    }`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_16rem)]" />
                </>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-bold backdrop-blur ${
                    result.type === "event"
                      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                      : "border-cyan-300/20 bg-slate-950/60 text-cyan-100"
                  }`}
                >
                  {result.meta}
                </span>

                <span className="max-w-full rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-sm font-bold text-slate-200 backdrop-blur">
                  <span className="line-clamp-1">{result.city || "Region"}</span>
                </span>

                {result.distanceKm !== null && (
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm font-bold text-emerald-100 backdrop-blur">
                    ca. {result.distanceKm} km
                  </span>
                )}
              </div>

              <div
                className={`absolute right-5 top-5 rounded-full border px-3 py-1 text-xs font-black backdrop-blur ${getPlanBadgeClassName(
                  result.planKey
                )}`}
              >
                {result.primaryBadge}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="flex flex-wrap gap-2">
                {secondaryBadges.slice(0, 4).map((badge, badgeIndex) => (
                  <span
                    key={`${normalizeKey(badge)}-${badgeIndex}`}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100"
                  >
                    {badge}
                  </span>
                ))}

                {result.isHighlighted && (
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-100">
                    Hervorgehoben
                  </span>
                )}
              </div>

              <p className="mt-5 break-words text-sm font-black uppercase tracking-wide text-slate-500">
                {result.subtitle}
              </p>

              <h2 className="mt-2 break-words text-2xl font-black tracking-tight">
                {result.title}
              </h2>

              <p className="mt-3 break-words text-sm font-semibold text-slate-400">
                📍 {result.city || "Region"}
              </p>

              <p className="mt-4 line-clamp-3 break-words text-slate-300">
                {result.description || "Weitere Informationen folgen."}
              </p>

              {result.ad && (
                <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                    Anzeige
                  </p>

                  <h3 className="mt-2 break-words font-black text-white">
                    {result.ad.title}
                  </h3>

                  <p className="mt-1 break-words text-sm text-slate-300">
                    {result.ad.description}
                  </p>

                  <div className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-2 text-sm font-black text-slate-950">
                    {result.ad.cta}
                  </div>
                </div>
              )}

              {reasons.length > 0 && (
                <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Warum dieser Treffer?
                  </p>

                  <ul className="mt-2 space-y-1 text-sm text-slate-300">
                    {reasons.slice(0, 3).map((reason, reasonIndex) => (
                      <li key={`${normalizeKey(reason)}-${reasonIndex}`}>
                        • {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resultTags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {resultTags.slice(0, 4).map((tag, tagIndex) => (
                    <span
                      key={`${normalizeKey(tag)}-${tagIndex}`}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-6">
                <div className="inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition group-hover:bg-cyan-300">
                  {result.cta}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function NoResultsBox({ query }: { query: string }) {
  const cleanedQuery = query.trim();

  return (
    <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
          Keine Treffer
        </p>

        <h2 className="mt-3 text-3xl font-black">
          Noch kein passender Treffer gefunden
        </h2>

        <p className="mt-4 leading-7 text-slate-300">
          Diese Suche ist trotzdem wertvoll: Wenn mehrere Nutzer nach ähnlichen
          Angeboten suchen, erkennt Locario daraus konkrete Nachfrage für neue
          Firmen, Events oder Kategorien.
        </p>

        {cleanedQuery && (
          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
            <p className="font-bold text-cyan-100">Gesuchte Nachfrage</p>

            <p className="mt-2 break-words text-sm text-slate-300">
              {cleanedQuery}
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link
            href="/firmen"
            className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
          >
            Alle Firmen ansehen
          </Link>

          <Link
            href="/events"
            className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
          >
            Alle Events ansehen
          </Link>

          <Link
            href="/fuer-firmen"
            className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
          >
            Firma/Event eintragen
          </Link>
        </div>
      </div>
    </div>
  );
}