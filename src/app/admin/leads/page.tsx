"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lead } from "@/types/lead";

type DrawerMode = "closed" | "details";
type InboxView = "open" | "new" | "in_progress" | "done" | "all";

type LocationAwareLead = Lead & {
  companyBaseName?: string;
  companyDisplayName?: string;
  companyLocationName?: string;
  companyCity?: string;
  companyAddress?: string;
  companyParentCompanyId?: string;
  companyParentName?: string;
  companyParentLocationName?: string;
  companyRelationLabel?: string;
  company?: {
    name?: string;
    locationName?: string;
    city?: string;
    address?: string;
    adress?: string;
    parentCompany?: {
      id?: string;
      name?: string;
      locationName?: string;
      city?: string;
    } | null;
    locations?: {
      id: string;
      name: string;
      locationName?: string;
      city?: string;
    }[];
  };
};

const leadsPerPage = 25;

const inboxViews: {
  value: InboxView;
  label: string;
  description: string;
}[] = [
  {
    value: "open",
    label: "Offen",
    description: "Neu + in Bearbeitung",
  },
  {
    value: "new",
    label: "Neu",
    description: "Noch nicht bearbeitet",
  },
  {
    value: "in_progress",
    label: "In Bearbeitung",
    description: "Nachfassen",
  },
  {
    value: "done",
    label: "Erledigt",
    description: "Abgeschlossen",
  },
  {
    value: "all",
    label: "Alle",
    description: "Gesamtes Archiv",
  },
];

const leadStatusOptions = [
  {
    value: "new",
    label: "Neu",
  },
  {
    value: "in_progress",
    label: "In Bearbeitung",
  },
  {
    value: "done",
    label: "Erledigt",
  },
];

function getLeadStatusLabel(status: string) {
  if (status === "new") {
    return "Neu";
  }

  if (status === "in_progress") {
    return "In Bearbeitung";
  }

  if (status === "done") {
    return "Erledigt";
  }

  return status;
}

function getLeadStatusClassName(status: string) {
  if (status === "new") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "in_progress") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "done") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-300";
}

function getSafeString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function normalizeValue(value: unknown) {
  return getSafeString(value)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function valueAlreadyContainsCity(value: string, city: string) {
  const normalizedValue = normalizeValue(value);
  const normalizedCity = normalizeValue(city);

  if (!normalizedValue || !normalizedCity) {
    return false;
  }

  return normalizedValue.includes(normalizedCity);
}

function getLeadCompanyDisplayName(lead: LocationAwareLead) {
  const displayName = getSafeString(lead.companyDisplayName);

  if (displayName) {
    return displayName;
  }

  const companyName = getSafeString(lead.companyName || lead.company?.name);
  const locationName = getSafeString(
    lead.companyLocationName || lead.company?.locationName
  );

  if (companyName && locationName) {
    return `${companyName} · ${locationName}`;
  }

  return companyName || "Firma offen";
}

function getLeadCompanyRelationLabel(lead: LocationAwareLead) {
  const relationLabel = getSafeString(lead.companyRelationLabel);

  if (relationLabel) {
    return relationLabel;
  }

  const parentName = getSafeString(
    lead.companyParentName || lead.company?.parentCompany?.name
  );
  const parentLocationName = getSafeString(
    lead.companyParentLocationName || lead.company?.parentCompany?.locationName
  );

  if (parentName) {
    return `Standort von ${
      parentLocationName ? `${parentName} · ${parentLocationName}` : parentName
    }`;
  }

  const locationCount = lead.company?.locations?.length ?? 0;

  if (locationCount > 0) {
    return `${locationCount} Standort${locationCount === 1 ? "" : "e"}`;
  }

  return "";
}

function getLeadCompanyLocationLine(lead: LocationAwareLead) {
  const city = getSafeString(lead.companyCity || lead.company?.city);
  const address = getSafeString(
    lead.companyAddress || lead.company?.address || lead.company?.adress
  );

  if (address && city && !valueAlreadyContainsCity(address, city)) {
    return `${address}, ${city}`;
  }

  return address || city || "Ort offen";
}

function getStatusRank(status: string) {
  if (status === "new") {
    return 1;
  }

  if (status === "in_progress") {
    return 2;
  }

  if (status === "done") {
    return 3;
  }

  return 4;
}

function getLeadSearchText(lead: LocationAwareLead) {
  return [
    getLeadCompanyDisplayName(lead),
    getLeadCompanyRelationLabel(lead),
    getLeadCompanyLocationLine(lead),
    lead.companyName,
    lead.companyLocationName,
    lead.companyParentName,
    lead.customerName,
    lead.customerEmail,
    lead.customerPhone,
    lead.message,
    lead.sourceQuery,
    lead.status,
  ]
    .join(" ")
    .toLowerCase();
}

function matchesInboxView(lead: Lead, view: InboxView) {
  if (view === "open") {
    return lead.status === "new" || lead.status === "in_progress";
  }

  if (view === "all") {
    return true;
  }

  return lead.status === view;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LocationAwareLead[]>([]);

  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [selectedInboxView, setSelectedInboxView] =
    useState<InboxView>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompany, selectedInboxView]);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) {
      return null;
    }

    return leads.find((lead) => lead.id === selectedLeadId) ?? null;
  }, [leads, selectedLeadId]);

  const newLeads = useMemo(() => {
    return leads.filter((lead) => lead.status === "new");
  }, [leads]);

  const inProgressLeads = useMemo(() => {
    return leads.filter((lead) => lead.status === "in_progress");
  }, [leads]);

  const doneLeads = useMemo(() => {
    return leads.filter((lead) => lead.status === "done");
  }, [leads]);

  const openLeads = useMemo(() => {
    return leads.filter(
      (lead) => lead.status === "new" || lead.status === "in_progress"
    );
  }, [leads]);

  const leadsWithSourceQuery = useMemo(() => {
    return leads.filter((lead) => lead.sourceQuery);
  }, [leads]);

  const companyOptions = useMemo(() => {
    const companyNames = leads
      .map(getLeadCompanyDisplayName)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return Array.from(new Set(companyNames));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return leads
      .filter((lead) => {
        const matchesSearch =
          !normalizedSearchQuery ||
          getLeadSearchText(lead).includes(normalizedSearchQuery);

        const matchesCompany =
          !selectedCompany || getLeadCompanyDisplayName(lead) === selectedCompany;

        return (
          matchesSearch &&
          matchesCompany &&
          matchesInboxView(lead, selectedInboxView)
        );
      })
      .sort((firstLead, secondLead) => {
        const statusDifference =
          getStatusRank(firstLead.status) - getStatusRank(secondLead.status);

        if (statusDifference !== 0) {
          return statusDifference;
        }

        return (
          new Date(secondLead.createdAt).getTime() -
          new Date(firstLead.createdAt).getTime()
        );
      });
  }, [leads, searchQuery, selectedCompany, selectedInboxView]);

  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / leadsPerPage));
  const safeCurrentPage = Math.min(currentPage, pageCount);

  const paginatedLeads = filteredLeads.slice(
    (safeCurrentPage - 1) * leadsPerPage,
    safeCurrentPage * leadsPerPage
  );

  const hasActiveFilters =
    searchQuery || selectedCompany || selectedInboxView !== "open";

  async function loadLeads() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/leads", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Leads konnten nicht geladen werden.");
      }

      const data = (await response.json()) as LocationAwareLead[];
      setLeads(data);
    } catch {
      setErrorMessage(
        "Die Leads konnten nicht aus der Datenbank geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, status: string) {
    try {
      setUpdatingLeadId(leadId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Lead-Status konnte nicht geändert werden."
        );
      }

      const updatedLead = (await response.json()) as LocationAwareLead;

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );

      setSuccessMessage("Lead-Status wurde aktualisiert.");

      if (status === "done") {
        closeDrawer();
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Ändern des Lead-Status ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setUpdatingLeadId(null);
    }
  }

  function openDetailsDrawer(lead: Lead) {
    setSelectedLeadId(lead.id);
    setDrawerMode("details");
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeDrawer() {
    setDrawerMode("closed");
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedCompany("");
    setSelectedInboxView("open");
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
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Lead-Inbox
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Kundenanfragen{" "}
            <span className="bg-gradient-to-r from-emerald-200 via-white to-cyan-200 bg-clip-text text-transparent">
              bearbeiten
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Hier geht es nur um Nachfassen: neue Leads prüfen, Kunden
            kontaktieren, Status setzen und erledigte Anfragen aus der offenen
            Arbeitsliste entfernen.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLeads}
          disabled={isLoading}
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-emerald-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Lädt..." : "Aktualisieren"}
        </button>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <CompactMetric label="Offen" value={openLeads.length} variant="emerald" />
        <CompactMetric label="Neu" value={newLeads.length} variant="emerald" />
        <CompactMetric
          label="In Bearbeitung"
          value={inProgressLeads.length}
          variant="amber"
        />
        <CompactMetric label="Erledigt" value={doneLeads.length} />
        <CompactMetric
          label="Mit Suchquelle"
          value={leadsWithSourceQuery.length}
          variant="cyan"
        />
      </div>

      {successMessage && (
        <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-300">
              Arbeitsliste
            </p>

            <h2 className="mt-2 text-3xl font-black">Offene Leads</h2>

            <p className="mt-2 text-sm text-slate-400">
              Standardmässig siehst du nur Leads, die noch offen oder in
              Bearbeitung sind.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-emerald-300/30 hover:bg-white/10"
            >
              Zur offenen Inbox
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {inboxViews.map((view) => {
            const isActive = selectedInboxView === view.value;

            return (
              <button
                key={view.value}
                type="button"
                onClick={() => setSelectedInboxView(view.value)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-emerald-300/30 hover:bg-white/[0.06]"
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
            placeholder="Kunde, Firma, Nachricht, Suchquelle..."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[18rem_1fr]">
            <SelectField
              label="Firma"
              value={selectedCompany}
              onChange={setSelectedCompany}
              options={[
                { value: "", label: "Alle Firmen" },
                ...companyOptions.map((companyName) => ({
                  value: companyName,
                  label: companyName,
                })),
              ]}
            />

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
              Lead = Kontakt aufnehmen, Status setzen, erledigen. Firmen selbst
              werden weiterhin in der Firmenverwaltung bearbeitet.
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 md:flex-row md:items-center">
          <p>
            <span className="font-black text-white">{filteredLeads.length}</span>{" "}
            Leads in dieser Ansicht.
          </p>

          <p className="text-slate-500">
            Seite {safeCurrentPage} von {pageCount} · {leadsPerPage} pro Seite
          </p>
        </div>

        {isLoading && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Leads werden geladen...
          </div>
        )}

        {!isLoading && leads.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Noch keine Leads gespeichert.
          </div>
        )}

        {!isLoading && leads.length > 0 && filteredLeads.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            In dieser Ansicht gibt es aktuell keinen Lead.
          </div>
        )}

        {!isLoading && paginatedLeads.length > 0 && (
          <div className="mt-5 grid gap-3">
            {paginatedLeads.map((lead) => {
              const isUpdating = updatingLeadId === lead.id;
              const isDone = lead.status === "done";

              return (
                <article
                  key={lead.id}
                  className={`rounded-3xl border p-4 transition ${
                    lead.status === "new"
                      ? "border-emerald-300/20 bg-emerald-300/10"
                      : lead.status === "in_progress"
                        ? "border-amber-300/20 bg-amber-300/10"
                        : lead.status === "done"
                          ? "border-cyan-300/20 bg-cyan-300/10"
                          : "border-white/10 bg-slate-950/45"
                  }`}
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_auto] xl:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDetailsDrawer(lead)}
                          className="break-words text-left text-xl font-black text-white transition hover:text-emerald-100"
                        >
                          {lead.customerName}
                        </button>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getLeadStatusClassName(
                            lead.status
                          )}`}
                        >
                          {getLeadStatusLabel(lead.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-300">
                        {getLeadCompanyDisplayName(lead)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {getLeadCompanyLocationLine(lead)}
                      </p>

                      {getLeadCompanyRelationLabel(lead) && (
                        <p className="mt-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                          {getLeadCompanyRelationLabel(lead)}
                        </p>
                      )}

                      {lead.sourceQuery && (
                        <p className="mt-2 text-xs font-bold text-cyan-100">
                          Suchquelle: {lead.sourceQuery}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0 text-sm text-slate-300">
                      <p className="truncate font-bold text-white">
                        {lead.customerEmail || "Keine E-Mail"}
                      </p>

                      <p className="mt-1 truncate text-slate-400">
                        {lead.customerPhone || "Kein Telefon"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Eingang: {formatDate(lead.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => openDetailsDrawer(lead)}
                        className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-emerald-300/30 hover:bg-white/10"
                      >
                        Details
                      </button>

                      {lead.customerEmail && (
                        <a
                          href={`mailto:${lead.customerEmail}`}
                          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-emerald-300/30 hover:bg-white/10"
                        >
                          E-Mail
                        </a>
                      )}

                      {lead.customerPhone && (
                        <a
                          href={`tel:${lead.customerPhone}`}
                          className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/10"
                        >
                          Anrufen
                        </a>
                      )}

                      {lead.status === "new" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            updateLeadStatus(lead.id, "in_progress")
                          }
                          className="rounded-xl border border-amber-300/30 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          In Bearbeitung
                        </button>
                      )}

                      {!isDone && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => updateLeadStatus(lead.id, "done")}
                          className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Erledigt
                        </button>
                      )}

                      {lead.companyId && (
                        <Link
                          href={`/firmen/${lead.companyId}`}
                          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                        >
                          Firma
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && filteredLeads.length > leadsPerPage && (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-emerald-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-emerald-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Weiter
            </button>
          </div>
        )}
      </section>

      <LeadDrawer
        mode={drawerMode}
        lead={selectedLead}
        updatingLeadId={updatingLeadId}
        onClose={closeDrawer}
        onUpdateStatus={updateLeadStatus}
        formatDate={formatDate}
      />
    </section>
  );
}

function LeadDrawer({
  mode,
  lead,
  updatingLeadId,
  onClose,
  onUpdateStatus,
  formatDate,
}: {
  mode: DrawerMode;
  lead: Lead | null;
  updatingLeadId: string | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: string) => void;
  formatDate: (dateValue: string) => string;
}) {
  if (mode === "closed" || !lead) {
    return null;
  }

  const isUpdating = updatingLeadId === lead.id;
  const isDone = lead.status === "done";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm">
      <div className="flex min-h-screen justify-end">
        <aside className="h-screen w-full max-w-5xl overflow-y-auto border-l border-white/10 bg-slate-950 p-5 shadow-2xl shadow-slate-950/50 md:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-emerald-300">
                Lead bearbeiten
              </p>

              <h2 className="mt-2 break-words text-4xl font-black tracking-tight">
                {lead.customerName}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                Eingegangen am {formatDate(lead.createdAt)} für{" "}
                {getLeadCompanyDisplayName(lead)}.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-emerald-300/30 hover:bg-white/10"
            >
              Schliessen
            </button>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[20rem_1fr]">
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Nachfassen
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getLeadStatusClassName(
                      lead.status
                    )}`}
                  >
                    {getLeadStatusLabel(lead.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {lead.status === "new" && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onUpdateStatus(lead.id, "in_progress")}
                      className="rounded-2xl border border-amber-300/30 px-4 py-3 text-sm font-black text-amber-100 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Als in Bearbeitung markieren
                    </button>
                  )}

                  {!isDone && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onUpdateStatus(lead.id, "done")}
                      className="rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Als erledigt markieren
                    </button>
                  )}

                  {lead.status === "done" && (
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
                      Dieser Lead ist erledigt.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Kontakt
                </p>

                <div className="mt-4 grid gap-3">
                  {lead.customerEmail && (
                    <a
                      href={`mailto:${lead.customerEmail}`}
                      className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-emerald-300/30 hover:bg-white/10"
                    >
                      E-Mail senden
                    </a>
                  )}

                  {lead.customerPhone && (
                    <a
                      href={`tel:${lead.customerPhone}`}
                      className="rounded-2xl border border-emerald-300/30 px-4 py-3 text-center text-sm font-black text-emerald-100 transition hover:bg-emerald-300/10"
                    >
                      Anrufen
                    </a>
                  )}

                  {lead.companyId && (
                    <Link
                      href={`/firmen/${lead.companyId}`}
                      className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                    >
                      Firmenprofil öffnen
                    </Link>
                  )}

                  <Link
                    href="/admin/firmen"
                    className="rounded-2xl border border-cyan-300/30 px-4 py-3 text-center text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10"
                  >
                    Firmenverwaltung
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <DetailBox title="Firma" value={getLeadCompanyDisplayName(lead)} />
                <DetailBox title="Standort" value={getLeadCompanyLocationLine(lead)} />
                <DetailBox title="Kunde" value={lead.customerName} />
                <DetailBox
                  title="E-Mail"
                  value={lead.customerEmail || "Nicht angegeben"}
                />
                <DetailBox
                  title="Telefon"
                  value={lead.customerPhone || "Nicht angegeben"}
                />
                <DetailBox title="Status" value={getLeadStatusLabel(lead.status)} />
                <DetailBox title="Eingang" value={formatDate(lead.createdAt)} />
                <DetailBox
                  title="Struktur"
                  value={getLeadCompanyRelationLabel(lead) || "Keine Verknüpfung"}
                />
              </div>

              {lead.sourceQuery && (
                <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                    Suchquelle
                  </p>

                  <p className="mt-3 break-words text-sm leading-7 text-slate-200">
                    {lead.sourceQuery}
                  </p>
                </section>
              )}

              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Nachricht
                </p>

                <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-300">
                  {lead.message}
                </p>
              </section>
            </div>
          </div>
        </aside>
      </div>
    </div>
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

function DetailBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-2 break-words text-sm text-slate-300">{value}</p>
    </div>
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
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300"
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
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-emerald-300"
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