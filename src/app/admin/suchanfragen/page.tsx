"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SearchLog = {
  id: string;
  query: string;
  normalizedQuery: string;
  resultCount: number;
  createdAt: string;
};

type SearchLogStat = {
  normalizedQuery: string;
  latestQuery: string;
  searchCount: number;
  zeroResultCount: number;
  totalResultCount: number;
  latestResultCount: number;
  averageResultCount: number;
  latestAt: string;
};

type SearchLogStatsResponse = {
  totalSearches: number;
  uniqueSearches: number;
  zeroResultSearches: number;
  topSearches: SearchLogStat[];
  acquisitionOpportunities: SearchLogStat[];
};

type AnalysisView = "opportunities" | "top" | "zero_logs" | "all_logs";

const emptySearchStats: SearchLogStatsResponse = {
  totalSearches: 0,
  uniqueSearches: 0,
  zeroResultSearches: 0,
  topSearches: [],
  acquisitionOpportunities: [],
};

const itemsPerPage = 25;

const analysisViews: {
  value: AnalysisView;
  label: string;
  description: string;
}[] = [
  {
    value: "opportunities",
    label: "Akquise",
    description: "Fehlende Anbieter",
  },
  {
    value: "top",
    label: "Top-Suchen",
    description: "Häufige Nachfrage",
  },
  {
    value: "zero_logs",
    label: "0-Treffer",
    description: "Einzelne Logs",
  },
  {
    value: "all_logs",
    label: "Suchlog",
    description: "Alle Suchen",
  },
];

function getSearchLogSearchText(searchLog: SearchLog) {
  return [
    searchLog.query,
    searchLog.normalizedQuery,
    searchLog.resultCount.toString(),
    searchLog.createdAt,
  ]
    .join(" ")
    .toLowerCase();
}

function getSearchStatSearchText(item: SearchLogStat) {
  return [
    item.latestQuery,
    item.normalizedQuery,
    item.searchCount.toString(),
    item.zeroResultCount.toString(),
    item.latestResultCount.toString(),
  ]
    .join(" ")
    .toLowerCase();
}

function getOpportunityLevel(item: SearchLogStat) {
  if (item.zeroResultCount >= 5 || item.latestResultCount === 0) {
    return "high";
  }

  if (item.averageResultCount <= 2) {
    return "medium";
  }

  return "low";
}

function getOpportunityLabel(item: SearchLogStat) {
  const level = getOpportunityLevel(item);

  if (level === "high") {
    return "Hohe Chance";
  }

  if (level === "medium") {
    return "Prüfen";
  }

  return "Beobachten";
}

function getOpportunityClassName(item: SearchLogStat) {
  const level = getOpportunityLevel(item);

  if (level === "high") {
    return "border-red-300/25 bg-red-300/10 text-red-100";
  }

  if (level === "medium") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

export default function AdminSearchLogsPage() {
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [searchStats, setSearchStats] =
    useState<SearchLogStatsResponse>(emptySearchStats);

  const [selectedView, setSelectedView] =
    useState<AnalysisView>("opportunities");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadSearchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedView]);

  const zeroResultLogs = useMemo(() => {
    return searchLogs.filter((searchLog) => searchLog.resultCount === 0);
  }, [searchLogs]);

  const successfulSearchLogs = useMemo(() => {
    return searchLogs.filter((searchLog) => searchLog.resultCount > 0);
  }, [searchLogs]);

  const averageResults = useMemo(() => {
    if (searchLogs.length === 0) {
      return 0;
    }

    const totalResults = searchLogs.reduce((sum, searchLog) => {
      return sum + searchLog.resultCount;
    }, 0);

    return Math.round((totalResults / searchLogs.length) * 10) / 10;
  }, [searchLogs]);

  const statItems = useMemo(() => {
    if (selectedView === "opportunities") {
      return searchStats.acquisitionOpportunities;
    }

    if (selectedView === "top") {
      return searchStats.topSearches;
    }

    return [];
  }, [searchStats.acquisitionOpportunities, searchStats.topSearches, selectedView]);

  const filteredStatItems = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return statItems.filter((item) => {
      return (
        !normalizedSearchQuery ||
        getSearchStatSearchText(item).includes(normalizedSearchQuery)
      );
    });
  }, [statItems, searchQuery]);

  const filteredSearchLogs = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return searchLogs
      .filter((searchLog) => {
        const matchesSearch =
          !normalizedSearchQuery ||
          getSearchLogSearchText(searchLog).includes(normalizedSearchQuery);

        const matchesView =
          selectedView === "all_logs" ||
          (selectedView === "zero_logs" && searchLog.resultCount === 0);

        return matchesSearch && matchesView;
      })
      .sort((firstLog, secondLog) => {
        return (
          new Date(secondLog.createdAt).getTime() -
          new Date(firstLog.createdAt).getTime()
        );
      });
  }, [searchLogs, searchQuery, selectedView]);

  const activeItems =
    selectedView === "opportunities" || selectedView === "top"
      ? filteredStatItems
      : filteredSearchLogs;

  const pageCount = Math.max(1, Math.ceil(activeItems.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, pageCount);

  const paginatedStatItems = filteredStatItems.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const paginatedSearchLogs = filteredSearchLogs.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const hasActiveFilters = searchQuery || selectedView !== "opportunities";

  async function loadSearchData() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [logsResponse, statsResponse] = await Promise.all([
        fetch("/api/search-logs", {
          method: "GET",
        }),
        fetch("/api/search-logs/stats", {
          method: "GET",
        }),
      ]);

      if (!logsResponse.ok) {
        throw new Error("Suchanfragen konnten nicht geladen werden.");
      }

      if (!statsResponse.ok) {
        throw new Error("Suchstatistiken konnten nicht geladen werden.");
      }

      const logsData = (await logsResponse.json()) as SearchLog[];
      const statsData =
        (await statsResponse.json()) as SearchLogStatsResponse;

      setSearchLogs(logsData);
      setSearchStats(statsData);
    } catch {
      setErrorMessage(
        "Die Suchdaten konnten nicht aus der Datenbank geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedView("opportunities");
    setCurrentPage(1);
  }

  function formatDate(dateValue: string) {
    return new Date(dateValue).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Suchanalyse
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Akquise{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Cockpit
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Suchdaten zeigen dir, was Nutzer wirklich brauchen. Besonders
            wertvoll sind Suchbegriffe ohne Treffer: Dort fehlen passende
            Anbieter auf Locario.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSearchData}
          disabled={isLoading}
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Lädt..." : "Aktualisieren"}
        </button>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <CompactMetric
          label="Suchanfragen"
          value={searchStats.totalSearches}
        />
        <CompactMetric
          label="Eindeutig"
          value={searchStats.uniqueSearches}
        />
        <CompactMetric
          label="0-Treffer"
          value={searchStats.zeroResultSearches}
          variant="red"
        />
        <CompactMetric
          label="Mit Treffern"
          value={successfulSearchLogs.length}
          variant="emerald"
        />
        <CompactMetric
          label="Ø Treffer"
          value={averageResults}
          variant="amber"
        />
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Auswertung
            </p>

            <h2 className="mt-2 text-3xl font-black">Nachfrage erkennen</h2>

            <p className="mt-2 text-sm text-slate-400">
              Starte mit Akquise-Chancen. Dort findest du Suchbegriffe, bei
              denen Locario noch zu wenig oder keine passenden Resultate hat.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/firmen"
              className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
            >
              Firmenverwaltung
            </Link>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                Zur Akquise-Ansicht
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analysisViews.map((view) => {
            const isActive = selectedView === view.value;

            return (
              <button
                key={view.value}
                type="button"
                onClick={() => setSelectedView(view.value)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-cyan-300/30 hover:bg-white/[0.06]"
                }`}
              >
                <span className="block font-black">{view.label}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {view.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
          <InputField
            label="Suche"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Suchbegriff, normalisierte Suche, Trefferzahl..."
          />

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
            Suchanalyse = nicht verwalten, sondern Nachfrage verstehen. Wenn
            ein Begriff oft gesucht wird und wenig Treffer hat, ist das ein
            Hinweis für Firmenakquise oder neue Kategorien.
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 md:flex-row md:items-center">
          <p>
            <span className="font-black text-white">{activeItems.length}</span>{" "}
            Einträge in dieser Ansicht.
          </p>

          <p className="text-slate-500">
            Seite {safeCurrentPage} von {pageCount} · {itemsPerPage} pro Seite
          </p>
        </div>

        {isLoading && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Suchdaten werden geladen...
          </div>
        )}

        {!isLoading && searchLogs.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Noch keine Suchanfragen gespeichert.
          </div>
        )}

        {!isLoading && searchLogs.length > 0 && activeItems.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            In dieser Ansicht gibt es aktuell keinen passenden Eintrag.
          </div>
        )}

        {!isLoading &&
          (selectedView === "opportunities" || selectedView === "top") &&
          paginatedStatItems.length > 0 && (
            <div className="mt-5 grid gap-3">
              {paginatedStatItems.map((item) => {
                const isOpportunityView = selectedView === "opportunities";

                return (
                  <article
                    key={item.normalizedQuery}
                    className={`rounded-3xl border p-4 transition ${
                      isOpportunityView
                        ? getOpportunityClassName(item)
                        : "border-white/10 bg-slate-950/45"
                    }`}
                  >
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_auto] xl:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-xl font-black text-white">
                            {item.latestQuery}
                          </h3>

                          {isOpportunityView && (
                            <span className="rounded-full border border-white/15 bg-slate-950/40 px-3 py-1 text-xs font-black text-white">
                              {getOpportunityLabel(item)}
                            </span>
                          )}

                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                            {item.searchCount}x gesucht
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-300">
                          Normalisiert: {item.normalizedQuery}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Zuletzt gesucht: {formatDate(item.latestAt)}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-3 xl:grid-cols-1">
                        <InfoLine
                          label="Letzte Treffer"
                          value={item.latestResultCount.toString()}
                        />
                        <InfoLine
                          label="0-Treffer"
                          value={item.zeroResultCount.toString()}
                        />
                        <InfoLine
                          label="Ø Treffer"
                          value={item.averageResultCount.toString()}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <Link
                          href="/admin/firmen"
                          className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10"
                        >
                          Firma suchen
                        </Link>

                        <Link
                          href="/admin/firmenanfragen"
                          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                        >
                          Inbox prüfen
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {!isLoading &&
          (selectedView === "zero_logs" || selectedView === "all_logs") &&
          paginatedSearchLogs.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="border-b border-white/10 bg-slate-950/80 text-xs font-black uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Suchbegriff</th>
                      <th className="px-4 py-3">Normalisiert</th>
                      <th className="px-4 py-3">Treffer</th>
                      <th className="px-4 py-3">Zeitpunkt</th>
                      <th className="px-4 py-3 text-right">Hinweis</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedSearchLogs.map((searchLog) => {
                      const hasNoResults = searchLog.resultCount === 0;

                      return (
                        <tr
                          key={searchLog.id}
                          className={`border-b border-white/10 transition last:border-b-0 hover:bg-white/[0.04] ${
                            hasNoResults ? "bg-red-300/10" : "bg-slate-950/35"
                          }`}
                        >
                          <td className="max-w-[24rem] px-4 py-4">
                            <p className="truncate font-black text-white">
                              {searchLog.query}
                            </p>
                          </td>

                          <td className="max-w-[20rem] px-4 py-4 text-slate-400">
                            <p className="truncate">
                              {searchLog.normalizedQuery}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-black ${
                                hasNoResults
                                  ? "border-red-300/30 bg-red-300/10 text-red-100"
                                  : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                              }`}
                            >
                              {searchLog.resultCount} Treffer
                            </span>
                          </td>

                          <td className="px-4 py-4 text-slate-400">
                            {formatDate(searchLog.createdAt)}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {hasNoResults ? (
                              <span className="text-xs font-black text-red-100">
                                Akquise prüfen
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">
                                Nachfrage vorhanden
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {!isLoading && activeItems.length > itemsPerPage && (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Zurück
            </button>

            <p className="text-center text-sm text-slate-400">
              Seite{" "}
              <span className="font-black text-white">{safeCurrentPage}</span>{" "}
              von <span className="font-black text-white">{pageCount}</span>
            </p>

            <button
              type="button"
              disabled={safeCurrentPage >= pageCount}
              onClick={() =>
                setCurrentPage((page) => Math.min(pageCount, page + 1))
              }
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Weiter
            </button>
          </div>
        )}
      </section>
    </section>
  );
}

function CompactMetric({
  label,
  value,
  variant = "cyan",
}: {
  label: string;
  value: number;
  variant?: "cyan" | "emerald" | "amber" | "red";
}) {
  const valueClassName =
    variant === "emerald"
      ? "text-emerald-200"
      : variant === "amber"
        ? "text-amber-200"
        : variant === "red"
          ? "text-red-200"
          : "text-cyan-200";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-xl shadow-slate-950/10">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className={`mt-1 text-3xl font-black ${valueClassName}`}>{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="text-slate-500">{label}:</span>{" "}
      <span className="font-black text-slate-100">{value}</span>
    </p>
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