"use client";

import * as React from "react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { companies as demoCompanies } from "@/data/companies";
import {
  canCompanyReceiveLeads,
  canCompanyUseAdvertising,
  getCompanyPlanLabel,
} from "@/data/plans";
import type { Company } from "@/types/company";

type LeadForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
};

const emptyLeadForm: LeadForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  message: "",
};

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
  return company.mainCategory || "Allgemein";
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

function shouldShowAdvertising(company: Company) {
  return Boolean(company.ad) && canCompanyUseAdvertising(company.plan);
}

function shouldShowLeadForm(company: Company) {
  return canCompanyReceiveLeads(company.plan);
}

function companyHasImage(company: Company) {
  return Boolean(company.imageUrl && company.imageUrl.trim());
}

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [isDemoCompany, setIsDemoCompany] = useState(false);
  const [sourceQuery, setSourceQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [leadForm, setLeadForm] = useState<LeadForm>(emptyLeadForm);
  const [leadSuccessMessage, setLeadSuccessMessage] = useState("");
  const [leadErrorMessage, setLeadErrorMessage] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryFromUrl = searchParams.get("q") ?? "";

    setSourceQuery(queryFromUrl);
    loadCompany();
  }, [id]);

  async function loadCompany() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setIsDemoCompany(false);

      const demoCompany = demoCompanies.find((item) => item.id === id);

      if (demoCompany) {
        setCompany(demoCompany);
        setIsDemoCompany(true);
        return;
      }

      const response = await fetch(`/api/companies/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Firma konnte nicht geladen werden."
        );
      }

      const data = (await response.json()) as Company;
      setCompany(data);
    } catch (error) {
      setCompany(null);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Laden der Firma ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  function updateLeadField(field: keyof LeadForm, value: string) {
    setLeadForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company) {
      return;
    }

    if (!shouldShowLeadForm(company)) {
      setLeadErrorMessage(
        "Diese Firma kann im aktuellen Paket keine Neario-Anfragen empfangen. Bitte nutze die Kontaktangaben der Firma."
      );
      return;
    }

    if (isDemoCompany) {
      setLeadErrorMessage(
        "Für Demo-Firmen können noch keine Anfragen gespeichert werden. Erstelle eine Firma im Admin, um Leads zu testen."
      );
      return;
    }

    try {
      setIsSubmittingLead(true);
      setLeadSuccessMessage("");
      setLeadErrorMessage("");

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: company.id,
          customerName: leadForm.customerName,
          customerEmail: leadForm.customerEmail,
          customerPhone: leadForm.customerPhone,
          message: leadForm.message,
          sourceQuery,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Anfrage konnte nicht gespeichert werden."
        );
      }

      setLeadForm(emptyLeadForm);
      setLeadSuccessMessage(
        "Deine Anfrage wurde erfolgreich gespeichert. Die Firma kann dich nun kontaktieren."
      );

      setTimeout(() => {
        setLeadSuccessMessage("");
      }, 5000);
    } catch (error) {
      if (error instanceof Error) {
        setLeadErrorMessage(error.message);
      } else {
        setLeadErrorMessage(
          "Beim Senden der Anfrage ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsSubmittingLead(false);
    }
  }

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
        <BackgroundGlow />

        <section className="relative mx-auto w-full max-w-5xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-300" />
              Firma wird geladen...
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

        <section className="relative mx-auto w-full max-w-4xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
            <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
              Nicht gefunden
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Firma nicht gefunden
            </h1>

            {errorMessage && (
              <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 font-semibold text-red-200">
                {errorMessage}
              </div>
            )}

            <p className="mt-4 text-slate-300">
              Diese Firma existiert entweder nicht oder konnte nicht geladen
              werden.
            </p>

            <Link
              href="/firmen"
              className="mt-8 inline-flex rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
            >
              Zurück zur Firmenübersicht
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const displayedMainCategory = getDisplayedMainCategory(company);
  const displayedSubCategories = getDisplayedSubCategories(company);
  const advertisingVisible = shouldShowAdvertising(company);
  const leadsVisible = shouldShowLeadForm(company);
  const hasImage = companyHasImage(company);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 md:py-16">
      <BackgroundGlow />

      <section className="relative mx-auto w-full max-w-7xl">
        <Link
          href="/firmen"
          className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
        >
          ← Zurück zur Übersicht
        </Link>

        {sourceQuery && (
          <div className="mt-5 inline-flex max-w-full rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            <span className="truncate">Gefunden über: „{sourceQuery}“</span>
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:rounded-[2.5rem]">
          <div className="relative isolate min-h-[24rem] overflow-hidden">
            {hasImage ? (
              <img
                src={company.imageUrl}
                alt={company.name}
                className="absolute inset-0 z-0 h-full w-full max-w-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-slate-950" />
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.28),transparent_20rem)]" />
              </>
            )}

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />
            <div className="absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-slate-950 to-transparent" />

            <div className="relative z-20 flex min-h-[24rem] min-w-0 flex-col justify-end p-6 sm:p-7 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-4 py-2 text-sm font-black text-cyan-100 backdrop-blur">
                  {displayedMainCategory}
                </span>

                <span className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-black text-slate-200 backdrop-blur">
                  {company.city}
                </span>

                {shouldShowPlanBadge(company) && (
                  <span
                    className={`rounded-full border px-4 py-2 text-sm font-black backdrop-blur ${getPlanBadgeClassName(
                      company.plan
                    )}`}
                  >
                    {getCompanyPlanLabel(company.plan)}
                  </span>
                )}
              </div>

              <h1 className="mt-6 max-w-5xl break-words text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
                {company.name}
              </h1>

              <p className="mt-6 max-w-3xl break-words text-base leading-7 text-slate-300 md:text-lg md:leading-8">
                {company.description}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {leadsVisible && (
                  <a
                    href="#anfrage"
                    className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
                  >
                    Anfrage senden
                  </a>
                )}

                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className={`rounded-3xl px-7 py-4 text-center font-black transition hover:-translate-y-0.5 ${
                      leadsVisible
                        ? "border border-white/15 bg-white/[0.04] text-white hover:border-cyan-300/30 hover:bg-white/10"
                        : "bg-gradient-to-r from-cyan-300 to-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30"
                    }`}
                  >
                    Direkt anrufen
                  </a>
                )}

                {!leadsVisible && company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="rounded-3xl border border-white/15 bg-white/[0.04] px-7 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    E-Mail senden
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <div className="min-w-0 space-y-8">
            {advertisingVisible && company.ad && (
              <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
                <p className="text-sm font-black uppercase tracking-wide text-cyan-200">
                  Aktuelles Angebot
                </p>

                <h2 className="mt-4 break-words text-3xl font-black tracking-tight md:text-4xl">
                  {company.ad.title}
                </h2>

                <p className="mt-4 max-w-3xl break-words text-slate-300">
                  {company.ad.description}
                </p>

                {leadsVisible ? (
                  <a
                    href="#anfrage"
                    className="mt-7 inline-flex rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                  >
                    {company.ad.cta}
                  </a>
                ) : (
                  <a
                    href={company.website || `mailto:${company.email}`}
                    className="mt-7 inline-flex rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                  >
                    {company.ad.cta}
                  </a>
                )}
              </section>
            )}

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Leistungen & Kategorien
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Was diese Firma anbietet
              </h2>

              <div className="mt-6 flex flex-wrap gap-2">
                {displayedSubCategories.map((subCategory) => (
                  <span
                    key={subCategory}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                  >
                    {subCategory}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-black">Suchbegriffe</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {company.tags.length > 0 ? (
                    company.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-300"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400">
                      Noch keine Suchbegriffe hinterlegt.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {leadsVisible ? (
              <section
                id="anfrage"
                className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 md:p-8"
              >
                <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                  Anfrage senden
                </p>

                <h2 className="mt-3 break-words text-3xl font-black tracking-tight">
                  Anfrage an {company.name}
                </h2>

                <p className="mt-4 max-w-2xl text-slate-300">
                  Stelle direkt eine Anfrage. Neario speichert den Kontakt als
                  Lead, damit die Firma später darauf reagieren kann.
                </p>

                {isDemoCompany && (
                  <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 text-amber-100">
                    Diese Firma ist eine Demo-Firma. Leads werden nur für Firmen
                    gespeichert, die du im Admin erstellt hast.
                  </div>
                )}

                {leadSuccessMessage && (
                  <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
                    {leadSuccessMessage}
                  </div>
                )}

                {leadErrorMessage && (
                  <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
                    {leadErrorMessage}
                  </div>
                )}

                <form onSubmit={handleLeadSubmit} className="mt-8 space-y-5">
                  <InputField
                    label="Name"
                    value={leadForm.customerName}
                    onChange={(value) => updateLeadField("customerName", value)}
                    placeholder="Max Muster"
                    required
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="E-Mail"
                      value={leadForm.customerEmail}
                      onChange={(value) =>
                        updateLeadField("customerEmail", value)
                      }
                      placeholder="max@example.ch"
                    />

                    <InputField
                      label="Telefon"
                      value={leadForm.customerPhone}
                      onChange={(value) =>
                        updateLeadField("customerPhone", value)
                      }
                      placeholder="+41 79 000 00 00"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-200">
                      Nachricht
                    </label>

                    <textarea
                      value={leadForm.message}
                      onChange={(event) =>
                        updateLeadField("message", event.target.value)
                      }
                      placeholder="Beschreibe kurz, was du suchst oder welches Angebot dich interessiert."
                      required
                      rows={5}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
                    />
                  </div>

                  <p className="text-sm text-slate-400">
                    Bitte gib mindestens E-Mail oder Telefonnummer an.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingLead
                      ? "Anfrage wird gesendet..."
                      : "Anfrage senden"}
                  </button>
                </form>
              </section>
            ) : (
              <section className="rounded-[2rem] border border-blue-300/20 bg-blue-300/10 p-6 shadow-2xl shadow-slate-950/20 md:p-8">
                <p className="text-sm font-black uppercase tracking-wide text-blue-200">
                  Kontakt über Firmendaten
                </p>

                <h2 className="mt-3 break-words text-3xl font-black tracking-tight">
                  Diese Firma nimmt keine Neario-Anfragen entgegen
                </h2>

                <p className="mt-4 max-w-2xl text-slate-300">
                  Im Starter-Paket gibt es kein Neario-Leadformular und kein
                  Partner-Dashboard. Nutze bitte die öffentlichen Kontaktdaten
                  der Firma.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                    >
                      Anrufen
                    </a>
                  )}

                  {company.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className="rounded-3xl bg-white px-6 py-4 text-center font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
                    >
                      E-Mail senden
                    </a>
                  )}

                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-3xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                    >
                      Website öffnen
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          <aside className="min-w-0 space-y-8">
            <section className="w-full max-w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/20 lg:sticky lg:top-28">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Kontakt
              </p>

              <h2 className="mt-3 break-words text-3xl font-black tracking-tight">
                Firma kontaktieren
              </h2>

              <div className="mt-6 grid min-w-0 gap-4">
                <InfoBox
                  title="Telefon"
                  value={company.phone || "Nicht angegeben"}
                />
                <InfoBox
                  title="E-Mail"
                  value={company.email || "Nicht angegeben"}
                />
                <InfoBox
                  title="Website"
                  value={company.website || "Nicht angegeben"}
                />
                <InfoBox title="Ort" value={company.city} />
              </div>

              <div className="mt-6 grid gap-3">
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                  >
                    Anrufen
                  </a>
                )}

                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="rounded-3xl bg-white px-6 py-4 text-center font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
                  >
                    E-Mail senden
                  </a>
                )}

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl border border-white/15 px-6 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    Website öffnen
                  </a>
                )}
              </div>

              <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="font-black text-cyan-100">Neario Hinweis</p>

                <p className="mt-2 text-sm text-slate-300">
                  {leadsVisible
                    ? "Diese Firma kann über Neario Anfragen empfangen. Beschreibe möglichst konkret, was du suchst."
                    : "Diese Firma ist über Neario sichtbar, empfängt aber im aktuellen Paket keine Neario-Anfragen. Nutze bitte Telefon, E-Mail oder Website."}
                </p>
              </div>
            </section>
          </aside>
        </div>
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

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 min-w-0 break-all font-bold text-white">{value}</p>
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
    <div className="min-w-0">
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