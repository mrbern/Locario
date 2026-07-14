"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Company } from "@/types/company";

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
  ]
    .join(" ")
    .toLowerCase();
}

export default function AdminLocationsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [locationName, setLocationName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const selectedCompany = useMemo(() => {
    return companies.find((company) => company.id === selectedCompanyId) ?? null;
  }, [companies, selectedCompanyId]);

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

  const availableParentCompanies = useMemo(() => {
    return companies
      .filter((company) => company.id !== selectedCompanyId)
      .filter((company) => !company.parentCompanyId)
      .sort((firstCompany, secondCompany) =>
        firstCompany.name.localeCompare(secondCompany.name)
      );
  }, [companies, selectedCompanyId]);

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

  function selectCompany(companyId: string) {
    const company = companies.find((item) => item.id === companyId);

    setSelectedCompanyId(companyId);
    setParentCompanyId(company?.parentCompanyId ?? "");
    setLocationName(company?.locationName ?? "");
    setSuccessMessage("");
    setErrorMessage("");
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

      setCompanies((currentCompanies) =>
        currentCompanies.map((company) =>
          company.id === savedCompany.id ? savedCompany : company
        )
      );

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
            Verknüpfe Firmen mit einer Hauptfirma und erfasse Standortnamen wie
            Hauptsitz, Filiale Thun oder Standort Bern.
          </p>
        </div>

        <Link
          href="/admin/firmen"
          className="rounded-3xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
        >
          Zur Firmenverwaltung
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard label="Firmen total" value={companies.length} />
        <MetricCard label="Hauptfirmen" value={mainCompanies.length} />
        <MetricCard label="Standorte" value={locationCompanies.length} />
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_26rem]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Firmen auswählen
              </p>

              <h2 className="mt-2 text-3xl font-black">Liste</h2>
            </div>

            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Firma, Ort oder Hauptfirma suchen..."
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
            <div className="mt-5 grid gap-3">
              {filteredCompanies.map((company) => {
                const isSelected = company.id === selectedCompanyId;

                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => selectCompany(company.id)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      isSelected
                        ? "border-cyan-300/50 bg-cyan-300/10"
                        : "border-white/10 bg-slate-950/45 hover:border-cyan-300/30 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div className="min-w-0">
                        <p className="break-words text-lg font-black text-white">
                          {getCompanyDisplayName(company)}
                        </p>

                        <p className="mt-1 break-words text-sm text-slate-400">
                          {getCompanyLocationLine(company)}
                        </p>

                        {company.parentCompany && (
                          <p className="mt-2 text-sm font-semibold text-cyan-200">
                            Gehört zu: {company.parentCompany.name}
                          </p>
                        )}
                      </div>

                      <StatusBadge
                        label={
                          company.parentCompanyId
                            ? "Standort"
                            : company.locations && company.locations.length > 0
                              ? "Hauptfirma"
                              : "Einzelstandort"
                        }
                        variant={company.parentCompanyId ? "blue" : "cyan"}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20 xl:sticky xl:top-8"
        >
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Verknüpfung
          </p>

          <h2 className="mt-2 text-3xl font-black">Standort setzen</h2>

          {!selectedCompany && (
            <p className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
              Wähle links eine Firma aus, um sie als Hauptfirma oder Standort zu
              definieren.
            </p>
          )}

          {selectedCompany && (
            <div className="mt-5 space-y-5">
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                  Ausgewählte Firma
                </p>

                <p className="mt-2 break-words text-xl font-black text-white">
                  {selectedCompany.name}
                </p>

                <p className="mt-1 break-words text-sm text-slate-300">
                  {getCompanyLocationLine(selectedCompany)}
                </p>
              </div>

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
                  Optional. Wird öffentlich als Zusatz zum Firmennamen genutzt.
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-200">
                  Gehört zu Hauptfirma
                </label>

                <select
                  value={parentCompanyId}
                  onChange={(event) => setParentCompanyId(event.target.value)}
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
                  Leer lassen, wenn diese Firma selbst eine Hauptfirma oder ein
                  Einzelstandort ist.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Wird gespeichert..." : "Standort speichern"}
              </button>
            </div>
          )}
        </form>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
          Übersicht
        </p>

        <h2 className="mt-2 text-3xl font-black">Hauptfirmen & Standorte</h2>

        <div className="mt-5 grid gap-4">
          {mainCompanies.map((company) => {
            const childLocations = companies
              .filter((item) => item.parentCompanyId === company.id)
              .sort((firstCompany, secondCompany) =>
                getCompanyDisplayName(firstCompany).localeCompare(
                  getCompanyDisplayName(secondCompany)
                )
              );

            return (
              <div
                key={company.id}
                className="rounded-3xl border border-white/10 bg-slate-950/45 p-5"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="text-lg font-black text-white">
                      {getCompanyDisplayName(company)}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {getCompanyLocationLine(company)}
                    </p>
                  </div>

                  <StatusBadge
                    label={`${childLocations.length} Standort${
                      childLocations.length === 1 ? "" : "e"
                    }`}
                    variant="cyan"
                  />
                </div>

                {childLocations.length > 0 && (
                  <div className="mt-4 grid gap-2">
                    {childLocations.map((location) => (
                      <div
                        key={location.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <p className="font-black text-cyan-100">
                          {getCompanyDisplayName(location)}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {getCompanyLocationLine(location)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-slate-950/10">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-4xl font-black text-cyan-200">{value}</p>
    </div>
  );
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "cyan" | "blue";
}) {
  const className =
    variant === "blue"
      ? "border-blue-300/20 bg-blue-300/10 text-blue-100"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
      {label}
    </span>
  );
}