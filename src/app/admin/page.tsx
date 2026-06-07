"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Company } from "@/types/company";
import type { CompanyInquiry } from "@/types/company-inquiry";
import type { Lead } from "@/types/lead";
import type { LocarioEvent } from "@/types/event";

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

function isHighlightedEvent(event: LocarioEvent) {
  return event.plan === "highlight" || event.plan === "premium";
}

export default function AdminDashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [events, setEvents] = useState<LocarioEvent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companyInquiries, setCompanyInquiries] = useState<CompanyInquiry[]>(
    []
  );
  const [searchStats, setSearchStats] =
    useState<SearchLogStatsResponse>(emptySearchStats);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const newLeads = useMemo(() => {
    return leads.filter((lead) => lead.status === "new");
  }, [leads]);

  const newCompanyInquiries = useMemo(() => {
    return companyInquiries.filter((inquiry) => inquiry.status === "new");
  }, [companyInquiries]);

  const companiesWithAds = useMemo(() => {
    return companies.filter((company) => company.ad);
  }, [companies]);

  const premiumCompanies = useMemo(() => {
    return companies.filter((company) => company.plan === "premium");
  }, [companies]);

  const activeEvents = useMemo(() => {
    return events.filter((event) => event.isActive);
  }, [events]);

  const highlightedEvents = useMemo(() => {
    return events.filter((event) => isHighlightedEvent(event));
  }, [events]);

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [
        companiesResponse,
        eventsResponse,
        leadsResponse,
        inquiriesResponse,
        searchStatsResponse,
      ] = await Promise.all([
        fetch("/api/companies", {
          method: "GET",
        }),
        fetch("/api/events", {
          method: "GET",
        }),
        fetch("/api/leads", {
          method: "GET",
        }),
        fetch("/api/company-inquiries", {
          method: "GET",
        }),
        fetch("/api/search-logs/stats", {
          method: "GET",
        }),
      ]);

      if (!companiesResponse.ok) {
        throw new Error("Firmen konnten nicht geladen werden.");
      }

      if (!eventsResponse.ok) {
        throw new Error("Events konnten nicht geladen werden.");
      }

      if (!leadsResponse.ok) {
        throw new Error("Leads konnten nicht geladen werden.");
      }

      if (!inquiriesResponse.ok) {
        throw new Error("Firmenanfragen konnten nicht geladen werden.");
      }

      if (!searchStatsResponse.ok) {
        throw new Error("Suchstatistiken konnten nicht geladen werden.");
      }

      const companiesData = (await companiesResponse.json()) as Company[];
      const eventsData = (await eventsResponse.json()) as LocarioEvent[];
      const leadsData = (await leadsResponse.json()) as Lead[];
      const inquiriesData =
        (await inquiriesResponse.json()) as CompanyInquiry[];
      const searchStatsData =
        (await searchStatsResponse.json()) as SearchLogStatsResponse;

      setCompanies(companiesData);
      setEvents(eventsData);
      setLeads(leadsData);
      setCompanyInquiries(inquiriesData);
      setSearchStats(searchStatsData);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Dashboard-Daten konnten nicht geladen werden.");
      }
    } finally {
      setIsLoading(false);
    }
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
            Admin Dashboard
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Locario{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Übersicht
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Deine zentrale Übersicht für Firmen, Events, Leads,
            Firmenanfragen und Suchdaten.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={isLoading}
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Lädt..." : "Aktualisieren"}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <DashboardCard
          title="Firmen"
          value={companies.length.toString()}
          description={`${premiumCompanies.length} Premium-Firmen`}
          href="/admin/firmen"
        />

        <DashboardCard
          title="Events"
          value={events.length.toString()}
          description={`${activeEvents.length} aktive Events`}
          href="/admin/events"
        />

        <DashboardCard
          title="Firmenanfragen"
          value={companyInquiries.length.toString()}
          description={`${newCompanyInquiries.length} neue Anfragen`}
          href="/admin/firmenanfragen"
        />

        <DashboardCard
          title="Leads"
          value={leads.length.toString()}
          description={`${newLeads.length} neue Kundenanfragen`}
          href="/admin/leads"
        />

        <DashboardCard
          title="Suchanfragen"
          value={searchStats.totalSearches.toString()}
          description={`${searchStats.zeroResultSearches} ohne Treffer`}
          href="/admin/suchanfragen"
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Schnellzugriff
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Was möchtest du verwalten?
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <QuickAction
              href="/admin/firmen"
              title="Firmen verwalten"
              description="Firmen hinzufügen, bearbeiten, löschen und Partner-Links kopieren."
            />

            <QuickAction
              href="/admin/events"
              title="Events verwalten"
              description="Events hinzufügen, Bilder hochladen, Wochenpakete setzen und veröffentlichen."
            />

            <QuickAction
              href="/admin/firmenanfragen"
              title="Firmenanfragen prüfen"
              description="Neue Firmenanfragen ansehen, Status ändern und veröffentlichen."
            />

            <QuickAction
              href="/admin/leads"
              title="Leads ansehen"
              description="Kundenanfragen aus Firmenprofilen prüfen und bearbeiten."
            />

            <QuickAction
              href="/admin/suchanfragen"
              title="Suchdaten analysieren"
              description="Top-Suchen und 0-Treffer als Akquise-Chancen erkennen."
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Plattformstatus
          </p>

          <h2 className="mt-2 text-3xl font-black">Aktueller Stand</h2>

          <div className="mt-6 grid gap-4">
            <StatusRow label="Firmen mit Werbung" value={companiesWithAds.length} />
            <StatusRow label="Premium-Firmen" value={premiumCompanies.length} />
            <StatusRow label="Aktive Events" value={activeEvents.length} />
            <StatusRow label="Event-Highlights" value={highlightedEvents.length} />
            <StatusRow label="Neue Leads" value={newLeads.length} />
            <StatusRow label="Neue Firmenanfragen" value={newCompanyInquiries.length} />
            <StatusRow label="Eindeutige Suchen" value={searchStats.uniqueSearches} />
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <SearchStatsPreview
          title="Top Suchanfragen"
          description="Diese Begriffe wurden am häufigsten gesucht."
          items={searchStats.topSearches}
          emptyMessage="Noch keine Top-Suchanfragen vorhanden."
          formatDate={formatDate}
        />

        <SearchStatsPreview
          title="Akquise-Chancen"
          description="Diese Suchen hatten keine oder wenige Treffer."
          items={searchStats.acquisitionOpportunities}
          emptyMessage="Aktuell keine offenen Akquise-Chancen."
          formatDate={formatDate}
          highlight
        />
      </div>
    </section>
  );
}

function DashboardCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.09]"
    >
      <p className="text-sm font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-4 text-5xl font-black text-cyan-200">{value}</p>

      <p className="mt-3 text-sm text-slate-300">{description}</p>

      <p className="mt-5 text-sm font-black text-cyan-300 transition group-hover:text-cyan-100">
        Öffnen →
      </p>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
    >
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </Link>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

function SearchStatsPreview({
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
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
      <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
        Analyse
      </p>

      <h2 className="mt-2 text-3xl font-black">{title}</h2>

      <p className="mt-2 text-slate-400">{description}</p>

      {items.length === 0 && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
          {emptyMessage}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-6 grid gap-4">
          {items.slice(0, 5).map((item) => (
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
                  <h3 className="font-black">{item.latestQuery}</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Normalisiert: {item.normalizedQuery}
                  </p>
                </div>

                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                  {item.searchCount}x
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                <p>Letzte Treffer: {item.latestResultCount}</p>
                <p>0-Treffer: {item.zeroResultCount}</p>
                <p>Ø Treffer: {item.averageResultCount}</p>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Zuletzt: {formatDate(item.latestAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
