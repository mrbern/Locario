"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  getSubcategoriesForMainCategory,
  mainCategories,
} from "@/data/categories";
import { canCompanyUseAdvertising } from "@/data/plans";
import { eventPlans } from "@/data/event-plans";

type RequestType = "company" | "event";

type InquiryForm = {
  requestType: RequestType;

  companyName: string;
  eventTitle: string;
  organizerName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  city: string;

  desiredPlan: string;
  eventPlan: string;
  eventCategory: string;
  eventLocationName: string;
  eventDate: string;

  mainCategory: string;
  subCategories: string[];

  description: string;
  tags: string;

  adTitle: string;
  adDescription: string;
  adCta: string;

  message: string;
};

const emptyInquiryForm: InquiryForm = {
  requestType: "company",

  companyName: "",
  eventTitle: "",
  organizerName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  city: "",

  desiredPlan: "starter",
  eventPlan: "highlight",
  eventCategory: "Sonstiges",
  eventLocationName: "",
  eventDate: "",

  mainCategory: "",
  subCategories: [],

  description: "",
  tags: "",

  adTitle: "",
  adDescription: "",
  adCta: "",

  message: "",
};

const companyPackages = [
  {
    value: "starter",
    name: "Starter",
    price: "CHF 49",
    badge: "Basis-Sichtbarkeit",
    description:
      "Für Firmen, die mit einem einfachen Profil auf Locario sichtbar sein möchten – ohne Leadformular und ohne Partner-Dashboard.",
    features: [
      "Firmenprofil auf Locario",
      "Hauptkategorie und Unterkategorien",
      "Kontaktinformationen sichtbar",
      "Website, Telefon und E-Mail sichtbar",
      "Suchbegriffe / Leistungen",
      "Titelbild möglich",
      "Auffindbar in Firmenübersicht und Suche",
    ],
    note: "Keine Locario-Leads, kein Partner-Dashboard und keine aktive Werbeanzeige enthalten.",
    highlighted: false,
  },
  {
    value: "pro",
    name: "Pro",
    price: "CHF 149",
    badge: "Empfohlen",
    description:
      "Für Firmen, die aktiv Anfragen erhalten, ihr Profil selbst verwalten und mit Angeboten werben möchten.",
    features: [
      "Alles aus Starter",
      "Partner-Dashboard",
      "Partner-Link für die Firma",
      "Leads empfangen und verwalten",
      "Profil selbst bearbeiten",
      "Aktive Werbeanzeige / Angebot",
      "Werbetitel, Werbetext und CTA",
      "Anzeige in Suche und Firmenprofil",
      "Bessere Sichtbarkeit als Starter",
      "Pro-Badge auf Locario",
    ],
    note: "Beste Wahl für aktive Kundengewinnung mit Locario.",
    highlighted: true,
  },
  {
    value: "premium",
    name: "Premium",
    price: "CHF 299",
    badge: "Maximale Präsenz",
    description:
      "Für Firmen, die maximale regionale Sichtbarkeit, Leadfunktion, Dashboard und bevorzugte Platzierung möchten.",
    features: [
      "Alles aus Pro",
      "Premium-Platzierung vor Pro und Starter",
      "Premium-Badge auf Locario",
      "Stärkste Sichtbarkeit in passenden Treffern",
      "Mehr Aufmerksamkeit bei regionalen Suchen",
      "Priorisierte Darstellung",
      "Ideal für stark umkämpfte Branchen",
    ],
    note: "Für Firmen mit starkem regionalem Werbefokus.",
    highlighted: false,
  },
];

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

const benefits = [
  {
    title: "Lokale Sichtbarkeit",
    description:
      "Locario macht regionale Firmen, Anbieter und Events sichtbar, wenn Menschen lokal suchen oder entdecken möchten.",
  },
  {
    title: "Moderne Darstellung",
    description:
      "Firmen und Events erscheinen mit Bild, Beschreibung, Ort, Kontakt, Kategorien, Angeboten und klaren Aktionen.",
  },
  {
    title: "Direkte Nachfrage",
    description:
      "Firmen erhalten ab Pro direkte Locario-Leads. Veranstalter können Events gezielt vor dem Eventdatum bewerben.",
  },
  {
    title: "Regionale Werbefläche",
    description:
      "Locario verbindet lokale Suche, Werbung und Event-Sichtbarkeit in einer modernen Plattform.",
  },
];

const steps = [
  {
    title: "Bereich wählen",
    number: "01",
    description:
      "Entscheide, ob du ein Firmenprofil oder ein Event-Wochenpaket anfragen möchtest.",
  },
  {
    title: "Angaben erfassen",
    number: "02",
    description:
      "Trage Firma, Veranstalter, Ort, Beschreibung, Kontakt und gewünschtes Paket ein.",
  },
  {
    title: "Prüfung durch Locario",
    number: "03",
    description:
      "Locario prüft die Angaben und kann dein Profil oder Event anschliessend veröffentlichen.",
  },
  {
    title: "Sichtbar werden",
    number: "04",
    description:
      "Firmen werden gefunden, Events werden entdeckt und Werbepakete sorgen für stärkere Präsenz.",
  },
];

const examples = [
  "Werkstatt Wattenwil",
  "Bäckerei Wattenwil",
  "Ich brauche Kies",
  "Sommerfest Bern",
  "Konzert Thun",
  "Markt am Wochenende",
];

const targetGroups = [
  "Handwerker",
  "Autogaragen",
  "Bau & Garten",
  "Händler",
  "Dienstleister",
  "Restaurants",
  "Vereine",
  "Veranstalter",
  "Gemeinden",
  "Bars & Clubs",
  "Kultur",
  "Regionale Anbieter",
];

const faqs = [
  {
    question: "Ist Locario nur für Firmen?",
    answer:
      "Nein. Locario startet mit Firmenprofilen und Events. Firmen können dauerhaft sichtbar sein, Events können zeitlich begrenzt und wochenweise beworben werden.",
  },
  {
    question: "Was ist im Starter-Paket enthalten?",
    answer:
      "Starter ist ein einfaches Sichtbarkeitspaket. Die Firma erhält ein öffentliches Profil mit Kontaktangaben, Website, Telefon, E-Mail, Kategorien, Beschreibung und Suchbegriffen. Locario-Leads, Partner-Dashboard und Werbeanzeigen sind erst ab Pro verfügbar.",
  },
  {
    question: "Was ist der Unterschied zwischen Starter und Pro?",
    answer:
      "Starter sorgt für Basis-Sichtbarkeit. Pro ist der eigentliche Business-Tarif mit Partner-Dashboard, Leadformular, Leadverwaltung, Profilbearbeitung und aktiver Werbeanzeige.",
  },
  {
    question: "Wie funktionieren Event-Wochenpakete?",
    answer:
      "Events werden für einen begrenzten Zeitraum beworben. Je nach Paket erscheinen sie normal, hervorgehoben oder besonders prominent auf der Events-Seite.",
  },
];

export default function ForCompaniesPage() {
  const [form, setForm] = useState<InquiryForm>(emptyInquiryForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEventRequest = form.requestType === "event";
  const advertisingAllowed = canCompanyUseAdvertising(form.desiredPlan);

  const availableSubCategories = useMemo(() => {
    if (!form.mainCategory) {
      return [];
    }

    return getSubcategoriesForMainCategory(form.mainCategory);
  }, [form.mainCategory]);

  const selectedCompanyPackage = companyPackages.find(
    (item) => item.value === form.desiredPlan
  );

  const selectedEventPackage = eventPlans.find(
    (item) => item.value === form.eventPlan
  );

  function updateField(field: keyof InquiryForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function updateRequestType(value: RequestType) {
    setForm((currentForm) => ({
      ...currentForm,
      requestType: value,
      mainCategory: value === "event" ? "" : currentForm.mainCategory,
      subCategories: value === "event" ? [] : currentForm.subCategories,
      adTitle: value === "event" ? "" : currentForm.adTitle,
      adDescription: value === "event" ? "" : currentForm.adDescription,
      adCta: value === "event" ? "" : currentForm.adCta,
    }));
  }

  function updateCompanyPlan(plan: string) {
    setForm((currentForm) => {
      const planAllowsAdvertising = canCompanyUseAdvertising(plan);

      return {
        ...currentForm,
        desiredPlan: plan,
        requestType: "company",
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

  function scrollToInquiry() {
    const inquirySection = document.getElementById("anfrage");

    if (inquirySection) {
      inquirySection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function selectCompanyPlan(plan: string) {
    updateCompanyPlan(plan);
    scrollToInquiry();
  }

  function selectEventPlan(plan: string) {
    setForm((currentForm) => ({
      ...currentForm,
      requestType: "event",
      eventPlan: plan,
    }));

    scrollToInquiry();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEventRequest && form.subCategories.length === 0) {
      setErrorMessage("Bitte wähle mindestens eine Unterkategorie aus.");
      return;
    }

    if (
      isEventRequest &&
      (!form.eventTitle.trim() ||
        !form.organizerName.trim() ||
        !form.contactName.trim() ||
        !form.email.trim() ||
        !form.city.trim() ||
        !form.description.trim() ||
        !form.message.trim())
    ) {
      setErrorMessage(
        "Bitte fülle Eventtitel, Veranstalter, Kontaktperson, E-Mail, Stadt, Beschreibung und Nachricht aus."
      );
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

      if (isEventRequest) {
        const response = await fetch("/api/event-inquiries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventTitle: form.eventTitle,
            organizerName: form.organizerName,
            contactName: form.contactName,
            email: form.email,
            phone: form.phone,
            website: form.website,
            city: form.city,

            desiredPlan: form.eventPlan,

            category: form.eventCategory,
            locationName: form.eventLocationName,
            eventDate: form.eventDate,

            description: form.description,
            tags,

            message: form.message,
            status: "new",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message || "Event-Anfrage konnte nicht gesendet werden."
          );
        }

        const selectedEventPlan = form.eventPlan;

        setForm({
          ...emptyInquiryForm,
          requestType: "event",
          eventPlan: selectedEventPlan,
        });

        setSuccessMessage(
          "Danke! Deine Event-Anfrage wurde erfolgreich gesendet. Locario kann dein Event nun prüfen und dich kontaktieren."
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 6000);

        return;
      }

      const mainCategory = form.mainCategory;
      const subCategories = form.subCategories;

      const searchTerms = [
        mainCategory.toLowerCase(),
        ...subCategories.map((subCategory) => subCategory.toLowerCase()),
        ...tags.map((tag) => tag.toLowerCase()),
      ].filter(Boolean);

      const requestInfo = [
        "Anfragetyp: Firmenprofil",
        `Gewünschtes Firmenpaket: ${
          selectedCompanyPackage?.name ?? form.desiredPlan
        }`,
        "",
        form.message,
      ].join("\n");

      const response = await fetch("/api/company-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: form.companyName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          website: form.website,
          city: form.city,

          desiredPlan: form.desiredPlan,

          mainCategory,
          subCategory: subCategories[0],
          subCategories,
          category: subCategories[0],

          description: form.description,
          tags,
          searchTerms,

          adTitle: advertisingAllowed ? form.adTitle : "",
          adDescription: advertisingAllowed ? form.adDescription : "",
          adCta: advertisingAllowed ? form.adCta : "",

          message: requestInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Firmenanfrage konnte nicht gesendet werden."
        );
      }

      const selectedCompanyPlan = form.desiredPlan;

      setForm({
        ...emptyInquiryForm,
        requestType: "company",
        desiredPlan: selectedCompanyPlan,
      });

      setSuccessMessage(
        "Danke! Deine Firmenanfrage wurde erfolgreich gesendet. Locario kann dein Profil nun prüfen und dich kontaktieren."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 6000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Beim Senden der Anfrage ist ein unbekannter Fehler passiert."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-16 text-white">
      <BackgroundGlow />

      <section className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/30">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/70" />
              Für Firmen & Veranstalter
            </div>

            <h1 className="mt-7 max-w-5xl text-5xl font-black tracking-tight md:text-7xl">
              Werde lokal sichtbar,{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
                wenn Menschen suchen oder entdecken.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Locario verbindet regionale Firmen, lokale Anbieter und Events an
              einem Ort. Starter sorgt für einfache Sichtbarkeit. Ab Pro kommen
              Leads, Partner-Dashboard und Werbeanzeigen dazu.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#anfrage"
                onClick={() => updateRequestType("company")}
                className="rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              >
                Firmenprofil anfragen
              </a>

              <a
                href="#anfrage"
                onClick={() => updateRequestType("event")}
                className="rounded-3xl border border-white/15 bg-white/[0.04] px-7 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10"
              >
                Event bewerben
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <HeroStat value="2" label="Bereiche" />
              <HeroStat value="24/7" label="online sichtbar" />
              <HeroStat value="7 Tage" label="Eventpakete" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-cyan-300/20 via-blue-500/10 to-transparent blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Locario als regionales Portal
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Firmen finden. Events entdecken. Regional werben.
              </h2>

              <div className="mt-6 flex flex-wrap gap-3">
                {examples.map((example) => (
                  <span
                    key={example}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-300"
                  >
                    {example}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-4">
                <MiniInfo
                  title="Starter"
                  description="Einfach sichtbar mit öffentlichem Firmenprofil und Kontaktangaben."
                />

                <MiniInfo
                  title="Pro & Premium"
                  description="Mit Partner-Dashboard, Leads, Profilbearbeitung und Werbeanzeigen."
                />

                <MiniInfo
                  title="Events"
                  description="Zeitlich begrenzte Sichtbarkeit für Veranstaltungen, Märkte, Konzerte und Vereinsanlässe."
                />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.09]"
            >
              <h2 className="text-2xl font-black tracking-tight">
                {benefit.title}
              </h2>

              <p className="mt-4 text-slate-300">{benefit.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-20 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl md:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Für viele regionale Anbieter
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Locario funktioniert für Firmen, Vereine, Veranstalter und lokale
                Organisationen.
              </h2>

              <p className="mt-5 text-slate-300">
                Entscheidend ist regionale Relevanz: Wer lokal gefunden,
                besucht, kontaktiert oder entdeckt werden möchte, kann von
                Locario profitieren.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {targetGroups.map((targetGroup) => (
                <span
                  key={targetGroup}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100"
                >
                  {targetGroup}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              So funktioniert Locario
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Einfacher Ablauf für Sichtbarkeit
            </h2>

            <p className="mt-5 text-slate-300">
              Locario soll einfach bleiben: Bereich wählen, Angaben erfassen,
              prüfen lassen und regional sichtbar werden.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.title}
                className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/20"
              >
                <p className="text-5xl font-black text-cyan-200">
                  {step.number}
                </p>

                <h3 className="mt-5 text-xl font-black">{step.title}</h3>

                <p className="mt-4 text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
              Pakete für Firmen
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Sichtbarkeit, Leads und Werbung klar getrennt
            </h2>

            <p className="mt-5 text-slate-300">
              Starter ist für einfache Sichtbarkeit. Pro ist der Business-Tarif
              mit Leads, Dashboard und Werbung. Premium bringt maximale
              regionale Präsenz.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {companyPackages.map((item) => {
              const isSelected =
                form.requestType === "company" &&
                form.desiredPlan === item.value;

              return (
                <PackageCard
                  key={item.name}
                  title={item.name}
                  price={`${item.price} / Monat`}
                  badge={item.badge}
                  description={item.description}
                  features={item.features}
                  note={item.note}
                  highlighted={item.highlighted}
                  selected={isSelected}
                  buttonLabel={isSelected ? "Ausgewählt" : "Paket wählen"}
                  onClick={() => selectCompanyPlan(item.value)}
                />
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-amber-300">
              Pakete für Events
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Wochenpakete für Veranstaltungen
            </h2>

            <p className="mt-5 text-slate-300">
              Events brauchen kurzfristige Aufmerksamkeit. Mit Wochenpaketen
              können Märkte, Konzerte, Vereinsanlässe, Partys oder lokale
              Highlights gezielt beworben werden.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {eventPlans.map((item) => {
              const isSelected =
                form.requestType === "event" && form.eventPlan === item.value;

              return (
                <PackageCard
                  key={item.value}
                  title={item.label}
                  price={item.price}
                  badge={
                    item.value === "premium"
                      ? "Top-Präsenz"
                      : item.value === "highlight"
                        ? "Empfohlen"
                        : "Basis"
                  }
                  description={item.description}
                  features={[
                    "Event-Kachel auf Locario",
                    "Bild, Datum, Ort und Beschreibung",
                    "Website- oder Ticketlink",
                    item.value === "basic"
                      ? "Normale Darstellung"
                      : "Hervorgehobene Darstellung",
                    item.value === "premium"
                      ? "Stärkste Event-Präsenz"
                      : "Regionale Sichtbarkeit",
                  ]}
                  note="Ideal für zeitlich begrenzte regionale Werbung."
                  highlighted={item.value === "highlight"}
                  selected={isSelected}
                  buttonLabel={
                    isSelected ? "Ausgewählt" : "Eventpaket wählen"
                  }
                  onClick={() => selectEventPlan(item.value)}
                  amber
                />
              );
            })}
          </div>
        </section>

        <section
          id="anfrage"
          className="mt-20 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-8 shadow-2xl shadow-cyan-950/20 md:p-10"
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-200">
                Anfrage senden
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                {isEventRequest
                  ? "Event-Werbung anfragen."
                  : "Firmenprofil anfragen."}
              </h2>

              <p className="mt-5 text-slate-300">
                {isEventRequest
                  ? "Erfasse dein Event mit Veranstalter, Kategorie, Datum, Ort und gewünschtem Wochenpaket."
                  : "Je vollständiger deine Angaben sind, desto schneller kann Locario dein Firmenprofil prüfen und veröffentlichen."}
              </p>

              <div className="mt-7 rounded-3xl border border-white/10 bg-slate-950/50 p-6">
                <p className="text-sm font-black uppercase tracking-wide text-cyan-200">
                  Ausgewählt
                </p>

                <p className="mt-3 text-3xl font-black">
                  {isEventRequest
                    ? selectedEventPackage?.label ?? "Event Highlight"
                    : selectedCompanyPackage?.name ?? "Starter"}
                </p>

                <p className="mt-3 text-sm text-slate-300">
                  {isEventRequest
                    ? selectedEventPackage?.description
                    : selectedCompanyPackage?.description}
                </p>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-6">
                <p className="text-sm font-black uppercase tracking-wide text-cyan-200">
                  Hinweis
                </p>

                <p className="mt-3 text-sm text-slate-300">
                  {isEventRequest
                    ? "Event-Anfragen landen neu separat in der Event-Anfrageverwaltung. Locario kann daraus anschliessend ein Event im Admin erstellen und veröffentlichen."
                    : "Starter enthält kein Leadformular und kein Partner-Dashboard. Wenn du aktive Anfragen und Profilverwaltung möchtest, wähle Pro oder Premium."}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 shadow-2xl shadow-slate-950/20"
            >
              <div className="space-y-5">
                {successMessage && (
                  <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
                    {errorMessage}
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => updateRequestType("company")}
                    className={`rounded-2xl border px-5 py-4 text-left font-black transition ${
                      form.requestType === "company"
                        ? "border-cyan-300/50 bg-cyan-300/20 text-cyan-100"
                        : "border-white/10 bg-white/[0.05] text-slate-300 hover:border-cyan-300/30"
                    }`}
                  >
                    Firmenprofil
                  </button>

                  <button
                    type="button"
                    onClick={() => updateRequestType("event")}
                    className={`rounded-2xl border px-5 py-4 text-left font-black transition ${
                      form.requestType === "event"
                        ? "border-amber-300/50 bg-amber-300/20 text-amber-100"
                        : "border-white/10 bg-white/[0.05] text-slate-300 hover:border-amber-300/30"
                    }`}
                  >
                    Event-Werbung
                  </button>
                </div>

                {!isEventRequest && (
                  <SelectField
                    label="Gewünschtes Firmenpaket"
                    value={form.desiredPlan}
                    onChange={updateCompanyPlan}
                    options={[
                      { value: "starter", label: "Starter – CHF 49 / Monat" },
                      { value: "pro", label: "Pro – CHF 149 / Monat" },
                      {
                        value: "premium",
                        label: "Premium – CHF 299 / Monat",
                      },
                    ]}
                  />
                )}

                {isEventRequest && (
                  <SelectField
                    label="Gewünschtes Eventpaket"
                    value={form.eventPlan}
                    onChange={(value) => updateField("eventPlan", value)}
                    options={eventPlans.map((plan) => ({
                      value: plan.value,
                      label: `${plan.label} – ${plan.price}`,
                    }))}
                  />
                )}

                {isEventRequest ? (
                  <>
                    <div className="grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Eventtitel"
                        value={form.eventTitle}
                        onChange={(value) => updateField("eventTitle", value)}
                        placeholder="Zum Beispiel: Sommerfest Wattenwil"
                        required
                      />

                      <InputField
                        label="Veranstalter"
                        value={form.organizerName}
                        onChange={(value) =>
                          updateField("organizerName", value)
                        }
                        placeholder="Zum Beispiel: Verein Wattenwil"
                        required
                      />
                    </div>

                    <InputField
                      label="Kontaktperson"
                      value={form.contactName}
                      onChange={(value) => updateField("contactName", value)}
                      placeholder="Max Muster"
                      required
                    />
                  </>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Firmenname"
                      value={form.companyName}
                      onChange={(value) => updateField("companyName", value)}
                      placeholder="Zum Beispiel: Auto Meier AG"
                      required
                    />

                    <InputField
                      label="Kontaktperson"
                      value={form.contactName}
                      onChange={(value) => updateField("contactName", value)}
                      placeholder="Max Muster"
                      required
                    />
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="E-Mail"
                    type="email"
                    value={form.email}
                    onChange={(value) => updateField("email", value)}
                    placeholder="info@firma.ch"
                    required
                  />

                  <InputField
                    label="Telefon"
                    value={form.phone}
                    onChange={(value) => updateField("phone", value)}
                    placeholder="+41 79 000 00 00"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Website"
                    value={form.website}
                    onChange={(value) => updateField("website", value)}
                    placeholder="https://www.firma.ch"
                  />

                  <InputField
                    label="Stadt / Region"
                    value={form.city}
                    onChange={(value) => updateField("city", value)}
                    placeholder="Zum Beispiel: Aarau"
                    required
                  />
                </div>

                {isEventRequest && (
                  <>
                    <div className="grid gap-5 md:grid-cols-2">
                      <SelectField
                        label="Event-Kategorie"
                        value={form.eventCategory}
                        onChange={(value) => updateField("eventCategory", value)}
                        options={eventCategories.map((category) => ({
                          value: category,
                          label: category,
                        }))}
                        required
                      />

                      <InputField
                        label="Eventdatum"
                        type="datetime-local"
                        value={form.eventDate}
                        onChange={(value) => updateField("eventDate", value)}
                        placeholder=""
                      />
                    </div>

                    <InputField
                      label="Location / Veranstaltungsort"
                      value={form.eventLocationName}
                      onChange={(value) =>
                        updateField("eventLocationName", value)
                      }
                      placeholder="Zum Beispiel: Dorfplatz, Halle, Club, Restaurant"
                    />
                  </>
                )}

                {!isEventRequest && (
                  <>
                    <SelectField
                      label="Hauptkategorie"
                      value={form.mainCategory}
                      onChange={updateMainCategory}
                      options={[
                        { value: "", label: "Hauptkategorie auswählen" },
                        ...mainCategories.map((category) => ({
                          value: category,
                          label: category,
                        })),
                      ]}
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
                  </>
                )}

                <TextareaField
                  label={
                    isEventRequest
                      ? "Beschreibung des Events"
                      : "Firmenbeschreibung"
                  }
                  value={form.description}
                  onChange={(value) => updateField("description", value)}
                  placeholder={
                    isEventRequest
                      ? "Beschreibe Event, Zielgruppe, Programm und warum es beworben werden soll."
                      : "Beschreibe deine Firma, deine Leistungen, dein Angebot und deine Zielregion."
                  }
                  rows={5}
                  required
                />

                <InputField
                  label={
                    isEventRequest
                      ? "Suchbegriffe / Event-Stichwörter"
                      : "Suchbegriffe / Stichwörter"
                  }
                  value={form.tags}
                  onChange={(value) => updateField("tags", value)}
                  placeholder={
                    isEventRequest
                      ? "Konzert, Markt, Familie, Verein, Party"
                      : "Garage, Occasionen, Neuwagen, Lackiererei"
                  }
                  required
                />

                {!isEventRequest && !advertisingAllowed && (
                  <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5">
                    <p className="font-black text-amber-200">
                      Starter enthält keine Werbeanzeige
                    </p>

                    <p className="mt-2 text-slate-300">
                      Dieses Paket ist für Basis-Sichtbarkeit gedacht.
                      Werbeanzeigen, Leads und Partner-Dashboard sind erst ab
                      Pro verfügbar.
                    </p>
                  </div>
                )}

                {!isEventRequest && advertisingAllowed && (
                  <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                    <h3 className="text-xl font-black text-cyan-100">
                      Werbeanzeige / Angebot
                    </h3>

                    <p className="mt-2 text-sm text-slate-300">
                      Optional für Pro und Premium: Dieses Angebot kann später
                      in der Suche und im Firmenprofil sichtbar sein.
                    </p>

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
                        onChange={(value) =>
                          updateField("adDescription", value)
                        }
                        placeholder="Beschreibe dein Angebot kurz und verkaufsstark."
                        rows={4}
                      />

                      <InputField
                        label="Button-Text"
                        value={form.adCta}
                        onChange={(value) => updateField("adCta", value)}
                        placeholder="Zum Beispiel: Angebot anfragen"
                      />
                    </div>
                  </div>
                )}

                <TextareaField
                  label="Nachricht an Locario"
                  value={form.message}
                  onChange={(value) => updateField("message", value)}
                  placeholder={
                    isEventRequest
                      ? "Gibt es Ticketlink, Bildwünsche, genaue Zeiten oder besondere Hinweise zum Event?"
                      : "Gibt es etwas, das Locario vor der Veröffentlichung wissen sollte?"
                  }
                  rows={4}
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-3xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Anfrage wird gesendet..."
                    : isEventRequest
                      ? "Event-Werbung anfragen"
                      : "Firmenprofil zur Prüfung senden"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/20"
            >
              <h3 className="text-xl font-black">{faq.question}</h3>

              <p className="mt-3 text-slate-300">{faq.answer}</p>
            </article>
          ))}
        </section>

        <section className="mt-20 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-8 text-center shadow-2xl shadow-cyan-950/20 md:p-12">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-200">
            Bereit für regionale Sichtbarkeit?
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
            Starte mit Locario und mache deine Firma oder dein Event dort
            sichtbar, wo Menschen lokal suchen.
          </h2>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#anfrage"
              onClick={() => updateRequestType("company")}
              className="rounded-3xl bg-white px-8 py-4 text-center font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              Firmenprofil anfragen
            </a>

            <a
              href="#anfrage"
              onClick={() => updateRequestType("event")}
              className="rounded-3xl border border-white/15 px-8 py-4 text-center font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              Event bewerben
            </a>
          </div>
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

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-slate-950/20">
      <p className="text-3xl font-black text-cyan-200">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function MiniInfo({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}

function PackageCard({
  title,
  price,
  badge,
  description,
  features,
  note,
  highlighted,
  selected,
  buttonLabel,
  onClick,
  amber = false,
}: {
  title: string;
  price: string;
  badge: string;
  description: string;
  features: string[];
  note: string;
  highlighted: boolean;
  selected: boolean;
  buttonLabel: string;
  onClick: () => void;
  amber?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl shadow-slate-950/20 ${
        highlighted
          ? amber
            ? "border-amber-300/40 bg-amber-300/10"
            : "border-cyan-300/40 bg-cyan-300/10"
          : "border-white/10 bg-white/[0.06]"
      } ${selected ? "ring-2 ring-cyan-300/60" : ""}`}
    >
      {highlighted && (
        <div
          className={`absolute inset-x-0 top-0 h-1 ${
            amber
              ? "bg-gradient-to-r from-amber-300 to-orange-400"
              : "bg-gradient-to-r from-cyan-300 to-blue-400"
          }`}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-3xl font-black">{title}</h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            highlighted
              ? amber
                ? "bg-amber-300 text-slate-950"
                : "bg-cyan-300 text-slate-950"
              : "border border-white/10 bg-white/[0.06] text-slate-300"
          }`}
        >
          {badge}
        </span>
      </div>

      <p
        className={`mt-6 text-4xl font-black ${
          amber ? "text-amber-200" : "text-cyan-200"
        }`}
      >
        {price}
      </p>

      <p className="mt-5 text-slate-300">{description}</p>

      <ul className="mt-7 space-y-3 text-slate-300">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-slate-950 ${
                amber ? "bg-amber-300" : "bg-cyan-300"
              }`}
            >
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
        {note}
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`mt-8 block w-full rounded-3xl px-5 py-4 text-center font-black transition hover:-translate-y-0.5 ${
          highlighted
            ? amber
              ? "bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-gradient-to-r from-cyan-300 to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
            : "bg-white text-slate-950 hover:bg-slate-200"
        }`}
      >
        {buttonLabel}
      </button>
    </article>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
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
        required={required}
        rows={rows}
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
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
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
