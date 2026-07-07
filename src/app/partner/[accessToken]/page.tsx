"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  canCompanyUseAdvertising,
  getCompanyPlanDescription,
  getCompanyPlanLabel,
} from "@/data/plans";
import type { Company } from "@/types/company";

type PartnerLead = {
  id: string;
  companyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  sourceQuery: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type PartnerDashboardResponse = {
  company: Company;
  leads: PartnerLead[];
};

type PartnerProfileForm = {
  imageUrl: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  adTitle: string;
  adDescription: string;
  adCta: string;
};

type CompanyWithAddress = Company & {
  address?: string | null;
  adress?: string | null;
  companyName?: string | null;
  title?: string | null;
  subCategories?: unknown;
};

const emptyPartnerProfileForm: PartnerProfileForm = {
  imageUrl: "",
  phone: "",
  email: "",
  website: "",
  description: "",
  adTitle: "",
  adDescription: "",
  adCta: "",
};

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

function getSafeString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function normalizeText(value: unknown) {
  return getSafeString(value)
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

function getSafeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => getSafeString(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmedValue);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => getSafeString(item).trim()).filter(Boolean);
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

function uniqueValues(values: string[]) {
  const seenValues = new Set<string>();
  const uniqueItems: string[] = [];

  values.forEach((value) => {
    const cleanValue = value.trim();
    const normalizedValue = normalizeText(cleanValue);

    if (!cleanValue || !normalizedValue || seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    uniqueItems.push(cleanValue);
  });

  return uniqueItems;
}

function getCompanyName(company: Company) {
  const safeCompany = company as CompanyWithAddress;

  return (
    getSafeString(company.name).trim() ||
    getSafeString(safeCompany.companyName).trim() ||
    getSafeString(safeCompany.title).trim() ||
    "Unbenannte Firma"
  );
}

function getCompanyAddress(company: Company) {
  const safeCompany = company as CompanyWithAddress;

  return (
    getSafeString(safeCompany.address).trim() ||
    getSafeString(safeCompany.adress).trim()
  );
}

function valueAlreadyContainsCity(value: string, city: string) {
  const normalizedValue = normalizeText(value);
  const normalizedCity = normalizeText(city);

  if (!normalizedValue || !normalizedCity) {
    return false;
  }

  return normalizedValue.includes(normalizedCity);
}

function getCompanyLocationLine(company: Company) {
  const city = getSafeString(company.city).trim();
  const address = getCompanyAddress(company);

  if (address && city && !valueAlreadyContainsCity(address, city)) {
    return `${address}, ${city}`;
  }

  return address || city || "Ort offen";
}

function getDisplayedSubCategories(company: Company) {
  const safeCompany = company as CompanyWithAddress;
  const subCategories = uniqueValues(
    getSafeStringArray(safeCompany.subCategories)
  );

  if (subCategories.length > 0) {
    return subCategories;
  }

  const subCategory = getSafeString(company.subCategory).trim();
  const category = getSafeString(company.category).trim();

  if (subCategory) {
    return [subCategory];
  }

  if (category) {
    return [category];
  }

  return [];
}

function getDisplayedMainCategory(company: Company) {
  return getSafeString(company.mainCategory, "Allgemein") || "Allgemein";
}

function createProfileForm(company: Company): PartnerProfileForm {
  return {
    imageUrl: getSafeString(company.imageUrl),
    phone: getSafeString(company.phone),
    email: getSafeString(company.email),
    website: getSafeString(company.website),
    description: getSafeString(company.description),
    adTitle: getSafeString(company.ad?.title),
    adDescription: getSafeString(company.ad?.description),
    adCta: getSafeString(company.ad?.cta),
  };
}

function getStatusLabel(status: string) {
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

function getStatusClassName(status: string) {
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

function getPlanBadgeClassName(plan: string | undefined) {
  if (plan === "premium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (plan === "pro") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (plan === "starter") {
    return "border-blue-300/30 bg-blue-300/10 text-blue-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-300";
}

function getLeadSearchText(lead: PartnerLead) {
  return normalizeText(
    [
      lead.customerName,
      lead.customerEmail,
      lead.customerPhone,
      lead.message,
      lead.sourceQuery,
      getStatusLabel(lead.status),
      lead.status,
    ].join(" ")
  );
}

function companyHasImage(company: Company) {
  return Boolean(getSafeString(company.imageUrl).trim());
}

function getWebsiteHref(value: unknown) {
  const website = getSafeString(value).trim();

  if (!website) {
    return "";
  }

  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }

  return `https://${website}`;
}

function formatDateTime(dateValue: string | null | undefined) {
  const dateString = getSafeString(dateValue).trim();
  const date = new Date(dateString);

  if (!dateString || Number.isNaN(date.getTime())) {
    return "Nicht angegeben";
  }

  return date.toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PartnerDashboardPage({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = React.use(params);

  const [company, setCompany] = useState<Company | null>(null);
  const [leads, setLeads] = useState<PartnerLead[]>([]);
  const [profileForm, setProfileForm] = useState<PartnerProfileForm>(
    emptyPartnerProfileForm
  );

  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const [selectedLeadStatus, setSelectedLeadStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");

  useEffect(() => {
    loadPartnerDashboard();
  }, [accessToken]);

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
    return leads.filter((lead) => getSafeString(lead.sourceQuery).trim());
  }, [leads]);

  const sortedLeads = useMemo(() => {
    return [...leads].sort((firstLead, secondLead) => {
      return (
        new Date(secondLead.createdAt).getTime() -
        new Date(firstLead.createdAt).getTime()
      );
    });
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const normalizedSearchQuery = normalizeText(leadSearchQuery);

    return sortedLeads.filter((lead) => {
      const matchesSearch =
        !normalizedSearchQuery ||
        getLeadSearchText(lead).includes(normalizedSearchQuery);

      const matchesStatus =
        !selectedLeadStatus || lead.status === selectedLeadStatus;

      return matchesSearch && matchesStatus;
    });
  }, [sortedLeads, leadSearchQuery, selectedLeadStatus]);

  const hasActiveLeadFilters = Boolean(leadSearchQuery || selectedLeadStatus);

  async function loadPartnerDashboard() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch(`/api/partner/${accessToken}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Partner-Dashboard konnte nicht geladen werden."
        );
      }

      const data = (await response.json()) as PartnerDashboardResponse;

      setCompany(data.company);
      setLeads(data.leads);
      setProfileForm(createProfileForm(data.company));
    } catch (error) {
      setCompany(null);
      setLeads([]);
      setProfileForm(emptyPartnerProfileForm);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Laden des Partner-Dashboards ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  function updateProfileField(field: keyof PartnerProfileForm, value: string) {
    setProfileForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function uploadCompanyImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingImage(true);
      setProfileSuccessMessage("");
      setProfileErrorMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/company-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Bild konnte nicht hochgeladen werden."
        );
      }

      const data = (await response.json()) as {
        imageUrl: string;
      };

      updateProfileField("imageUrl", data.imageUrl);
      setProfileSuccessMessage(
        "Bild wurde hochgeladen. Speichere das Profil, damit es übernommen wird."
      );

      setTimeout(() => {
        setProfileSuccessMessage("");
      }, 5000);
    } catch (error) {
      if (error instanceof Error) {
        setProfileErrorMessage(error.message);
      } else {
        setProfileErrorMessage(
          "Beim Hochladen des Bildes ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  function removeCompanyImage() {
    updateProfileField("imageUrl", "");
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company) {
      return;
    }

    const advertisingAllowed = canCompanyUseAdvertising(company.plan);

    try {
      setIsSavingProfile(true);
      setProfileSuccessMessage("");
      setProfileErrorMessage("");

      const hasAd =
        advertisingAllowed &&
        (profileForm.adTitle.trim() ||
          profileForm.adDescription.trim() ||
          profileForm.adCta.trim());

      const response = await fetch(`/api/partner/${accessToken}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: profileForm.imageUrl.trim(),
          phone: profileForm.phone.trim(),
          email: profileForm.email.trim(),
          website: profileForm.website.trim(),
          description: profileForm.description.trim(),
          ad: hasAd
            ? {
                title: profileForm.adTitle.trim(),
                description: profileForm.adDescription.trim(),
                cta: profileForm.adCta.trim(),
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Firmenprofil konnte nicht gespeichert werden."
        );
      }

      const data = (await response.json()) as PartnerDashboardResponse;

      setCompany(data.company);
      setLeads(data.leads);
      setProfileForm(createProfileForm(data.company));
      setProfileSuccessMessage("Firmenprofil wurde erfolgreich gespeichert.");

      setTimeout(() => {
        setProfileSuccessMessage("");
      }, 4000);
    } catch (error) {
      if (error instanceof Error) {
        setProfileErrorMessage(error.message);
      } else {
        setProfileErrorMessage(
          "Beim Speichern des Firmenprofils ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function updateLeadStatus(leadId: string, status: string) {
    try {
      setUpdatingLeadId(leadId);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await fetch(
        `/api/partner/${accessToken}/leads/${leadId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Lead-Status konnte nicht geändert werden."
        );
      }

      const updatedLead = (await response.json()) as PartnerLead;

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );

      setSuccessMessage("Lead-Status wurde aktualisiert.");

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

  function resetLeadFilters() {
    setLeadSearchQuery("");
    setSelectedLeadStatus("");
  }

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
        <BackgroundGlow />

        <section className="relative mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-300" />
              Partner-Dashboard wird geladen...
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!company) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
        <BackgroundGlow />

        <section className="relative mx-auto max-w-4xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Locario Partner
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Partner-Zugang nicht gefunden
            </h1>

            {errorMessage && (
              <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
                {errorMessage}
              </div>
            )}

            <p className="mt-4 text-slate-300">
              Prüfe bitte, ob der Partner-Link vollständig und korrekt ist.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
            >
              Zur Startseite
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const companyName = getCompanyName(company);
  const companyLocationLine = getCompanyLocationLine(company);
  const companyAddress = getCompanyAddress(company);
  const displayedMainCategory = getDisplayedMainCategory(company);
  const displayedSubCategories = getDisplayedSubCategories(company);
  const advertisingAllowed = canCompanyUseAdvertising(company.plan);
  const planLabel = getCompanyPlanLabel(company.plan);
  const planDescription = getCompanyPlanDescription(company.plan);
  const hasImage = companyHasImage(company);
  const publicWebsiteHref = getWebsiteHref(company.website);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
      <BackgroundGlow />

      <section className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/30">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/70" />
              Locario Partner-Dashboard
            </div>

            <h1 className="mt-6 max-w-5xl break-words text-5xl font-black tracking-tight md:text-7xl">
              {companyName}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="max-w-full rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-slate-200">
                📍 {companyLocationLine}
              </span>

              <span
                className={`rounded-full border px-4 py-2 text-sm font-black ${getPlanBadgeClassName(
                  company.plan
                )}`}
              >
                Paket: {planLabel}
              </span>

              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100">
                {displayedMainCategory}
              </span>
            </div>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Verwalte dein Firmenprofil, aktualisiere Kontaktdaten, ändere
              dein Titelbild und bearbeite Kundenanfragen, die über Locario
              eingegangen sind.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={`/firmen/${company.id}`}
                className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              >
                Öffentliches Profil ansehen
              </Link>

              <button
                type="button"
                onClick={loadPartnerDashboard}
                className="rounded-3xl border border-white/15 bg-white/[0.04] px-7 py-4 text-center font-black text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10"
              >
                Aktualisieren
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Überblick
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Deine Locario-Aktivität
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DashboardCard
                title="Leads gesamt"
                value={leads.length.toString()}
                description="Alle Anfragen"
              />

              <DashboardCard
                title="Neu"
                value={newLeads.length.toString()}
                description="Noch offen"
              />

              <DashboardCard
                title="In Bearbeitung"
                value={inProgressLeads.length.toString()}
                description="Aktive Kontakte"
              />

              <DashboardCard
                title="Erledigt"
                value={doneLeads.length.toString()}
                description="Abgeschlossen"
              />
            </div>

            <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="font-black text-cyan-100">{planLabel}</p>
              <p className="mt-2 text-sm text-slate-300">{planDescription}</p>
            </div>
          </div>
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

        <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Firmenprofil
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Aktuelle Darstellung
            </h2>

            <p className="mt-3 text-slate-400">
              So wird dein Unternehmen aktuell auf Locario dargestellt.
            </p>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50">
              {hasImage ? (
                <img
                  src={company.imageUrl}
                  alt={companyName}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-slate-950 text-sm font-bold text-slate-400">
                  Noch kein Titelbild hinterlegt
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {displayedSubCategories.map((subCategory, subCategoryIndex) => (
                <span
                  key={`${normalizeText(subCategory)}-${subCategoryIndex}`}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                >
                  {subCategory}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Beschreibung
              </p>

              <p className="mt-3 whitespace-pre-line break-words text-slate-200">
                {company.description}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoBox title="Ort" value={company.city || "Nicht angegeben"} />

              <InfoBox
                title="Adresse"
                value={companyAddress || "Nicht angegeben"}
              />

              <InfoBox
                title="Telefon"
                value={company.phone || "Nicht angegeben"}
              />

              <InfoBox
                title="E-Mail"
                value={company.email || "Nicht angegeben"}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <InfoBox
                title="Website"
                value={company.website || "Nicht angegeben"}
              />

              <InfoBox title="Paket" value={planLabel} />
            </div>

            {publicWebsiteHref && (
              <a
                href={publicWebsiteHref}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                Website öffnen
              </a>
            )}

            {advertisingAllowed && company.ad && (
              <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                  Aktive Werbung
                </p>

                <h3 className="mt-3 break-words text-2xl font-black">
                  {company.ad.title}
                </h3>

                <p className="mt-2 whitespace-pre-line break-words text-slate-300">
                  {company.ad.description}
                </p>

                <p className="mt-4 text-sm font-black text-cyan-100">
                  Button: {company.ad.cta}
                </p>
              </div>
            )}

            {!advertisingAllowed && (
              <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-amber-200">
                  Werbung nicht verfügbar
                </p>

                <h3 className="mt-2 text-xl font-black text-white">
                  Werbeanzeigen sind ab Pro verfügbar
                </h3>

                <p className="mt-2 text-slate-300">
                  Mit dem Pro- oder Premium-Paket kannst du ein aktives Angebot
                  auf deinem Firmenprofil und in den Suchergebnissen anzeigen.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Profil bearbeiten
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Firmenangaben aktualisieren
            </h2>

            <p className="mt-3 text-slate-400">
              Kontaktdaten, Beschreibung, Titelbild und Werbung kannst du selbst
              bearbeiten. Name, Ort, Adresse, Kategorien und Paket werden aktuell
              von Locario verwaltet.
            </p>

            {profileSuccessMessage && (
              <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
                {profileSuccessMessage}
              </div>
            )}

            {profileErrorMessage && (
              <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
                {profileErrorMessage}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="mt-8 space-y-5">
              <ImageUploadField
                imageUrl={profileForm.imageUrl}
                isUploading={isUploadingImage}
                onUpload={uploadCompanyImage}
                onRemove={removeCompanyImage}
              />

              <div className="grid gap-5 md:grid-cols-3">
                <InputField
                  label="Telefon"
                  value={profileForm.phone}
                  onChange={(value) => updateProfileField("phone", value)}
                  placeholder="+41 31 000 00 00"
                />

                <InputField
                  label="E-Mail"
                  value={profileForm.email}
                  onChange={(value) => updateProfileField("email", value)}
                  placeholder="info@firma.ch"
                />

                <InputField
                  label="Website"
                  value={profileForm.website}
                  onChange={(value) => updateProfileField("website", value)}
                  placeholder="https://www.firma.ch"
                />
              </div>

              <TextareaField
                label="Beschreibung"
                value={profileForm.description}
                onChange={(value) => updateProfileField("description", value)}
                placeholder="Beschreibe dein Unternehmen und deine wichtigsten Leistungen."
                rows={5}
                required
              />

              {advertisingAllowed && (
                <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <h3 className="text-xl font-black text-cyan-100">
                    Werbeanzeige / Angebot
                  </h3>

                  <p className="mt-2 text-sm text-slate-300">
                    Optional: Wenn alle Werbefelder leer sind, wird keine
                    Werbung angezeigt.
                  </p>

                  <div className="mt-5 space-y-5">
                    <InputField
                      label="Werbetitel"
                      value={profileForm.adTitle}
                      onChange={(value) => updateProfileField("adTitle", value)}
                      placeholder="Zum Beispiel: Gratis Beratung"
                    />

                    <TextareaField
                      label="Werbetext"
                      value={profileForm.adDescription}
                      onChange={(value) =>
                        updateProfileField("adDescription", value)
                      }
                      placeholder="Beschreibe dein aktuelles Angebot."
                      rows={4}
                    />

                    <InputField
                      label="Button-Text"
                      value={profileForm.adCta}
                      onChange={(value) => updateProfileField("adCta", value)}
                      placeholder="Zum Beispiel: Angebot anfragen"
                    />
                  </div>
                </div>
              )}

              {!advertisingAllowed && (
                <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5">
                  <p className="font-black text-amber-200">
                    Werbeanzeige nicht im aktuellen Paket enthalten
                  </p>

                  <h3 className="mt-2 text-xl font-black text-white">
                    Upgrade auf Pro oder Premium
                  </h3>

                  <p className="mt-2 text-slate-300">
                    Im Starter-Paket kannst du dein Firmenprofil und deine
                    Kontaktdaten bearbeiten. Eigene Werbeanzeigen und Angebote
                    sind ab dem Pro-Paket verfügbar.
                  </p>

                  <p className="mt-4 text-sm text-amber-100">
                    Wende dich an Locario, wenn du dein Paket erweitern möchtest.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingProfile || isUploadingImage}
                className="w-full rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile
                  ? "Profil wird gespeichert..."
                  : "Profil speichern"}
              </button>
            </form>
          </section>
        </div>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Kundenanfragen
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Leads bearbeiten
              </h2>

              <p className="mt-3 text-slate-400">
                Diese Anfragen wurden über dein Locario-Firmenprofil gesendet.
              </p>
            </div>

            {hasActiveLeadFilters && (
              <button
                type="button"
                onClick={resetLeadFilters}
                className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_16rem]">
            <InputField
              label="Leads suchen"
              value={leadSearchQuery}
              onChange={setLeadSearchQuery}
              placeholder="Name, E-Mail, Telefon, Nachricht..."
            />

            <SelectField
              label="Status"
              value={selectedLeadStatus}
              onChange={setSelectedLeadStatus}
              options={[
                { value: "", label: "Alle Status" },
                { value: "new", label: "Neu" },
                { value: "in_progress", label: "In Bearbeitung" },
                { value: "done", label: "Erledigt" },
              ]}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <MiniStat
              title="Gefiltert"
              value={filteredLeads.length.toString()}
              description={`von ${leads.length} Leads`}
            />

            <MiniStat
              title="Neu"
              value={newLeads.length.toString()}
              description="Noch nicht bearbeitet"
            />

            <MiniStat
              title="Mit Suchquelle"
              value={leadsWithSourceQuery.length.toString()}
              description="Über Suche entstanden"
            />

            <MiniStat
              title="Erledigt"
              value={doneLeads.length.toString()}
              description="Abgeschlossen"
            />
          </div>

          {leads.length === 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
              Noch keine Kundenanfragen vorhanden.
            </div>
          )}

          {leads.length > 0 && filteredLeads.length === 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
              Kein Lead passt zu deinem Filter.
            </div>
          )}

          {filteredLeads.length > 0 && (
            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              {filteredLeads.map((lead) => {
                const leadEmail = getSafeString(lead.customerEmail).trim();
                const leadPhone = getSafeString(lead.customerPhone).trim();
                const leadSourceQuery = getSafeString(lead.sourceQuery).trim();

                return (
                  <article
                    key={lead.id}
                    className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-slate-950/20"
                  >
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div className="min-w-0">
                        <h3 className="break-words text-2xl font-black tracking-tight">
                          {lead.customerName}
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                          {formatDateTime(lead.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClassName(
                          lead.status
                        )}`}
                      >
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                      <InfoLine
                        label="E-Mail"
                        value={leadEmail || "Nicht angegeben"}
                      />

                      <InfoLine
                        label="Telefon"
                        value={leadPhone || "Nicht angegeben"}
                      />
                    </div>

                    {leadSourceQuery && (
                      <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                        <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                          Quelle / Suche
                        </p>

                        <p className="mt-2 break-words text-slate-200">
                          {leadSourceQuery}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Nachricht
                      </p>

                      <p className="mt-2 whitespace-pre-line break-words text-slate-200">
                        {lead.message}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      {leadEmail && (
                        <a
                          href={`mailto:${leadEmail}`}
                          className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
                        >
                          E-Mail senden
                        </a>
                      )}

                      {leadPhone && (
                        <a
                          href={`tel:${leadPhone}`}
                          className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
                        >
                          Anrufen
                        </a>
                      )}
                    </div>

                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Status bearbeiten
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {leadStatusOptions.map((statusOption) => {
                          const isActive = lead.status === statusOption.value;
                          const isUpdating = updatingLeadId === lead.id;

                          return (
                            <button
                              key={statusOption.value}
                              type="button"
                              disabled={isActive || isUpdating}
                              onClick={() =>
                                updateLeadStatus(lead.id, statusOption.value)
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
      </section>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-12rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-[-14rem] top-[10rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-[18rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-4xl font-black text-cyan-200">{value}</p>

      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </article>
  );
}

function MiniStat({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black text-white">{value}</p>

      <p className="mt-2 text-sm text-slate-400">{description}</p>
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
        Firmenbild / Titelbild
      </label>

      <p className="mt-2 text-sm text-slate-400">
        Dieses Bild erscheint oben auf der Firmenkarte, in der Suche und im
        öffentlichen Firmenprofil. Erlaubt sind JPG, PNG und WebP bis 5 MB.
      </p>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Firmenbild Vorschau"
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-slate-950 text-sm font-bold text-slate-400">
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

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 break-words font-bold text-white">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="break-words">
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
        rows={rows}
        required={required}
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
