"use client";

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

const emptySearchStats: SearchLogStatsResponse = {
  totalSearches: 0,
  uniqueSearches: 0,
  zeroResultSearches: 0,
  topSearches: [],
  acquisitionOpportunities: [],
};

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

export default function AdminSearchLogsPage() {
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [searchStats, setSearchStats] =
    useState<SearchLogStatsResponse>(emptySearchStats);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResultFilter, setSelectedResultFilter] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadSearchData();
  }, []);

  const filteredSearchLogs = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return searchLogs.filter((searchLog) => {
      const matchesSearch =
        !normalizedSearchQuery ||
        getSearchLogSearchText(searchLog).includes(normalizedSearchQuery);

      const matchesResultFilter =
        !selectedResultFilter ||
        (selectedResultFilter === "zero" && searchLog.resultCount === 0) ||
        (selectedResultFilter === "with_results" && searchLog.resultCount > 0);

      return matchesSearch && matchesResultFilter;
    });
  }, [searchLogs, searchQuery, selectedResultFilter]);

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

  const hasActiveFilters = searchQuery || selectedResultFilter;

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
    setSelectedResultFilter("");
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
            Suchanfragen{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              auswerten
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Analysiere, wonach Nutzer suchen. Besonders wertvoll sind
            Suchanfragen ohne Treffer, weil daraus neue Akquise-Chancen für
            Neario entstehen.
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

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Suchanfragen"
          value={searchStats.totalSearches.toString()}
          description="Gespeicherte Suchen"
        />

        <AdminStatCard
          title="Eindeutig"
          value={searchStats.uniqueSearches.toString()}
          description="Verschiedene Suchbegriffe"
        />

        <AdminStatCard
          title="Ohne Treffer"
          value={searchStats.zeroResultSearches.toString()}
          description="Potenzielle Akquise-Chancen"
        />

        <AdminStatCard
          title="Ø Treffer"
          value={averageResults.toString()}
          description="Durchschnitt pro Suche"
        />
      </div>

      {errorMessage && (
        <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <SearchStatsCard
          title="Top Suchanfragen"
          description="Diese Begriffe wurden am häufigsten gesucht."
          items={searchStats.topSearches}
          emptyMessage="Noch keine Top-Suchanfragen vorhanden."
          formatDate={formatDate}
        />

        <SearchStatsCard
          title="Akquise-Chancen"
          description="Diese Suchen hatten keine oder wenige Treffer. Hier könnten passende Firmen fehlen."
          items={searchStats.acquisitionOpportunities}
          emptyMessage="Aktuell keine offenen Akquise-Chancen."
          formatDate={formatDate}
          highlight
        />
      </div>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Suchlog
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Letzte Suchanfragen
            </h2>

            <p className="mt-3 text-slate-400">
              Durchsuche alle gespeicherten Suchanfragen und filtere nach
              Trefferanzahl.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_16rem]">
          <InputField
            label="Suche"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Suchbegriff, normalisierte Suche..."
          />

          <SelectField
            label="Treffer"
            value={selectedResultFilter}
            onChange={setSelectedResultFilter}
            options={[
              { value: "", label: "Alle Suchanfragen" },
              { value: "zero", label: "Nur 0 Treffer" },
              { value: "with_results", label: "Nur mit Treffern" },
            ]}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MiniStat
            title="Gefiltert"
            value={filteredSearchLogs.length.toString()}
            description={`von ${searchLogs.length} Suchanfragen`}
          />

          <MiniStat
            title="Mit Treffern"
            value={successfulSearchLogs.length.toString()}
            description="Suchen mit passenden Ergebnissen"
          />

          <MiniStat
            title="Ohne Treffer"
            value={zeroResultLogs.length.toString()}
            description="Suchen ohne passende Ergebnisse"
          />
        </div>
      </section>

      {isLoading && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Suchanfragen werden geladen...
        </div>
      )}

      {!isLoading && searchLogs.length === 0 && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Noch keine Suchanfragen gespeichert.
        </div>
      )}

      {!isLoading && searchLogs.length > 0 && filteredSearchLogs.length === 0 && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Keine Suchanfrage passt zu deinem Filter.
        </div>
      )}

      {!isLoading && filteredSearchLogs.length > 0 && (
        <div className="mt-10 grid gap-4">
          {filteredSearchLogs.map((searchLog) => (
            <article
              key={searchLog.id}
              className={`rounded-[2rem] border p-6 shadow-2xl shadow-slate-950/20 ${
                searchLog.resultCount === 0
                  ? "border-red-300/20 bg-red-300/10"
                  : "border-white/10 bg-white/[0.06]"
              }`}
            >
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-black tracking-tight">
                      {searchLog.query}
                    </h3>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        searchLog.resultCount === 0
                          ? "border-red-300/30 bg-red-300/10 text-red-100"
                          : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                      }`}
                    >
                      {searchLog.resultCount} Treffer
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Normalisiert: {searchLog.normalizedQuery}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Gesucht am {formatDate(searchLog.createdAt)}
                  </p>
                </div>

                {searchLog.resultCount === 0 && (
                  <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100 md:max-w-xs">
                    <p className="font-black">Akquise-Hinweis</p>
                    <p className="mt-1 text-amber-100/80">
                      Für diese Suche fehlen passende Anbieter. Das kann ein
                      guter Hinweis für neue Firmenakquise sein.
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminStatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
      <p className="text-sm font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-4 text-5xl font-black text-cyan-200">{value}</p>

      <p className="mt-3 text-sm text-slate-300">{description}</p>
    </article>
  );
}

function MiniStat({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <p className="text-sm font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black text-white">{value}</p>

      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </article>
  );
}

function SearchStatsCard({
  title,
  description,
  items,
  emptyMessage,
  formatDate,
  highlight = false,
}: {
  title: string;
  description: string;
  items: SearchLogStat[];
  emptyMessage: string;
  formatDate: (dateValue: string) => string;
  highlight?: boolean;
}) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
      <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
        Analyse
      </p>

      <h2 className="mt-2 text-3xl font-black">{title}</h2>

      <p className="mt-3 text-slate-400">{description}</p>

      {items.length === 0 && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
          {emptyMessage}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-6 grid gap-4">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.normalizedQuery}
              className={`rounded-3xl border p-5 ${
                highlight
                  ? "border-amber-300/20 bg-amber-300/10"
                  : "border-white/10 bg-slate-950/50"
              }`}
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <h3 className="text-xl font-black">{item.latestQuery}</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Normalisiert: {item.normalizedQuery}
                  </p>
                </div>

                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                  {item.searchCount}x gesucht
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                <p>Letzte Treffer: {item.latestResultCount}</p>
                <p>0-Treffer: {item.zeroResultCount}</p>
                <p>Ø Treffer: {item.averageResultCount}</p>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Zuletzt gesucht: {formatDate(item.latestAt)}
              </p>
            </div>
          ))}
        </div>
      )}
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
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-slate-950 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}