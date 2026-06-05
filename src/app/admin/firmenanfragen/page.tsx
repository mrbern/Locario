"use client";

import { useEffect, useMemo, useState } from "react";
import {
  canCompanyUseAdvertising,
  getCompanyPlanLabel,
} from "@/data/plans";
import type { Company } from "@/types/company";
import type { CompanyInquiry } from "@/types/company-inquiry";

type PublishCompanyInquiryResponse = {
  company: Company;
  inquiry: CompanyInquiry;
};

const inquiryStatusOptions = [
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
    label: "Umgewandelt",
  },
  {
    value: "rejected",
    label: "Abgelehnt",
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
    return "Umgewandelt";
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

function hasInquiryAd(inquiry: CompanyInquiry) {
  return Boolean(
    inquiry.adTitle.trim() ||
      inquiry.adDescription.trim() ||
      inquiry.adCta.trim()
  );
}

function getPartnerPath(company: Company) {
  if (!company.accessToken) {
    return "";
  }

  return `/partner/${company.accessToken}`;
}

export default function AdminCompanyInquiriesPage() {
  const [companyInquiries, setCompanyInquiries] = useState<CompanyInquiry[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

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

  const filteredInquiries = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return companyInquiries.filter((inquiry) => {
      const searchableText = [
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

      const matchesSearch =
        !normalizedSearchQuery ||
        searchableText.includes(normalizedSearchQuery);

      const matchesStatus =
        !selectedStatus || inquiry.status === selectedStatus;

      const matchesPlan = !selectedPlan || inquiry.desiredPlan === selectedPlan;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [companyInquiries, searchQuery, selectedStatus, selectedPlan]);

  const hasActiveFilters = searchQuery || selectedStatus || selectedPlan;

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

      setSuccessMessage("Status der Firmenanfrage wurde aktualisiert.");

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
      "Möchtest du diese Firmenanfrage wirklich als Firma veröffentlichen?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setPublishingInquiryId(inquiryId);
      setSuccessMessage("");
      setErrorMessage("");

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
            "Firmenanfrage konnte nicht veröffentlicht werden."
        );
      }

      const data = (await response.json()) as PublishCompanyInquiryResponse;

      setCompanyInquiries((currentInquiries) =>
        currentInquiries.map((inquiry) =>
          inquiry.id === data.inquiry.id ? data.inquiry : inquiry
        )
      );

      setSuccessMessage(
        `Firma "${data.company.name}" wurde veröffentlicht. Partner-Link: ${getPartnerPath(
          data.company
        )}`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 6000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Veröffentlichen der Firmenanfrage ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setPublishingInquiryId(null);
    }
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedStatus("");
    setSelectedPlan("");
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
            Firmenanfragen
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Anfragen{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              prüfen
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Prüfe neue Firmenprofile, kontaktiere Interessenten, ändere den
            Status und veröffentliche passende Anfragen direkt als Firma.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCompanyInquiries}
          disabled={isLoading}
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Lädt..." : "Aktualisieren"}
        </button>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Neu"
          value={newCompanyInquiries.length.toString()}
          description="Noch nicht kontaktiert"
        />

        <AdminStatCard
          title="Kontaktiert"
          value={contactedCompanyInquiries.length.toString()}
          description="In Abklärung"
        />

        <AdminStatCard
          title="Umgewandelt"
          value={convertedCompanyInquiries.length.toString()}
          description="Bereits veröffentlicht"
        />

        <AdminStatCard
          title="Abgelehnt"
          value={rejectedCompanyInquiries.length.toString()}
          description="Nicht übernommen"
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
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Filter
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Firmenanfragen durchsuchen
            </h2>

            <p className="mt-3 text-slate-400">
              Suche nach Firma, Kontaktperson, Ort, Kategorie, Paket oder
              Suchbegriffen.
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
            placeholder="Firma, Ort, Kategorie, E-Mail..."
          />

          <SelectField
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "", label: "Alle Status" },
              { value: "new", label: "Neu" },
              { value: "contacted", label: "Kontaktiert" },
              { value: "converted", label: "Umgewandelt" },
              { value: "rejected", label: "Abgelehnt" },
            ]}
          />

          <SelectField
            label="Paket"
            value={selectedPlan}
            onChange={setSelectedPlan}
            options={[
              { value: "", label: "Alle Pakete" },
              { value: "starter", label: "Starter" },
              { value: "pro", label: "Pro" },
              { value: "premium", label: "Premium" },
            ]}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
          <span className="font-black text-white">
            {filteredInquiries.length}
          </span>{" "}
          von{" "}
          <span className="font-black text-white">
            {companyInquiries.length}
          </span>{" "}
          Firmenanfragen werden angezeigt.
        </div>
      </section>

      {isLoading && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Firmenanfragen werden geladen...
        </div>
      )}

      {!isLoading && companyInquiries.length === 0 && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Noch keine Firmenanfragen gespeichert.
        </div>
      )}

      {!isLoading && companyInquiries.length > 0 && filteredInquiries.length === 0 && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-slate-300">
          Keine Firmenanfrage passt zu deinem Filter.
        </div>
      )}

      {!isLoading && filteredInquiries.length > 0 && (
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {filteredInquiries.map((inquiry) => {
            const isUpdating = updatingInquiryId === inquiry.id;
            const isPublishing = publishingInquiryId === inquiry.id;
            const advertisingAllowed = canCompanyUseAdvertising(
              inquiry.desiredPlan
            );
            const inquiryHasAd = hasInquiryAd(inquiry);

            return (
              <article
                key={inquiry.id}
                className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-black tracking-tight">
                        {inquiry.companyName}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${getPlanClassName(
                          inquiry.desiredPlan
                        )}`}
                      >
                        {getCompanyPlanLabel(inquiry.desiredPlan)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      Anfrage vom {formatDate(inquiry.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getInquiryStatusClassName(
                      inquiry.status
                    )}`}
                  >
                    {getInquiryStatusLabel(inquiry.status)}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                  <InfoLine label="Kontakt" value={inquiry.contactName} />
                  <InfoLine label="Stadt" value={inquiry.city} />
                  <InfoLine label="E-Mail" value={inquiry.email} />
                  <InfoLine
                    label="Telefon"
                    value={inquiry.phone || "Nicht angegeben"}
                  />
                  <InfoLine
                    label="Website"
                    value={inquiry.website || "Nicht angegeben"}
                    wide
                  />
                </div>

                <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                    Eingereichtes Firmenprofil
                  </p>

                  <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                    <InfoLine
                      label="Hauptkategorie"
                      value={inquiry.mainCategory || "Nicht angegeben"}
                    />
                    <InfoLine
                      label="Haupt-Unterkategorie"
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

                  <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Beschreibung
                    </p>

                    <p className="mt-2 text-slate-200">
                      {inquiry.description || "Nicht angegeben"}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
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
                </div>

                {advertisingAllowed && inquiryHasAd && (
                  <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-amber-200">
                      Eingereichte Werbeanzeige
                    </p>

                    <h4 className="mt-3 text-xl font-black text-white">
                      {inquiry.adTitle || "Aktuelles Angebot"}
                    </h4>

                    <p className="mt-2 text-sm text-slate-300">
                      {inquiry.adDescription || "Kein Werbetext angegeben."}
                    </p>

                    <p className="mt-4 text-sm font-black text-amber-100">
                      Button: {inquiry.adCta || "Mehr erfahren"}
                    </p>
                  </div>
                )}

                {!advertisingAllowed && (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
                    Dieses Paket enthält keine aktive Werbeanzeige.
                  </div>
                )}

                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Nachricht an Neario
                  </p>

                  <p className="mt-2 text-slate-200">{inquiry.message}</p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
                  >
                    E-Mail senden
                  </a>

                  {inquiry.phone && (
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
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

                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Veröffentlichung
                  </p>

                  {inquiry.status === "converted" ? (
                    <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
                      Diese Anfrage wurde bereits als Firma veröffentlicht.
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isPublishing}
                      onClick={() => publishCompanyInquiry(inquiry.id)}
                      className="mt-4 w-full rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPublishing
                        ? "Wird veröffentlicht..."
                        : "Als Firma veröffentlichen"}
                    </button>
                  )}

                  <p className="mt-4 text-xs text-slate-500">
                    Beim Veröffentlichen wird automatisch eine echte Firma
                    erstellt, inklusive Paket, Kategorien, Suchbegriffen,
                    Kontaktdaten, Partner-Link und optionaler Werbung.
                  </p>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Status bearbeiten
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {inquiryStatusOptions.map((statusOption) => {
                      const isActive = inquiry.status === statusOption.value;

                      return (
                        <button
                          key={statusOption.value}
                          type="button"
                          disabled={isActive || isUpdating || isPublishing}
                          onClick={() =>
                            updateCompanyInquiryStatus(
                              inquiry.id,
                              statusOption.value
                            )
                          }
                          className={`rounded-2xl px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isActive
                              ? "bg-cyan-300 text-slate-950"
                              : "border border-white/15 text-white hover:border-cyan-300/30 hover:bg-white/10"
                          }`}
                        >
                          {isUpdating && !isActive
                            ? "Speichert..."
                            : statusOption.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
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

function InfoLine({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <p className={wide ? "md:col-span-2" : ""}>
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