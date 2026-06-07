"use client";

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
import type { LocarioEvent } from "@/types/event";

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

  startsAt: string;
  endsAt: string;

  website: string;
  ticketUrl: string;

  isActive: boolean;
  highlightUntil: string;
};

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

  startsAt: "",
  endsAt: "",

  website: "",
  ticketUrl: "",

  isActive: true,
  highlightUntil: "",
};

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function toInputDateTime(value: string) {
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

function formatDateTime(value: string) {
  if (!value) {
    return "Nicht gesetzt";
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
      event.description,
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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<LocarioEvent[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEditing = Boolean(editingEventId);

  useEffect(() => {
    loadEvents();
  }, []);

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

        return matchesSearch && matchesPlan && matchesStatus;
      })
      .sort((a, b) => {
        const planDifference =
          getEventPlanRank(b.plan) - getEventPlanRank(a.plan);

        if (planDifference !== 0) {
          return planDifference;
        }

        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });
  }, [events, eventSearchQuery, selectedPlanFilter, selectedStatusFilter]);

  const activeEvents = events.filter((event) => event.isActive);
  const inactiveEvents = events.filter((event) => !event.isActive);
  const highlightedEvents = events.filter((event) => isHighlightedEvent(event));
  const eventsWithImages = events.filter((event) => eventHasImage(event));

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

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

  function startEditingEvent(event: LocarioEvent) {
    setEditingEventId(event.id);

    setForm({
      title: event.title,
      imageUrl: event.imageUrl || "",

      organizerName: event.organizerName,
      category: event.category,
      plan: event.plan || "basic",

      city: event.city,
      locationName: event.locationName,
      address: event.address,

      description: event.description,

      startsAt: toInputDateTime(event.startsAt),
      endsAt: toInputDateTime(event.endsAt),

      website: event.website,
      ticketUrl: event.ticketUrl,

      isActive: event.isActive,
      highlightUntil: toInputDateTime(event.highlightUntil),
    });

    setSuccessMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingEventId(null);
    setForm(emptyForm);
    setSuccessMessage("");
    setErrorMessage("");
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

        throw new Error(errorData?.message || "Event konnte nicht gelöscht werden.");
      }

      setEvents((currentEvents) =>
        currentEvents.filter((eventItem) => eventItem.id !== id)
      );

      if (editingEventId === id) {
        cancelEditing();
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
              verwalten
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Erfasse regionale Events, Veranstalter, Bilder, Orte, Ticketlinks
            und Wochenpakete für die öffentliche Events-Seite.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEvents}
          disabled={isLoading}
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Lädt..." : "Aktualisieren"}
        </button>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Events"
          value={events.length.toString()}
          description="Gespeicherte Events"
        />

        <AdminStatCard
          title="Aktiv"
          value={activeEvents.length.toString()}
          description={`${inactiveEvents.length} deaktiviert`}
        />

        <AdminStatCard
          title="Highlights"
          value={highlightedEvents.length.toString()}
          description="Highlight oder Premium"
        />

        <AdminStatCard
          title="Bilder"
          value={eventsWithImages.length.toString()}
          description="Events mit Titelbild"
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

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr_1.15fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Formular
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {isEditing ? "Event bearbeiten" : "Event hinzufügen"}
              </h2>

              <p className="mt-3 text-slate-400">
                Trage Veranstaltungsdaten, Bild, Ort, Zeitraum und Event-Paket
                ein.
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                Abbrechen
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <InputField
              label="Eventtitel"
              value={form.title}
              onChange={(value) => updateField("title", value)}
              placeholder="Zum Beispiel: Sommerfest Wattenwil"
              required
            />

            <ImageUploadField
              imageUrl={form.imageUrl}
              isUploading={isUploadingImage}
              onUpload={uploadEventImage}
              onRemove={removeEventImage}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Veranstalter"
                value={form.organizerName}
                onChange={(value) => updateField("organizerName", value)}
                placeholder="Zum Beispiel: Musikverein Wattenwil"
                required
              />

              <SelectField
                label="Kategorie"
                value={form.category}
                onChange={(value) => updateField("category", value)}
                placeholder="Kategorie auswählen"
                options={eventCategories}
                required
              />
            </div>

            <EventPlanSelect
              label="Wochenpaket"
              value={form.plan}
              onChange={(value) => updateField("plan", value)}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Stadt / Region"
                value={form.city}
                onChange={(value) => updateField("city", value)}
                placeholder="Zum Beispiel: Bern"
                required
              />

              <InputField
                label="Ort / Location"
                value={form.locationName}
                onChange={(value) => updateField("locationName", value)}
                placeholder="Zum Beispiel: Dorfplatz"
              />
            </div>

            <InputField
              label="Adresse"
              value={form.address}
              onChange={(value) => updateField("address", value)}
              placeholder="Strasse, Hausnummer"
            />

            <TextareaField
              label="Beschreibung"
              value={form.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Beschreibe das Event kurz und ansprechend."
              rows={5}
              required
            />

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Startdatum / Startzeit"
                type="datetime-local"
                value={form.startsAt}
                onChange={(value) => updateField("startsAt", value)}
                placeholder=""
                required
              />

              <InputField
                label="Enddatum / Endzeit"
                type="datetime-local"
                value={form.endsAt}
                onChange={(value) => updateField("endsAt", value)}
                placeholder=""
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Website"
                value={form.website}
                onChange={(value) => updateField("website", value)}
                placeholder="https://www.event.ch"
              />

              <InputField
                label="Ticketlink"
                value={form.ticketUrl}
                onChange={(value) => updateField("ticketUrl", value)}
                placeholder="https://tickets.example.ch"
              />
            </div>

            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <h3 className="text-xl font-black text-cyan-100">
                Sichtbarkeit
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                Aktive Events erscheinen öffentlich auf der Events-Seite.
                Highlight/Premium wird stärker dargestellt.
              </p>

              <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  className="h-5 w-5"
                />

                <span className="font-bold text-white">
                  Event öffentlich anzeigen
                </span>
              </label>

              <div className="mt-5">
                <InputField
                  label="Highlight bis"
                  type="datetime-local"
                  value={form.highlightUntil}
                  onChange={(value) => updateField("highlightUntil", value)}
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
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Übersicht
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Events aus der Datenbank
            </h2>

            <p className="mt-3 text-slate-400">
              Suche, filtere und verwalte regionale Veranstaltungen.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_12rem_12rem]">
            <InputField
              label="Events suchen"
              value={eventSearchQuery}
              onChange={setEventSearchQuery}
              placeholder="Titel, Ort, Kategorie, Veranstalter..."
            />

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
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
            <span className="font-black text-white">
              {filteredEvents.length}
            </span>{" "}
            von <span className="font-black text-white">{events.length}</span>{" "}
            Events werden angezeigt.
          </div>

          {isLoading && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
              Events werden geladen...
            </div>
          )}

          {!isLoading && events.length === 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
              Noch keine Events in der Datenbank gespeichert.
            </div>
          )}

          {!isLoading && events.length > 0 && filteredEvents.length === 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
              Kein Event passt zu deinem Filter.
            </div>
          )}

          {!isLoading && filteredEvents.length > 0 && (
            <div className="mt-8 space-y-4">
              {filteredEvents.map((event) => {
                const isCurrentEvent = editingEventId === event.id;
                const hasImage = eventHasImage(event);

                return (
                  <article
                    key={event.id}
                    className={`overflow-hidden rounded-3xl border transition ${
                      isCurrentEvent
                        ? "border-cyan-300/50 bg-cyan-300/10"
                        : "border-white/10 bg-slate-950/60 hover:border-cyan-300/30 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="relative h-44 overflow-hidden">
                      {hasImage ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-slate-950" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

                      <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-3 py-1 text-xs font-black text-cyan-100 backdrop-blur">
                          {event.category}
                        </span>

                        <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-black text-slate-200 backdrop-blur">
                          {event.city}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black backdrop-blur ${getPlanBadgeClassName(
                            event.plan
                          )}`}
                        >
                          {getEventPlanLabel(event.plan)}
                        </span>

                        {!event.isActive && (
                          <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs font-black text-red-200 backdrop-blur">
                            Inaktiv
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                        <div className="flex-1">
                          <p className="text-sm font-black text-cyan-200">
                            {formatDateTime(event.startsAt)}
                          </p>

                          <h3 className="mt-2 text-2xl font-black tracking-tight">
                            {event.title}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-slate-400">
                            {event.organizerName}
                          </p>

                          <p className="mt-3 text-xs text-slate-500">
                            {getEventPlanDescription(event.plan)} —{" "}
                            {getEventPlanPrice(event.plan)}
                          </p>

                          <p className="mt-4 text-slate-300">
                            {event.description}
                          </p>

                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            <InfoBox
                              title="Location"
                              value={event.locationName || "Nicht angegeben"}
                            />

                            <InfoBox
                              title="Adresse"
                              value={event.address || "Nicht angegeben"}
                            />
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            {event.website && (
                              <a
                                href={event.website}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                              >
                                Website öffnen
                              </a>
                            )}

                            {event.ticketUrl && (
                              <a
                                href={event.ticketUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
                              >
                                Tickets öffnen
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row gap-3 md:flex-col">
                          <button
                            type="button"
                            onClick={() => startEditingEvent(event)}
                            className="rounded-2xl border border-cyan-300/30 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10"
                          >
                            Bearbeiten
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteEvent(event.id, event.title)}
                            disabled={deletingEventId === event.id}
                            className="rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingEventId === event.id
                              ? "Löscht..."
                              : "Löschen"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
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
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <label className="text-sm font-bold text-slate-200">
        Eventbild / Titelbild
      </label>

      <p className="mt-2 text-sm text-slate-400">
        Dieses Bild erscheint oben auf der Event-Kachel. Erlaubt sind JPG, PNG
        und WebP bis 5 MB.
      </p>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Eventbild Vorschau"
            className="h-52 w-full object-cover"
          />
        ) : (
          <div className="flex h-52 items-center justify-center bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-slate-950 text-sm font-bold text-slate-400">
            Noch kein Bild hochgeladen
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:flex">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5">
          {isUploading ? "Bild wird hochgeladen..." : "Bild hochladen"}
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
            className="rounded-2xl border border-red-400/30 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bild entfernen
          </button>
        )}
      </div>

      {imageUrl && (
        <p className="mt-4 break-all text-xs text-slate-500">{imageUrl}</p>
      )}
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

        {options.map((option) => (
          <option
            key={option}
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

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}
