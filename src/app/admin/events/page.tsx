"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  eventPlans,
  getEventPlanDescription,
  getEventPlanLabel,
  getEventPlanPrice,
  getEventPlanRank,
} from "@/data/event-plans";
import {
  getAutomaticEventSearchTerms,
  getEventSearchSuggestions,
} from "@/data/event-search-taxonomy";
import type { LocarioEvent } from "@/types/event";

type DrawerMode = "closed" | "create" | "edit" | "details";

type EventForm = {
  title: string;
  imageUrl: string;

  organizerName: string;
  category: string;
  plan: string;

  city: string;
  locationName: string;
  address: string;

  description: string;

  tags: string;
  searchTerms: string;

  startsAt: string;
  endsAt: string;

  website: string;
  ticketUrl: string;

  isActive: boolean;
  highlightUntil: string;
};

const eventsPerPage = 25;

const eventCategories = [
  "Konzert",
  "Party",
  "Markt",
  "Sport",
  "Verein",
  "Gewerbe",
  "Familie",
  "Kultur",
  "Gastronomie",
  "Kurs",
  "Gesundheit",
  "Senioren",
  "Jugend",
  "Kirche",
  "Dorf",
  "Sonstiges",
];

const emptyForm: EventForm = {
  title: "",
  imageUrl: "",

  organizerName: "",
  category: "",
  plan: "basic",

  city: "",
  locationName: "",
  address: "",

  description: "",

  tags: "",
  searchTerms: "",

  startsAt: "",
  endsAt: "",

  website: "",
  ticketUrl: "",

  isActive: true,
  highlightUntil: "",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeTerm(value: string) {
  return normalizeText(value);
}

function normalizeKey(value: string) {
  return normalizeTerm(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSafeString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function getSafeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => getSafeString(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmedValue);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => getSafeString(item).trim())
          .filter(Boolean);
      }
    } catch {
      return trimmedValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function getFormTerms(value: string) {
  return value
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
}

function uniqueTerms(values: string[]) {
  const seenTerms = new Set<string>();
  const terms: string[] = [];

  values.forEach((value) => {
    const cleanedValue = value.trim();
    const normalizedValue = normalizeTerm(cleanedValue);

    if (!cleanedValue || seenTerms.has(normalizedValue)) {
      return;
    }

    seenTerms.add(normalizedValue);
    terms.push(cleanedValue);
  });

  return terms;
}

function termsToText(values: string[]) {
  return uniqueTerms(values).join(", ");
}

function getMergedTermsText(currentValue: string, termsToAdd: string[]) {
  return termsToText([...getFormTerms(currentValue), ...termsToAdd]);
}

function toInputDateTime(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Nicht gesetzt";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Nicht gesetzt";
  }

  return date.toLocaleString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function valueAlreadyContainsCity(value: string, city: string) {
  const normalizedValue = normalizeText(value);
  const normalizedCity = normalizeText(city);

  if (!normalizedValue || !normalizedCity) {
    return false;
  }

  return normalizedValue.includes(normalizedCity);
}

function getEventLocationLine(event: LocarioEvent) {
  const locationName = event.locationName?.trim() || "";
  const address = event.address?.trim() || "";
  const city = event.city?.trim() || "";

  const parts = [locationName, address];

  if (
    city &&
    !valueAlreadyContainsCity(locationName, city) &&
    !valueAlreadyContainsCity(address, city)
  ) {
    parts.push(city);
  }

  return parts.filter(Boolean).join(", ") || "Nicht angegeben";
}

function getExternalHref(value: string | null | undefined) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return "";
  }

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue;
  }

  return `https://${cleanValue}`;
}

function getEventSearchText(event: LocarioEvent) {
  return normalizeText(
    [
      event.title,
      event.organizerName,
      event.category,
      event.plan,
      event.city,
      event.locationName,
      event.address,
      getEventLocationLine(event),
      event.description,
      ...getSafeStringArray(event.tags),
      ...getSafeStringArray(event.searchTerms),
      event.website,
      event.ticketUrl,
    ].join(" ")
  );
}

function eventHasImage(event: LocarioEvent) {
  return Boolean(event.imageUrl && event.imageUrl.trim());
}

function isHighlightedEvent(event: LocarioEvent) {
  return event.plan === "highlight" || event.plan === "premium";
}

function getPlanBadgeClassName(plan: string | undefined) {
  if (plan === "premium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (plan === "highlight") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-300";
}

function getEventStatusClassName(isActive: boolean) {
  if (isActive) {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  return "border-red-300/30 bg-red-300/10 text-red-100";
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<LocarioEvent[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);

  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEditing = drawerMode === "edit" && Boolean(editingEventId);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    eventSearchQuery,
    selectedPlanFilter,
    selectedStatusFilter,
    selectedCategoryFilter,
  ]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) {
      return null;
    }

    return events.find((event) => event.id === selectedEventId) ?? null;
  }, [events, selectedEventId]);

  const automaticSearchSuggestions = useMemo(() => {
    return uniqueTerms(
      getEventSearchSuggestions({
        category: form.category,
        tags: getFormTerms(form.tags),
      })
    );
  }, [form.category, form.tags]);

  const selectedSearchTerms = useMemo(() => {
    return uniqueTerms(getFormTerms(form.searchTerms)).map(normalizeTerm);
  }, [form.searchTerms]);

  const filteredEvents = useMemo(() => {
    const normalizedSearchQuery = normalizeText(eventSearchQuery);

    return events
      .filter((event) => {
        const matchesSearch =
          !normalizedSearchQuery ||
          getEventSearchText(event).includes(normalizedSearchQuery);

        const matchesPlan =
          !selectedPlanFilter || event.plan === selectedPlanFilter;

        const matchesStatus =
          !selectedStatusFilter ||
          (selectedStatusFilter === "active" && event.isActive) ||
          (selectedStatusFilter === "inactive" && !event.isActive);

        const matchesCategory =
          !selectedCategoryFilter || event.category === selectedCategoryFilter;

        return matchesSearch && matchesPlan && matchesStatus && matchesCategory;
      })
      .sort((firstEvent, secondEvent) => {
        const firstStartsAt = new Date(firstEvent.startsAt).getTime();
        const secondStartsAt = new Date(secondEvent.startsAt).getTime();

        const planDifference =
          getEventPlanRank(secondEvent.plan) - getEventPlanRank(firstEvent.plan);

        if (planDifference !== 0) {
          return planDifference;
        }

        return firstStartsAt - secondStartsAt;
      });
  }, [
    events,
    eventSearchQuery,
    selectedPlanFilter,
    selectedStatusFilter,
    selectedCategoryFilter,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / eventsPerPage));
  const safeCurrentPage = Math.min(currentPage, pageCount);

  const paginatedEvents = filteredEvents.slice(
    (safeCurrentPage - 1) * eventsPerPage,
    safeCurrentPage * eventsPerPage
  );

  const activeEvents = events.filter((event) => event.isActive);
  const inactiveEvents = events.filter((event) => !event.isActive);
  const highlightedEvents = events.filter((event) => isHighlightedEvent(event));
  const eventsWithImages = events.filter((event) => eventHasImage(event));
  const basicEvents = events.filter((event) => event.plan === "basic");
  const highlightEvents = events.filter((event) => event.plan === "highlight");
  const premiumEvents = events.filter((event) => event.plan === "premium");

  const hasActiveFilters =
    eventSearchQuery ||
    selectedPlanFilter ||
    selectedStatusFilter ||
    selectedCategoryFilter;

  async function loadEvents() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/events", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Events konnten nicht geladen werden.");
      }

      const data = (await response.json()) as LocarioEvent[];
      setEvents(data);
    } catch {
      setErrorMessage("Events konnten nicht aus der Datenbank geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(field: keyof EventForm, value: string | boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function applyAutomaticSearchSuggestions() {
    setForm((currentForm) => ({
      ...currentForm,
      searchTerms: getMergedTermsText(
        currentForm.searchTerms,
        automaticSearchSuggestions
      ),
    }));
  }

  function addSearchSuggestion(term: string) {
    setForm((currentForm) => ({
      ...currentForm,
      searchTerms: getMergedTermsText(currentForm.searchTerms, [term]),
    }));
  }

  function resetFilters() {
    setEventSearchQuery("");
    setSelectedPlanFilter("");
    setSelectedStatusFilter("");
    setSelectedCategoryFilter("");
    setCurrentPage(1);
  }

  async function uploadEventImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingImage(true);
      setSuccessMessage("");
      setErrorMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/event-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Eventbild konnte nicht hochgeladen werden."
        );
      }

      const data = (await response.json()) as {
        imageUrl: string;
      };

      updateField("imageUrl", data.imageUrl);
      setSuccessMessage(
        "Eventbild wurde hochgeladen. Speichere das Event, damit es übernommen wird."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Hochladen des Eventbildes ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  function removeEventImage() {
    updateField("imageUrl", "");
  }

  function openCreateDrawer() {
    setForm(emptyForm);
    setEditingEventId(null);
    setSelectedEventId(null);
    setDrawerMode("create");
    setSuccessMessage("");
    setErrorMessage("");
  }

  function openDetailsDrawer(event: LocarioEvent) {
    setSelectedEventId(event.id);
    setEditingEventId(null);
    setDrawerMode("details");
    setSuccessMessage("");
    setErrorMessage("");
  }

  function openEditDrawer(event: LocarioEvent) {
    setEditingEventId(event.id);
    setSelectedEventId(event.id);
    setDrawerMode("edit");

    setForm({
      title: event.title || "",
      imageUrl: event.imageUrl || "",

      organizerName: event.organizerName || "",
      category: event.category || "",
      plan: event.plan || "basic",

      city: event.city || "",
      locationName: event.locationName || "",
      address: event.address || "",

      description: event.description || "",

      tags: uniqueTerms(getSafeStringArray(event.tags)).join(", "),
      searchTerms: uniqueTerms(getSafeStringArray(event.searchTerms)).join(", "),

      startsAt: toInputDateTime(event.startsAt),
      endsAt: toInputDateTime(event.endsAt),

      website: event.website || "",
      ticketUrl: event.ticketUrl || "",

      isActive: event.isActive,
      highlightUntil: toInputDateTime(event.highlightUntil),
    });

    setSuccessMessage("");
    setErrorMessage("");
  }

  function closeDrawer() {
    setDrawerMode("closed");
    setEditingEventId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const tags = uniqueTerms(getFormTerms(form.tags));
      const editableSearchTerms = uniqueTerms(getFormTerms(form.searchTerms));

      const fallbackSearchTerms = uniqueTerms(
        getAutomaticEventSearchTerms({
          category: form.category,
          tags,
        })
      );

      const searchTerms =
        editableSearchTerms.length > 0 ? editableSearchTerms : fallbackSearchTerms;

      const payload = {
        title: form.title,
        imageUrl: form.imageUrl,

        organizerName: form.organizerName,
        category: form.category,
        plan: form.plan,

        city: form.city,
        locationName: form.locationName,
        address: form.address,

        description: form.description,

        tags,
        searchTerms,

        startsAt: form.startsAt,
        endsAt: form.endsAt,

        website: form.website,
        ticketUrl: form.ticketUrl,

        isActive: form.isActive,
        highlightUntil: form.highlightUntil,
      };

      const response = await fetch(
        isEditing ? `/api/events/${editingEventId}` : "/api/events",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            (isEditing
              ? "Event konnte nicht bearbeitet werden."
              : "Event konnte nicht gespeichert werden.")
        );
      }

      const savedEvent = (await response.json()) as LocarioEvent;

      if (isEditing) {
        setEvents((currentEvents) =>
          currentEvents.map((eventItem) =>
            eventItem.id === savedEvent.id ? savedEvent : eventItem
          )
        );

        setSuccessMessage("Event wurde erfolgreich bearbeitet.");
      } else {
        setEvents((currentEvents) => [savedEvent, ...currentEvents]);

        setSuccessMessage("Event wurde erfolgreich gespeichert.");
      }

      setForm(emptyForm);
      setEditingEventId(null);
      setSelectedEventId(savedEvent.id);
      setDrawerMode("details");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Beim Speichern ist ein unbekannter Fehler passiert.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteEvent(id: string, title: string) {
    const confirmed = window.confirm(
      `Möchtest du "${title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingEventId(id);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Event konnte nicht gelöscht werden."
        );
      }

      setEvents((currentEvents) =>
        currentEvents.filter((eventItem) => eventItem.id !== id)
      );

      if (selectedEventId === id) {
        closeDrawer();
        setSelectedEventId(null);
      }

      setSuccessMessage("Event wurde erfolgreich gelöscht.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Beim Löschen ist ein unbekannter Fehler passiert.");
      }
    } finally {
      setDeletingEventId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Eventverwaltung
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Events{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Tabelle
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Events erfassen, Suchbegriffe automatisch vorschlagen und manuell
            bearbeiten.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openCreateDrawer}
            className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
          >
            Neues Event
          </button>

          <button
            type="button"
            onClick={loadEvents}
            disabled={isLoading}
            className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Lädt..." : "Aktualisieren"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        <CompactMetric label="Alle" value={events.length} />
        <CompactMetric label="Aktiv" value={activeEvents.length} />
        <CompactMetric label="Inaktiv" value={inactiveEvents.length} />
        <CompactMetric label="Basic" value={basicEvents.length} />
        <CompactMetric label="Highlight" value={highlightEvents.length} />
        <CompactMetric label="Premium" value={premiumEvents.length} />
        <CompactMetric label="Bilder" value={eventsWithImages.length} />
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
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Datenbank
            </p>

            <h2 className="mt-2 text-3xl font-black">Eventliste</h2>

            <p className="mt-2 text-sm text-slate-400">
              Kompakt, filterbar und mit Event-Suchlogik.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
          <InputField
            label="Suche"
            value={eventSearchQuery}
            onChange={setEventSearchQuery}
            placeholder="Event suchen: Titel, Ort, Kategorie, Veranstalter, Suchbegriff..."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <PlanFilterSelect
              label="Paket"
              value={selectedPlanFilter}
              onChange={setSelectedPlanFilter}
            />

            <StatusFilterSelect
              label="Status"
              value={selectedStatusFilter}
              onChange={setSelectedStatusFilter}
            />

            <CategoryFilterSelect
              label="Kategorie"
              value={selectedCategoryFilter}
              onChange={setSelectedCategoryFilter}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 md:flex-row md:items-center">
          <p>
            <span className="font-black text-white">
              {filteredEvents.length}
            </span>{" "}
            von <span className="font-black text-white">{events.length}</span>{" "}
            Events gefunden.
          </p>

          <p className="text-slate-500">
            Seite {safeCurrentPage} von {pageCount} · {eventsPerPage} pro Seite
          </p>
        </div>

        {isLoading && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Events werden geladen...
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Noch keine Events in der Datenbank gespeichert.
          </div>
        )}

        {!isLoading && events.length > 0 && filteredEvents.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Kein Event passt zu deinem Filter.
          </div>
        )}

        {!isLoading && paginatedEvents.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
                <thead className="border-b border-white/10 bg-slate-950/80 text-xs font-black uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Datum</th>
                    <th className="px-4 py-3">Ort</th>
                    <th className="px-4 py-3">Paket</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aktionen</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEvents.map((event) => {
                    const hasImage = eventHasImage(event);
                    const isHighlighted = isHighlightedEvent(event);
                    const eventLocationLine = getEventLocationLine(event);

                    return (
                      <tr
                        key={event.id}
                        className="border-b border-white/10 bg-slate-950/35 transition last:border-b-0 hover:bg-white/[0.04]"
                      >
                        <td className="max-w-[30rem] px-4 py-4">
                          <button
                            type="button"
                            onClick={() => openDetailsDrawer(event)}
                            className="block max-w-full truncate text-left text-base font-black text-white transition hover:text-cyan-100"
                          >
                            {event.title}
                          </button>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {event.organizerName} · {event.category}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          <p>{formatDateTime(event.startsAt)}</p>

                          {event.endsAt && (
                            <p className="mt-1 text-xs text-slate-500">
                              Bis {formatDateTime(event.endsAt)}
                            </p>
                          )}
                        </td>

                        <td className="max-w-[20rem] px-4 py-4 text-slate-300">
                          <p className="truncate">{event.city || "Ort offen"}</p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {eventLocationLine}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getPlanBadgeClassName(
                              event.plan
                            )}`}
                          >
                            {getEventPlanLabel(event.plan)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-black ${getEventStatusClassName(
                                event.isActive
                              )}`}
                            >
                              {event.isActive ? "Aktiv" : "Inaktiv"}
                            </span>

                            {hasImage && <TinyDot label="Bild" />}
                            {isHighlighted && <TinyDot label="Highlight" />}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDetailsDrawer(event)}
                              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                            >
                              Details
                            </button>

                            <Link
                              href={`/events/${event.id}`}
                              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                            >
                              Öffnen
                            </Link>

                            <button
                              type="button"
                              onClick={() => openEditDrawer(event)}
                              className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && filteredEvents.length > eventsPerPage && (
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

      <EventDrawer
        mode={drawerMode}
        event={selectedEvent}
        form={form}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        isUploadingImage={isUploadingImage}
        automaticSearchSuggestions={automaticSearchSuggestions}
        selectedSearchTerms={selectedSearchTerms}
        deletingEventId={deletingEventId}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        onUpdateField={updateField}
        onApplyAutomaticSearchSuggestions={applyAutomaticSearchSuggestions}
        onAddSearchSuggestion={addSearchSuggestion}
        onUploadImage={uploadEventImage}
        onRemoveImage={removeEventImage}
        onEditEvent={openEditDrawer}
        onDeleteEvent={deleteEvent}
      />
    </section>
  );
}

function EventDrawer({
  mode,
  event,
  form,
  isEditing,
  isSubmitting,
  isUploadingImage,
  automaticSearchSuggestions,
  selectedSearchTerms,
  deletingEventId,
  onClose,
  onSubmit,
  onUpdateField,
  onApplyAutomaticSearchSuggestions,
  onAddSearchSuggestion,
  onUploadImage,
  onRemoveImage,
  onEditEvent,
  onDeleteEvent,
}: {
  mode: DrawerMode;
  event: LocarioEvent | null;
  form: EventForm;
  isEditing: boolean;
  isSubmitting: boolean;
  isUploadingImage: boolean;
  automaticSearchSuggestions: string[];
  selectedSearchTerms: string[];
  deletingEventId: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateField: (field: keyof EventForm, value: string | boolean) => void;
  onApplyAutomaticSearchSuggestions: () => void;
  onAddSearchSuggestion: (term: string) => void;
  onUploadImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onEditEvent: (event: LocarioEvent) => void;
  onDeleteEvent: (id: string, title: string) => void;
}) {
  if (mode === "closed") {
    return null;
  }

  const isFormMode = mode === "create" || mode === "edit";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm">
      <div className="flex min-h-screen justify-end">
        <aside className="h-screen w-full max-w-5xl overflow-y-auto border-l border-white/10 bg-slate-950 p-5 shadow-2xl shadow-slate-950/50 md:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                {isFormMode ? "Bearbeitung" : "Eventdetails"}
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-tight">
                {mode === "create"
                  ? "Neues Event erfassen"
                  : mode === "edit"
                    ? "Event bearbeiten"
                    : event?.title || "Event"}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                {isFormMode
                  ? "Kategorie wählen, Vorschläge übernehmen und Suchbegriffe direkt bearbeiten."
                  : "Details, Sichtbarkeit, Paket, Links und Aktionen zu diesem Event."}
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

          {isFormMode && (
            <form onSubmit={onSubmit} className="mt-8 grid gap-6 xl:grid-cols-3">
              <div className="space-y-5">
                <InputField
                  label="Eventtitel"
                  value={form.title}
                  onChange={(value) => onUpdateField("title", value)}
                  placeholder="Zum Beispiel: Sommerfest Wattenwil"
                  required
                />

                <InputField
                  label="Veranstalter"
                  value={form.organizerName}
                  onChange={(value) => onUpdateField("organizerName", value)}
                  placeholder="Zum Beispiel: Musikverein Wattenwil"
                  required
                />

                <SelectField
                  label="Kategorie"
                  value={form.category}
                  onChange={(value) => onUpdateField("category", value)}
                  placeholder="Kategorie auswählen"
                  options={eventCategories}
                  required
                />

                <EventPlanSelect
                  label="Wochenpaket"
                  value={form.plan}
                  onChange={(value) => onUpdateField("plan", value)}
                />

                <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="font-black text-cyan-100">
                    {getEventPlanLabel(form.plan)}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {getEventPlanDescription(form.plan)}
                  </p>

                  <p className="mt-2 text-sm font-black text-cyan-100">
                    {getEventPlanPrice(form.plan)}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <ImageUploadField
                  imageUrl={form.imageUrl}
                  isUploading={isUploadingImage}
                  onUpload={onUploadImage}
                  onRemove={onRemoveImage}
                />

                <InputField
                  label="Stadt / Region"
                  value={form.city}
                  onChange={(value) => onUpdateField("city", value)}
                  placeholder="Zum Beispiel: Bern"
                  required
                />

                <InputField
                  label="Ort / Location"
                  value={form.locationName}
                  onChange={(value) => onUpdateField("locationName", value)}
                  placeholder="Zum Beispiel: Dorfplatz"
                />

                <InputField
                  label="Adresse"
                  value={form.address}
                  onChange={(value) => onUpdateField("address", value)}
                  placeholder="Strasse, Hausnummer"
                />

                <TextareaField
                  label="Beschreibung"
                  value={form.description}
                  onChange={(value) => onUpdateField("description", value)}
                  placeholder="Beschreibe das Event kurz und ansprechend."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-5">
                <InputField
                  label="Sichtbare Zusatzlabels"
                  value={form.tags}
                  onChange={(value) => onUpdateField("tags", value)}
                  placeholder="Zum Beispiel: gratis, kinderfreundlich, live musik..."
                />

                <SearchTermsEditor
                  value={form.searchTerms}
                  suggestions={automaticSearchSuggestions}
                  selectedTerms={selectedSearchTerms}
                  onChange={(value) => onUpdateField("searchTerms", value)}
                  onApplyAll={onApplyAutomaticSearchSuggestions}
                  onAddTerm={onAddSearchSuggestion}
                />

                <InputField
                  label="Startdatum / Startzeit"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(value) => onUpdateField("startsAt", value)}
                  placeholder=""
                  required
                />

                <InputField
                  label="Enddatum / Endzeit"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(value) => onUpdateField("endsAt", value)}
                  placeholder=""
                />

                <InputField
                  label="Website"
                  value={form.website}
                  onChange={(value) => onUpdateField("website", value)}
                  placeholder="https://www.event.ch"
                />

                <InputField
                  label="Ticketlink"
                  value={form.ticketUrl}
                  onChange={(value) => onUpdateField("ticketUrl", value)}
                  placeholder="https://tickets.example.ch"
                />

                <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-lg font-black text-cyan-100">
                    Sichtbarkeit
                  </p>

                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(checkboxEvent) =>
                        onUpdateField("isActive", checkboxEvent.target.checked)
                      }
                      className="h-5 w-5"
                    />

                    <span className="font-bold text-white">
                      Event öffentlich anzeigen
                    </span>
                  </label>

                  <div className="mt-4">
                    <InputField
                      label="Highlight bis"
                      type="datetime-local"
                      value={form.highlightUntil}
                      onChange={(value) => onUpdateField("highlightUntil", value)}
                      placeholder=""
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="w-full rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? isEditing
                      ? "Änderungen werden gespeichert..."
                      : "Event wird gespeichert..."
                    : isEditing
                      ? "Änderungen speichern"
                      : "Event speichern"}
                </button>
              </div>
            </form>
          )}

          {mode === "details" && event && (
            <EventDetailsDrawer
              event={event}
              deletingEventId={deletingEventId}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function EventDetailsDrawer({
  event,
  deletingEventId,
  onEditEvent,
  onDeleteEvent,
}: {
  event: LocarioEvent;
  deletingEventId: string | null;
  onEditEvent: (event: LocarioEvent) => void;
  onDeleteEvent: (id: string, title: string) => void;
}) {
  const hasImage = eventHasImage(event);
  const isHighlighted = isHighlightedEvent(event);
  const tags = uniqueTerms(getSafeStringArray(event.tags));
  const searchTerms = uniqueTerms(getSafeStringArray(event.searchTerms));
  const eventLocationLine = getEventLocationLine(event);
  const websiteHref = getExternalHref(event.website);
  const ticketHref = getExternalHref(event.ticketUrl);

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[20rem_1fr]">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
          {hasImage ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-52 w-full object-cover"
            />
          ) : (
            <div className="flex h-44 items-center justify-center bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-slate-950 text-sm font-bold text-slate-400">
              Kein Bild
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Aktionen
          </p>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => onEditEvent(event)}
              className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
            >
              Bearbeiten
            </button>

            <Link
              href={`/events/${event.id}`}
              className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Öffentlich öffnen
            </Link>

            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                Website öffnen
              </a>
            )}

            {ticketHref && (
              <a
                href={ticketHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-cyan-300/30 px-4 py-3 text-center text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10"
              >
                Tickets öffnen
              </a>
            )}

            <button
              type="button"
              onClick={() => onDeleteEvent(event.id, event.title)}
              disabled={deletingEventId === event.id}
              className="rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingEventId === event.id ? "Löscht..." : "Event löschen"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${getPlanBadgeClassName(
              event.plan
            )}`}
          >
            {getEventPlanLabel(event.plan)}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${getEventStatusClassName(
              event.isActive
            )}`}
          >
            {event.isActive ? "Aktiv" : "Inaktiv"}
          </span>

          {hasImage && <MiniBadge label="Bild" />}
          {isHighlighted && <MiniBadge label="Highlight" variant="emerald" />}
        </div>

        <h3 className="break-words text-4xl font-black">{event.title}</h3>

        <p className="text-slate-400">
          {event.organizerName} · {event.category}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailBox title="Start" value={formatDateTime(event.startsAt)} />
          <DetailBox title="Ende" value={formatDateTime(event.endsAt)} />
          <DetailBox title="Stadt" value={event.city || "Nicht angegeben"} />
          <DetailBox
            title="Location"
            value={event.locationName || "Nicht angegeben"}
          />
          <DetailBox title="Adresse" value={event.address || "Nicht angegeben"} />
          <DetailBox title="Ort komplett" value={eventLocationLine} />
          <DetailBox
            title="Paket"
            value={`${getEventPlanDescription(event.plan)} · ${getEventPlanPrice(
              event.plan
            )}`}
          />
          <DetailBox
            title="Highlight bis"
            value={formatDateTime(event.highlightUntil)}
          />
          <DetailBox
            title="Status"
            value={event.isActive ? "Öffentlich sichtbar" : "Deaktiviert"}
          />
          <DetailBox
            title="Suchbegriffe"
            value={
              searchTerms.length > 0
                ? searchTerms.slice(0, 30).join(", ")
                : "Noch keine Suchbegriffe."
            }
          />
          <DetailBox
            title="Zusatzlabels"
            value={
              tags.length > 0 ? tags.join(", ") : "Keine Zusatzlabels."
            }
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Beschreibung
          </p>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">
            {event.description}
          </p>
        </div>

        {searchTerms.length > 0 && (
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
              Suchlogik
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerms.slice(0, 80).map((term, termIndex) => (
                <span
                  key={`${normalizeKey(term)}-${termIndex}`}
                  className="rounded-full border border-cyan-300/20 bg-slate-950/50 px-3 py-1 text-xs text-cyan-100"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, tagIndex) => (
              <span
                key={`${normalizeKey(tag)}-${tagIndex}`}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-xl shadow-slate-950/10">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-cyan-200">{value}</p>
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

function MiniBadge({
  label,
  variant = "cyan",
}: {
  label: string;
  variant?: "cyan" | "emerald";
}) {
  const className =
    variant === "emerald"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
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

function SearchTermsEditor({
  value,
  suggestions,
  selectedTerms,
  onChange,
  onApplyAll,
  onAddTerm,
}: {
  value: string;
  suggestions: string[];
  selectedTerms: string[];
  onChange: (value: string) => void;
  onApplyAll: () => void;
  onAddTerm: (term: string) => void;
}) {
  const shownSuggestions = uniqueTerms(suggestions);
  const selectedTermSet = new Set(selectedTerms.map(normalizeTerm));

  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-black text-cyan-100">
            Suchbegriffe
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Diese Begriffe steuern die Event-Suche. Du kannst sie bearbeiten,
            ergänzen oder Vorschläge anklicken.
          </p>
        </div>

        <button
          type="button"
          onClick={onApplyAll}
          disabled={shownSuggestions.length === 0}
          className="rounded-2xl border border-cyan-300/30 px-4 py-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Alle übernehmen
        </button>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="konzert, live musik, band, festival, openair..."
        rows={7}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />

      <p className="mt-2 text-xs text-slate-400">
        Begriffe mit Komma trennen. Beispiel: live musik, kinderprogramm,
        wochenende
      </p>

      {shownSuggestions.length === 0 && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
          Wähle zuerst eine Event-Kategorie aus.
        </p>
      )}

      {shownSuggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
            Vorschläge
          </p>

          <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
            {shownSuggestions.map((term, termIndex) => {
              const isSelected = selectedTermSet.has(normalizeTerm(term));

              return (
                <button
                  key={`${normalizeKey(term)}-${termIndex}`}
                  type="button"
                  onClick={() => onAddTerm(term)}
                  disabled={isSelected}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed ${
                    isSelected
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                      : "border-cyan-300/20 bg-slate-950/60 text-cyan-100 hover:bg-cyan-300/10"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {term}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageUploadField({
  imageUrl,
  isUploading,
  onUpload,
  onRemove,
}: {
  imageUrl: string;
  isUploading: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
      <label className="text-sm font-bold text-slate-200">
        Eventbild / Titelbild
      </label>

      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Eventbild Vorschau"
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="flex h-28 items-center justify-center bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-slate-950 text-sm font-bold text-slate-400">
            Kein Bild
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:flex">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5">
          {isUploading ? "Lädt..." : "Bild hochladen"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        {imageUrl && (
          <button
            type="button"
            onClick={onRemove}
            disabled={isUploading}
            className="rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Entfernen
          </button>
        )}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      >
        <option value="" className="bg-slate-950 text-slate-400">
          {placeholder}
        </option>

        {options.map((option, optionIndex) => (
          <option
            key={`${normalizeKey(option)}-${optionIndex}`}
            value={option}
            className="bg-slate-950 text-white"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function EventPlanSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      >
        {eventPlans.map((plan) => (
          <option
            key={plan.value}
            value={plan.value}
            className="bg-slate-950 text-white"
          >
            {plan.label} — {plan.price}
          </option>
        ))}
      </select>
    </div>
  );
}

function PlanFilterSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      >
        <option value="" className="bg-slate-950 text-slate-400">
          Alle Pakete
        </option>

        {eventPlans.map((plan) => (
          <option
            key={plan.value}
            value={plan.value}
            className="bg-slate-950 text-white"
          >
            {plan.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusFilterSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      >
        <option value="" className="bg-slate-950 text-slate-400">
          Alle Status
        </option>

        <option value="active" className="bg-slate-950 text-white">
          Aktiv
        </option>

        <option value="inactive" className="bg-slate-950 text-white">
          Inaktiv
        </option>
      </select>
    </div>
  );
}

function CategoryFilterSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      >
        <option value="" className="bg-slate-950 text-slate-400">
          Alle Kategorien
        </option>

        {eventCategories.map((category, categoryIndex) => (
          <option
            key={`${normalizeKey(category)}-${categoryIndex}`}
            value={category}
            className="bg-slate-950 text-white"
          >
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}