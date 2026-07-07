"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getEventPlanLabel, getEventPlanPrice } from "@/data/event-plans";
import { getAutomaticEventSearchTerms } from "@/data/event-search-taxonomy";
import type { EventInquiry } from "@/types/event-inquiry";
import type { LocarioEvent } from "@/types/event";

type DrawerMode = "closed" | "details";

type InboxView =
  | "open"
  | "new"
  | "contacted"
  | "approved"
  | "rejected"
  | "all";

type StatusOption = {
  value: string;
  label: string;
};

type PlanOption = {
  value: string;
  label: string;
};

const inquiriesPerPage = 25;

const statusOptions: StatusOption[] = [
  {
    value: "new",
    label: "Neu",
  },
  {
    value: "contacted",
    label: "Kontaktiert",
  },
  {
    value: "approved",
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
    value: "approved",
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

const planOptions: PlanOption[] = [
  {
    value: "basic",
    label: "Event Basic",
  },
  {
    value: "highlight",
    label: "Event Highlight",
  },
  {
    value: "premium",
    label: "Event Premium",
  },
];

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function getInquirySearchText(inquiry: EventInquiry) {
  return normalizeText(
    [
      inquiry.eventTitle,
      inquiry.organizerName,
      inquiry.contactName,
      inquiry.email,
      inquiry.phone,
      inquiry.website,
      inquiry.city,
      inquiry.address,
      inquiry.desiredPlan,
      inquiry.category,
      inquiry.locationName,
      inquiry.description,
      inquiry.message,
      ...inquiry.tags,
    ].join(" ")
  );
}

function getStatusLabel(status: string) {
  const matchingStatus = statusOptions.find((item) => item.value === status);

  return matchingStatus?.label || status;
}

function getStatusClassName(status: string) {
  if (status === "approved") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "contacted") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "rejected") {
    return "border-red-400/30 bg-red-400/10 text-red-200";
  }

  return "border-amber-300/30 bg-amber-300/10 text-amber-100";
}

function getPlanClassName(plan: string) {
  if (plan === "premium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (plan === "highlight") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
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

  if (status === "approved") {
    return 3;
  }

  if (status === "rejected") {
    return 4;
  }

  return 5;
}

function matchesInboxView(inquiry: EventInquiry, view: InboxView) {
  if (view === "open") {
    return inquiry.status === "new" || inquiry.status === "contacted";
  }

  if (view === "all") {
    return true;
  }

  return inquiry.status === view;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Nicht angegeben";
  }

  return new Date(value).toLocaleString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Nicht angegeben";
  }

  return new Date(value).toLocaleDateString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminEventInquiriesPage() {
  const [eventInquiries, setEventInquiries] = useState<EventInquiry[]>([]);

  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    null
  );

  const [selectedInboxView, setSelectedInboxView] =
    useState<InboxView>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [latestPublishedEvent, setLatestPublishedEvent] =
    useState<LocarioEvent | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(
    null
  );
  const [creatingEventInquiryId, setCreatingEventInquiryId] = useState<
    string | null
  >(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadEventInquiries();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlanFilter, selectedInboxView]);

  const selectedInquiry = useMemo(() => {
    if (!selectedInquiryId) {
      return null;
    }

    return (
      eventInquiries.find((inquiry) => inquiry.id === selectedInquiryId) ?? null
    );
  }, [eventInquiries, selectedInquiryId]);

  const filteredInquiries = useMemo(() => {
    const normalizedSearchQuery = normalizeText(searchQuery);

    return eventInquiries
      .filter((inquiry) => {
        const matchesSearch =
          !normalizedSearchQuery ||
          getInquirySearchText(inquiry).includes(normalizedSearchQuery);

        const matchesPlan =
          !selectedPlanFilter || inquiry.desiredPlan === selectedPlanFilter;

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
  }, [eventInquiries, searchQuery, selectedPlanFilter, selectedInboxView]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredInquiries.length / inquiriesPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, pageCount);

  const paginatedInquiries = filteredInquiries.slice(
    (safeCurrentPage - 1) * inquiriesPerPage,
    safeCurrentPage * inquiriesPerPage
  );

  const newInquiries = eventInquiries.filter(
    (inquiry) => inquiry.status === "new"
  );

  const contactedInquiries = eventInquiries.filter(
    (inquiry) => inquiry.status === "contacted"
  );

  const approvedInquiries = eventInquiries.filter(
    (inquiry) => inquiry.status === "approved"
  );

  const rejectedInquiries = eventInquiries.filter(
    (inquiry) => inquiry.status === "rejected"
  );

  const openInquiries = eventInquiries.filter(
    (inquiry) => inquiry.status === "new" || inquiry.status === "contacted"
  );

  const premiumInquiries = eventInquiries.filter(
    (inquiry) => inquiry.desiredPlan === "premium"
  );

  const hasActiveFilters =
    searchQuery || selectedPlanFilter || selectedInboxView !== "open";

  async function loadEventInquiries() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/event-inquiries", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Event-Anfragen konnten nicht geladen werden.");
      }

      const data = (await response.json()) as EventInquiry[];
      setEventInquiries(data);
    } catch {
      setErrorMessage(
        "Event-Anfragen konnten nicht aus der Datenbank geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function updateInquiryStatus(id: string, status: string) {
    try {
      setUpdatingInquiryId(id);
      setSuccessMessage("");
      setErrorMessage("");
      setLatestPublishedEvent(null);

      const response = await fetch(`/api/event-inquiries/${id}`, {
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
          errorData?.message || "Status konnte nicht aktualisiert werden."
        );
      }

      const updatedInquiry = (await response.json()) as EventInquiry;

      setEventInquiries((currentInquiries) =>
        currentInquiries.map((inquiry) =>
          inquiry.id === updatedInquiry.id ? updatedInquiry : inquiry
        )
      );

      setSuccessMessage("Status der Anfrage wurde aktualisiert.");

      if (status === "approved" || status === "rejected") {
        closeDrawer();
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return updatedInquiry;
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Aktualisieren des Status ist ein unbekannter Fehler passiert."
        );
      }

      return null;
    } finally {
      setUpdatingInquiryId(null);
    }
  }

  async function createEventFromInquiry(inquiry: EventInquiry) {
    if (!inquiry.eventDate) {
      setErrorMessage(
        "Dieses Event kann noch nicht angenommen werden, weil kein Eventdatum angegeben wurde. Kontaktiere zuerst den Veranstalter oder erstelle das Event später manuell unter Eventverwaltung."
      );
      return;
    }

    const confirmed = window.confirm(
      `Möchtest du "${inquiry.eventTitle}" annehmen und daraus ein Event in der Verwaltung erstellen?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCreatingEventInquiryId(inquiry.id);
      setSuccessMessage("");
      setErrorMessage("");
      setLatestPublishedEvent(null);

      const tags = inquiry.tags ?? [];
      const searchTerms = getAutomaticEventSearchTerms({
        category: inquiry.category || "Sonstiges",
        tags,
      });

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: inquiry.eventTitle,
          imageUrl: "",

          organizerName: inquiry.organizerName,
          category: inquiry.category || "Sonstiges",
          plan: inquiry.desiredPlan || "basic",

          city: inquiry.city,
          locationName: inquiry.locationName,
          address: inquiry.address || "",

          description: inquiry.description,

          tags,
          searchTerms,

          startsAt: inquiry.eventDate,
          endsAt: "",

          website: inquiry.website,
          ticketUrl: "",

          isActive: true,
          highlightUntil: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Event konnte nicht erstellt werden."
        );
      }

      const createdEvent = (await response.json()) as LocarioEvent;
      const updatedInquiry = await updateInquiryStatus(inquiry.id, "approved");

      if (updatedInquiry) {
        setLatestPublishedEvent(createdEvent);
        setSuccessMessage(
          `Event "${createdEvent.title}" wurde angenommen und in der Eventverwaltung erstellt.`
        );
        closeDrawer();

        setTimeout(() => {
          setSuccessMessage("");
        }, 7000);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Annehmen der Event-Anfrage ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setCreatingEventInquiryId(null);
    }
  }

  function openDetailsDrawer(inquiry: EventInquiry) {
    setSelectedInquiryId(inquiry.id);
    setDrawerMode("details");
    setSuccessMessage("");
    setErrorMessage("");
    setLatestPublishedEvent(null);
  }

  function closeDrawer() {
    setDrawerMode("closed");
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedPlanFilter("");
    setSelectedInboxView("open");
    setCurrentPage(1);
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            Event-Inbox
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Anfragen{" "}
            <span className="bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-transparent">
              entscheiden
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Hier werden nur Event-Anfragen geprüft. Nach dem Annehmen wird das
            Event erstellt und danach unter Events verwaltet.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/events"
            className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
          >
            Eventverwaltung
          </Link>

          <button
            type="button"
            onClick={loadEventInquiries}
            disabled={isLoading}
            className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Lädt..." : "Aktualisieren"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <CompactMetric label="Offen" value={openInquiries.length} />
        <CompactMetric label="Neu" value={newInquiries.length} variant="amber" />
        <CompactMetric
          label="Kontaktiert"
          value={contactedInquiries.length}
          variant="cyan"
        />
        <CompactMetric
          label="Angenommen"
          value={approvedInquiries.length}
          variant="emerald"
        />
        <CompactMetric
          label="Abgelehnt"
          value={rejectedInquiries.length}
          variant="red"
        />
        <CompactMetric
          label="Premium"
          value={premiumInquiries.length}
          variant="amber"
        />
      </div>

      {successMessage && (
        <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
          <p>{successMessage}</p>

          {latestPublishedEvent && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/events"
                className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Zur Eventverwaltung
              </Link>

              <Link
                href={`/events/${latestPublishedEvent.id}`}
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
            <p className="text-sm font-black uppercase tracking-wide text-amber-300">
              Arbeitsliste
            </p>

            <h2 className="mt-2 text-3xl font-black">Offene Entscheidungen</h2>

            <p className="mt-2 text-sm text-slate-400">
              Standardmässig siehst du nur offene Event-Anfragen. Angenommene
              Events verschwinden aus dieser Arbeitsliste.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10"
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
                    ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
                    : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-amber-300/30 hover:bg-white/[0.06]"
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
            placeholder="Event, Veranstalter, Ort, Adresse, Kontakt..."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[16rem_1fr]">
            <SelectField
              label="Paket"
              value={selectedPlanFilter}
              onChange={setSelectedPlanFilter}
              options={[
                {
                  value: "",
                  label: "Alle Pakete",
                },
                ...planOptions,
              ]}
            />

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
              Anfrage = nur prüfen, kontaktieren, annehmen oder ablehnen. Nach
              dem Annehmen erfolgt die weitere Bearbeitung in der
              Eventverwaltung.
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
            Event-Anfragen werden geladen...
          </div>
        )}

        {!isLoading && eventInquiries.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Noch keine Event-Anfragen vorhanden.
          </div>
        )}

        {!isLoading &&
          eventInquiries.length > 0 &&
          filteredInquiries.length === 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
              In dieser Ansicht gibt es aktuell keine Anfrage.
            </div>
          )}

        {!isLoading && paginatedInquiries.length > 0 && (
          <div className="mt-5 grid gap-3">
            {paginatedInquiries.map((inquiry) => {
              const isCreatingEvent = creatingEventInquiryId === inquiry.id;
              const isUpdating = updatingInquiryId === inquiry.id;
              const eventCanBeCreated = Boolean(inquiry.eventDate);
              const isClosed =
                inquiry.status === "approved" || inquiry.status === "rejected";

              return (
                <article
                  key={inquiry.id}
                  className={`rounded-3xl border p-4 transition ${
                    inquiry.status === "new"
                      ? "border-amber-300/20 bg-amber-300/10"
                      : inquiry.status === "contacted"
                        ? "border-cyan-300/20 bg-cyan-300/10"
                        : inquiry.status === "approved"
                          ? "border-emerald-300/20 bg-emerald-300/10"
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
                          className="break-words text-left text-xl font-black text-white transition hover:text-amber-100"
                        >
                          {inquiry.eventTitle}
                        </button>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClassName(
                            inquiry.status
                          )}`}
                        >
                          {getStatusLabel(inquiry.status)}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getPlanClassName(
                            inquiry.desiredPlan
                          )}`}
                        >
                          {getEventPlanLabel(inquiry.desiredPlan)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-300">
                        {inquiry.city}
                        {inquiry.address ? ` · ${inquiry.address}` : ""} ·{" "}
                        {inquiry.category} · {formatDate(inquiry.eventDate)}
                      </p>

                      {!eventCanBeCreated && !isClosed && (
                        <p className="mt-2 text-xs font-bold text-amber-100">
                          Kein Eventdatum vorhanden. Vor dem Annehmen zuerst
                          Kontakt aufnehmen.
                        </p>
                      )}
                    </div>

                    <div className="min-w-0 text-sm text-slate-300">
                      <p className="truncate font-bold text-white">
                        {inquiry.contactName}
                      </p>

                      <p className="mt-1 truncate text-slate-400">
                        {inquiry.email}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Eingang: {formatDateTime(inquiry.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => openDetailsDrawer(inquiry)}
                        className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-amber-300/30 hover:bg-white/10"
                      >
                        Details
                      </button>

                      <a
                        href={`mailto:${inquiry.email}`}
                        className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-amber-300/30 hover:bg-white/10"
                      >
                        Kontakt
                      </a>

                      {inquiry.status === "new" && (
                        <button
                          type="button"
                          disabled={isUpdating || isCreatingEvent}
                          onClick={() =>
                            updateInquiryStatus(inquiry.id, "contacted")
                          }
                          className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Kontaktiert
                        </button>
                      )}

                      {!isClosed && (
                        <>
                          <button
                            type="button"
                            onClick={() => createEventFromInquiry(inquiry)}
                            disabled={isCreatingEvent || !eventCanBeCreated}
                            className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCreatingEvent ? "Erstellt..." : "Annehmen"}
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating || isCreatingEvent}
                            onClick={() =>
                              updateInquiryStatus(inquiry.id, "rejected")
                            }
                            className="rounded-xl border border-red-400/30 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Ablehnen
                          </button>
                        </>
                      )}

                      {inquiry.status === "approved" && (
                        <Link
                          href="/admin/events"
                          className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/10"
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
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Weiter
            </button>
          </div>
        )}
      </section>

      <EventInquiryDrawer
        mode={drawerMode}
        inquiry={selectedInquiry}
        updatingInquiryId={updatingInquiryId}
        creatingEventInquiryId={creatingEventInquiryId}
        onClose={closeDrawer}
        onUpdateStatus={updateInquiryStatus}
        onCreateEvent={createEventFromInquiry}
      />
    </section>
  );
}

function EventInquiryDrawer({
  mode,
  inquiry,
  updatingInquiryId,
  creatingEventInquiryId,
  onClose,
  onUpdateStatus,
  onCreateEvent,
}: {
  mode: DrawerMode;
  inquiry: EventInquiry | null;
  updatingInquiryId: string | null;
  creatingEventInquiryId: string | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onCreateEvent: (inquiry: EventInquiry) => void;
}) {
  if (mode === "closed" || !inquiry) {
    return null;
  }

  const isUpdating = updatingInquiryId === inquiry.id;
  const isCreatingEvent = creatingEventInquiryId === inquiry.id;
  const eventCanBeCreated = Boolean(inquiry.eventDate);
  const isClosed =
    inquiry.status === "approved" || inquiry.status === "rejected";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm">
      <div className="flex min-h-screen justify-end">
        <aside className="h-screen w-full max-w-5xl overflow-y-auto border-l border-white/10 bg-slate-950 p-5 shadow-2xl shadow-slate-950/50 md:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-amber-300">
                Anfrage prüfen
              </p>

              <h2 className="mt-2 break-words text-4xl font-black tracking-tight">
                {inquiry.eventTitle}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                Eingegangen am {formatDateTime(inquiry.createdAt)} von{" "}
                {inquiry.contactName}. Diese Ansicht ist nur für die
                Entscheidung gedacht.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10"
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
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClassName(
                      inquiry.status
                    )}`}
                  >
                    {getStatusLabel(inquiry.status)}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getPlanClassName(
                      inquiry.desiredPlan
                    )}`}
                  >
                    {getEventPlanLabel(inquiry.desiredPlan)}
                  </span>
                </div>

                {!eventCanBeCreated && !isClosed && (
                  <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                    Dieses Event hat noch kein Eventdatum. Kontaktiere zuerst
                    den Veranstalter, bevor du es annimmst.
                  </div>
                )}

                <div className="mt-5 grid gap-3">
                  {inquiry.status === "approved" && (
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-black text-emerald-100">
                      Diese Anfrage wurde angenommen. Änderungen erfolgen jetzt
                      in der Eventverwaltung.
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
                        onClick={() => onCreateEvent(inquiry)}
                        disabled={isCreatingEvent || !eventCanBeCreated}
                        className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCreatingEvent
                          ? "Event wird erstellt..."
                          : "Annehmen & Event erstellen"}
                      </button>

                      {inquiry.status === "new" && (
                        <button
                          type="button"
                          disabled={isUpdating || isCreatingEvent}
                          onClick={() =>
                            onUpdateStatus(inquiry.id, "contacted")
                          }
                          className="rounded-2xl border border-cyan-300/30 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Als kontaktiert markieren
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isUpdating || isCreatingEvent}
                        onClick={() => onUpdateStatus(inquiry.id, "rejected")}
                        className="rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Anfrage ablehnen
                      </button>
                    </>
                  )}

                  {inquiry.status === "approved" && (
                    <Link
                      href="/admin/events"
                      className="rounded-2xl bg-emerald-300 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
                    >
                      Zur Eventverwaltung
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
                    className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10"
                  >
                    E-Mail schreiben
                  </a>

                  {inquiry.phone && (
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="rounded-2xl border border-amber-300/30 px-4 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-amber-300/10"
                    >
                      Anrufen
                    </a>
                  )}

                  {inquiry.website && (
                    <a
                      href={inquiry.website}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10"
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

                <p className="mt-3 text-2xl font-black text-white">
                  {getEventPlanLabel(inquiry.desiredPlan)}
                </p>

                <p className="mt-2 text-sm font-black text-amber-100">
                  {getEventPlanPrice(inquiry.desiredPlan)}
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Nach dem Annehmen wird daraus ein Eventeintrag. Adresse,
                  Tags und Suchbegriffe werden direkt übernommen.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <DetailBox title="Veranstalter" value={inquiry.organizerName} />
                <DetailBox title="Kategorie" value={inquiry.category} />
                <DetailBox title="Kontaktperson" value={inquiry.contactName} />
                <DetailBox title="E-Mail" value={inquiry.email} />
                <DetailBox
                  title="Telefon"
                  value={inquiry.phone || "Nicht angegeben"}
                />
                <DetailBox title="Stadt" value={inquiry.city} />
                <DetailBox
                  title="Adresse"
                  value={inquiry.address || "Nicht angegeben"}
                />
                <DetailBox
                  title="Location"
                  value={inquiry.locationName || "Nicht angegeben"}
                />
                <DetailBox
                  title="Eventdatum"
                  value={formatDateTime(inquiry.eventDate)}
                />
                <DetailBox
                  title="Website"
                  value={inquiry.website || "Nicht angegeben"}
                />
                <DetailBox
                  title="Eingang"
                  value={formatDateTime(inquiry.createdAt)}
                />
              </div>

              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Beschreibung
                </p>

                <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-300">
                  {inquiry.description}
                </p>
              </section>

              <section className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-amber-100">
                  Nachricht an Locario
                </p>

                <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-300">
                  {inquiry.message}
                </p>
              </section>

              {inquiry.tags.length > 0 && (
                <section>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Tags / Suchbasis
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {inquiry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
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
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
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
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-300"
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