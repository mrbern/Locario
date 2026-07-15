"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Company } from "@/types/company";

type PanelMode = "edit" | "create";

type CreateLocationForm = {
  parentCompanyId: string;
  locationName: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
};

const emptyCreateLocationForm: CreateLocationForm = {
  parentCompanyId: "",
  locationName: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  description: "",
};

function getSafeString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function normalizeValue(value: string) {
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

function uniqueTerms(values: string[]) {
  const seenValues = new Set<string>();
  const terms: string[] = [];

  values.forEach((value) => {
    const cleanValue = value.trim();
    const normalizedValue = normalizeValue(cleanValue);

    if (!cleanValue || seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    terms.push(cleanValue);
  });

  return terms;
}

function getCompanyAddress(company: Company) {
  return (
    getSafeString(company.address).trim() ||
    getSafeString(company.adress).trim()
  );
}

function valueAlreadyContainsCity(value: string, city: string) {
  const normalizedValue = normalizeValue(value);
  const normalizedCity = normalizeValue(city);

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

function getCompanyDisplayName(company: Company) {
  const locationName = getSafeString(company.locationName).trim();

  if (locationName) {
    return `${company.name} · ${locationName}`;
  }

  return company.name;
}

function getSubCategories(company: Company) {
  if (company.subCategories && company.subCategories.length > 0) {
    return company.subCategories;
  }

  return [company.subCategory || company.category].filter(Boolean);
}

function getSearchText(company: Company) {
  return [
    company.name,
    company.locationName,
    company.city,
    company.address,
    company.adress,
    company.parentCompany?.name,
    company.parentCompany?.locationName,
    ...(company.locations ?? []).flatMap((location) => [
      location.name,
      location.locationName,
      location.city,
      location.address,
      location.adress,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

function getCompanyRoleLabel(company: Company, childCount: number) {
  if (company.parentCompanyId) {
    return "Filiale / Standort";
  }

  if (childCount > 0) {
    return "Hauptfirma";
  }

  if (company.locationName) {
    return "Hauptsitz / Einzelstandort";
  }

  return "Einzelstandort";
}

function getCompanyRoleVariant(company: Company, childCount: number) {
  if (company.parentCompanyId) {
    return "blue";
  }

  if (childCount > 0) {
    return "emerald";
  }

  if (company.locationName) {
    return "cyan";
  }

  return "slate";
}

function getPublicCompanyPath(company: Company) {
  return `/firmen/${company.id}`;
}

export default function AdminLocationsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [panelMode, setPanelMode] = useState<PanelMode>("edit");

  const [createLocationForm, setCreateLocationForm] =
    useState<CreateLocationForm>(emptyCreateLocationForm);

  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const selectedCompany = useMemo(() => {
    return companies.find((company) => company.id === selectedCompanyId) ?? null;
  }, [companies, selectedCompanyId]);

  const selectedCompanyChildLocations = useMemo(() => {
    if (!selectedCompany) {
      return [];
    }

    return companies
      .filter((company) => company.parentCompanyId === selectedCompany.id)
      .sort((firstCompany, secondCompany) =>
        getCompanyDisplayName(firstCompany).localeCompare(
          getCompanyDisplayName(secondCompany)
        )
      );
  }, [companies, selectedCompany]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return companies
      .filter((company) => {
        if (!normalizedSearchQuery) {
          return true;
        }

        return getSearchText(company).includes(normalizedSearchQuery);
      })
      .sort((firstCompany, secondCompany) =>
        getCompanyDisplayName(firstCompany).localeCompare(
          getCompanyDisplayName(secondCompany)
        )
      );
  }, [companies, searchQuery]);

  const mainCompanies = useMemo(() => {
    return companies
      .filter((company) => !company.parentCompanyId)
      .sort((firstCompany, secondCompany) =>
        firstCompany.name.localeCompare(secondCompany.name)
      );
  }, [companies]);

  const locationCompanies = useMemo(() => {
    return companies
      .filter((company) => company.parentCompanyId)
      .sort((firstCompany, secondCompany) =>
        getCompanyDisplayName(firstCompany).localeCompare(
          getCompanyDisplayName(secondCompany)
        )
      );
  }, [companies]);

  const companiesToReview = useMemo(() => {
    return companies
      .filter((company) => {
        const childCount = companies.filter(
          (item) => item.parentCompanyId === company.id
        ).length;

        return Boolean(company.locationName && !company.parentCompanyId && childCount === 0);
      })
      .sort((firstCompany, secondCompany) =>
        getCompanyDisplayName(firstCompany).localeCompare(
          getCompanyDisplayName(secondCompany)
        )
      );
  }, [companies]);

  const availableParentCompanies = useMemo(() => {
    return mainCompanies
      .filter((company) => company.id !== selectedCompanyId)
      .sort((firstCompany, secondCompany) =>
        firstCompany.name.localeCompare(secondCompany.name)
      );
  }, [mainCompanies, selectedCompanyId]);

  const parentForCreate = useMemo(() => {
    return (
      mainCompanies.find(
        (company) => company.id === createLocationForm.parentCompanyId
      ) ?? null
    );
  }, [mainCompanies, createLocationForm.parentCompanyId]);

  function getChildLocations(parentCompanyIdToFind: string) {
    return companies
      .filter((company) => company.parentCompanyId === parentCompanyIdToFind)
      .sort((firstCompany, secondCompany) =>
        getCompanyDisplayName(firstCompany).localeCompare(
          getCompanyDisplayName(secondCompany)
        )
      );
  }

  function selectCompany(companyId: string) {
    const company = companies.find((item) => item.id === companyId);

    setSelectedCompanyId(companyId);
    setParentCompanyId(company?.parentCompanyId ?? "");
    setLocationName(company?.locationName ?? "");
    setPanelMode("edit");
    setSuccessMessage("");
    setErrorMessage("");
  }

  function startCreateLocation(parentCompany: Company) {
    setPanelMode("create");
    setSelectedCompanyId(parentCompany.id);
    setParentCompanyId("");

    setCreateLocationForm({
      parentCompanyId: parentCompany.id,
      locationName: "",
      city: "",
      address: "",
      phone: parentCompany.phone ?? "",
      email: parentCompany.email ?? "",
      website: parentCompany.website ?? "",
      description: parentCompany.description ?? "",
    });

    setSuccessMessage("");
    setErrorMessage("");
  }

  function updateCreateLocationField(
    field: keyof CreateLocationForm,
    value: string
  ) {
    setCreateLocationForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

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
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Firmen konnten nicht geladen werden.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCompany) {
      setErrorMessage("Bitte wähle zuerst eine Firma aus.");
      return;
    }

    if (parentCompanyId && selectedCompanyChildLocations.length > 0) {
      setErrorMessage(
        "Diese Firma hat bereits eigene Standorte. Entferne zuerst die Standorte oder wähle eine andere Firma als Filiale."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const subCategories = getSubCategories(selectedCompany);
      const primarySubCategory =
        subCategories[0] || selectedCompany.subCategory || selectedCompany.category;

      const payload = {
        name: selectedCompany.name,
        imageUrl: selectedCompany.imageUrl ?? "",
        plan: selectedCompany.plan ?? "pilot",

        parentCompanyId: parentCompanyId || null,
        locationName: locationName.trim() || null,

        mainCategory: selectedCompany.mainCategory || "Allgemein",
        subCategory: primarySubCategory,
        subCategories,
        category: selectedCompany.category || primarySubCategory,

        city: selectedCompany.city,
        address: getCompanyAddress(selectedCompany),

        phone: selectedCompany.phone ?? "",
        email: selectedCompany.email ?? "",
        website: selectedCompany.website ?? "",

        description: selectedCompany.description,
        tags: selectedCompany.tags ?? [],
        searchTerms: selectedCompany.searchTerms ?? [],

        latitude: selectedCompany.latitude ?? null,
        longitude: selectedCompany.longitude ?? null,

        ad: selectedCompany.ad
          ? {
              title: selectedCompany.ad.title,
              description: selectedCompany.ad.description,
              cta: selectedCompany.ad.cta,
            }
          : undefined,
      };

      const response = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            "Standort-Verknüpfung konnte nicht gespeichert werden."
        );
      }

      const savedCompany = (await response.json()) as Company;

      setSelectedCompanyId(savedCompany.id);
      setParentCompanyId(savedCompany.parentCompanyId ?? "");
      setLocationName(savedCompany.locationName ?? "");
      setSuccessMessage("Standort-Verknüpfung wurde gespeichert.");

      await loadCompanies();

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

  async function handleCreateLocationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!parentForCreate) {
      setErrorMessage("Bitte wähle zuerst eine Hauptfirma aus.");
      return;
    }

    if (!createLocationForm.locationName.trim()) {
      setErrorMessage("Bitte gib einen Standortnamen ein.");
      return;
    }

    if (!createLocationForm.city.trim()) {
      setErrorMessage("Bitte gib eine Stadt oder Region für die Filiale ein.");
      return;
    }

    try {
      setIsCreatingLocation(true);
      setSuccessMessage("");
      setErrorMessage("");

      const subCategories = getSubCategories(parentForCreate);
      const primarySubCategory =
        subCategories[0] || parentForCreate.subCategory || parentForCreate.category;

      const tags = getSafeStringArray(parentForCreate.tags);
      const searchTerms = uniqueTerms([
        ...getSafeStringArray(parentForCreate.searchTerms),
        parentForCreate.name,
        createLocationForm.locationName,
        createLocationForm.city,
        createLocationForm.address,
        "Standort",
        "Filiale",
      ]);

      const payload = {
        name: parentForCreate.name,
        imageUrl: parentForCreate.imageUrl ?? "",
        plan: parentForCreate.plan ?? "pilot",

        parentCompanyId: parentForCreate.id,
        locationName: createLocationForm.locationName.trim(),

        mainCategory: parentForCreate.mainCategory || "Allgemein",
        subCategory: primarySubCategory,
        subCategories,
        category: parentForCreate.category || primarySubCategory,

        city: createLocationForm.city.trim(),
        address: createLocationForm.address.trim(),

        phone: createLocationForm.phone.trim(),
        email: createLocationForm.email.trim(),
        website: createLocationForm.website.trim(),

        description:
          createLocationForm.description.trim() ||
          parentForCreate.description ||
          `${parentForCreate.name} am Standort ${createLocationForm.locationName.trim()}.`,
        tags,
        searchTerms,

        latitude: null,
        longitude: null,
      };

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Filiale konnte nicht erstellt werden."
        );
      }

      const createdCompany = (await response.json()) as Company;

      setSelectedCompanyId(createdCompany.id);
      setParentCompanyId(createdCompany.parentCompanyId ?? "");
      setLocationName(createdCompany.locationName ?? "");
      setPanelMode("edit");
      setCreateLocationForm(emptyCreateLocationForm);
      setSuccessMessage(
        `Filiale "${getCompanyDisplayName(createdCompany)}" wurde erstellt.`
      );

      await loadCompanies();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Beim Erstellen der Filiale ist ein Fehler passiert.");
      }
    } finally {
      setIsCreatingLocation(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Standortverwaltung
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
            Firmen{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              Standorte
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Verknüpfe Hauptfirmen, Hauptsitze und Filialen. Du kannst bestehende
            Firmen zuordnen oder direkt aus einer Hauptfirma eine neue Filiale
            erstellen.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/firmen"
            className="rounded-3xl border border-white/15 px-6 py-4 text-center text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
          >
            Zur Firmenverwaltung
          </Link>

          <button
            type="button"
            onClick={loadCompanies}
            disabled={isLoading}
            className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Lädt..." : "Aktualisieren"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <MetricCard label="Firmen total" value={companies.length} />
        <MetricCard label="Haupt-/Einzel" value={mainCompanies.length} />
        <MetricCard label="Filialen" value={locationCompanies.length} />
        <MetricCard
          label="Prüfen"
          value={companiesToReview.length}
          variant={companiesToReview.length > 0 ? "amber" : "cyan"}
        />
      </div>

      {successMessage && (
        <div className="mt-6 rounded-3xl border border-emerald-300/30 bg-emerald-300/10 p-5 text-emerald-100">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
          {errorMessage}
        </div>
      )}

      {companiesToReview.length > 0 && (
        <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-amber-300/10 p-5 shadow-2xl shadow-slate-950/20">
          <p className="text-sm font-black uppercase tracking-wide text-amber-200">
            Prüfen
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Standortname vorhanden, aber keine Hauptfirma verknüpft
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            Diese Einträge können korrekt sein, wenn es Hauptsitze sind. Wenn es
            Filialen sind, solltest du sie einer Hauptfirma zuordnen.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {companiesToReview.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => selectCompany(company.id)}
                className="rounded-2xl border border-amber-300/20 bg-slate-950/45 p-4 text-left transition hover:border-amber-300/40 hover:bg-white/[0.06]"
              >
                <p className="font-black text-white">
                  {getCompanyDisplayName(company)}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {getCompanyLocationLine(company)}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Struktur
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Hauptfirmen & Filialen
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Hauptfirmen stehen oben, Filialen werden darunter gruppiert.
              </p>
            </div>

            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Firma, Standort, Ort oder Hauptfirma suchen..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 md:max-w-sm"
            />
          </div>

          {isLoading && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
              Firmen werden geladen...
            </div>
          )}

          {!isLoading && filteredCompanies.length === 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">
              Keine Firma gefunden.
            </div>
          )}

          {!isLoading && filteredCompanies.length > 0 && (
            <div className="mt-5 grid gap-4">
              {mainCompanies
                .filter((company) => {
                  if (!searchQuery.trim()) {
                    return true;
                  }

                  const childLocations = getChildLocations(company.id);
                  const searchText = [
                    getSearchText(company),
                    ...childLocations.map(getSearchText),
                  ]
                    .join(" ")
                    .toLowerCase();

                  return searchText.includes(searchQuery.trim().toLowerCase());
                })
                .map((company) => {
                  const childLocations = getChildLocations(company.id);
                  const childCount = childLocations.length;
                  const isSelected = company.id === selectedCompanyId;

                  return (
                    <article
                      key={company.id}
                      className={`rounded-3xl border p-5 transition ${
                        isSelected
                          ? "border-cyan-300/50 bg-cyan-300/10"
                          : "border-white/10 bg-slate-950/45"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => selectCompany(company.id)}
                              className="break-words text-left text-xl font-black text-white transition hover:text-cyan-100"
                            >
                              {getCompanyDisplayName(company)}
                            </button>

                            <StatusBadge
                              label={getCompanyRoleLabel(company, childCount)}
                              variant={getCompanyRoleVariant(company, childCount)}
                            />
                          </div>

                          <p className="mt-2 break-words text-sm text-slate-400">
                            {getCompanyLocationLine(company)}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            {childCount === 0
                              ? "Noch keine Filiale verknüpft."
                              : `${childCount} Filiale${
                                  childCount === 1 ? "" : "n"
                                } verknüpft.`}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <button
                            type="button"
                            onClick={() => selectCompany(company.id)}
                            className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                          >
                            Bearbeiten
                          </button>

                          <button
                            type="button"
                            onClick={() => startCreateLocation(company)}
                            className="rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/10"
                          >
                            + Filiale
                          </button>

                          <Link
                            href={getPublicCompanyPath(company)}
                            className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10"
                          >
                            Öffentlich
                          </Link>
                        </div>
                      </div>

                      {childLocations.length > 0 && (
                        <div className="mt-4 grid gap-2">
                          {childLocations.map((location) => {
                            const isLocationSelected =
                              location.id === selectedCompanyId;

                            return (
                              <div
                                key={location.id}
                                className={`rounded-2xl border p-4 transition ${
                                  isLocationSelected
                                    ? "border-blue-300/40 bg-blue-300/10"
                                    : "border-white/10 bg-white/[0.04]"
                                }`}
                              >
                                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          selectCompany(location.id)
                                        }
                                        className="break-words text-left font-black text-cyan-100 transition hover:text-white"
                                      >
                                        {getCompanyDisplayName(location)}
                                      </button>

                                      <StatusBadge
                                        label="Filiale / Standort"
                                        variant="blue"
                                      />
                                    </div>

                                    <p className="mt-1 text-sm text-slate-400">
                                      {getCompanyLocationLine(location)}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2 md:justify-end">
                                    <button
                                      type="button"
                                      onClick={() => selectCompany(location.id)}
                                      className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                                    >
                                      Bearbeiten
                                    </button>

                                    <Link
                                      href={getPublicCompanyPath(location)}
                                      className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10"
                                    >
                                      Öffentlich
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  );
                })}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20 xl:sticky xl:top-8">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-1">
            <button
              type="button"
              onClick={() => setPanelMode("edit")}
              className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                panelMode === "edit"
                  ? "bg-cyan-300 text-slate-950"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              Zuordnen
            </button>

            <button
              type="button"
              onClick={() => setPanelMode("create")}
              className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                panelMode === "create"
                  ? "bg-emerald-300 text-slate-950"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              Neue Filiale
            </button>
          </div>

          {panelMode === "edit" && (
            <form onSubmit={handleSubmit} className="mt-5">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Bestehende Firma
              </p>

              <h2 className="mt-2 text-3xl font-black">Standort zuordnen</h2>

              {!selectedCompany && (
                <p className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                  Wähle links eine Firma oder Filiale aus.
                </p>
              )}

              {selectedCompany && (
                <div className="mt-5 space-y-5">
                  <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                      Ausgewählt
                    </p>

                    <p className="mt-2 break-words text-xl font-black text-white">
                      {selectedCompany.name}
                    </p>

                    <p className="mt-1 break-words text-sm text-slate-300">
                      {getCompanyLocationLine(selectedCompany)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge
                        label={getCompanyRoleLabel(
                          selectedCompany,
                          selectedCompanyChildLocations.length
                        )}
                        variant={getCompanyRoleVariant(
                          selectedCompany,
                          selectedCompanyChildLocations.length
                        )}
                      />

                      <Link
                        href={getPublicCompanyPath(selectedCompany)}
                        className="rounded-full border border-cyan-300/20 bg-slate-950/40 px-3 py-1 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/10"
                      >
                        Öffentlich öffnen
                      </Link>
                    </div>
                  </div>

                  {selectedCompanyChildLocations.length > 0 && (
                    <div className="rounded-3xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
                      Diese Firma hat bereits eigene Standorte. Sie sollte nicht
                      zusätzlich als Filiale einer anderen Firma gesetzt werden.
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-bold text-slate-200">
                      Standortname
                    </label>

                    <input
                      value={locationName}
                      onChange={(event) => setLocationName(event.target.value)}
                      placeholder="Zum Beispiel: Hauptsitz Wattenwil, Filiale Thun"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Öffentlich sichtbar als Zusatz zum Firmennamen.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-200">
                      Gehört zu Hauptfirma
                    </label>

                    <select
                      value={parentCompanyId}
                      onChange={(event) =>
                        setParentCompanyId(event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
                    >
                      <option value="" className="bg-slate-950 text-slate-400">
                        Keine Hauptfirma / ist selbst Hauptfirma
                      </option>

                      {availableParentCompanies.map((company) => (
                        <option
                          key={company.id}
                          value={company.id}
                          className="bg-slate-950 text-white"
                        >
                          {company.name} — {getCompanyLocationLine(company)}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-slate-500">
                      Leer lassen für Hauptfirma, Hauptsitz oder Einzelstandort.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Wird gespeichert..." : "Zuordnung speichern"}
                  </button>
                </div>
              )}
            </form>
          )}

          {panelMode === "create" && (
            <form onSubmit={handleCreateLocationSubmit} className="mt-5">
              <p className="text-sm font-black uppercase tracking-wide text-emerald-300">
                Neue Filiale
              </p>

              <h2 className="mt-2 text-3xl font-black">Aus Vorlage erstellen</h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Erstellt eine neue Firma als Filiale und übernimmt Paket,
                Kategorie, Tags und Suchlogik von der Hauptfirma.
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-200">
                    Hauptfirma
                  </label>

                  <select
                    value={createLocationForm.parentCompanyId}
                    onChange={(event) => {
                      const parentCompany = mainCompanies.find(
                        (company) => company.id === event.target.value
                      );

                      if (parentCompany) {
                        startCreateLocation(parentCompany);
                        return;
                      }

                      updateCreateLocationField(
                        "parentCompanyId",
                        event.target.value
                      );
                    }}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-emerald-300"
                  >
                    <option value="" className="bg-slate-950 text-slate-400">
                      Hauptfirma auswählen
                    </option>

                    {mainCompanies.map((company) => (
                      <option
                        key={company.id}
                        value={company.id}
                        className="bg-slate-950 text-white"
                      >
                        {company.name} — {getCompanyLocationLine(company)}
                      </option>
                    ))}
                  </select>
                </div>

                {parentForCreate && (
                  <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-200">
                      Vorlage
                    </p>

                    <p className="mt-2 font-black text-white">
                      {getCompanyDisplayName(parentForCreate)}
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {parentForCreate.mainCategory || "Allgemein"} ·{" "}
                      {getSubCategories(parentForCreate).join(", ") ||
                        parentForCreate.category ||
                        "Keine Unterkategorie"}
                    </p>
                  </div>
                )}

                <InputField
                  label="Standortname"
                  value={createLocationForm.locationName}
                  onChange={(value) =>
                    updateCreateLocationField("locationName", value)
                  }
                  placeholder="Zum Beispiel: Filiale Thun"
                  required
                />

                <InputField
                  label="Stadt / Region"
                  value={createLocationForm.city}
                  onChange={(value) => updateCreateLocationField("city", value)}
                  placeholder="Zum Beispiel: Thun"
                  required
                />

                <InputField
                  label="Adresse"
                  value={createLocationForm.address}
                  onChange={(value) =>
                    updateCreateLocationField("address", value)
                  }
                  placeholder="Strasse, Hausnummer, PLZ Ort"
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <InputField
                    label="Telefon"
                    value={createLocationForm.phone}
                    onChange={(value) =>
                      updateCreateLocationField("phone", value)
                    }
                    placeholder="+41 33 000 00 00"
                  />

                  <InputField
                    label="E-Mail"
                    value={createLocationForm.email}
                    onChange={(value) =>
                      updateCreateLocationField("email", value)
                    }
                    placeholder="filiale@firma.ch"
                  />
                </div>

                <InputField
                  label="Website"
                  value={createLocationForm.website}
                  onChange={(value) =>
                    updateCreateLocationField("website", value)
                  }
                  placeholder="https://www.firma.ch"
                />

                <TextareaField
                  label="Beschreibung"
                  value={createLocationForm.description}
                  onChange={(value) =>
                    updateCreateLocationField("description", value)
                  }
                  placeholder="Optional eigene Beschreibung für diesen Standort."
                  rows={4}
                />

                <button
                  type="submit"
                  disabled={isCreatingLocation}
                  className="w-full rounded-3xl bg-gradient-to-r from-emerald-300 to-cyan-400 px-6 py-4 font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingLocation ? "Filiale wird erstellt..." : "Filiale erstellen"}
                </button>
              </div>
            </form>
          )}
        </aside>
      </section>
    </section>
  );
}

function MetricCard({
  label,
  value,
  variant = "cyan",
}: {
  label: string;
  value: number;
  variant?: "cyan" | "amber";
}) {
  const valueClassName =
    variant === "amber" ? "text-amber-200" : "text-cyan-200";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-slate-950/10">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-4xl font-black ${valueClassName}`}>{value}</p>
    </div>
  );
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "cyan" | "blue" | "emerald" | "slate";
}) {
  const className =
    variant === "blue"
      ? "border-blue-300/20 bg-blue-300/10 text-blue-100"
      : variant === "emerald"
        ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
        : variant === "slate"
          ? "border-slate-300/20 bg-slate-300/10 text-slate-300"
          : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
      {label}
    </span>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />
    </div>
  );
}