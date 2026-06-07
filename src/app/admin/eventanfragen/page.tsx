"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getEventPlanLabel,
  getEventPlanPrice,
} from "@/data/event-plans";
import type { EventInquiry } from "@/types/event-inquiry";
import type { LocarioEvent } from "@/types/event";

const statusOptions = [
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

const planOptions = [
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

function formatDateTime(value: string) {
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

function formatDate(value: string) {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(
    null
  );
  const [deletingInquiryId, setDeletingInquiryId] = useState<string | null>(
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

  const filteredInquiries = useMemo(() => {
    const normalizedSearchQuery = normalizeText(searchQuery);

    return eventInquiries.filter((inquiry) => {
      const matchesSearch =
        !normalizedSearchQuery ||
        getInquirySearchText(inquiry).includes(normalizedSearchQuery);

      const matchesStatus =
        !selectedStatusFilter || inquiry.status === selectedStatusFilter;

      const matchesPlan =
        !selectedPlanFilter || inquiry.desiredPlan === selectedPlanFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [
    eventInquiries,
    searchQuery,
    selectedStatusFilter,
    selectedPlanFilter,
  ]);

  const newInquiries = eventInquiries.filter(
    (inquiry) => inquiry.status === "new"
  );

  const contactedInquiries = eventInquiries.filter(
    (inquiry) => inquiry.status === "contacted"
  );

  const approvedInquiries = eventInquiries.filter(
    (inquiry) => inquiry.status === "approved"
  );

  const premiumInquiries = eventInquiries.filter(
    (inquiry) => inquiry.desiredPlan === "premium"
  );

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

      setSuccessMessage("Status wurde aktualisiert.");

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
        "Dieses Event kann noch nicht erstellt werden, weil kein Eventdatum angegeben wurde. Erstelle es manuell unter /admin/events oder bitte den Veranstalter um ein Datum."
      );
      return;
    }

    const confirmed = window.confirm(
      `Möchtest du aus "${inquiry.eventTitle}" ein öffentliches Event erstellen?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCreatingEventInquiryId(inquiry.id);
      setSuccessMessage("");
      setErrorMessage("");

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
          address: "",

          description: inquiry.description,

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
        setSuccessMessage(
          `Event wurde erstellt und veröffentlicht: ${createdEvent.title}`
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Erstellen des Events ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setCreatingEventInquiryId(null);
    }
  }

  async function deleteInquiry(id: string, eventTitle: string) {
    const confirmed = window.confirm(
      `Möchtest du die Event-Anfrage "${eventTitle}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingInquiryId(id);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await fetch(`/api/event-inquiries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Event-Anfrage konnte nicht gelöscht werden."
        );
      }

      setEventInquiries((currentInquiries) =>
        currentInquiries.filter((inquiry) => inquiry.id !== id)
      );

      setSuccessMessage("Event-Anfrage wurde gelöscht.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Löschen der Event-Anfrage ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setDeletingInquiryId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            Event-Anfragen
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Event-Anfragen{" "}
            <span className="bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-transparent">
              verwalten
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Prüfe neue Event-Werbeanfragen, kontaktiere Veranstalter, ändere den
            Status oder erstelle daraus direkt ein öffentliches Event.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEventInquiries}
          disabled={isLoading}
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Lädt..." : "Aktualisieren"}
        </button>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Event-Anfragen"
          value={eventInquiries.length.toString()}
          description="Alle gespeicherten Anfragen"
        />

        <AdminStatCard
          title="Neu"
          value={newInquiries.length.toString()}
          description="Noch nicht bearbeitet"
        />

        <AdminStatCard
          title="Kontaktiert"
          value={contactedInquiries.length.toString()}
          description="In Bearbeitung"
        />

        <AdminStatCard
          title="Premium"
          value={premiumInquiries.length.toString()}
          description={`${approvedInquiries.length} angenommen`}
        />
      </div>

      {successMessage && (
        <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-amber-300">
              Übersicht
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Eingegangene Event-Anfragen
            </h2>

            <p className="mt-3 text-slate-400">
              Suche nach Event, Veranstalter, Ort, Kontaktperson oder Paket.
            </p>
          </div>

          <Link
            href="/admin/events"
            className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
          >
            Event manuell erstellen
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_13rem_13rem]">
          <InputField
            label="Event-Anfragen suchen"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Event, Veranstalter, Ort, Kontakt..."
          />

          <SelectField
            label="Status"
            value={selectedStatusFilter}
            onChange={setSelectedStatusFilter}
            options={[
              {
                value: "",
                label: "Alle Status",
              },
              ...statusOptions,
            ]}
          />

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
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
          <span className="font-black text-white">
            {filteredInquiries.length}
          </span>{" "}
          von{" "}
          <span className="font-black text-white">
            {eventInquiries.length}
          </span>{" "}
          Event-Anfragen werden angezeigt.
        </div>

        {isLoading && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
            Event-Anfragen werden geladen...
          </div>
        )}

        {!isLoading && eventInquiries.length === 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
            Noch keine Event-Anfragen vorhanden.
          </div>
        )}

        {!isLoading &&
          eventInquiries.length > 0 &&
          filteredInquiries.length === 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
              Keine Event-Anfrage passt zu deinem Filter.
            </div>
          )}

        {!isLoading && filteredInquiries.length > 0 && (
          <div className="mt-8 grid gap-5">
            {filteredInquiries.map((inquiry) => {
              const isCreatingEvent = creatingEventInquiryId === inquiry.id;
              const eventCanBeCreated = Boolean(inquiry.eventDate);

              return (
                <article
                  key={inquiry.id}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/20 transition hover:border-amber-300/30 hover:bg-white/[0.06]"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
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

                        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-slate-300">
                          {inquiry.city}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-slate-300">
                          {inquiry.category}
                        </span>
                      </div>

                      <h3 className="mt-4 break-words text-3xl font-black tracking-tight">
                        {inquiry.eventTitle}
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-slate-400">
                        Veranstalter: {inquiry.organizerName}
                      </p>

                      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <InfoBox title="Kontakt" value={inquiry.contactName} />

                        <InfoBox title="E-Mail" value={inquiry.email} />

                        <InfoBox
                          title="Telefon"
                          value={inquiry.phone || "Nicht angegeben"}
                        />

                        <InfoBox
                          title="Eventdatum"
                          value={formatDate(inquiry.eventDate)}
                        />
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <InfoBox
                          title="Location"
                          value={inquiry.locationName || "Nicht angegeben"}
                        />

                        <InfoBox
                          title="Website"
                          value={inquiry.website || "Nicht angegeben"}
                        />
                      </div>

                      {!eventCanBeCreated && (
                        <div className="mt-5 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 text-amber-100">
                          Dieses Event hat noch kein Eventdatum. Es kann erst
                          automatisch veröffentlicht werden, wenn ein Datum
                          vorhanden ist.
                        </div>
                      )}

                      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Beschreibung
                        </p>

                        <p className="mt-3 whitespace-pre-line break-words text-slate-300">
                          {inquiry.description}
                        </p>
                      </div>

                      <div className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                        <p className="text-xs font-black uppercase tracking-wide text-amber-100">
                          Nachricht an Locario
                        </p>

                        <p className="mt-3 whitespace-pre-line break-words text-slate-300">
                          {inquiry.message}
                        </p>
                      </div>

                      {inquiry.tags.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {inquiry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="mt-5 text-xs text-slate-500">
                        Eingegangen: {formatDateTime(inquiry.createdAt)} · Paket:{" "}
                        {getEventPlanPrice(inquiry.desiredPlan)}
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:w-56">
                      <SelectField
                        label="Status ändern"
                        value={inquiry.status}
                        onChange={(value) =>
                          updateInquiryStatus(inquiry.id, value)
                        }
                        options={statusOptions}
                        disabled={updatingInquiryId === inquiry.id}
                      />

                      <button
                        type="button"
                        onClick={() => createEventFromInquiry(inquiry)}
                        disabled={
                          isCreatingEvent ||
                          !eventCanBeCreated ||
                          inquiry.status === "approved"
                        }
                        className="rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCreatingEvent
                          ? "Wird erstellt..."
                          : inquiry.status === "approved"
                            ? "Bereits angenommen"
                            : "Annehmen & Event erstellen"}
                      </button>

                      <a
                        href={`mailto:${inquiry.email}`}
                        className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
                      >
                        E-Mail schreiben
                      </a>

                      {inquiry.phone && (
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-amber-300/30 hover:bg-white/10"
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

                      <Link
                        href="/admin/events"
                        className="rounded-2xl border border-cyan-300/30 px-4 py-3 text-center text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10"
                      >
                        Event manuell erstellen
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          deleteInquiry(inquiry.id, inquiry.eventTitle)
                        }
                        disabled={deletingInquiryId === inquiry.id}
                        className="rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingInquiryId === inquiry.id
                          ? "Löscht..."
                          : "Löschen"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
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

      <p className="mt-4 text-5xl font-black text-amber-200">{value}</p>

      <p className="mt-3 text-sm text-slate-300">{description}</p>
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
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

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

