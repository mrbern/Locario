"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  categoryGroups,
  getSubcategoriesForMainCategory,
  type CategoryGroup,
} from "@/data/categories";
import { eventPlans } from "@/data/event-plans";
import {
  eventCategoryOptions,
  getAutomaticEventSearchTerms,
} from "@/data/event-search-taxonomy";
import { canCompanyUseAdvertising } from "@/data/plans";
import { getAutomaticCompanySearchTerms } from "@/data/search-taxonomy";

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
  address: string;
  addressAddition: string;

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
  address: "",
  addressAddition: "",

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
      "Für Firmen, die zuerst sauber regional auffindbar sein möchten – mit öffentlichem Profil, Adresse, Kontakt und Suchbegriffen.",
    features: [
      "Firmenprofil auf Locario",
      "Hauptkategorie und Unterkategorien",
      "Kontaktinformationen sichtbar",
      "Website, Telefon und E-Mail sichtbar",
      "Adresse / Standort sichtbar",
      "Automatische Suchlogik",
      "Titelbild möglich",
      "Auffindbar in Firmenübersicht und Suche",
    ],
    note: "Basis-Paket für Sichtbarkeit. Keine Locario-Leads, kein Partner-Dashboard und keine aktive Werbeanzeige enthalten.",
    highlighted: false,
  },
  {
    value: "pro",
    name: "Pro",
    price: "CHF 149",
    badge: "Empfohlen",
    description:
      "Für Firmen, die aus regionaler Sichtbarkeit echte Anfragen machen möchten – mit Leads, Dashboard und Werbeanzeige.",
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
    note: "Empfohlenes Verkaufspaket für aktive regionale Kundengewinnung mit Locario.",
    highlighted: true,
  },
  {
    value: "premium",
    name: "Premium",
    price: "CHF 299",
    badge: "Maximale Präsenz",
    description:
      "Für Firmen mit starkem regionalem Werbefokus, mehreren Standorten oder hoher Konkurrenz in der Suche.",
    features: [
      "Alles aus Pro",
      "Premium-Platzierung vor Pro und Starter",
      "Premium-Badge auf Locario",
      "Stärkste Sichtbarkeit in passenden Treffern",
      "Mehr Aufmerksamkeit bei regionalen Suchen",
      "Priorisierte Darstellung",
      "Ideal für stark umkämpfte Branchen",
    ],
    note: "Für Firmen, die Locario aktiv als regionalen Werbe- und Anfragekanal nutzen möchten.",
    highlighted: false,
  },
];

const eventCategories = eventCategoryOptions;

const benefits = [
  {
    title: "Sichtbarkeit bei echter Suche",
    description:
      "Locario setzt dort an, wo Menschen konkret etwas brauchen: Anbieter, Hilfe, Produkte, Dienstleistungen oder Events in ihrer Region.",
  },
  {
    title: "Mehr als ein Eintrag",
    description:
      "Profile enthalten Bild, Beschreibung, Ort, Kategorien, Suchbegriffe, Angebote und klare Kontaktmöglichkeiten.",
  },
  {
    title: "Leads ab Pro",
    description:
      "Pro und Premium machen aus Sichtbarkeit einen Anfragekanal: mit Leadformular, Partner-Dashboard und Profilverwaltung.",
  },
  {
    title: "Einstieg ohne Druck",
    description:
      "Für erste regionale Partner kann im persönlichen Gespräch ein individuelles Launch-Angebot vereinbart werden.",
  },
];

const launchOfferBenefits = [
  {
    title: "Individuell starten",
    description:
      "Die öffentlichen Pakete bleiben klar. Für ausgewählte Startpartner kann Locario den Einstieg persönlich abstimmen.",
  },
  {
    title: "Ohne Druck verkaufen",
    description:
      "Im Verkaufsgespräch kannst du zuerst den Nutzen erklären und danach das passende Paket empfehlen.",
  },
  {
    title: "Feedback nutzen",
    description:
      "Erste Partner helfen, Kategorien, Suchbegriffe, Angebote und regionale Nachfrage vor dem breiteren Verkauf zu schärfen.",
  },
];

const steps = [
  {
    title: "Paket wählen",
    number: "01",
    description:
      "Wähle Firmenprofil oder Event-Werbung. Für Firmen ist Pro das empfohlene Verkaufspaket.",
  },
  {
    title: "Angaben erfassen",
    number: "02",
    description:
      "Trage Firma, Veranstalter, Adresse, Beschreibung, Kontakt, Kategorie und gewünschtes Paket ein.",
  },
  {
    title: "Prüfung durch Locario",
    number: "03",
    description:
      "Locario prüft die Angaben, ergänzt bei Bedarf Suchbegriffe und kann Profil oder Event veröffentlichen.",
  },
  {
    title: "Sichtbar werden",
    number: "04",
    description:
      "Firmen werden gefunden, Events werden entdeckt und die Suchanalyse zeigt, wonach Menschen regional fragen.",
  },
];

const examples = [
  "mein Auto macht Geräusche",
  "Gärtner Burgdorf",
  "Handwerker im Kanton Bern",
  "Events im Berner Oberland",
  "Konzert Thun",
  "Kinderprogramm Wochenende",
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
    question: "Ist Locario nur ein weiteres Firmenverzeichnis?",
    answer:
      "Nein. Locario soll eine regionale Nachfrage-Plattform sein: Nutzer suchen natürlich nach Bedarf, Ort und Events; Firmen werden passend gefunden und Suchanfragen können ausgewertet werden.",
  },
  {
    question: "Gibt es ein Launch-Angebot?",
    answer:
      "Ja, für ausgewählte erste regionale Partner kann im persönlichen Gespräch ein individuelles Launch-Angebot vereinbart werden. Öffentlich bleiben Starter, Pro und Premium die klaren Pakete.",
  },
  {
    question: "Was ist der Unterschied zwischen Starter und Pro?",
    answer:
      "Starter sorgt für Basis-Sichtbarkeit. Pro ist der eigentliche Business-Tarif mit Partner-Dashboard, Leadformular, Leadverwaltung, Profilbearbeitung und aktiver Werbeanzeige.",
  },
  {
    question: "Wie funktionieren Event-Wochenpakete?",
    answer:
      "Events brauchen kurz vor dem Datum Aufmerksamkeit. Deshalb werden sie wochenweise beworben – je nach Paket normal, hervorgehoben oder besonders prominent.",
  },
];

function getCityFromAddress(address: string) {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    return "";
  }

  const addressParts = trimmedAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const normalizedPart = part.toLowerCase();

      return !["schweiz", "switzerland", "suisse", "svizzera"].includes(
        normalizedPart
      );
    });

  const partWithZip = [...addressParts]
    .reverse()
    .find((part) => /\b\d{4,5}\s+/.test(part));

  if (partWithZip) {
    return partWithZip.replace(/^.*?\b\d{4,5}\s+/, "").trim();
  }

  if (addressParts.length > 1) {
    return addressParts[addressParts.length - 1]
      .replace(/^\d{4,5}\s+/, "")
      .trim();
  }

  return "";
}

function getFullAddress(address: string, addressAddition: string) {
  const cleanAddress = address.trim();
  const cleanAddressAddition = addressAddition.trim();

  if (!cleanAddressAddition) {
    return cleanAddress;
  }

  return `${cleanAddress} · ${cleanAddressAddition}`;
}

function getTermsFromText(value: string) {
  return value
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
}

function normalizeSearchTerm(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function valueMatchesSearch(value: string, searchValue: string) {
  const normalizedValue = normalizeSearchTerm(value);
  const normalizedSearchValue = normalizeSearchTerm(searchValue);

  if (!normalizedSearchValue) {
    return true;
  }

  return normalizedValue.includes(normalizedSearchValue);
}

function filterCategoryGroups(groups: CategoryGroup[], searchValue: string) {
  const normalizedSearchValue = normalizeSearchTerm(searchValue);

  if (!normalizedSearchValue) {
    return groups;
  }

  return groups.filter((group) => {
    const searchableText = [
      group.name,
      group.description,
      ...group.keywords,
      ...group.subcategories,
    ].join(" ");

    return valueMatchesSearch(searchableText, searchValue);
  });
}

function filterOptions(options: string[], searchValue: string) {
  return options.filter((option) => valueMatchesSearch(option, searchValue));
}

function getCategoryGroupHitTerms(group: CategoryGroup, searchValue: string) {
  const normalizedSearchValue = normalizeSearchTerm(searchValue);

  if (!normalizedSearchValue) {
    return group.subcategories.slice(0, 4);
  }

  return [...group.subcategories, ...group.keywords]
    .filter((item) => valueMatchesSearch(item, searchValue))
    .slice(0, 5);
}

function uniqueValues(values: string[]) {
  const seenValues = new Set<string>();
  const uniqueItems: string[] = [];

  values.forEach((value) => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      return;
    }

    const normalizedValue = normalizeSearchTerm(cleanValue);

    if (seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    uniqueItems.push(cleanValue);
  });

  return uniqueItems;
}

function getActiveSearchTerms(terms: string[], excludedTerms: string[]) {
  const excludedSet = new Set(excludedTerms.map(normalizeSearchTerm));

  return uniqueValues(terms).filter(
    (term) => !excludedSet.has(normalizeSearchTerm(term))
  );
}

export default function ForCompaniesPage() {
  const [form, setForm] = useState<InquiryForm>(emptyInquiryForm);
  const [excludedSearchTerms, setExcludedSearchTerms] = useState<string[]>([]);
  const [mainCategorySearch, setMainCategorySearch] = useState("");
  const [subCategorySearch, setSubCategorySearch] = useState("");
  const [eventCategorySearch, setEventCategorySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEventRequest = form.requestType === "event";
  const advertisingAllowed = canCompanyUseAdvertising(form.desiredPlan);

  const derivedCity = useMemo(() => {
    return getCityFromAddress(form.address);
  }, [form.address]);

  const fullAddress = useMemo(() => {
    return getFullAddress(form.address, form.addressAddition);
  }, [form.address, form.addressAddition]);

  const manualExtraTags = useMemo(() => {
    return getTermsFromText(form.tags);
  }, [form.tags]);

  const availableSubCategories = useMemo(() => {
    if (!form.mainCategory) {
      return [];
    }

    return getSubcategoriesForMainCategory(form.mainCategory);
  }, [form.mainCategory]);

  const filteredMainCategoryGroups = useMemo(() => {
    return filterCategoryGroups(categoryGroups, mainCategorySearch);
  }, [mainCategorySearch]);

  const filteredSubCategories = useMemo(() => {
    return filterOptions(availableSubCategories, subCategorySearch);
  }, [availableSubCategories, subCategorySearch]);

  const filteredEventCategories = useMemo(() => {
    return filterOptions(eventCategories, eventCategorySearch);
  }, [eventCategorySearch]);

  const selectedCompanyPackage = companyPackages.find(
    (item) => item.value === form.desiredPlan
  );

  const selectedEventPackage = eventPlans.find(
    (item) => item.value === form.eventPlan
  );

  const automaticCompanyTags = useMemo(() => {
    return uniqueValues([
      form.mainCategory,
      ...form.subCategories,
      ...manualExtraTags,
    ]);
  }, [form.mainCategory, form.subCategories, manualExtraTags]);

  const automaticCompanySearchTerms = useMemo(() => {
    return getAutomaticCompanySearchTerms({
      mainCategory: form.mainCategory,
      subCategories: form.subCategories,
      tags: manualExtraTags,
    });
  }, [form.mainCategory, form.subCategories, manualExtraTags]);

  const automaticEventSearchTerms = useMemo(() => {
    return getAutomaticEventSearchTerms({
      category: form.eventCategory,
      tags: manualExtraTags,
    });
  }, [form.eventCategory, manualExtraTags]);

  const visibleSearchPreviewTerms = isEventRequest
    ? automaticEventSearchTerms
    : automaticCompanySearchTerms;

  const activeSearchPreviewTerms = useMemo(() => {
    return getActiveSearchTerms(visibleSearchPreviewTerms, excludedSearchTerms);
  }, [visibleSearchPreviewTerms, excludedSearchTerms]);

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

    setExcludedSearchTerms([]);
    setMainCategorySearch("");
    setSubCategorySearch("");
    setEventCategorySearch("");
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

    setExcludedSearchTerms([]);
  }

  function updateMainCategory(value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      mainCategory: value,
      subCategories: [],
    }));

    setSubCategorySearch("");
    setExcludedSearchTerms([]);
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

  function toggleSearchTerm(term: string) {
    const normalizedTerm = normalizeSearchTerm(term);
    const isCurrentlyExcluded = excludedSearchTerms.includes(normalizedTerm);
    const activeTerms = getActiveSearchTerms(
      visibleSearchPreviewTerms,
      excludedSearchTerms
    );

    if (!isCurrentlyExcluded && activeTerms.length <= 1) {
      setErrorMessage("Mindestens ein Suchbegriff muss aktiv bleiben.");

      setTimeout(() => {
        setErrorMessage("");
      }, 3000);

      return;
    }

    setExcludedSearchTerms((currentTerms) => {
      if (currentTerms.includes(normalizedTerm)) {
        return currentTerms.filter((item) => item !== normalizedTerm);
      }

      return [...currentTerms, normalizedTerm];
    });
  }

  function activateAllSearchTerms() {
    setExcludedSearchTerms([]);
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

    setExcludedSearchTerms([]);
    scrollToInquiry();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.address.trim() || !derivedCity) {
      setErrorMessage(
        "Bitte gib eine vollständige Adresse ein, damit Locario den Ort automatisch erkennen kann. Format: Strasse Hausnummer, PLZ Ort."
      );
      return;
    }

    if (!isEventRequest && !form.mainCategory.trim()) {
      setErrorMessage("Bitte wähle eine Hauptkategorie aus.");
      return;
    }

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
        !form.description.trim() ||
        !form.message.trim())
    ) {
      setErrorMessage(
        "Bitte fülle Eventtitel, Veranstalter, Kontaktperson, E-Mail, Adresse, Beschreibung und Nachricht aus."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const selectedCompanySearchTerms = getActiveSearchTerms(
        automaticCompanySearchTerms,
        excludedSearchTerms
      );

      const selectedEventSearchTerms = getActiveSearchTerms(
        automaticEventSearchTerms,
        excludedSearchTerms
      );

      if (isEventRequest) {
        const eventTags = uniqueValues([
          ...manualExtraTags,
          ...selectedEventSearchTerms,
        ]);

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
            city: derivedCity,
            address: fullAddress,

            desiredPlan: form.eventPlan,

            category: form.eventCategory,
            locationName: form.eventLocationName,
            eventDate: form.eventDate,

            description: form.description,
            tags: eventTags,
            searchTerms: selectedEventSearchTerms,

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

        setExcludedSearchTerms([]);

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
          city: derivedCity,
          address: fullAddress,

          desiredPlan: form.desiredPlan,

          mainCategory,
          subCategory: subCategories[0],
          subCategories,
          category: subCategories[0],

          description: form.description,
          tags: automaticCompanyTags,
          searchTerms: selectedCompanySearchTerms,

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

      setExcludedSearchTerms([]);

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
              Werde regional sichtbar,{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
                wenn echte Nachfrage entsteht.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Locario ist nicht nur ein Eintrag, sondern ein regionaler Such- und
              Anfragekanal. Firmen werden bei passenden Suchanfragen gefunden,
              Events werden entdeckt und Firmen können Locario als regionalen
              Anfragekanal nutzen.
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
              <HeroStat value="Pro" label="empfohlenes Paket" />
              <HeroStat value="24/7" label="regional sichtbar" />
              <HeroStat value="7 Tage" label="Event-Wochenpakete" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-cyan-300/20 via-blue-500/10 to-transparent blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Locario als verkaufbare Plattform
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Nachfrage erkennen. Sichtbarkeit verkaufen. Lokal wachsen.
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
                  description="Basis-Sichtbarkeit mit öffentlichem Profil, Adresse, Kontakt und Suchbegriffen."
                />

                <MiniInfo
                  title="Pro & Premium"
                  description="Mit Partner-Dashboard, Leads, Profilbearbeitung, Werbeanzeige und stärkerer Platzierung."
                />

                <MiniInfo
                  title="Launch-Angebot"
                  description="Für erste regionale Partner kann im Gespräch ein individueller Einstieg vereinbart werden."
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

        <section className="mt-20 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-8 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-emerald-200">
                Launch-Angebot
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Pakete klar zeigen, Einstieg flexibel halten.
              </h2>

              <p className="mt-5 text-slate-300">
                Öffentlich bleiben Starter, Pro und Premium klar sichtbar. Für
                ausgewählte erste regionale Partner kann im persönlichen Gespräch
                ein individuelles Launch-Angebot vereinbart werden.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {launchOfferBenefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="rounded-3xl border border-emerald-300/20 bg-slate-950/50 p-5"
                >
                  <h3 className="text-xl font-black text-emerald-100">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-300">
                    {benefit.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl md:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
                Für regionale Anbieter mit lokalem Markt
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Locario funktioniert für Anbieter, die regional gefunden, kontaktiert
                oder entdeckt werden wollen.
              </h2>

              <p className="mt-5 text-slate-300">
                Entscheidend ist nicht die Firmengrösse, sondern lokale Relevanz:
                Wer in einer Region Nachfrage bedienen kann, passt zu Locario.
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
              So funktioniert der Einstieg
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Vom Profil zur regionalen Sichtbarkeit
            </h2>

            <p className="mt-5 text-slate-300">
              Der Einstieg soll für Firmen einfach sein: Paket wählen, Profil prüfen
              lassen, regional sichtbar werden und danach mit echten Daten optimieren.
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
              Firmenpakete
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Starter sichtbar. Pro verkaufbar. Premium dominant.
            </h2>

            <p className="mt-5 text-slate-300">
              So bleibt das Angebot verständlich: Starter ist der einfache Eintrag.
              Pro ist das wichtigste Verkaufspaket mit Leads und Dashboard.
              Premium ist für Firmen, die regional sehr präsent sein wollen.
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
              Event-Werbung für den richtigen Zeitpunkt
            </h2>

            <p className="mt-5 text-slate-300">
              Events brauchen Aufmerksamkeit vor dem Datum. Wochenpakete machen
              Sichtbarkeit einfach planbar – für Märkte, Konzerte, Vereinsanlässe,
              Partys oder lokale Highlights.
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
                    "Bild, Datum, Ort, Adresse und Beschreibung",
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
                Paket anfragen
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                {isEventRequest
                  ? "Event-Werbung anfragen."
                  : "Firmenprofil anfragen."}
              </h2>

              <p className="mt-5 text-slate-300">
                {isEventRequest
                  ? "Erfasse dein Event mit Veranstalter, Kategorie, Datum, Adresse und gewünschtem Wochenpaket."
                  : "Je vollständiger deine Angaben sind, desto schneller kann Locario dein Profil prüfen, Suchbegriffe vorbereiten und den passenden Paketstart abstimmen."}
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
                    : "Pro ist das wichtigste Verkaufspaket. Starter bleibt bewusst einfach; Leads, Dashboard, Profilverwaltung und Werbeanzeige sind ab Pro enthalten."}
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
                      { value: "pro", label: "Pro – CHF 149 / Monat – empfohlen" },
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

                <InputField
                  label="Website"
                  value={form.website}
                  onChange={(value) => updateField("website", value)}
                  placeholder="https://www.firma.ch"
                />

                <AddressCard
                  value={form.address}
                  addressAddition={form.addressAddition}
                  derivedCity={derivedCity}
                  isEventRequest={isEventRequest}
                  onChange={(value) => updateField("address", value)}
                  onChangeAddressAddition={(value) =>
                    updateField("addressAddition", value)
                  }
                />

                {isEventRequest && (
                  <>
                    <div className="grid gap-5 md:grid-cols-2">
                      <EventCategoryPicker
                        value={form.eventCategory}
                        searchValue={eventCategorySearch}
                        options={filteredEventCategories}
                        onSearchChange={setEventCategorySearch}
                        onChange={(value) => {
                          updateField("eventCategory", value);
                          setExcludedSearchTerms([]);
                        }}
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
                    <CategorySelectionCard
                      mainCategory={form.mainCategory}
                      subCategories={form.subCategories}
                      categorySearch={mainCategorySearch}
                      subCategorySearch={subCategorySearch}
                      filteredGroups={filteredMainCategoryGroups}
                      availableSubCategories={availableSubCategories}
                      filteredSubCategories={filteredSubCategories}
                      onSearchChange={setMainCategorySearch}
                      onSubCategorySearchChange={setSubCategorySearch}
                      onSelectMainCategory={updateMainCategory}
                      onToggleSubCategory={toggleSubCategory}
                    />
                  </>
                )}

                <InputField
                  label="Zusatzlabels / Spezialbegriffe (optional)"
                  value={form.tags}
                  onChange={(value) => updateField("tags", value)}
                  placeholder={
                    isEventRequest
                      ? "Zum Beispiel: kinderfreundlich, live musik, gratis"
                      : "Zum Beispiel: vegan, 24h, terrasse, notdienst"
                  }
                />

                <SearchPreviewCard
                  isEventRequest={isEventRequest}
                  terms={visibleSearchPreviewTerms}
                  activeTerms={activeSearchPreviewTerms}
                  excludedTerms={excludedSearchTerms}
                  hasEnoughBaseData={
                    isEventRequest
                      ? Boolean(form.eventCategory)
                      : Boolean(form.mainCategory && form.subCategories.length)
                  }
                  onToggleTerm={toggleSearchTerm}
                  onActivateAll={activateAllSearchTerms}
                />

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
            Mache deine Firma oder dein Event dort sichtbar, wo Menschen regional
            suchen, vergleichen und konkrete Hilfe brauchen.
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

function AddressCard({
  value,
  addressAddition,
  derivedCity,
  isEventRequest,
  onChange,
  onChangeAddressAddition,
}: {
  value: string;
  addressAddition: string;
  derivedCity: string;
  isEventRequest: boolean;
  onChange: (value: string) => void;
  onChangeAddressAddition: (value: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-cyan-300/25 bg-cyan-300/10 p-5 shadow-xl shadow-cyan-950/10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <label className="text-lg font-black text-cyan-100">
            {isEventRequest
              ? "Adresse des Veranstaltungsorts"
              : "Adresse der Firma"}
          </label>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Gib die vollständige Adresse ein. Locario erkennt daraus automatisch
            den Ort für Suche, Admin und Veröffentlichung.
          </p>
        </div>

        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            derivedCity
              ? "border-cyan-300/30 bg-slate-950/70"
              : "border-white/10 bg-slate-950/50"
          }`}
        >
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Erkannter Ort
          </p>

          <p
            className={`mt-1 font-black ${
              derivedCity ? "text-cyan-100" : "text-slate-500"
            }`}
          >
            {derivedCity || "Noch nicht erkannt"}
          </p>
        </div>
      </div>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Strasse Hausnummer, PLZ Ort"
        required
        className="mt-5 w-full rounded-2xl border border-cyan-300/40 bg-slate-950/70 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />

      <input
        value={addressAddition}
        onChange={(event) => onChangeAddressAddition(event.target.value)}
        placeholder={
          isEventRequest
            ? "Optionaler Zusatz: Halle, Eingang, Stockwerk, Standplatz..."
            : "Optionaler Zusatz: Eingang, Stockwerk, Büro, Ladenlokal..."
        }
        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Empfohlenes Format
        </p>

        <p className="mt-1 text-sm text-slate-300">
          Strasse Hausnummer, PLZ Ort
        </p>
      </div>
    </div>
  );
}

function SearchPreviewCard({
  isEventRequest,
  terms,
  activeTerms,
  excludedTerms,
  hasEnoughBaseData,
  onToggleTerm,
  onActivateAll,
}: {
  isEventRequest: boolean;
  terms: string[];
  activeTerms: string[];
  excludedTerms: string[];
  hasEnoughBaseData: boolean;
  onToggleTerm: (term: string) => void;
  onActivateAll: () => void;
}) {
  const shownTerms = uniqueValues(terms).slice(0, 48);
  const excludedSet = new Set(excludedTerms.map(normalizeSearchTerm));
  const inactiveCount = shownTerms.filter((term) =>
    excludedSet.has(normalizeSearchTerm(term))
  ).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h3 className="text-lg font-black text-white">
            Automatische Suchlogik
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Locario schlägt passende Suchbegriffe automatisch vor. Alle Begriffe
            sind zuerst aktiv. Unpassende Begriffe kannst du per Klick abwählen.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black text-emerald-100">
            {activeTerms.length} aktiv
          </span>

          <button
            type="button"
            onClick={onActivateAll}
            disabled={inactiveCount === 0}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Alle aktivieren
          </button>
        </div>
      </div>

      {!hasEnoughBaseData && (
        <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Wähle zuerst die passende Kategorie aus. Danach erscheinen hier die
          automatisch erkannten Suchbegriffe.
        </p>
      )}

      {hasEnoughBaseData && shownTerms.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {shownTerms.map((term, termIndex) => {
              const isExcluded = excludedSet.has(normalizeSearchTerm(term));
              const isLastActive = !isExcluded && activeTerms.length <= 1;

              return (
                <button
                  key={`${normalizeSearchTerm(term)}-${termIndex}`}
                  type="button"
                  onClick={() => onToggleTerm(term)}
                  disabled={isLastActive}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isExcluded
                      ? "border-red-300/20 bg-red-300/10 text-red-200 line-through hover:bg-red-300/20"
                      : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                  }`}
                  title={
                    isLastActive
                      ? "Mindestens ein Suchbegriff muss aktiv bleiben."
                      : isExcluded
                        ? "Wieder aktivieren"
                        : "Abwählen"
                  }
                >
                  {isExcluded ? "+ " : "✓ "}
                  {term}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Grün = wird gespeichert. Rot/durchgestrichen = wird nicht
            gespeichert.
          </p>
        </>
      )}

      {hasEnoughBaseData && shownTerms.length === 0 && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
          Noch keine Suchbegriffe erkannt. Ergänze optional Spezialbegriffe.
        </p>
      )}

      {hasEnoughBaseData && terms.length > shownTerms.length && (
        <p className="mt-4 text-xs text-slate-500">
          Es werden die wichtigsten {shownTerms.length} von {terms.length}{" "}
          Begriffen angezeigt.
        </p>
      )}
    </div>
  );
}

function CategorySelectionCard({
  mainCategory,
  subCategories,
  categorySearch,
  subCategorySearch,
  filteredGroups,
  availableSubCategories,
  filteredSubCategories,
  onSearchChange,
  onSubCategorySearchChange,
  onSelectMainCategory,
  onToggleSubCategory,
}: {
  mainCategory: string;
  subCategories: string[];
  categorySearch: string;
  subCategorySearch: string;
  filteredGroups: CategoryGroup[];
  availableSubCategories: string[];
  filteredSubCategories: string[];
  onSearchChange: (value: string) => void;
  onSubCategorySearchChange: (value: string) => void;
  onSelectMainCategory: (value: string) => void;
  onToggleSubCategory: (value: string) => void;
}) {
  const selectedGroup = categoryGroups.find((group) => group.name === mainCategory);

  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 shadow-xl shadow-cyan-950/10">
      <div>
        <label className="text-lg font-black text-cyan-100">
          Kategorie & Leistungen
        </label>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Suche nach Branche, Leistung oder Alltagssprache. Die Auswahl steuert
          später Tags, Suchbegriffe und die Trefferqualität in der Locario-Suche.
        </p>
      </div>

      <div className="mt-5">
        <CategorySearchInput
          label="Hauptkategorie suchen"
          value={categorySearch}
          onChange={onSearchChange}
          placeholder="Zum Beispiel: Garage, Heizung, Garten, Restaurant, Reinigung..."
        />
      </div>

      <div className="mt-4 grid max-h-[28rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
        {filteredGroups.map((group) => {
          const isSelected = mainCategory === group.name;
          const hitTerms = getCategoryGroupHitTerms(group, categorySearch);

          return (
            <button
              key={group.name}
              type="button"
              onClick={() => onSelectMainCategory(group.name)}
              className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                isSelected
                  ? "border-cyan-300/60 bg-cyan-300/20 text-cyan-100"
                  : "border-white/10 bg-slate-950/50 text-slate-300 hover:border-cyan-300/30 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{group.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {group.description}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    isSelected
                      ? "bg-cyan-300 text-slate-950"
                      : "border border-white/10 text-slate-400"
                  }`}
                >
                  {isSelected ? "✓" : "+"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {hitTerms.map((term) => (
                  <span
                    key={`${group.name}-${term}`}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Keine Hauptkategorie gefunden. Versuche einen allgemeineren Begriff
          oder nutze unten die Zusatzlabels für Spezialbegriffe.
        </p>
      )}

      <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <p className="font-black text-white">Unterkategorien</p>
            <p className="mt-1 text-sm text-slate-400">
              Wähle eine oder mehrere konkrete Leistungen. Die erste Auswahl wird
              als Hauptleistung gespeichert.
            </p>
          </div>

          {mainCategory && (
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100">
              {mainCategory}
            </span>
          )}
        </div>

        {!mainCategory && (
          <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
            Wähle zuerst eine Hauptkategorie aus.
          </p>
        )}

        {mainCategory && (
          <>
            <div className="mt-4">
              <CategorySearchInput
                label="Unterkategorie suchen"
                value={subCategorySearch}
                onChange={onSubCategorySearchChange}
                placeholder="Zum Beispiel: Reifenservice, Boiler, Bäckerei, Endreinigung..."
              />
            </div>

            <div className="mt-4 grid max-h-[24rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
              {filteredSubCategories.map((option) => {
                const isSelected = subCategories.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onToggleSubCategory(option)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      isSelected
                        ? "border-emerald-300/50 bg-emerald-300/20 text-emerald-100"
                        : "border-white/10 bg-slate-950/50 text-slate-300 hover:border-cyan-300/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="mr-2">{isSelected ? "✓" : "+"}</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {filteredSubCategories.length === 0 && (
              <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
                In dieser Hauptkategorie wurde keine passende Unterkategorie
                gefunden. Suchbegriff ändern oder eine andere Hauptkategorie wählen.
              </p>
            )}
          </>
        )}

        {subCategories.length > 0 && (
          <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-200">
              Ausgewählte Leistungen
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {subCategories.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onToggleSubCategory(value)}
                  className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-slate-950 transition hover:bg-emerald-200"
                  title="Abwählen"
                >
                  ✓ {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedGroup && availableSubCategories.length > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            {availableSubCategories.length} mögliche Unterkategorien in dieser
            Hauptkategorie.
          </p>
        )}
      </div>
    </div>
  );
}

function EventCategoryPicker({
  value,
  searchValue,
  options,
  onSearchChange,
  onChange,
}: {
  value: string;
  searchValue: string;
  options: string[];
  onSearchChange: (value: string) => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-200">Event-Kategorie</label>

      <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <CategorySearchInput
          label="Kategorie suchen"
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Zum Beispiel: Konzert, Markt, Familie, Kultur..."
        />

        <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = value === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  isSelected
                    ? "border-amber-300/50 bg-amber-300/20 text-amber-100"
                    : "border-white/10 bg-slate-950/50 text-slate-300 hover:border-amber-300/30 hover:bg-white/10"
                }`}
              >
                <span className="mr-2">{isSelected ? "✓" : "+"}</span>
                {option}
              </button>
            );
          })}
        </div>

        {options.length === 0 && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
            Keine Event-Kategorie gefunden.
          </p>
        )}
      </div>
    </div>
  );
}

function CategorySearchInput({
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
      <label className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
      />
    </div>
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
