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
  findMainCategoryForSubCategory,
  getSubcategoriesForMainCategory,
  mainCategories,
} from "@/data/categories";
import {
  getAutomaticCompanySearchTerms,
  getCompanySearchSuggestions,
} from "@/data/search-taxonomy";
import {
  canCompanyReceiveLeads,
  canCompanyUseAdvertising,
  canCompanyUsePartnerDashboard,
  companyPlans,
  getCompanyPlanDescription,
  getCompanyPlanLabel,
} from "@/data/plans";
import type { Company } from "@/types/company";

type DrawerMode = "closed" | "create" | "edit" | "details";

type CompanyForm = {
  name: string;
  imageUrl: string;
  plan: string;
  mainCategory: string;
  subCategories: string[];
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  tags: string;
  searchTerms: string;
  adTitle: string;
  adDescription: string;
  adCta: string;
};

type SafeCompany = Company & {
  address?: string | null;
  adress?: string | null;
  companyName?: string | null;
  title?: string | null;
};

const emptyForm: CompanyForm = {
  name: "",
  imageUrl: "",
  plan: "pilot",
  mainCategory: "",
  subCategories: [],
  city: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  description: "",
  tags: "",
  searchTerms: "",
  adTitle: "",
  adDescription: "",
  adCta: "",
};

const companiesPerPage = 25;

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

function normalizeTerm(value: string) {
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

function getDisplayedSubCategories(company: Company) {
  const subCategories = getSafeStringArray(company.subCategories);

  if (subCategories.length > 0) {
    return subCategories;
  }

  if (company.subCategory) {
    return [company.subCategory];
  }

  if (company.category) {
    return [company.category];
  }

  return [];
}

function getDisplayedMainCategory(company: Company) {
  if (company.mainCategory && company.mainCategory !== "Allgemein") {
    return company.mainCategory;
  }

  const subCategories = getDisplayedSubCategories(company);
  const inferredMainCategory = findMainCategoryForSubCategory(
    subCategories[0] || company.category
  );

  return inferredMainCategory || company.mainCategory || "Allgemein";
}

function getCompanyAddress(company: Company) {
  const safeCompany = company as SafeCompany;

  return (
    getSafeString(safeCompany.address).trim() ||
    getSafeString(safeCompany.adress).trim()
  );
}

function valueAlreadyContainsCity(value: string, city: string) {
  const normalizedValue = normalizeTerm(value);
  const normalizedCity = normalizeTerm(city);

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

function getCompanyLocationName(company: Company) {
  return getSafeString(company.locationName).trim();
}

function getCompanyDisplayName(company: Company) {
  const locationName = getCompanyLocationName(company);

  if (locationName) {
    return `${company.name} · ${locationName}`;
  }

  return company.name;
}

function getLocationStatusLabel(company: Company) {
  if (company.parentCompanyId && company.parentCompany?.name) {
    return `Filiale von ${company.parentCompany.name}`;
  }

  if (company.parentCompanyId) {
    return "Filiale / Standort";
  }

  if (company.locations && company.locations.length > 0) {
    return `Hauptfirma · ${company.locations.length} Standort${
      company.locations.length === 1 ? "" : "e"
    }`;
  }

  if (company.locationName) {
    return "Hauptsitz / Einzelstandort";
  }

  return "Einzelstandort";
}

function getLocationStatusFilterValue(company: Company) {
  if (company.parentCompanyId) {
    return "location-company";
  }

  if (company.locations && company.locations.length > 0) {
    return "main-company";
  }

  if (company.locationName) {
    return "named-single";
  }

  return "single-location";
}

function getLocationStatusClassName(company: Company) {
  const status = getLocationStatusFilterValue(company);

  if (status === "location-company") {
    return "border-blue-300/30 bg-blue-300/10 text-blue-100";
  }

  if (status === "main-company") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "named-single") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-300";
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

function getCompanySearchText(company: Company) {
  return [
    company.name,
    getCompanyDisplayName(company),
    company.locationName,
    getLocationStatusLabel(company),
    company.parentCompany?.name,
    company.parentCompany?.locationName,
    company.parentCompany?.city,
    company.parentCompany?.address,
    company.parentCompany?.adress,
    ...(company.locations ?? []).flatMap((location) => [
      location.name,
      location.locationName,
      location.city,
      location.address,
      location.adress,
    ]),
    company.plan,
    company.city,
    getCompanyAddress(company),
    getCompanyLocationLine(company),
    company.mainCategory,
    company.subCategory,
    company.category,
    company.description,
    ...getDisplayedSubCategories(company),
    ...getSafeStringArray(company.tags),
    ...getSafeStringArray(company.searchTerms),
    company.email,
    company.phone,
    company.website,
    company.ad?.title ?? "",
    company.ad?.description ?? "",
    company.ad?.cta ?? "",
  ]
    .join(" ")
    .toLowerCase();
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

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<CompanyForm>(emptyForm);

  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);

  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("");
  const [selectedVisibilityFilter, setSelectedVisibilityFilter] = useState("");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(
    null
  );

  const isEditing = drawerMode === "edit" && Boolean(editingCompanyId);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    companySearchQuery,
    selectedPlanFilter,
    selectedVisibilityFilter,
    selectedLocationFilter,
  ]);

  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId) {
      return null;
    }

    return companies.find((company) => company.id === selectedCompanyId) ?? null;
  }, [companies, selectedCompanyId]);

  const availableSubCategories = useMemo(() => {
    const baseSubCategories = getSubcategoriesForMainCategory(form.mainCategory);

    const customSelectedSubCategories = form.subCategories.filter(
      (subCategory) => !baseSubCategories.includes(subCategory)
    );

    return [...baseSubCategories, ...customSelectedSubCategories];
  }, [form.mainCategory, form.subCategories]);

  const automaticSearchSuggestions = useMemo(() => {
    return uniqueTerms(
      getCompanySearchSuggestions({
        mainCategory: form.mainCategory,
        subCategories: form.subCategories,
        tags: getFormTerms(form.tags),
      })
    );
  }, [form.mainCategory, form.subCategories, form.tags]);

  const selectedSearchTerms = useMemo(() => {
    return uniqueTerms(getFormTerms(form.searchTerms)).map(normalizeTerm);
  }, [form.searchTerms]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearchQuery = companySearchQuery.trim().toLowerCase();

    return companies
      .filter((company) => {
        const matchesSearch =
          !normalizedSearchQuery ||
          getCompanySearchText(company).includes(normalizedSearchQuery);

        const matchesPlan =
          !selectedPlanFilter || company.plan === selectedPlanFilter;

        const matchesVisibility =
          !selectedVisibilityFilter ||
          (selectedVisibilityFilter === "with-image" &&
            Boolean(company.imageUrl)) ||
          (selectedVisibilityFilter === "without-image" && !company.imageUrl) ||
          (selectedVisibilityFilter === "with-ad" && Boolean(company.ad)) ||
          (selectedVisibilityFilter === "with-dashboard" &&
            canCompanyUsePartnerDashboard(company.plan)) ||
          (selectedVisibilityFilter === "without-dashboard" &&
            !canCompanyUsePartnerDashboard(company.plan));

        const matchesLocation =
          !selectedLocationFilter ||
          getLocationStatusFilterValue(company) === selectedLocationFilter;

        return matchesSearch && matchesPlan && matchesVisibility && matchesLocation;
      })
      .sort((firstCompany, secondCompany) =>
        getSafeString(firstCompany.name).localeCompare(
          getSafeString(secondCompany.name)
        )
      );
  }, [
    companies,
    companySearchQuery,
    selectedPlanFilter,
    selectedVisibilityFilter,
    selectedLocationFilter,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredCompanies.length / companiesPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, pageCount);

  const paginatedCompanies = filteredCompanies.slice(
    (safeCurrentPage - 1) * companiesPerPage,
    safeCurrentPage * companiesPerPage
  );

  const starterCompanies = companies.filter(
    (company) => company.plan === "starter"
  );
  const proCompanies = companies.filter((company) => company.plan === "pro");
  const premiumCompanies = companies.filter(
    (company) => company.plan === "premium"
  );
  const mainLocationCompanies = companies.filter(
    (company) => !company.parentCompanyId && company.locations && company.locations.length > 0
  );
  const locationCompanies = companies.filter((company) => company.parentCompanyId);
  const singleLocationCompanies = companies.filter(
    (company) => !company.parentCompanyId && (!company.locations || company.locations.length === 0)
  );

  const hasActiveFilters =
    companySearchQuery ||
    selectedPlanFilter ||
    selectedVisibilityFilter ||
    selectedLocationFilter;

  async function loadCompanies() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/companies", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Firmen konnten nicht geladen werden.");
      }

      const data = (await response.json()) as Company[];
      setCompanies(data);
    } catch {
      setErrorMessage(
        "Die Firmen konnten nicht aus der Datenbank geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(field: keyof CompanyForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function updatePlan(value: string) {
    setForm((currentForm) => {
      const planAllowsAdvertising = canCompanyUseAdvertising(value);

      return {
        ...currentForm,
        plan: value,
        adTitle: planAllowsAdvertising ? currentForm.adTitle : "",
        adDescription: planAllowsAdvertising ? currentForm.adDescription : "",
        adCta: planAllowsAdvertising ? currentForm.adCta : "",
      };
    });
  }

  function updateMainCategory(value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      mainCategory: value,
      subCategories: [],
    }));
  }

  function toggleSubCategory(subCategory: string) {
    setForm((currentForm) => {
      const isSelected = currentForm.subCategories.includes(subCategory);

      if (isSelected) {
        return {
          ...currentForm,
          subCategories: currentForm.subCategories.filter(
            (item) => item !== subCategory
          ),
        };
      }

      return {
        ...currentForm,
        subCategories: [...currentForm.subCategories, subCategory],
      };
    });
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
    setCompanySearchQuery("");
    setSelectedPlanFilter("");
    setSelectedVisibilityFilter("");
    setSelectedLocationFilter("");
    setCurrentPage(1);
  }

  async function uploadCompanyImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingImage(true);
      setErrorMessage("");
      setSuccessMessage("");

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

      updateField("imageUrl", data.imageUrl);
      setSuccessMessage(
        "Bild wurde hochgeladen. Speichere die Firma, damit es übernommen wird."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Hochladen des Bildes ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  function removeCompanyImage() {
    updateField("imageUrl", "");
  }

  async function copyPartnerLink(company: Company) {
    const partnerPath = getPartnerPath(company);

    if (!partnerPath) {
      setErrorMessage(
        "Dieses Paket hat keinen Partner-Zugang. Partner-Dashboard ist erst ab Pro verfügbar."
      );
      return;
    }

    const partnerLink = `${window.location.origin}${partnerPath}`;

    try {
      await navigator.clipboard.writeText(partnerLink);
      setSuccessMessage("Partner-Link wurde kopiert.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch {
      setErrorMessage("Partner-Link konnte nicht kopiert werden.");
    }
  }

  function openCreateDrawer() {
    setForm(emptyForm);
    setEditingCompanyId(null);
    setSelectedCompanyId(null);
    setDrawerMode("create");
    setSuccessMessage("");
    setErrorMessage("");
  }

  function openDetailsDrawer(company: Company) {
    setSelectedCompanyId(company.id);
    setEditingCompanyId(null);
    setDrawerMode("details");
    setSuccessMessage("");
    setErrorMessage("");
  }

  function openEditDrawer(company: Company) {
    const existingSubCategories =
      company.subCategories && company.subCategories.length > 0
        ? getSafeStringArray(company.subCategories)
        : [company.subCategory || company.category].filter(Boolean);

    const fallbackMainCategory =
      company.mainCategory ||
      findMainCategoryForSubCategory(existingSubCategories[0] || "") ||
      "";

    setEditingCompanyId(company.id);
    setSelectedCompanyId(company.id);
    setDrawerMode("edit");

    setForm({
      name: getSafeString(company.name),
      imageUrl: getSafeString(company.imageUrl),
      plan: getSafeString(company.plan, "pilot") || "pilot",
      mainCategory: fallbackMainCategory,
      subCategories: existingSubCategories,
      city: getSafeString(company.city),
      address: getCompanyAddress(company),
      phone: getSafeString(company.phone),
      email: getSafeString(company.email),
      website: getSafeString(company.website),
      description: getSafeString(company.description),
      tags: getSafeStringArray(company.tags).join(", "),
      searchTerms: getSafeStringArray(company.searchTerms).join(", "),
      adTitle: canCompanyUseAdvertising(company.plan)
        ? company.ad?.title ?? ""
        : "",
      adDescription: canCompanyUseAdvertising(company.plan)
        ? company.ad?.description ?? ""
        : "",
      adCta: canCompanyUseAdvertising(company.plan) ? company.ad?.cta ?? "" : "",
    });

    setSuccessMessage("");
    setErrorMessage("");
  }

  function closeDrawer() {
    setDrawerMode("closed");
    setEditingCompanyId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.subCategories.length === 0) {
      setErrorMessage("Bitte wähle mindestens eine Unterkategorie aus.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const tags = getFormTerms(form.tags);
      const primarySubCategory = form.subCategories[0];

      const editableSearchTerms = getFormTerms(form.searchTerms);
      const fallbackSearchTerms = getAutomaticCompanySearchTerms({
        mainCategory: form.mainCategory,
        subCategories: form.subCategories,
        tags,
      });

      const searchTerms =
        editableSearchTerms.length > 0 ? editableSearchTerms : fallbackSearchTerms;

      const hasAd =
        canCompanyUseAdvertising(form.plan) &&
        (form.adTitle.trim() ||
          form.adDescription.trim() ||
          form.adCta.trim());

      const payload = {
        name: form.name,
        imageUrl: form.imageUrl,
        plan: form.plan,
        mainCategory: form.mainCategory,
        subCategory: primarySubCategory,
        subCategories: form.subCategories,
        category: primarySubCategory,
        city: form.city,
        address: form.address,
        phone: form.phone,
        email: form.email,
        website: form.website,
        description: form.description,
        tags,
        searchTerms,
        ad: hasAd
          ? {
              title: form.adTitle,
              description: form.adDescription,
              cta: form.adCta || "Mehr erfahren",
            }
          : undefined,
      };

      const response = await fetch(
        isEditing ? `/api/companies/${editingCompanyId}` : "/api/companies",
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
              ? "Firma konnte nicht bearbeitet werden."
              : "Firma konnte nicht gespeichert werden.")
        );
      }

      const savedCompany = (await response.json()) as Company;

      if (isEditing) {
        setCompanies((currentCompanies) =>
          currentCompanies.map((company) =>
            company.id === savedCompany.id ? savedCompany : company
          )
        );

        setSuccessMessage("Firma wurde erfolgreich bearbeitet.");
      } else {
        setCompanies((currentCompanies) => [
          savedCompany,
          ...currentCompanies,
        ]);

        setSuccessMessage(
          "Firma wurde erfolgreich in der Datenbank gespeichert."
        );
      }

      setForm(emptyForm);
      setEditingCompanyId(null);
      setSelectedCompanyId(savedCompany.id);
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

  async function deleteCompany(id: string, name: string) {
    const confirmed = window.confirm(
      `Möchtest du "${name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCompanyId(id);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Firma konnte nicht gelöscht werden."
        );
      }

      setCompanies((currentCompanies) =>
        currentCompanies.filter((company) => company.id !== id)
      );

      if (selectedCompanyId === id) {
        closeDrawer();
        setSelectedCompanyId(null);
      }

      setSuccessMessage("Firma wurde erfolgreich gelöscht.");

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
      setDeletingCompanyId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Firmenverwaltung
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Firmen{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Tabelle
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Firmen erfassen, Suchbegriffe automatisch vorschlagen, manuell
            bearbeiten und die Trefferqualität von Locario gezielt verbessern.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/standorte"
            className="rounded-3xl border border-emerald-300/30 px-6 py-4 text-center text-sm font-black text-emerald-100 transition hover:bg-emerald-300/10"
          >
            Standorte verwalten
          </Link>

          <button
            type="button"
            onClick={openCreateDrawer}
            className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
          >
            Neue Firma
          </button>

          <button
            type="button"
            onClick={loadCompanies}
            disabled={isLoading}
            className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Lädt..." : "Aktualisieren"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        <CompactMetric label="Alle" value={companies.length} />
        <CompactMetric label="Starter" value={starterCompanies.length} />
        <CompactMetric label="Pro" value={proCompanies.length} />
        <CompactMetric label="Premium" value={premiumCompanies.length} />
        <CompactMetric label="Hauptfirmen" value={mainLocationCompanies.length} />
        <CompactMetric label="Filialen" value={locationCompanies.length} />
        <CompactMetric label="Einzel" value={singleLocationCompanies.length} />
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

            <h2 className="mt-2 text-3xl font-black">Firmenliste</h2>

            <p className="mt-2 text-sm text-slate-400">
              Kompakt, filterbar und mit bearbeitbaren Suchbegriffen im
              Hintergrund.
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
            value={companySearchQuery}
            onChange={setCompanySearchQuery}
            placeholder="Firma suchen: Name, Ort, Kategorie, Suchbegriff..."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[16rem_18rem_18rem]">
            <PlanFilterSelect
              label="Paket"
              value={selectedPlanFilter}
              onChange={setSelectedPlanFilter}
            />

            <VisibilityFilterSelect
              label="Filter"
              value={selectedVisibilityFilter}
              onChange={setSelectedVisibilityFilter}
            />

            <LocationFilterSelect
              label="Standortstatus"
              value={selectedLocationFilter}
              onChange={setSelectedLocationFilter}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 md:flex-row md:items-center">
          <p>
            <span className="font-black text-white">
              {filteredCompanies.length}
            </span>{" "}
            von{" "}
            <span className="font-black text-white">{companies.length}</span>{" "}
            Firmen gefunden.
          </p>

          <p className="text-slate-500">
            Seite {safeCurrentPage} von {pageCount} · {companiesPerPage} pro
            Seite
          </p>
        </div>

        {isLoading && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Firmen werden geladen...
          </div>
        )}

        {!isLoading && companies.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
            Noch keine Firmen in der Datenbank gespeichert.
          </div>
        )}

        {!isLoading &&
          companies.length > 0 &&
          filteredCompanies.length === 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
              Keine Firma passt zu deinem Filter.
            </div>
          )}

        {!isLoading && paginatedCompanies.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full border-collapse text-left text-sm">
                <thead className="border-b border-white/10 bg-slate-950/80 text-xs font-black uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Firma</th>
                    <th className="px-4 py-3">Standort</th>
                    <th className="px-4 py-3">Ort / Adresse</th>
                    <th className="px-4 py-3">Paket</th>
                    <th className="px-4 py-3">Features</th>
                    <th className="px-4 py-3">Kontakt</th>
                    <th className="px-4 py-3 text-right">Aktionen</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCompanies.map((company) => {
                    const displayedMainCategory =
                      getDisplayedMainCategory(company);
                    const displayedSubCategories =
                      getDisplayedSubCategories(company);
                    const partnerPath = getPartnerPath(company);
                    const hasPartnerDashboard = canCompanyUsePartnerDashboard(
                      company.plan
                    );
                    const hasLeadAccess = canCompanyReceiveLeads(company.plan);
                    const hasAdvertisingAccess = canCompanyUseAdvertising(
                      company.plan
                    );
                    const companyLocationLine = getCompanyLocationLine(company);

                    return (
                      <tr
                        key={company.id}
                        className="border-b border-white/10 bg-slate-950/35 transition last:border-b-0 hover:bg-white/[0.04]"
                      >
                        <td className="max-w-[28rem] px-4 py-4">
                          <button
                            type="button"
                            onClick={() => openDetailsDrawer(company)}
                            className="block max-w-full truncate text-left text-base font-black text-white transition hover:text-cyan-100"
                          >
                            {getCompanyDisplayName(company)}
                          </button>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {displayedMainCategory} ·{" "}
                            {displayedSubCategories.slice(0, 3).join(", ") ||
                              "Keine Unterkategorie"}
                          </p>
                        </td>

                        <td className="max-w-[18rem] px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getLocationStatusClassName(
                              company
                            )}`}
                          >
                            {getLocationStatusLabel(company)}
                          </span>
                        </td>

                        <td className="max-w-[22rem] px-4 py-4 text-slate-300">
                          <p className="truncate font-semibold text-white">
                            {companyLocationLine}
                          </p>

                          {company.city && companyLocationLine !== company.city && (
                            <p className="mt-1 truncate text-xs text-slate-500">
                              Stadt / Region: {company.city}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getPlanClassName(
                              company.plan
                            )}`}
                          >
                            {getCompanyPlanLabel(company.plan)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {company.imageUrl && <TinyDot label="Bild" />}
                            {company.ad && hasAdvertisingAccess && (
                              <TinyDot label="Werbung" />
                            )}
                            {hasLeadAccess && <TinyDot label="Leads" />}
                            {hasPartnerDashboard && (
                              <TinyDot label="Dashboard" />
                            )}
                            {!hasPartnerDashboard && (
                              <TinyDot label="Starter" />
                            )}
                          </div>
                        </td>

                        <td className="max-w-[16rem] px-4 py-4 text-slate-400">
                          <p className="truncate">
                            {company.email || "Keine E-Mail"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {company.phone || "Kein Telefon"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDetailsDrawer(company)}
                              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                            >
                              Details
                            </button>

                            <Link
                              href={`/firmen/${company.id}`}
                              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                            >
                              Öffnen
                            </Link>

                            {partnerPath && (
                              <button
                                type="button"
                                onClick={() => copyPartnerLink(company)}
                                className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/10"
                              >
                                Partner
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => openEditDrawer(company)}
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

        {!isLoading && filteredCompanies.length > companiesPerPage && (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
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

      <CompanyDrawer
        mode={drawerMode}
        company={selectedCompany}
        form={form}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        isUploadingImage={isUploadingImage}
        availableSubCategories={availableSubCategories}
        automaticSearchSuggestions={automaticSearchSuggestions}
        selectedSearchTerms={selectedSearchTerms}
        deletingCompanyId={deletingCompanyId}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        onUpdateField={updateField}
        onUpdatePlan={updatePlan}
        onUpdateMainCategory={updateMainCategory}
        onToggleSubCategory={toggleSubCategory}
        onApplyAutomaticSearchSuggestions={applyAutomaticSearchSuggestions}
        onAddSearchSuggestion={addSearchSuggestion}
        onUploadImage={uploadCompanyImage}
        onRemoveImage={removeCompanyImage}
        onEditCompany={openEditDrawer}
        onDeleteCompany={deleteCompany}
        onCopyPartnerLink={copyPartnerLink}
      />
    </section>
  );
}

function CompanyDrawer({
  mode,
  company,
  form,
  isEditing,
  isSubmitting,
  isUploadingImage,
  availableSubCategories,
  automaticSearchSuggestions,
  selectedSearchTerms,
  deletingCompanyId,
  onClose,
  onSubmit,
  onUpdateField,
  onUpdatePlan,
  onUpdateMainCategory,
  onToggleSubCategory,
  onApplyAutomaticSearchSuggestions,
  onAddSearchSuggestion,
  onUploadImage,
  onRemoveImage,
  onEditCompany,
  onDeleteCompany,
  onCopyPartnerLink,
}: {
  mode: DrawerMode;
  company: Company | null;
  form: CompanyForm;
  isEditing: boolean;
  isSubmitting: boolean;
  isUploadingImage: boolean;
  availableSubCategories: string[];
  automaticSearchSuggestions: string[];
  selectedSearchTerms: string[];
  deletingCompanyId: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateField: (field: keyof CompanyForm, value: string) => void;
  onUpdatePlan: (value: string) => void;
  onUpdateMainCategory: (value: string) => void;
  onToggleSubCategory: (value: string) => void;
  onApplyAutomaticSearchSuggestions: () => void;
  onAddSearchSuggestion: (term: string) => void;
  onUploadImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (id: string, name: string) => void;
  onCopyPartnerLink: (company: Company) => void;
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
                {isFormMode ? "Bearbeitung" : "Firmendetails"}
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-tight">
                {mode === "create"
                  ? "Neue Firma erfassen"
                  : mode === "edit"
                    ? "Firma bearbeiten"
                    : company?.name || "Firma"}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                {isFormMode
                  ? "Kategorie wählen, Vorschläge übernehmen, Suchbegriffe direkt bearbeiten."
                  : "Details, Paketlogik, Kontakt, Suchbegriffe und Aktionen zu dieser Firma."}
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
                  label="Firmenname"
                  value={form.name}
                  onChange={(value) => onUpdateField("name", value)}
                  placeholder="Zum Beispiel: Auto Meier AG"
                  required
                />

                <PlanSelectField
                  label="Paket"
                  value={form.plan}
                  onChange={onUpdatePlan}
                />

                {!canCompanyUsePartnerDashboard(form.plan) && (
                  <InfoNotice
                    title="Starter"
                    description="Kein Partner-Link, kein Dashboard und keine Locario-Leads."
                    variant="blue"
                  />
                )}

                {canCompanyUsePartnerDashboard(form.plan) && (
                  <InfoNotice
                    title="Partner-Zugang"
                    description="Partner-Link, Dashboard und Locario-Leads sind aktiv."
                    variant="emerald"
                  />
                )}

                <SelectField
                  label="Hauptkategorie"
                  value={form.mainCategory}
                  onChange={onUpdateMainCategory}
                  placeholder="Hauptkategorie auswählen"
                  options={mainCategories}
                  required
                />

                <MultiSelectField
                  label="Unterkategorien"
                  values={form.subCategories}
                  options={availableSubCategories}
                  disabled={!form.mainCategory}
                  emptyMessage={
                    form.mainCategory
                      ? "Keine Unterkategorien vorhanden."
                      : "Wähle zuerst eine Hauptkategorie."
                  }
                  onToggle={onToggleSubCategory}
                />
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
                  label="Adresse"
                  value={form.address}
                  onChange={(value) => onUpdateField("address", value)}
                  placeholder="Strasse, Hausnummer, PLZ Ort"
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <InputField
                    label="Telefon"
                    value={form.phone}
                    onChange={(value) => onUpdateField("phone", value)}
                    placeholder="+41 31 000 00 00"
                  />

                  <InputField
                    label="E-Mail"
                    value={form.email}
                    onChange={(value) => onUpdateField("email", value)}
                    placeholder="info@firma.ch"
                  />
                </div>

                <InputField
                  label="Website"
                  value={form.website}
                  onChange={(value) => onUpdateField("website", value)}
                  placeholder="https://www.firma.ch"
                />

                <TextareaField
                  label="Beschreibung"
                  value={form.description}
                  onChange={(value) => onUpdateField("description", value)}
                  placeholder="Beschreibe kurz, was die Firma anbietet."
                  required
                  rows={5}
                />
              </div>

              <div className="space-y-5">
                <InputField
                  label="Sichtbare Zusatzlabels"
                  value={form.tags}
                  onChange={(value) => onUpdateField("tags", value)}
                  placeholder="Spezielle Marken, Leistungen, Produkte..."
                />

                <SearchTermsEditor
                  value={form.searchTerms}
                  suggestions={automaticSearchSuggestions}
                  selectedTerms={selectedSearchTerms}
                  onChange={(value) => onUpdateField("searchTerms", value)}
                  onApplyAll={onApplyAutomaticSearchSuggestions}
                  onAddTerm={onAddSearchSuggestion}
                />

                <AdFields
                  plan={form.plan}
                  adTitle={form.adTitle}
                  adDescription={form.adDescription}
                  adCta={form.adCta}
                  onChange={onUpdateField}
                />

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="w-full rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? isEditing
                      ? "Änderungen werden gespeichert..."
                      : "Wird gespeichert..."
                    : isEditing
                      ? "Änderungen speichern"
                      : "Firma speichern"}
                </button>
              </div>
            </form>
          )}

          {mode === "details" && company && (
            <CompanyDetailsDrawer
              company={company}
              deletingCompanyId={deletingCompanyId}
              onEditCompany={onEditCompany}
              onDeleteCompany={onDeleteCompany}
              onCopyPartnerLink={onCopyPartnerLink}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function CompanyDetailsDrawer({
  company,
  deletingCompanyId,
  onEditCompany,
  onDeleteCompany,
  onCopyPartnerLink,
}: {
  company: Company;
  deletingCompanyId: string | null;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (id: string, name: string) => void;
  onCopyPartnerLink: (company: Company) => void;
}) {
  const displayedMainCategory = getDisplayedMainCategory(company);
  const displayedSubCategories = getDisplayedSubCategories(company);
  const partnerPath = getPartnerPath(company);
  const leadsAllowed = canCompanyReceiveLeads(company.plan);
  const partnerDashboardAllowed = canCompanyUsePartnerDashboard(company.plan);
  const advertisingAllowed = canCompanyUseAdvertising(company.plan);
  const companyLocationLine = getCompanyLocationLine(company);
  const websiteHref = getExternalHref(company.website);
  const manualTerms = uniqueTerms(getSafeStringArray(company.tags));
  const searchTerms = uniqueTerms(getSafeStringArray(company.searchTerms));

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[20rem_1fr]">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
          {company.imageUrl ? (
            <img
              src={company.imageUrl}
              alt={company.name}
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
              onClick={() => onEditCompany(company)}
              className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
            >
              Bearbeiten
            </button>

            {partnerPath && (
              <button
                type="button"
                onClick={() => onCopyPartnerLink(company)}
                className="rounded-2xl border border-emerald-300/30 px-4 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/10"
              >
                Partner-Link kopieren
              </button>
            )}

            <Link
              href={`/firmen/${company.id}`}
              className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Öffentlich öffnen
            </Link>

            <Link
              href="/admin/standorte"
              className="rounded-2xl border border-emerald-300/30 px-4 py-3 text-center text-sm font-black text-emerald-100 transition hover:bg-emerald-300/10"
            >
              Standort verwalten
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

            <button
              type="button"
              onClick={() => onDeleteCompany(company.id, company.name)}
              disabled={deletingCompanyId === company.id}
              className="rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingCompanyId === company.id ? "Löscht..." : "Firma löschen"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${getPlanClassName(
              company.plan
            )}`}
          >
            {getCompanyPlanLabel(company.plan)}
          </span>

          {leadsAllowed && <MiniBadge label="Leads" />}
          {partnerDashboardAllowed && <MiniBadge label="Dashboard" />}
          {company.ad && advertisingAllowed && (
            <MiniBadge label="Werbung" variant="emerald" />
          )}
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${getLocationStatusClassName(
              company
            )}`}
          >
            {getLocationStatusLabel(company)}
          </span>
        </div>

        <h3 className="break-words text-4xl font-black">
          {getCompanyDisplayName(company)}
        </h3>

        <p className="text-slate-400">
          {companyLocationLine} · {displayedMainCategory}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailBox title="Standortstatus" value={getLocationStatusLabel(company)} />

          <DetailBox
            title="Standortname"
            value={getCompanyLocationName(company) || "Nicht hinterlegt"}
          />

          <DetailBox title="Ort / Adresse" value={companyLocationLine} />

          <DetailBox title="Kategorie" value={displayedMainCategory} />

          <DetailBox
            title="Unterkategorien"
            value={
              displayedSubCategories.length > 0
                ? displayedSubCategories.join(", ")
                : "Keine Unterkategorie"
            }
          />

          <DetailBox
            title="Paketlogik"
            value={getCompanyPlanDescription(company.plan)}
          />

          <DetailBox
            title="Kontakt"
            value={[
              company.email || "Keine E-Mail",
              company.phone || "Kein Telefon",
            ].join(" · ")}
          />

          {partnerPath ? (
            <DetailBox title="Partner-Link" value={partnerPath} />
          ) : (
            <DetailBox
              title="Partner-Zugang"
              value="Kein Partner-Zugang in diesem Paket."
            />
          )}

          {company.ad && advertisingAllowed ? (
            <DetailBox
              title="Werbung"
              value={`${company.ad.title} · ${company.ad.cta}`}
            />
          ) : (
            <DetailBox title="Werbung" value="Keine aktive Werbeanzeige." />
          )}

          <DetailBox
            title="Suchbegriffe"
            value={
              searchTerms.length > 0
                ? searchTerms.slice(0, 30).join(", ")
                : "Noch keine Suchbegriffe."
            }
          />

          <DetailBox
            title="Sichtbare Zusatzlabels"
            value={
              manualTerms.length > 0
                ? manualTerms.join(", ")
                : "Keine Zusatzlabels."
            }
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Beschreibung
          </p>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">
            {company.description}
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
                  key={`${normalizeTerm(term)}-${termIndex}`}
                  className="rounded-full border border-cyan-300/20 bg-slate-950/50 px-3 py-1 text-xs text-cyan-100"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {manualTerms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {manualTerms.map((tag, tagIndex) => (
              <span
                key={`${normalizeTerm(tag)}-${tagIndex}`}
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
  variant?: "cyan" | "emerald" | "blue";
}) {
  const className =
    variant === "emerald"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : variant === "blue"
        ? "border-blue-300/20 bg-blue-300/10 text-blue-100"
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

function InfoNotice({
  title,
  description,
  variant,
}: {
  title: string;
  description: string;
  variant: "blue" | "emerald";
}) {
  const className =
    variant === "emerald"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : "border-blue-300/20 bg-blue-300/10 text-blue-100";

  return (
    <div className={`rounded-3xl border p-4 ${className}`}>
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
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

  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-black text-cyan-100">
            Suchbegriffe
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Diese Begriffe steuern die Suche. Du kannst sie direkt bearbeiten,
            ergänzen oder einzelne Vorschläge anklicken.
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
        placeholder="coiffeur, haare schneiden, bart schneiden, barber, balayage..."
        rows={7}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />

      <p className="mt-2 text-xs text-slate-400">
        Begriffe mit Komma trennen. Beispiel: haare schneiden, bart schneiden,
        barber
      </p>

      {shownSuggestions.length === 0 && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
          Wähle zuerst eine Hauptkategorie und Unterkategorie aus.
        </p>
      )}

      {shownSuggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
            Vorschläge
          </p>

          <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
            {shownSuggestions.map((term, termIndex) => {
              const isSelected = selectedTerms.includes(normalizeTerm(term));

              return (
                <button
                  key={`${normalizeTerm(term)}-${termIndex}`}
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
      <label className="text-sm font-bold text-slate-200">Firmenbild</label>

      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Firmenbild Vorschau"
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

function AdFields({
  plan,
  adTitle,
  adDescription,
  adCta,
  onChange,
}: {
  plan: string;
  adTitle: string;
  adDescription: string;
  adCta: string;
  onChange: (field: keyof CompanyForm, value: string) => void;
}) {
  const advertisingAllowed = canCompanyUseAdvertising(plan);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
      <h3 className="text-lg font-black text-cyan-100">Werbeanzeige</h3>

      {!advertisingAllowed && (
        <p className="mt-2 text-sm text-slate-400">
          Dieses Paket kann keine Werbeanzeige nutzen.
        </p>
      )}

      {advertisingAllowed && (
        <div className="mt-4 space-y-4">
          <InputField
            label="Werbetitel"
            value={adTitle}
            onChange={(value) => onChange("adTitle", value)}
            placeholder="Zum Beispiel: Gratis Fahrzeugcheck"
          />

          <TextareaField
            label="Werbetext"
            value={adDescription}
            onChange={(value) => onChange("adDescription", value)}
            placeholder="Beschreibe das Angebot kurz."
            rows={3}
          />

          <InputField
            label="Button-Text"
            value={adCta}
            onChange={(value) => onChange("adCta", value)}
            placeholder="Zum Beispiel: Angebot anfragen"
          />
        </div>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <input
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
  const hasCustomValue = value && !options.includes(value);

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

        {hasCustomValue && (
          <option value={value} className="bg-slate-950 text-white">
            {value}
          </option>
        )}

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

function PlanSelectField({
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
        {companyPlans.map((plan) => (
          <option
            key={plan.value}
            value={plan.value}
            className="bg-slate-950 text-white"
          >
            {plan.label} — {plan.description}
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

        {companyPlans.map((plan) => (
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

function VisibilityFilterSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = [
    {
      value: "",
      label: "Alle",
    },
    {
      value: "with-image",
      label: "Mit Bild",
    },
    {
      value: "without-image",
      label: "Ohne Bild",
    },
    {
      value: "with-ad",
      label: "Mit Werbung",
    },
    {
      value: "with-dashboard",
      label: "Mit Dashboard",
    },
    {
      value: "without-dashboard",
      label: "Ohne Dashboard",
    },
  ];

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


function LocationFilterSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = [
    {
      value: "",
      label: "Alle Standorttypen",
    },
    {
      value: "main-company",
      label: "Hauptfirmen mit Filialen",
    },
    {
      value: "location-company",
      label: "Filialen / Standorte",
    },
    {
      value: "named-single",
      label: "Hauptsitz / Einzelstandort",
    },
    {
      value: "single-location",
      label: "Einzelstandorte ohne Namen",
    },
  ];

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


function MultiSelectField({
  label,
  values,
  options,
  disabled,
  emptyMessage,
  onToggle,
}: {
  label: string;
  values: string[];
  options: string[];
  disabled: boolean;
  emptyMessage: string;
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        {options.length === 0 && (
          <p className="text-sm text-slate-400">{emptyMessage}</p>
        )}

        {options.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {options.map((option, optionIndex) => {
              const isSelected = values.includes(option);

              return (
                <button
                  key={`${normalizeTerm(option)}-${optionIndex}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggle(option)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? "border-cyan-300/50 bg-cyan-300/20 text-cyan-100"
                      : "border-white/10 bg-slate-950/50 text-slate-300 hover:border-cyan-300/30 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2">{isSelected ? "✓" : "+"}</span>
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {values.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {values.map((value, valueIndex) => (
              <span
                key={`${normalizeTerm(value)}-${valueIndex}`}
                className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950"
              >
                {value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}