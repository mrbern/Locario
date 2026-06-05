"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lead } from "@/types/lead";

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
    return "border-slate-300/20 bg-slate-300/10 text-slate-300";
  }

  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

function getLeadSearchText(lead: Lead) {
  return [
    lead.companyName,
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

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  const newLeads = useMemo(() => {
    return leads.filter((lead) => lead.status === "new");
  }, [leads]);

  const inProgressLeads = useMemo(() => {
    return leads.filter((lead) => lead.status === "in_progress");
  }, [leads]);

  const doneLeads = useMemo(() => {
    return leads.filter((lead) => lead.status === "done");
  }, [leads]);

  const leadsWithSourceQuery = useMemo(() => {
    return leads.filter((lead) => lead.sourceQuery);
  }, [leads]);

  const companyOptions = useMemo(() => {
    const companyNames = leads
      .map((lead) => lead.companyName)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return Array.from(new Set(companyNames));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !normalizedSearchQuery ||
        getLeadSearchText(lead).includes(normalizedSearchQuery);

      const matchesStatus =
        !selectedStatus || lead.status === selectedStatus;

      const matchesCompany =
        !selectedCompany || lead.companyName === selectedCompany;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [leads, searchQuery, selectedStatus, selectedCompany]);

  const hasActiveFilters = searchQuery || selectedStatus || selectedCompany;

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

      const data = (await response.json()) as Lead[];
      setLeads(data);
    } catch {
      setErrorMessage(
        "Die Leads konnten nicht aus der Datenbank geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedStatus("");
    setSelectedCompany("");
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
            Leads
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Kundenanfragen{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              verwalten
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Hier siehst du alle Anfragen, die Nutzer über Firmenprofile
            gesendet haben. Du kannst nach Firma, Status, Quelle und Inhalt
            filtern.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLeads}
          disabled={isLoading}
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Lädt..." : "Aktualisieren"}
        </button>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Alle Leads"
          value={leads.length.toString()}
          description="Gespeicherte Kundenanfragen"
        />

        <AdminStatCard
          title="Neue Leads"
          value={newLeads.length.toString()}
          description="Noch offen"
        />

        <AdminStatCard
          title="In Bearbeitung"
          value={inProgressLeads.length.toString()}
          description="Bereits angeschaut"
        />

        <AdminStatCard
          title="Mit Suchquelle"
          value={leadsWithSourceQuery.length.toString()}
          description={`${doneLeads.length} erledigt`}
        />
      </div>

      {errorMessage && (
        <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Filter
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Leads durchsuchen
            </h2>

            <p className="mt-3 text-slate-400">
              Suche nach Firma, Kunde, E-Mail, Telefon, Nachricht oder
              ursprünglicher Suchanfrage.
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

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_14rem_14rem]">
          <InputField
            label="Suche"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Kunde, Firma, Nachricht, Suchquelle..."
          />

          <SelectField
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "", label: "Alle Status" },
              { value: "new", label: "Neu" },
              { value: "in_progress", label: "In Bearbeitung" },
              { value: "done", label: "Erledigt" },
            ]}
          />

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
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
          <span className="font-black text-white">{filteredLeads.length}</span>{" "}
          von <span className="font-black text-white">{leads.length}</span>{" "}
          Leads werden angezeigt.
        </div>
      </section>

      {isLoading && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Leads werden geladen...
        </div>
      )}

      {!isLoading && leads.length === 0 && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Noch keine Leads gespeichert.
        </div>
      )}

      {!isLoading && leads.length > 0 && filteredLeads.length === 0 && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Kein Lead passt zu deinem Filter.
        </div>
      )}

      {!isLoading && filteredLeads.length > 0 && (
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {filteredLeads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20"
            >
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                    {lead.companyName}
                  </p>

                  <h3 className="mt-2 text-2xl font-black tracking-tight">
                    {lead.customerName}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {formatDate(lead.createdAt)}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${getLeadStatusClassName(
                    lead.status
                  )}`}
                >
                  {getLeadStatusLabel(lead.status)}
                </span>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                <InfoLine
                  label="E-Mail"
                  value={lead.customerEmail || "Nicht angegeben"}
                />

                <InfoLine
                  label="Telefon"
                  value={lead.customerPhone || "Nicht angegeben"}
                />
              </div>

              {lead.sourceQuery && (
                <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                    Quelle / Suche
                  </p>

                  <p className="mt-2 text-slate-200">{lead.sourceQuery}</p>
                </div>
              )}

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Nachricht
                </p>

                <p className="mt-2 text-slate-200">{lead.message}</p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {lead.customerEmail && (
                  <a
                    href={`mailto:${lead.customerEmail}`}
                    className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
                  >
                    E-Mail senden
                  </a>
                )}

                {lead.customerPhone && (
                  <a
                    href={`tel:${lead.customerPhone}`}
                    className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
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

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="text-slate-500">{label}:</span>{" "}
      <span className="text-slate-200">{value}</span>
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