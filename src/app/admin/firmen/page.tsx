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
  canCompanyReceiveLeads,
  canCompanyUseAdvertising,
  canCompanyUsePartnerDashboard,
  companyPlans,
  getCompanyPlanDescription,
  getCompanyPlanLabel,
} from "@/data/plans";
import type { Company } from "@/types/company";

type CompanyForm = {
  name: string;
  imageUrl: string;
  plan: string;
  mainCategory: string;
  subCategories: string[];
  city: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  tags: string;
  adTitle: string;
  adDescription: string;
  adCta: string;
};

const emptyForm: CompanyForm = {
  name: "",
  imageUrl: "",
  plan: "pilot",
  mainCategory: "",
  subCategories: [],
  city: "",
  phone: "",
  email: "",
  website: "",
  description: "",
  tags: "",
  adTitle: "",
  adDescription: "",
  adCta: "",
};

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
  if (company.subCategories && company.subCategories.length > 0) {
    return company.subCategories;
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

function getCompanySearchText(company: Company) {
  return [
    company.name,
    company.plan,
    company.city,
    company.mainCategory,
    company.subCategory,
    company.category,
    company.description,
    ...getDisplayedSubCategories(company),
    ...company.tags,
    ...company.searchTerms,
    company.ad?.title ?? "",
    company.ad?.description ?? "",
    company.ad?.cta ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(
    null
  );

  const isEditing = Boolean(editingCompanyId);

  const availableSubCategories = useMemo(() => {
    const baseSubCategories = getSubcategoriesForMainCategory(form.mainCategory);

    const customSelectedSubCategories = form.subCategories.filter(
      (subCategory) => !baseSubCategories.includes(subCategory)
    );

    return [...baseSubCategories, ...customSelectedSubCategories];
  }, [form.mainCategory, form.subCategories]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearchQuery = companySearchQuery.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch =
        !normalizedSearchQuery ||
        getCompanySearchText(company).includes(normalizedSearchQuery);

      const matchesPlan =
        !selectedPlanFilter || company.plan === selectedPlanFilter;

      return matchesSearch && matchesPlan;
    });
  }, [companies, companySearchQuery, selectedPlanFilter]);

  const companiesWithAds = companies.filter((company) => company.ad);
  const companiesWithImages = companies.filter((company) => company.imageUrl);
  const premiumCompanies = companies.filter(
    (company) => company.plan === "premium"
  );
  const starterCompanies = companies.filter(
    (company) => company.plan === "starter"
  );
  const proCompanies = companies.filter((company) => company.plan === "pro");

  useEffect(() => {
    loadCompanies();
  }, []);

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

  function getPartnerPath(company: Company) {
    if (!canCompanyUsePartnerDashboard(company.plan)) {
      return "";
    }

    if (!company.accessToken) {
      return "";
    }

    return `/partner/${company.accessToken}`;
  }

  async function copyPartnerLink(company: Company) {
    if (!canCompanyUsePartnerDashboard(company.plan)) {
      setErrorMessage(
        "Dieses Paket hat keinen Partner-Zugang. Partner-Dashboard ist erst ab Pro verfügbar."
      );
      return;
    }

    if (!company.accessToken) {
      setErrorMessage("Für diese Firma wurde noch kein Partner-Link erstellt.");
      return;
    }

    const partnerLink = `${window.location.origin}/partner/${company.accessToken}`;

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

      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const primarySubCategory = form.subCategories[0];

      const searchTerms = [
        form.mainCategory.toLowerCase(),
        ...form.subCategories.map((subCategory) => subCategory.toLowerCase()),
        ...tags.map((tag) => tag.toLowerCase()),
      ].filter(Boolean);

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

  function startEditingCompany(company: Company) {
    const existingSubCategories =
      company.subCategories && company.subCategories.length > 0
        ? company.subCategories
        : [company.subCategory || company.category].filter(Boolean);

    const fallbackMainCategory =
      company.mainCategory ||
      findMainCategoryForSubCategory(existingSubCategories[0] || "") ||
      "";

    setEditingCompanyId(company.id);

    setForm({
      name: company.name,
      imageUrl: company.imageUrl || "",
      plan: company.plan || "pilot",
      mainCategory: fallbackMainCategory,
      subCategories: existingSubCategories,
      city: company.city,
      phone: company.phone,
      email: company.email,
      website: company.website,
      description: company.description,
      tags: company.tags.join(", "),
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingCompanyId(null);
    setForm(emptyForm);
    setSuccessMessage("");
    setErrorMessage("");
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

      if (editingCompanyId === id) {
        cancelEditing();
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
              verwalten
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Erfasse, bearbeite und lösche Firmenprofile, Pakete,
            Suchbegriffe, Kategorien, Bilder, Werbeanzeigen und Partner-Zugänge
            ab Pro.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCompanies}
          disabled={isLoading}
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Lädt..." : "Aktualisieren"}
        </button>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Firmen"
          value={companies.length.toString()}
          description={`${companiesWithImages.length} mit Titelbild`}
        />

        <AdminStatCard
          title="Starter"
          value={starterCompanies.length.toString()}
          description="Ohne Leads / Dashboard"
        />

        <AdminStatCard
          title="Pro"
          value={proCompanies.length.toString()}
          description="Mit Leads und Dashboard"
        />

        <AdminStatCard
          title="Premium"
          value={premiumCompanies.length.toString()}
          description={`${companiesWithAds.length} Firmen mit Werbung`}
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
                {isEditing ? "Firma bearbeiten" : "Firma hinzufügen"}
              </h2>

              <p className="mt-3 text-slate-400">
                {isEditing
                  ? "Bearbeite die ausgewählte Firma und speichere die Änderungen."
                  : "Trage eine regionale Firma mit Paket, Hauptkategorie und mehreren Unterkategorien ein."}
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
              label="Firmenname"
              value={form.name}
              onChange={(value) => updateField("name", value)}
              placeholder="Zum Beispiel: Auto Meier AG"
              required
            />

            <ImageUploadField
              imageUrl={form.imageUrl}
              isUploading={isUploadingImage}
              onUpload={uploadCompanyImage}
              onRemove={removeCompanyImage}
            />

            <PlanSelectField
              label="Paket"
              value={form.plan}
              onChange={updatePlan}
            />

            {!canCompanyUsePartnerDashboard(form.plan) && (
              <div className="rounded-3xl border border-blue-300/20 bg-blue-300/10 p-5">
                <p className="font-black text-blue-100">
                  Starter: kein Partner-Dashboard
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  Dieses Paket erstellt keinen Partner-Link, kein
                  Business-Dashboard und keine Neario-Leadverwaltung. Leads und
                  Dashboard sind erst ab Pro verfügbar.
                </p>
              </div>
            )}

            {canCompanyUsePartnerDashboard(form.plan) && (
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                <p className="font-black text-emerald-100">
                  Partner-Zugang aktiv
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  Dieses Paket erhält einen Partner-Link, ein Dashboard und kann
                  Neario-Leads empfangen.
                </p>
              </div>
            )}

            <SelectField
              label="Hauptkategorie"
              value={form.mainCategory}
              onChange={updateMainCategory}
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
              onToggle={toggleSubCategory}
            />

            <InputField
              label="Stadt / Region"
              value={form.city}
              onChange={(value) => updateField("city", value)}
              placeholder="Zum Beispiel: Bern"
              required
            />

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Telefon"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="+41 31 000 00 00"
              />

              <InputField
                label="E-Mail"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="info@firma.ch"
              />
            </div>

            <InputField
              label="Website"
              value={form.website}
              onChange={(value) => updateField("website", value)}
              placeholder="https://www.firma.ch"
            />

            <TextareaField
              label="Beschreibung"
              value={form.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Beschreibe kurz, was die Firma anbietet."
              required
              rows={5}
            />

            <InputField
              label="Suchbegriffe"
              value={form.tags}
              onChange={(value) => updateField("tags", value)}
              placeholder="Garage, Occasionen, Neuwagen, Lackiererei"
              required
            />

            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <h3 className="text-xl font-black text-cyan-100">
                Werbeanzeige / Angebot
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                Werbeanzeigen sind erst ab Pro verfügbar. Wenn alle Werbefelder
                leer sind, wird keine Werbung gespeichert.
              </p>

              {!canCompanyUseAdvertising(form.plan) && (
                <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Dieses Paket kann keine Werbeanzeigen nutzen. Werbung ist erst
                  ab Pro verfügbar. Eingetragene Werbefelder werden bei Starter
                  nicht gespeichert.
                </div>
              )}

              {canCompanyUseAdvertising(form.plan) && (
                <div className="mt-5 space-y-5">
                  <InputField
                    label="Werbetitel"
                    value={form.adTitle}
                    onChange={(value) => updateField("adTitle", value)}
                    placeholder="Zum Beispiel: Gratis Fahrzeugcheck"
                  />

                  <TextareaField
                    label="Werbetext"
                    value={form.adDescription}
                    onChange={(value) => updateField("adDescription", value)}
                    placeholder="Beschreibe das Angebot kurz und verkaufsstark."
                    rows={4}
                  />

                  <InputField
                    label="Button-Text"
                    value={form.adCta}
                    onChange={(value) => updateField("adCta", value)}
                    placeholder="Zum Beispiel: Angebot anfragen"
                  />
                </div>
              )}
            </div>

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
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Übersicht
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Firmen aus der Datenbank
              </h2>

              <p className="mt-3 text-slate-400">
                Suche, filtere und verwalte gespeicherte Firmenprofile.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_14rem]">
            <InputField
              label="Firmen suchen"
              value={companySearchQuery}
              onChange={setCompanySearchQuery}
              placeholder="Name, Stadt, Kategorie, Suchbegriff..."
            />

            <PlanFilterSelect
              label="Paket"
              value={selectedPlanFilter}
              onChange={setSelectedPlanFilter}
            />
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
            <span className="font-black text-white">
              {filteredCompanies.length}
            </span>{" "}
            von{" "}
            <span className="font-black text-white">{companies.length}</span>{" "}
            Firmen werden angezeigt.
          </div>

          {isLoading && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
              Firmen werden geladen...
            </div>
          )}

          {!isLoading && companies.length === 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
              Noch keine Firmen in der Datenbank gespeichert.
            </div>
          )}

          {!isLoading &&
            companies.length > 0 &&
            filteredCompanies.length === 0 && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
                Keine Firma passt zu deinem Filter.
              </div>
            )}

          {!isLoading && filteredCompanies.length > 0 && (
            <div className="mt-8 space-y-4">
              {filteredCompanies.map((company) => {
                const displayedMainCategory = getDisplayedMainCategory(company);
                const displayedSubCategories =
                  getDisplayedSubCategories(company);
                const partnerPath = getPartnerPath(company);
                const isCurrentCompany = editingCompanyId === company.id;
                const hasPartnerDashboard = canCompanyUsePartnerDashboard(
                  company.plan
                );
                const hasLeadAccess = canCompanyReceiveLeads(company.plan);
                const hasAdvertisingAccess = canCompanyUseAdvertising(
                  company.plan
                );

                return (
                  <article
                    key={company.id}
                    className={`overflow-hidden rounded-3xl border transition ${
                      isCurrentCompany
                        ? "border-cyan-300/50 bg-cyan-300/10"
                        : "border-white/10 bg-slate-950/60 hover:border-cyan-300/30 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="relative h-44 overflow-hidden">
                      {company.imageUrl ? (
                        <img
                          src={company.imageUrl}
                          alt={company.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-slate-950" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                      <div className="absolute bottom-5 left-5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-3 py-1 text-xs font-black text-cyan-100 backdrop-blur">
                          {displayedMainCategory}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black backdrop-blur ${getPlanClassName(
                            company.plan
                          )}`}
                        >
                          {getCompanyPlanLabel(company.plan)}
                        </span>

                        {company.imageUrl && (
                          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100 backdrop-blur">
                            Bild
                          </span>
                        )}

                        {company.ad && hasAdvertisingAccess && (
                          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100 backdrop-blur">
                            Werbung
                          </span>
                        )}

                        {hasLeadAccess && (
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100 backdrop-blur">
                            Leads
                          </span>
                        )}

                        {hasPartnerDashboard && (
                          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100 backdrop-blur">
                            Dashboard
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                        <div className="flex-1">
                          <h3 className="text-2xl font-black tracking-tight">
                            {company.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            {company.city}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            {getCompanyPlanDescription(company.plan)}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {displayedSubCategories.map((subCategory) => (
                              <span
                                key={subCategory}
                                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100"
                              >
                                {subCategory}
                              </span>
                            ))}
                          </div>

                          <p className="mt-4 text-slate-300">
                            {company.description}
                          </p>

                          {!hasPartnerDashboard && (
                            <div className="mt-5 rounded-3xl border border-blue-300/20 bg-blue-300/10 p-4">
                              <p className="text-xs font-black uppercase tracking-wide text-blue-100">
                                Kein Partner-Zugang
                              </p>

                              <p className="mt-2 text-sm text-slate-300">
                                Dieses Paket hat kein Business-Dashboard und
                                keine Leadverwaltung. Partner-Zugang ist erst ab
                                Pro verfügbar.
                              </p>
                            </div>
                          )}

                          {partnerPath && (
                            <div className="mt-5 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                              <p className="text-xs font-black uppercase tracking-wide text-emerald-100">
                                Partner-Zugang
                              </p>

                              <p className="mt-2 break-all text-sm text-slate-300">
                                {partnerPath}
                              </p>

                              <p className="mt-3 text-xs text-emerald-100">
                                Dieser Link ist vertraulich. Sende ihn nur an
                                die jeweilige Firma.
                              </p>

                              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <button
                                  type="button"
                                  onClick={() => copyPartnerLink(company)}
                                  className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200"
                                >
                                  Link kopieren
                                </button>

                                <Link
                                  href={partnerPath}
                                  className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                                >
                                  Öffnen
                                </Link>
                              </div>
                            </div>
                          )}

                          {company.ad && hasAdvertisingAccess && (
                            <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                              <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                                Aktive Werbung
                              </p>

                              <h4 className="mt-2 font-black">
                                {company.ad.title}
                              </h4>

                              <p className="mt-1 text-sm text-slate-300">
                                {company.ad.description}
                              </p>

                              <p className="mt-3 text-sm font-black text-cyan-100">
                                Button: {company.ad.cta}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            {company.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-row gap-3 md:flex-col">
                          <button
                            type="button"
                            onClick={() => startEditingCompany(company)}
                            className="rounded-2xl border border-cyan-300/30 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10"
                          >
                            Bearbeiten
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCompany(company.id, company.name)
                            }
                            disabled={deletingCompanyId === company.id}
                            className="rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingCompanyId === company.id
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
        Firmenbild / Titelbild
      </label>

      <p className="mt-2 text-sm text-slate-400">
        Dieses Bild erscheint oben auf der Firmenkarte und später im
        Firmenprofil. Erlaubt sind JPG, PNG und WebP bis 5 MB.
      </p>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Firmenbild Vorschau"
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
          <div className="grid gap-3 md:grid-cols-2">
            {options.map((option) => {
              const isSelected = values.includes(option);

              return (
                <button
                  key={option}
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
            {values.map((value) => (
              <span
                key={value}
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