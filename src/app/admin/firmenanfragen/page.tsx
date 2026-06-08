"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  canCompanyReceiveLeads,
  canCompanyUseAdvertising,
  canCompanyUsePartnerDashboard,
  getCompanyPlanLabel,
} from "@/data/plans";
import type { Company } from "@/types/company";
import type { CompanyInquiry } from "@/types/company-inquiry";

type DrawerMode = "closed" | "details";

type InboxView = "open" | "new" | "contacted" | "converted" | "rejected" | "all";

type PublishCompanyInquiryResponse = {
  company: Company;
  inquiry: CompanyInquiry;
};

type InquiryStatusOption = {
  value: string;
  label: string;
};

const inquiriesPerPage = 25;

const inquiryStatusOptions: InquiryStatusOption[] = [
  {
    value: "new",
    label: "Neu",
  },
  {
    value: "contacted",
    label: "Kontaktiert",
  },
  {
    value: "converted",
    label: "Angenommen",
  },
  {
    value: "rejected",
    label: "Abgelehnt",
  },
];

const inboxViews: {
  value: InboxView;
  label: string;
  description: string;
}[] = [
  {
    value: "open",
    label: "Offen",
    description: "Neu + kontaktiert",
  },
  {
    value: "new",
    label: "Neu",
    description: "Noch nicht bearbeitet",
  },
  {
    value: "contacted",
    label: "Kontaktiert",
    description: "In Abklärung",
  },
  {
    value: "converted",
    label: "Angenommen",
    description: "Bereits in Verwaltung",
  },
  {
    value: "rejected",
    label: "Abgelehnt",
    description: "Nicht übernehmen",
  },
  {
    value: "all",
    label: "Alle",
    description: "Gesamtes Archiv",
  },
];

const planFilterOptions = [
  {
    value: "",
    label: "Alle Pakete",
  },
  {
    value: "pilot",
    label: "Pilot",
  },
  {
    value: "starter",
    label: "Starter",
  },
  {
    value: "pro",
    label: "Pro",
  },
  {
    value: "premium",
    label: "Premium",
  },
];

function getInquiryStatusLabel(status: string) {
  if (status === "new") {
    return "Neu";
  }

  if (status === "contacted") {
    return "Kontaktiert";
  }

  if (status === "converted") {
    return "Angenommen";
  }

  if (status === "rejected") {
    return "Abgelehnt";
  }

  return status;
}

function getInquiryStatusClassName(status: string) {
  if (status === "new") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "contacted") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "converted") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "rejected") {
    return "border-red-300/30 bg-red-300/10 text-red-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-300";
}

function getPlanClassName(plan: string | undefined) {
  if (plan === "starter") {
    return "border-blue-300/30 bg-blue-300/10 text-blue-100";
  }

  if (plan === "pro") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (plan === "premium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-300";
}

function getStatusRank(status: string) {
  if (status === "new") {
    return 1;
  }

  if (status === "contacted") {
    return 2;
  }

  if (status === "converted") {
    return 3;
  }

  if (status === "rejected") {
    return 4;
  }

  return 5;
}

function hasInquiryAd(inquiry: CompanyInquiry) {
  return Boolean(
    (inquiry.adTitle || "").trim() ||
      (inquiry.adDescription || "").trim() ||
      (inquiry.adCta || "").trim()
  );
}

function getPartnerPath(company: Company) {
  if (!canCompanyUsePartnerDashboard(company.plan)) {
    return "";
  }

  if (!company.accessToken) {
    return "";
  }

  return `/partner/${company.accessToken}`;
}

function getPublishSuccessMessage(company: Company) {
  const partnerPath = getPartnerPath(company);

  if (partnerPath) {
    return `Firma "${company.name}" wurde angenommen und in der Firmenverwaltung erstellt. Partner-Link: ${partnerPath}`;
  }

  return `Firma "${company.name}" wurde angenommen und in der Firmenverwaltung erstellt.`;
}

function getInquirySearchText(inquiry: CompanyInquiry) {
  return [
    inquiry.companyName,
    inquiry.contactName,
    inquiry.email,
    inquiry.phone,
    inquiry.website,
    inquiry.city,
    inquiry.desiredPlan,
    inquiry.mainCategory,
    inquiry.subCategory,
    inquiry.description,
    inquiry.message,
    inquiry.adTitle,
    inquiry.adDescription,
    inquiry.adCta,
    ...inquiry.subCategories,
    ...inquiry.tags,
    ...inquiry.searchTerms,
  ]
    .join(" ")
    .toLowerCase();
}

function matchesInboxView(inquiry: CompanyInquiry, view: InboxView) {
  if (view === "open") {
    return inquiry.status === "new" || inquiry.status === "contacted";
  }

  if (view === "all") {
    return true;
  }

  return inquiry.status === view;
}

export default function AdminCompanyInquiriesPage() {
  const [companyInquiries, setCompanyInquiries] = useState<CompanyInquiry[]>(
    []
  );

  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    null
  );

  const [selectedInboxView, setSelectedInboxView] =
    useState<InboxView>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [latestPublishedCompany, setLatestPublishedCompany] =
    useState<Company | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(
    null
  );
  const [publishingInquiryId, setPublishingInquiryId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadCompanyInquiries();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlan, selectedInboxView]);

  const selectedInquiry = useMemo(() => {
    if (!selectedInquiryId) {
      return null;
    }

    return (
      companyInquiries.find((inquiry) => inquiry.id === selectedInquiryId) ??
      null
    );
  }, [companyInquiries, selectedInquiryId]);

  const newCompanyInquiries = useMemo(() => {
    return companyInquiries.filter((inquiry) => inquiry.status === "new");
  }, [companyInquiries]);

  const contactedCompanyInquiries = useMemo(() => {
    return companyInquiries.filter((inquiry) => inquiry.status === "contacted");
  }, [companyInquiries]);

  const convertedCompanyInquiries = useMemo(() => {
    return companyInquiries.filter((inquiry) => inquiry.status === "converted");
  }, [companyInquiries]);

  const rejectedCompanyInquiries = useMemo(() => {
    return companyInquiries.filter((inquiry) => inquiry.status === "rejected");
  }, [companyInquiries]);

  const openCompanyInquiries = useMemo(() => {
    return companyInquiries.filter(
      (inquiry) => inquiry.status === "new" || inquiry.status === "contacted"
    );
  }, [companyInquiries]);

  const filteredInquiries = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return companyInquiries
      .filter((inquiry) => {
        const matchesSearch =
          !normalizedSearchQuery ||
          getInquirySearchText(inquiry).includes(normalizedSearchQuery);

        const matchesPlan =
          !selectedPlan || inquiry.desiredPlan === selectedPlan;

        return (
          matchesSearch &&
          matchesPlan &&
          matchesInboxView(inquiry, selectedInboxView)
        );
      })
      .sort((firstInquiry, secondInquiry) => {
        const statusDifference =
          getStatusRank(firstInquiry.status) -
          getStatusRank(secondInquiry.status);

        if (statusDifference !== 0) {
          return statusDifference;
        }

        return (
          new Date(secondInquiry.createdAt).getTime() -
          new Date(firstInquiry.createdAt).getTime()
        );
      });
  }, [companyInquiries, searchQuery, selectedPlan, selectedInboxView]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredInquiries.length / inquiriesPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, pageCount);

  const paginatedInquiries = filteredInquiries.slice(
    (safeCurrentPage - 1) * inquiriesPerPage,
    safeCurrentPage * inquiriesPerPage
  );

  const hasActiveFilters =
    searchQuery || selectedPlan || selectedInboxView !== "open";

  async function loadCompanyInquiries() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/company-inquiries", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Firmenanfragen konnten nicht geladen werden.");
      }

      const data = (await response.json()) as CompanyInquiry[];
      setCompanyInquiries(data);
    } catch {
      setErrorMessage(
        "Die Firmenanfragen konnten nicht aus der Datenbank geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function updateCompanyInquiryStatus(inquiryId: string, status: string) {
    try {
      setUpdatingInquiryId(inquiryId);
      setSuccessMessage("");
      setErrorMessage("");
      setLatestPublishedCompany(null);

      const response = await fetch(`/api/company-inquiries/${inquiryId}`, {
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
          errorData?.message ||
            "Status der Firmenanfrage konnte nicht geändert werden."
        );
      }

      const updatedInquiry = (await response.json()) as CompanyInquiry;

      setCompanyInquiries((currentInquiries) =>
        currentInquiries.map((inquiry) =>
          inquiry.id === updatedInquiry.id ? updatedInquiry : inquiry
        )
      );

      setSuccessMessage("Status der Anfrage wurde aktualisiert.");

      if (status === "rejected" || status === "converted") {
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
          "Beim Ändern des Anfrage-Status ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setUpdatingInquiryId(null);
    }
  }

  async function publishCompanyInquiry(inquiryId: string) {
    const confirmed = window.confirm(
      "Möchtest du diese Firmenanfrage annehmen und daraus eine Firma in der Verwaltung erstellen?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setPublishingInquiryId(inquiryId);
      setSuccessMessage("");
      setErrorMessage("");
      setLatestPublishedCompany(null);

      const response = await fetch(
        `/api/company-inquiries/${inquiryId}/publish`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            "Firmenanfrage konnte nicht angenommen werden."
        );
      }

      const data = (await response.json()) as PublishCompanyInquiryResponse;

      setCompanyInquiries((currentInquiries) =>
        currentInquiries.map((inquiry) =>
          inquiry.id === data.inquiry.id ? data.inquiry : inquiry
        )
      );

      setLatestPublishedCompany(data.company);
      setSuccessMessage(getPublishSuccessMessage(data.company));
      closeDrawer();

      setTimeout(() => {
        setSuccessMessage("");
      }, 7000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Annehmen der Firmenanfrage ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setPublishingInquiryId(null);
    }
  }

  function openDetailsDrawer(inquiry: CompanyInquiry) {
    setSelectedInquiryId(inquiry.id);
    setDrawerMode("details");
    setSuccessMessage("");
    setErrorMessage("");
    setLatestPublishedCompany(null);
  }

  function closeDrawer() {
    setDrawerMode("closed");
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedPlan("");
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
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Firmen-Inbox
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Anfragen{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              entscheiden
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Hier werden nur Firmenanfragen geprüft. Nach dem Annehmen wird die
            Firma erstellt und danach unter Firmen verwaltet.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/firmen"
            className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
          >
            Firmenverwaltung
          </Link>

          <button
            type="button"
            onClick={loadCompanyInquiries}
            disabled={isLoading}
            className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Lädt..." : "Aktualisieren"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <CompactMetric
          label="Offen"
          value={openCompanyInquiries.length}
          variant="cyan"
        />
        <CompactMetric
          label="Neu"
          value={newCompanyInquiries.length}
          variant="emerald"
        />
        <CompactMetric
          label="Kontaktiert"
          value={contactedCompanyInquiries.length}
          variant="amber"
        />
        <CompactMetric
          label="Angenommen"
          value={convertedCompanyInquiries.length}
          variant="cyan"
        />
        <CompactMetric
          label="Abgelehnt"
          value={rejectedCompanyInquiries.length}
          variant="red"
        />
      </div>

      {successMessage && (
        <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
          <p>{successMessage}</p>

          {latestPublishedCompany && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/firmen"
                className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Zur Firmenverwaltung
              </Link>

              <Link
                href={`/firmen/${latestPublishedCompany.id}`}
                className="rounded-2xl border border-emerald-300/30 px-4 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/10"
              >
                Öffentlich ansehen
              </Link>
            </div>
          )}
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
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Arbeitsliste
            </p>

            <h2 className="mt-2 text-3xl font-black">Offene Entscheidungen</h2>

            <p className="mt-2 text-sm text-slate-400">
              Standardmässig siehst du nur offene Anfragen. Angenommene Firmen
              verschwinden aus dieser Arbeitsliste.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Zur offenen Inbox
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {inboxViews.map((view) => {
            const isActive = selectedInboxView === view.value;

            return (
              <button
                key={view.value}
                type="button"
                onClick={() => setSelectedInboxView(view.value)}
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
            placeholder="Firma, Kontakt, Ort, Kategorie, E-Mail..."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[16rem_1fr]">
            <SelectField
              label="Paket"
              value={selectedPlan}
              onChange={setSelectedPlan}
              options={planFilterOptions}
            />

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
              Anfrage = nur prüfen, kontaktieren, annehmen oder ablehnen. Nach
              dem Annehmen erfolgt die weitere Bearbeitung in der
              Firmenverwaltung.
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 md:flex-row md:items-center">
          <p>
            <span className="font-black text-white">
              {filteredInquiries.length}
            </span>{" "}
            Anfragen in dieser Ansicht.
          </p>

          <p className="text-slate-500">
            Seite {safeCurrentPage} von {pageCount} · {inquiriesPerPage} pro
            Seite
          </p>
        </div>

        {isLoading && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Firmenanfragen werden geladen...
          </div>
        )}

        {!isLoading && companyInquiries.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Noch keine Firmenanfragen gespeichert.
          </div>
        )}

        {!isLoading &&
          companyInquiries.length > 0 &&
          filteredInquiries.length === 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
              In dieser Ansicht gibt es aktuell keine Anfrage.
            </div>
          )}

        {!isLoading && paginatedInquiries.length > 0 && (
          <div className="mt-5 grid gap-3">
            {paginatedInquiries.map((inquiry) => {
              const isUpdating = updatingInquiryId === inquiry.id;
              const isPublishing = publishingInquiryId === inquiry.id;
              const advertisingAllowed = canCompanyUseAdvertising(
                inquiry.desiredPlan
              );
              const leadsAllowed = canCompanyReceiveLeads(inquiry.desiredPlan);
              const partnerDashboardAllowed = canCompanyUsePartnerDashboard(
                inquiry.desiredPlan
              );
              const inquiryHasAd = hasInquiryAd(inquiry);
              const isClosed =
                inquiry.status === "converted" || inquiry.status === "rejected";

              return (
                <article
                  key={inquiry.id}
                  className={`rounded-3xl border p-4 transition ${
                    inquiry.status === "new"
                      ? "border-emerald-300/20 bg-emerald-300/10"
                      : inquiry.status === "contacted"
                        ? "border-amber-300/20 bg-amber-300/10"
                        : inquiry.status === "converted"
                          ? "border-cyan-300/20 bg-cyan-300/10"
                          : inquiry.status === "rejected"
                            ? "border-red-300/20 bg-red-300/10"
                            : "border-white/10 bg-slate-950/45"
                  }`}
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_auto] xl:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDetailsDrawer(inquiry)}
                          className="break-words text-left text-xl font-black text-white transition hover:text-cyan-100"
                        >
                          {inquiry.companyName}
                        </button>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getInquiryStatusClassName(
                            inquiry.status
                          )}`}
                        >
                          {getInquiryStatusLabel(inquiry.status)}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getPlanClassName(
                            inquiry.desiredPlan
                          )}`}
                        >
                          {getCompanyPlanLabel(inquiry.desiredPlan)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-300">
                        {inquiry.city} ·{" "}
                        {inquiry.mainCategory || "Keine Kategorie"} ·{" "}
                        {inquiry.subCategory || "Keine Unterkategorie"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {leadsAllowed && <TinyDot label="Leads" />}
                        {partnerDashboardAllowed && (
                          <TinyDot label="Dashboard" />
                        )}
                        {advertisingAllowed && inquiryHasAd && (
                          <TinyDot label="Werbung" />
                        )}
                        {!partnerDashboardAllowed && (
                          <TinyDot label="Starter" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 text-sm text-slate-300">
                      <p className="truncate font-bold text-white">
                        {inquiry.contactName}
                      </p>

                      <p className="mt-1 truncate text-slate-400">
                        {inquiry.email}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Eingang: {formatDate(inquiry.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => openDetailsDrawer(inquiry)}
                        className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                      >
                        Details
                      </button>

                      <a
                        href={`mailto:${inquiry.email}`}
                        className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                      >
                        Kontakt
                      </a>

                      {inquiry.status === "new" && (
                        <button
                          type="button"
                          disabled={isUpdating || isPublishing}
                          onClick={() =>
                            updateCompanyInquiryStatus(
                              inquiry.id,
                              "contacted"
                            )
                          }
                          className="rounded-xl border border-amber-300/30 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Kontaktiert
                        </button>
                      )}

                      {!isClosed && (
                        <>
                          <button
                            type="button"
                            disabled={isPublishing}
                            onClick={() => publishCompanyInquiry(inquiry.id)}
                            className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPublishing ? "Erstellt..." : "Annehmen"}
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating || isPublishing}
                            onClick={() =>
                              updateCompanyInquiryStatus(
                                inquiry.id,
                                "rejected"
                              )
                            }
                            className="rounded-xl border border-red-400/30 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Ablehnen
                          </button>
                        </>
                      )}

                      {inquiry.status === "converted" && (
                        <Link
                          href="/admin/firmen"
                          className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10"
                        >
                          In Verwaltung
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && filteredInquiries.length > inquiriesPerPage && (
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

      <CompanyInquiryDrawer
        mode={drawerMode}
        inquiry={selectedInquiry}
        updatingInquiryId={updatingInquiryId}
        publishingInquiryId={publishingInquiryId}
        onClose={closeDrawer}
        onUpdateStatus={updateCompanyInquiryStatus}
        onPublish={publishCompanyInquiry}
        formatDate={formatDate}
      />
    </section>
  );
}

function CompanyInquiryDrawer({
  mode,
  inquiry,
  updatingInquiryId,
  publishingInquiryId,
  onClose,
  onUpdateStatus,
  onPublish,
  formatDate,
}: {
  mode: DrawerMode;
  inquiry: CompanyInquiry | null;
  updatingInquiryId: string | null;
  publishingInquiryId: string | null;
  onClose: () => void;
  onUpdateStatus: (inquiryId: string, status: string) => void;
  onPublish: (inquiryId: string) => void;
  formatDate: (dateValue: string) => string;
}) {
  if (mode === "closed" || !inquiry) {
    return null;
  }

  const advertisingAllowed = canCompanyUseAdvertising(inquiry.desiredPlan);
  const leadsAllowed = canCompanyReceiveLeads(inquiry.desiredPlan);
  const partnerDashboardAllowed = canCompanyUsePartnerDashboard(
    inquiry.desiredPlan
  );
  const inquiryHasAd = hasInquiryAd(inquiry);
  const isUpdating = updatingInquiryId === inquiry.id;
  const isPublishing = publishingInquiryId === inquiry.id;
  const isClosed =
    inquiry.status === "converted" || inquiry.status === "rejected";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm">
      <div className="flex min-h-screen justify-end">
        <aside className="h-screen w-full max-w-5xl overflow-y-auto border-l border-white/10 bg-slate-950 p-5 shadow-2xl shadow-slate-950/50 md:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Anfrage prüfen
              </p>

              <h2 className="mt-2 break-words text-4xl font-black tracking-tight">
                {inquiry.companyName}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                Eingegangen am {formatDate(inquiry.createdAt)} von{" "}
                {inquiry.contactName}. Diese Ansicht ist nur für die
                Entscheidung gedacht.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Schliessen
            </button>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[20rem_1fr]">
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Entscheidung
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getInquiryStatusClassName(
                      inquiry.status
                    )}`}
                  >
                    {getInquiryStatusLabel(inquiry.status)}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getPlanClassName(
                      inquiry.desiredPlan
                    )}`}
                  >
                    {getCompanyPlanLabel(inquiry.desiredPlan)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {inquiry.status === "converted" && (
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
                      Diese Anfrage wurde angenommen. Änderungen erfolgen jetzt
                      in der Firmenverwaltung.
                    </div>
                  )}

                  {inquiry.status === "rejected" && (
                    <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-black text-red-200">
                      Diese Anfrage wurde abgelehnt.
                    </div>
                  )}

                  {!isClosed && (
                    <>
                      <button
                        type="button"
                        disabled={isPublishing}
                        onClick={() => onPublish(inquiry.id)}
                        className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPublishing
                          ? "Firma wird erstellt..."
                          : "Annehmen & Firma erstellen"}
                      </button>

                      {inquiry.status === "new" && (
                        <button
                          type="button"
                          disabled={isUpdating || isPublishing}
                          onClick={() =>
                            onUpdateStatus(inquiry.id, "contacted")
                          }
                          className="rounded-2xl border border-amber-300/30 px-4 py-3 text-sm font-black text-amber-100 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Als kontaktiert markieren
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isUpdating || isPublishing}
                        onClick={() => onUpdateStatus(inquiry.id, "rejected")}
                        className="rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Anfrage ablehnen
                      </button>
                    </>
                  )}

                  {inquiry.status === "converted" && (
                    <Link
                      href="/admin/firmen"
                      className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
                    >
                      Zur Firmenverwaltung
                    </Link>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Kontakt
                </p>

                <div className="mt-4 grid gap-3">
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    E-Mail senden
                  </a>

                  {inquiry.phone && (
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="rounded-2xl border border-cyan-300/30 px-4 py-3 text-center text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10"
                    >
                      Anrufen
                    </a>
                  )}

                  {inquiry.website && (
                    <a
                      href={inquiry.website}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                    >
                      Website öffnen
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Beim Annehmen
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {leadsAllowed && <MiniBadge label="Leads" />}
                  {partnerDashboardAllowed && <MiniBadge label="Dashboard" />}
                  {advertisingAllowed && <MiniBadge label="Werbung" />}
                  {!partnerDashboardAllowed && <MiniBadge label="Starter" />}
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Nach dem Annehmen wird daraus ein Firmeneintrag. Ab dann wird
                  die Firma nur noch unter /admin/firmen bearbeitet.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <DetailBox title="Kontaktperson" value={inquiry.contactName} />
                <DetailBox title="Stadt" value={inquiry.city} />
                <DetailBox title="E-Mail" value={inquiry.email} />
                <DetailBox
                  title="Telefon"
                  value={inquiry.phone || "Nicht angegeben"}
                />
                <DetailBox
                  title="Website"
                  value={inquiry.website || "Nicht angegeben"}
                />
                <DetailBox
                  title="Gewünschtes Paket"
                  value={getCompanyPlanLabel(inquiry.desiredPlan)}
                />
              </div>

              <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                  Eingereichte Angaben
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <DetailBox
                    title="Hauptkategorie"
                    value={inquiry.mainCategory || "Nicht angegeben"}
                  />

                  <DetailBox
                    title="Unterkategorie"
                    value={inquiry.subCategory || "Nicht angegeben"}
                  />
                </div>

                {inquiry.subCategories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {inquiry.subCategories.map((subCategory) => (
                      <span
                        key={subCategory}
                        className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100"
                      >
                        {subCategory}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Beschreibung
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-200">
                    {inquiry.description || "Nicht angegeben"}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Suchbegriffe
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {inquiry.tags.length > 0 ? (
                      inquiry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">
                        Keine Suchbegriffe angegeben.
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {advertisingAllowed && inquiryHasAd && (
                <section className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-amber-200">
                    Eingereichte Werbeidee
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    {inquiry.adTitle || "Aktuelles Angebot"}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {inquiry.adDescription || "Kein Werbetext angegeben."}
                  </p>

                  <p className="mt-4 text-sm font-black text-amber-100">
                    Button: {inquiry.adCta || "Mehr erfahren"}
                  </p>
                </section>
              )}

              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Nachricht an Locario
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-200">
                  {inquiry.message}
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

function TinyDot({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[0.65rem] font-black text-cyan-100">
      {label}
    </span>
  );
}

function MiniBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
      {label}
    </span>
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