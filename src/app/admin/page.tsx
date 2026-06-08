"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Company } from "@/types/company";
import type { CompanyInquiry } from "@/types/company-inquiry";
import type { EventInquiry } from "@/types/event-inquiry";
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

type TaskVariant = "cyan" | "amber" | "emerald" | "red";

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

function getTaskClassName(variant: TaskVariant, isImportant: boolean) {
  if (!isImportant) {
    return "border-white/10 bg-slate-950/45";
  }

  if (variant === "amber") {
    return "border-amber-300/25 bg-amber-300/10";
  }

  if (variant === "emerald") {
    return "border-emerald-300/25 bg-emerald-300/10";
  }

  if (variant === "red") {
    return "border-red-300/25 bg-red-300/10";
  }

  return "border-cyan-300/25 bg-cyan-300/10";
}

function getValueClassName(variant: TaskVariant) {
  if (variant === "amber") {
    return "text-amber-200";
  }

  if (variant === "emerald") {
    return "text-emerald-200";
  }

  if (variant === "red") {
    return "text-red-200";
  }

  return "text-cyan-200";
}

export default function AdminDashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [events, setEvents] = useState<LocarioEvent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companyInquiries, setCompanyInquiries] = useState<CompanyInquiry[]>(
    []
  );
  const [eventInquiries, setEventInquiries] = useState<EventInquiry[]>([]);
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

  const contactedCompanyInquiries = useMemo(() => {
    return companyInquiries.filter((inquiry) => inquiry.status === "contacted");
  }, [companyInquiries]);

  const convertedCompanyInquiries = useMemo(() => {
    return companyInquiries.filter((inquiry) => inquiry.status === "converted");
  }, [companyInquiries]);

  const newEventInquiries = useMemo(() => {
    return eventInquiries.filter((inquiry) => inquiry.status === "new");
  }, [eventInquiries]);

  const contactedEventInquiries = useMemo(() => {
    return eventInquiries.filter((inquiry) => inquiry.status === "contacted");
  }, [eventInquiries]);

  const convertedEventInquiries = useMemo(() => {
    return eventInquiries.filter((inquiry) => inquiry.status === "converted");
  }, [eventInquiries]);

  const companiesWithAds = useMemo(() => {
    return companies.filter((company) => company.ad);
  }, [companies]);

  const starterCompanies = useMemo(() => {
    return companies.filter((company) => company.plan === "starter");
  }, [companies]);

  const proCompanies = useMemo(() => {
    return companies.filter((company) => company.plan === "pro");
  }, [companies]);

  const premiumCompanies = useMemo(() => {
    return companies.filter((company) => company.plan === "premium");
  }, [companies]);

  const activeEvents = useMemo(() => {
    return events.filter((event) => event.isActive);
  }, [events]);

  const inactiveEvents = useMemo(() => {
    return events.filter((event) => !event.isActive);
  }, [events]);

  const highlightedEvents = useMemo(() => {
    return events.filter((event) => isHighlightedEvent(event));
  }, [events]);

  const openWorkCount =
    newCompanyInquiries.length +
    newEventInquiries.length +
    newLeads.length +
    searchStats.zeroResultSearches;

  const importantTasks = [
    {
      title: "Firmenanfragen",
      value: newCompanyInquiries.length,
      description: "Neue Firmen prüfen und veröffentlichen.",
      href: "/admin/firmenanfragen",
      action: "Prüfen",
      variant: "cyan" as const,
    },
    {
      title: "Eventanfragen",
      value: newEventInquiries.length,
      description: "Neue Events kontrollieren und freigeben.",
      href: "/admin/eventanfragen",
      action: "Prüfen",
      variant: "amber" as const,
    },
    {
      title: "Neue Leads",
      value: newLeads.length,
      description: "Kundenanfragen aus Firmenprofilen bearbeiten.",
      href: "/admin/leads",
      action: "Bearbeiten",
      variant: "emerald" as const,
    },
    {
      title: "0-Treffer",
      value: searchStats.zeroResultSearches,
      description: "Suchbegriffe ohne Resultate als Akquise nutzen.",
      href: "/admin/suchanfragen",
      action: "Analysieren",
      variant: "red" as const,
    },
  ];

  const platformRows = [
    {
      label: "Firmen gesamt",
      value: companies.length,
      detail: `${premiumCompanies.length} Premium`,
      href: "/admin/firmen",
    },
    {
      label: "Events gesamt",
      value: events.length,
      detail: `${activeEvents.length} aktiv`,
      href: "/admin/events",
    },
    {
      label: "Firmenanfragen",
      value: companyInquiries.length,
      detail: `${convertedCompanyInquiries.length} veröffentlicht`,
      href: "/admin/firmenanfragen",
    },
    {
      label: "Eventanfragen",
      value: eventInquiries.length,
      detail: `${convertedEventInquiries.length} veröffentlicht`,
      href: "/admin/eventanfragen",
    },
    {
      label: "Leads",
      value: leads.length,
      detail: `${newLeads.length} neu`,
      href: "/admin/leads",
    },
    {
      label: "Suchanfragen",
      value: searchStats.totalSearches,
      detail: `${searchStats.uniqueSearches} eindeutig`,
      href: "/admin/suchanfragen",
    },
  ];

  const quickActions = [
    {
      title: "Firmen verwalten",
      description: "Firmen als Tabelle bearbeiten, Partner-Links und Pakete prüfen.",
      href: "/admin/firmen",
    },
    {
      title: "Events verwalten",
      description: "Events als Tabelle bearbeiten, Status und Wochenpakete steuern.",
      href: "/admin/events",
    },
    {
      title: "Firmenanfragen prüfen",
      description: "Eingereichte Firmen kontrollieren und als Firma veröffentlichen.",
      href: "/admin/firmenanfragen",
    },
    {
      title: "Eventanfragen prüfen",
      description: "Eingereichte Events kontrollieren und als Event veröffentlichen.",
      href: "/admin/eventanfragen",
    },
    {
      title: "Leads bearbeiten",
      description: "Kundenanfragen prüfen, Status setzen und nachfassen.",
      href: "/admin/leads",
    },
    {
      title: "Suchdaten analysieren",
      description: "Top-Suchen und 0-Treffer für Akquise auswerten.",
      href: "/admin/suchanfragen",
    },
  ];

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [
        companiesResponse,
        eventsResponse,
        leadsResponse,
        companyInquiriesResponse,
        eventInquiriesResponse,
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
        fetch("/api/event-inquiries", {
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

      if (!companyInquiriesResponse.ok) {
        throw new Error("Firmenanfragen konnten nicht geladen werden.");
      }

      if (!eventInquiriesResponse.ok) {
        throw new Error("Event-Anfragen konnten nicht geladen werden.");
      }

      if (!searchStatsResponse.ok) {
        throw new Error("Suchstatistiken konnten nicht geladen werden.");
      }

      const companiesData = (await companiesResponse.json()) as Company[];
      const eventsData = (await eventsResponse.json()) as LocarioEvent[];
      const leadsData = (await leadsResponse.json()) as Lead[];
      const companyInquiriesData =
        (await companyInquiriesResponse.json()) as CompanyInquiry[];
      const eventInquiriesData =
        (await eventInquiriesResponse.json()) as EventInquiry[];
      const searchStatsData =
        (await searchStatsResponse.json()) as SearchLogStatsResponse;

      setCompanies(companiesData);
      setEvents(eventsData);
      setLeads(leadsData);
      setCompanyInquiries(companyInquiriesData);
      setEventInquiries(eventInquiriesData);
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
            Locario Admin
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Admin{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Cockpit
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Kompakte Zentrale für Firmen, Events, Anfragen, Leads und
            Suchdaten. Der Fokus liegt auf offenen Aufgaben und schnellen
            Aktionen.
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
        <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <CompactMetric label="Offen" value={openWorkCount} variant="red" />
        <CompactMetric label="Firmen" value={companies.length} />
        <CompactMetric label="Events" value={events.length} variant="amber" />
        <CompactMetric label="Leads" value={leads.length} variant="emerald" />
        <CompactMetric
          label="Suchen"
          value={searchStats.totalSearches}
          variant="cyan"
        />
        <CompactMetric
          label="0-Treffer"
          value={searchStats.zeroResultSearches}
          variant="red"
        />
      </div>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Aufgaben
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Was jetzt wichtig ist
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Diese vier Bereiche zeigen dir sofort, wo Arbeit offen ist.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="hidden grid-cols-[minmax(0,1.2fr)_7rem_minmax(0,1.5fr)_8rem] gap-4 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
            <span>Bereich</span>
            <span>Anzahl</span>
            <span>Beschreibung</span>
            <span className="text-right">Aktion</span>
          </div>

          {importantTasks.map((task) => (
            <TaskRow
              key={task.title}
              title={task.title}
              value={task.value}
              description={task.description}
              href={task.href}
              action={task.action}
              variant={task.variant}
            />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 2xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Plattform
            </p>

            <h2 className="mt-2 text-3xl font-black">Statusübersicht</h2>

            <p className="mt-2 text-sm text-slate-400">
              Kompakte Zahlen zu den wichtigsten Bereichen.
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="hidden grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)_8rem] gap-4 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
              <span>Bereich</span>
              <span>Anzahl</span>
              <span>Info</span>
              <span className="text-right">Öffnen</span>
            </div>

            {platformRows.map((row) => (
              <PlatformRow
                key={row.label}
                label={row.label}
                value={row.value}
                detail={row.detail}
                href={row.href}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Schnellzugriff
            </p>

            <h2 className="mt-2 text-3xl font-black">Admin-Bereiche</h2>

            <p className="mt-2 text-sm text-slate-400">
              Direkter Einstieg in die wichtigsten Verwaltungsseiten.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {quickActions.map((action) => (
              <QuickAction
                key={action.href}
                href={action.href}
                title={action.title}
                description={action.description}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-3">
        <MiniStatusPanel
          title="Firmenpakete"
          rows={[
            {
              label: "Starter",
              value: starterCompanies.length,
            },
            {
              label: "Pro",
              value: proCompanies.length,
            },
            {
              label: "Premium",
              value: premiumCompanies.length,
            },
            {
              label: "Mit Werbung",
              value: companiesWithAds.length,
            },
          ]}
        />

        <MiniStatusPanel
          title="Events"
          rows={[
            {
              label: "Aktiv",
              value: activeEvents.length,
            },
            {
              label: "Inaktiv",
              value: inactiveEvents.length,
            },
            {
              label: "Highlight/Premium",
              value: highlightedEvents.length,
            },
            {
              label: "Gesamt",
              value: events.length,
            },
          ]}
        />

        <MiniStatusPanel
          title="Anfragen"
          rows={[
            {
              label: "Neue Firmen",
              value: newCompanyInquiries.length,
            },
            {
              label: "Kontaktierte Firmen",
              value: contactedCompanyInquiries.length,
            },
            {
              label: "Neue Events",
              value: newEventInquiries.length,
            },
            {
              label: "Kontaktierte Events",
              value: contactedEventInquiries.length,
            },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <SearchStatsPreview
          title="Top-Suchen"
          description="Die häufigsten Suchbegriffe auf Locario."
          items={searchStats.topSearches}
          emptyMessage="Noch keine Top-Suchanfragen vorhanden."
          formatDate={formatDate}
        />

        <SearchStatsPreview
          title="Akquise-Chancen"
          description="Suchanfragen mit wenigen oder keinen Treffern."
          items={searchStats.acquisitionOpportunities}
          emptyMessage="Aktuell keine offenen Akquise-Chancen."
          formatDate={formatDate}
          highlight
        />
      </div>
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
  variant?: TaskVariant;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-xl shadow-slate-950/10">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className={`mt-1 text-3xl font-black ${getValueClassName(variant)}`}>
        {value}
      </p>
    </div>
  );
}

function TaskRow({
  title,
  value,
  description,
  href,
  action,
  variant,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
  action: string;
  variant: TaskVariant;
}) {
  const isImportant = value > 0;

  return (
    <Link
      href={href}
      className={`grid gap-4 border-b border-white/10 px-4 py-4 transition last:border-b-0 hover:bg-white/[0.04] lg:grid-cols-[minmax(0,1.2fr)_7rem_minmax(0,1.5fr)_8rem] lg:items-center ${getTaskClassName(
        variant,
        isImportant
      )}`}
    >
      <div>
        <p className="font-black text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-500 lg:hidden">{description}</p>
      </div>

      <p className={`text-3xl font-black ${getValueClassName(variant)}`}>
        {value}
      </p>

      <p className="hidden text-sm text-slate-300 lg:block">{description}</p>

      <p className="text-sm font-black text-cyan-200 lg:text-right">
        {isImportant ? action : "Alles gut"} →
      </p>
    </Link>
  );
}

function PlatformRow({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="grid gap-4 border-b border-white/10 bg-slate-950/40 px-4 py-4 transition last:border-b-0 hover:bg-white/[0.04] lg:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)_8rem] lg:items-center"
    >
      <p className="font-black text-white">{label}</p>

      <p className="text-2xl font-black text-cyan-200">{value}</p>

      <p className="text-sm text-slate-400">{detail}</p>

      <p className="text-sm font-black text-cyan-200 lg:text-right">
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
      className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>

        <span className="text-sm font-black text-cyan-300">→</span>
      </div>
    </Link>
  );
}

function MiniStatusPanel({
  title,
  rows,
}: {
  title: string;
  rows: {
    label: string;
    value: number;
  }[];
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
      <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
        Status
      </p>

      <h2 className="mt-2 text-2xl font-black">{title}</h2>

      <div className="mt-5 grid gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
          >
            <p className="text-sm text-slate-300">{row.label}</p>
            <p className="text-lg font-black text-white">{row.value}</p>
          </div>
        ))}
      </div>
    </section>
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
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Analyse
          </p>

          <h2 className="mt-2 text-3xl font-black">{title}</h2>

          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>

        <Link
          href="/admin/suchanfragen"
          className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
        >
          Suchdaten öffnen
        </Link>
      </div>

      {items.length === 0 && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
          {emptyMessage}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="hidden grid-cols-[minmax(0,1fr)_6rem_7rem_9rem] gap-4 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 md:grid">
            <span>Suchbegriff</span>
            <span>Anzahl</span>
            <span>Treffer</span>
            <span>Zuletzt</span>
          </div>

          {items.slice(0, 6).map((item) => (
            <div
              key={item.normalizedQuery}
              className={`grid gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_6rem_7rem_9rem] md:items-center ${
                highlight
                  ? "bg-amber-300/10"
                  : "bg-slate-950/40"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate font-black text-white">
                  {item.latestQuery}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {item.normalizedQuery}
                </p>
              </div>

              <p className="text-sm font-black text-cyan-200">
                {item.searchCount}x
              </p>

              <p className="text-sm text-slate-300">
                {item.latestResultCount}
              </p>

              <p className="text-xs text-slate-500">
                {formatDate(item.latestAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}