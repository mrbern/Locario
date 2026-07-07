"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  findMainCategoryForSubCategory,
  getSubcategoriesForMainCategory,
  mainCategories,
} from "@/data/categories";
import { companies as demoCompanies } from "@/data/companies";
import { canCompanyUseAdvertising, getCompanyPlanLabel } from "@/data/plans";
import type { Company } from "@/types/company";

type SafeCompany = Company & {
  address?: string | null;
  adress?: string | null;
  companyName?: string | null;
  title?: string | null;
  tags?: unknown;
  searchTerms?: unknown;
  subCategories?: unknown;
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

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
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

function getCompanyName(company: Company) {
  const safeCompany = company as SafeCompany;

  return (
    getSafeString(company.name).trim() ||
    getSafeString(safeCompany.companyName).trim() ||
    getSafeString(safeCompany.title).trim() ||
    "Unbenannte Firma"
  );
}

function getCompanyId(company: Company, fallbackIndex: number) {
  const safeId = String(company.id ?? "").trim();

  if (safeId) {
    return safeId;
  }

  return `company-${fallbackIndex}`;
}

function getCompanyAddress(company: Company) {
  const safeCompany = company as SafeCompany;

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
  const safeCompany = company as SafeCompany;
  const subCategories = uniqueTerms(getSafeStringArray(safeCompany.subCategories));

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

function shouldShowAdvertising(company: Company) {
  return Boolean(company.ad) && canCompanyUseAdvertising(company.plan);
}

function getCompanySearchText(company: Company) {
  const safeCompany = company as SafeCompany;
  const mainCategory = getDisplayedMainCategory(company);
  const subCategories = getDisplayedSubCategories(company);
  const advertisingVisible = shouldShowAdvertising(company);
  const tags = getSafeStringArray(safeCompany.tags);
  const searchTerms = getSafeStringArray(safeCompany.searchTerms);

  return normalizeText(
    [
      getCompanyName(company),
      mainCategory,
      ...subCategories,
      company.category,
      company.city,
      getCompanyAddress(company),
      company.description,
      company.phone,
      company.email,
      company.website,
      advertisingVisible ? company.ad?.title ?? "" : "",
      advertisingVisible ? company.ad?.description ?? "" : "",
      advertisingVisible ? company.ad?.cta ?? "" : "",
      ...tags,
      ...searchTerms,
    ].join(" ")
  );
}

function getPlanRank(company: Company) {
  if (company.plan === "premium") {
    return 4;
  }

  if (company.plan === "pro") {
    return 3;
  }

  if (company.plan === "starter") {
    return 2;
  }

  return 1;
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

function shouldShowPlanBadge(company: Company) {
  return (
    company.plan === "starter" ||
    company.plan === "pro" ||
    company.plan === "premium"
  );
}

function companyHasImage(company: Company) {
  return Boolean(company.imageUrl && company.imageUrl.trim());
}

export default function CompaniesPage() {
  const [databaseCompanies, setDatabaseCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [cityQuery, setCityQuery] = useState("");

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
      setDatabaseCompanies(data);
    } catch {
      setErrorMessage(
        "Die Firmen aus der Datenbank konnten nicht geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const allCompanies = useMemo(() => {
    return [...demoCompanies, ...databaseCompanies];
  }, [databaseCompanies]);

  const availableSubCategories = useMemo(() => {
    if (!selectedMainCategory) {
      return [];
    }

    return getSubcategoriesForMainCategory(selectedMainCategory);
  }, [selectedMainCategory]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearchQuery = normalizeText(searchQuery);
    const normalizedCityQuery = normalizeText(cityQuery);

    return allCompanies
      .filter((company) => {
        const mainCategory = getDisplayedMainCategory(company);
        const subCategories = getDisplayedSubCategories(company);
        const searchableText = getCompanySearchText(company);

        const matchesSearch =
          !normalizedSearchQuery ||
          searchableText.includes(normalizedSearchQuery);

        const matchesMainCategory =
          !selectedMainCategory || mainCategory === selectedMainCategory;

        const matchesSubCategory =
          !selectedSubCategory || subCategories.includes(selectedSubCategory);

        const matchesCity =
          !normalizedCityQuery ||
          normalizeText([company.city, getCompanyAddress(company)].join(" ")).includes(
            normalizedCityQuery
          );

        return (
          matchesSearch &&
          matchesMainCategory &&
          matchesSubCategory &&
          matchesCity
        );
      })
      .sort((a, b) => {
        const planDifference = getPlanRank(b) - getPlanRank(a);

        if (planDifference !== 0) {
          return planDifference;
        }

        return getCompanyName(a).localeCompare(getCompanyName(b));
      });
  }, [
    allCompanies,
    searchQuery,
    selectedMainCategory,
    selectedSubCategory,
    cityQuery,
  ]);

  function updateMainCategory(value: string) {
    setSelectedMainCategory(value);
    setSelectedSubCategory("");
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    setCityQuery("");
  }

  const hasActiveFilters =
    searchQuery || selectedMainCategory || selectedSubCategory || cityQuery;

  const companiesWithAds = filteredCompanies.filter((company) =>
    shouldShowAdvertising(company)
  );

  const companiesWithImages = filteredCompanies.filter((company) =>
    companyHasImage(company)
  );

  const premiumCompanies = filteredCompanies.filter(
    (company) => company.plan === "premium"
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-14rem] top-[10rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[18rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/30">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/70" />
              Firmen entdecken
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
              Regionale Firmen{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
                modern entdecken.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Filtere lokale Anbieter nach Suchbegriff, Kategorie,
              Unterkategorie und Stadt. Premium-Firmen erscheinen innerhalb
              passender Treffer zuerst.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/fuer-firmen"
                className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              >
                Firma eintragen
              </Link>

              <Link
                href="/suche"
                className="rounded-3xl border border-white/15 bg-white/[0.04] px-7 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10"
              >
                Zur Locario-Suche
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <HeroStat value={allCompanies.length.toString()} label="Firmen" />

              <HeroStat
                value={companiesWithAds.length.toString()}
                label="Anzeigen"
              />

              <HeroStat
                value={companiesWithImages.length.toString()}
                label="Bilder"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-sm font-bold text-cyan-100">
                Moderne Firmenprofile
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Firmen werden mit Kategorie, Ort, Adresse, Suchbegriffen,
                Paket-Badge, Titelbild und optionaler Werbeanzeige dargestellt.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                Filter
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Passende Anbieter finden
              </h2>

              <p className="mt-2 text-slate-400">
                Suche nach Firma, Angebot, Leistung, Kategorie, Adresse oder
                Ort.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <InputField
              label="Suche"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Name, Angebot, Leistung..."
            />

            <SelectField
              label="Hauptkategorie"
              value={selectedMainCategory}
              onChange={updateMainCategory}
              placeholder="Alle Hauptkategorien"
              options={mainCategories}
            />

            <SelectField
              label="Unterkategorie"
              value={selectedSubCategory}
              onChange={setSelectedSubCategory}
              placeholder={
                selectedMainCategory
                  ? "Alle Unterkategorien"
                  : "Zuerst Hauptkategorie wählen"
              }
              options={availableSubCategories}
              disabled={!selectedMainCategory}
            />

            <InputField
              label="Ort / Adresse"
              value={cityQuery}
              onChange={setCityQuery}
              placeholder="Zum Beispiel: Wattenwil"
            />
          </div>

          <div className="mt-7 flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/50 p-5 md:flex-row md:items-center">
            <p className="text-sm text-slate-300">
              <span className="font-bold text-white">
                {filteredCompanies.length}
              </span>{" "}
              von{" "}
              <span className="font-bold text-white">
                {allCompanies.length}
              </span>{" "}
              Firmen werden angezeigt — sortiert nach Paketstufe.
            </p>

            <div className="flex flex-wrap gap-3">
              <ResultPill label="Premium" value={premiumCompanies.length} />
              <ResultPill label="Mit Anzeige" value={companiesWithAds.length} />
              <ResultPill label="Mit Bild" value={companiesWithImages.length} />
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 font-semibold text-red-200">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-slate-300 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-300" />
              Firmen werden geladen...
            </div>
          </div>
        )}

        {!isLoading && filteredCompanies.length === 0 && (
          <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                Keine Treffer
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Keine Firma gefunden
              </h2>

              <p className="mt-4 text-slate-300">
                Mit diesen Filtern gibt es aktuell keinen passenden Anbieter.
                Das kann später ein Hinweis sein, welche Firmen Locario noch
                akquirieren sollte.
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-3xl bg-white px-6 py-4 font-black text-slate-950 transition hover:bg-slate-200"
                >
                  Filter zurücksetzen
                </button>

                <Link
                  href="/fuer-firmen"
                  className="rounded-3xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  Firma eintragen
                </Link>
              </div>
            </div>
          </div>
        )}

        {!isLoading && filteredCompanies.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCompanies.map((company, index) => (
              <CompanyCard
                key={getCompanyId(company, index)}
                company={company}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-3xl font-black text-cyan-200">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ResultPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  const displayedMainCategory = getDisplayedMainCategory(company);
  const displayedSubCategories = getDisplayedSubCategories(company);
  const advertisingVisible = shouldShowAdvertising(company);
  const hasImage = companyHasImage(company);
  const tags = uniqueTerms(getSafeStringArray((company as SafeCompany).tags));
  const companyName = getCompanyName(company);
  const companyId = getCompanyId(company, index);
  const locationLine = getCompanyLocationLine(company);

  return (
    <Link
      href={`/firmen/${companyId}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.09]"
    >
      <div className="relative h-44 overflow-hidden">
        {hasImage ? (
          <img
            src={company.imageUrl}
            alt={companyName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_16rem)]" />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-3 py-1 text-sm font-bold text-cyan-100 backdrop-blur">
            {displayedMainCategory}
          </span>

          <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-sm font-bold text-slate-200 backdrop-blur">
            {company.city || "Ort offen"}
          </span>
        </div>

        <div className="absolute left-5 top-5 rounded-2xl border border-white/15 bg-slate-950/50 px-4 py-2 text-sm font-bold text-white backdrop-blur">
          Anbieter #{index + 1}
        </div>

        {shouldShowPlanBadge(company) && (
          <div
            className={`absolute right-5 top-5 rounded-full border px-3 py-1 text-xs font-black backdrop-blur ${getPlanBadgeClassName(
              company.plan
            )}`}
          >
            {getCompanyPlanLabel(company.plan)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2">
          {displayedSubCategories.slice(0, 4).map((subCategory, tagIndex) => (
            <span
              key={`${normalizeTerm(subCategory)}-${tagIndex}`}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100"
            >
              {subCategory}
            </span>
          ))}

          {displayedSubCategories.length > 4 && (
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
              +{displayedSubCategories.length - 4} weitere
            </span>
          )}
        </div>

        <h2 className="mt-5 break-words text-2xl font-black tracking-tight">
          {companyName}
        </h2>

        <p className="mt-3 break-words text-sm font-semibold text-slate-400">
          📍 {locationLine}
        </p>

        <p className="mt-4 line-clamp-4 break-words text-slate-300">
          {company.description || "Noch keine Beschreibung vorhanden."}
        </p>

        {advertisingVisible && company.ad && (
          <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
              Anzeige
            </p>

            <h3 className="mt-2 break-words font-black text-white">
              {company.ad.title}
            </h3>

            <p className="mt-1 break-words text-sm text-slate-300">
              {company.ad.description}
            </p>

            <div className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-2 text-sm font-black text-slate-950">
              {company.ad.cta}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag, tagIndex) => (
              <span
                key={`${normalizeTerm(tag)}-${tagIndex}`}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition group-hover:bg-cyan-300">
            Firma ansehen
          </div>
        </div>
      </div>
    </Link>
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
  placeholder,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
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