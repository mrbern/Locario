export type CategoryGroup = {
  name: string;
  description: string;
  keywords: string[];
  subcategories: string[];
};

export type CategorySearchItem = {
  mainCategory: string;
  subCategory?: string;
  label: string;
  type: "main" | "sub";
  keywords: string[];
};

export const categoryGroups: CategoryGroup[] = [
  {
    name: "Bau, Garten & Material",
    description:
      "Bauen, Garten, Materiallieferung, Erdarbeiten, Aussenbereich und Baustoffe.",
    keywords: [
      "bauen",
      "bau",
      "baustoffe",
      "kies",
      "sand",
      "garten",
      "aushub",
      "renovation",
      "umbau",
      "material",
    ],
    subcategories: [
      "Kieswerk",
      "Sand & Splitt",
      "Baustoffhandel",
      "Bauunternehmen",
      "Aushub & Erdarbeiten",
      "Baggerarbeiten",
      "Beton & Zement",
      "Gartenbau",
      "Gartenpflege",
      "Gärtnerei",
      "Baumschule",
      "Forstbetrieb",
      "Brennholz",
      "Gerüstbau",
      "Plattenleger",
      "Bodenleger",
      "Fenster & Türen",
      "Storen & Beschattung",
    ],
  },
  {
    name: "Handwerk & Reparaturen",
    description:
      "Handwerker, Haustechnik, Reparaturen, Montage, Service und Notfalldienste.",
    keywords: [
      "handwerker",
      "reparatur",
      "notdienst",
      "sanitär",
      "heizung",
      "elektriker",
      "maler",
      "schreiner",
      "dach",
      "solar",
    ],
    subcategories: [
      "Elektriker",
      "Sanitär",
      "Heizung",
      "Lüftung & Klima",
      "Solar & Photovoltaik",
      "Maler & Gipser",
      "Schreiner",
      "Zimmermann",
      "Dachdecker",
      "Spengler",
      "Schlosser",
      "Glaser",
      "Haushaltgeräte Reparatur",
      "Allrounder",
      "Notfalldienst",
      "Kaminfeger",
    ],
  },
  {
    name: "Auto, Garage & Fahrzeuge",
    description:
      "Garagen, Fahrzeugservice, Verkauf, Reifen, Carrosserie, Vermietung und Landmaschinen.",
    keywords: [
      "auto",
      "garage",
      "werkstatt",
      "fahrzeug",
      "reifen",
      "pneu",
      "carrosserie",
      "occasion",
      "leasing",
      "motorrad",
    ],
    subcategories: [
      "Autohaus",
      "Garage",
      "Occasionen",
      "Neuwagen",
      "Autowerkstatt",
      "Reifenservice",
      "Carrosserie",
      "Autolackiererei",
      "Fahrzeugaufbereitung",
      "Autovermietung",
      "Leasing",
      "Motorrad",
      "Nutzfahrzeuge",
      "Landmaschinen",
    ],
  },
  {
    name: "Beauty, Gesundheit & Wohlbefinden",
    description:
      "Beauty, Coiffeur, Therapie, Praxen, Fitness, Gesundheit und Wohlbefinden.",
    keywords: [
      "coiffeur",
      "haare",
      "beauty",
      "kosmetik",
      "massage",
      "physio",
      "arzt",
      "zahnarzt",
      "fitness",
      "gesundheit",
    ],
    subcategories: [
      "Coiffeur",
      "Barbershop",
      "Kosmetikstudio",
      "Nagelstudio",
      "Massage",
      "Physiotherapie",
      "Osteopathie",
      "Podologie",
      "Zahnarzt",
      "Arztpraxis",
      "Apotheke",
      "Drogerie",
      "Fitnesscenter",
      "Personal Training",
      "Ernährungsberatung",
      "Spitex & Pflege",
    ],
  },
  {
    name: "Gastro, Lebensmittel & Genuss",
    description:
      "Restaurants, Take-away, Cafés, Lebensmittel, regionale Produkte und Catering.",
    keywords: [
      "restaurant",
      "essen",
      "takeaway",
      "cafe",
      "bäckerei",
      "metzgerei",
      "hofladen",
      "catering",
      "bar",
      "lebensmittel",
    ],
    subcategories: [
      "Restaurant",
      "Pizzeria",
      "Take-away",
      "Café",
      "Bäckerei",
      "Konditorei",
      "Metzgerei",
      "Käserei",
      "Hofladen",
      "Lebensmittelgeschäft",
      "Getränkemarkt",
      "Catering",
      "Foodtruck",
      "Bar & Lounge",
    ],
  },
  {
    name: "Immobilien, Wohnen & Reinigung",
    description:
      "Immobilien, Wohnen, Umzug, Reinigung, Innenausbau, Hauswartung und Sicherheit.",
    keywords: [
      "immobilien",
      "wohnung",
      "haus",
      "umzug",
      "reinigung",
      "hauswartung",
      "möbel",
      "küche",
      "bad",
      "schlüssel",
    ],
    subcategories: [
      "Immobilienmakler",
      "Immobilienverwaltung",
      "Hauswartung",
      "Umzugsfirma",
      "Reinigungsfirma",
      "Endreinigung",
      "Gebäudereinigung",
      "Teppichreinigung",
      "Möbelhaus",
      "Innenausbau",
      "Küchenbau",
      "Badumbau",
      "Sicherheitstechnik",
      "Schlüsseldienst",
    ],
  },
  {
    name: "Transport, Logistik & Entsorgung",
    description:
      "Transport, Kurier, Lieferdienst, Taxi, Umzug, Räumung, Lager und Entsorgung.",
    keywords: [
      "transport",
      "logistik",
      "kurier",
      "lieferung",
      "taxi",
      "umzug",
      "räumung",
      "entsorgung",
      "recycling",
      "lager",
    ],
    subcategories: [
      "Transportfirma",
      "Kurierdienst",
      "Lieferdienst",
      "Taxi",
      "Carreisen",
      "Umzugstransport",
      "Lagerraum",
      "Entsorgung",
      "Recycling",
      "Räumung",
      "Muldenvermietung",
      "Baumaschinen Transport",
      "Paketdienst",
    ],
  },
  {
    name: "Dienstleistungen & Beratung",
    description:
      "Treuhand, Recht, Versicherung, Beratung, Marketing, Web, IT und Kreativleistungen.",
    keywords: [
      "beratung",
      "treuhand",
      "steuern",
      "anwalt",
      "marketing",
      "webdesign",
      "it",
      "fotograf",
      "druckerei",
      "versicherung",
    ],
    subcategories: [
      "Treuhand",
      "Steuerberatung",
      "Versicherung",
      "Anwalt",
      "Notar",
      "Unternehmensberatung",
      "Marketingagentur",
      "Webdesign",
      "IT Support",
      "Cybersecurity",
      "Druckerei",
      "Fotograf",
      "Videoproduktion",
      "Übersetzungen",
    ],
  },
  {
    name: "Detailhandel & Fachgeschäfte",
    description:
      "Lokale Läden, Fachgeschäfte, Produkte, Beratung und Verkauf vor Ort.",
    keywords: [
      "laden",
      "geschäft",
      "shop",
      "einkaufen",
      "mode",
      "schuhe",
      "velo",
      "blumen",
      "optiker",
      "tierbedarf",
    ],
    subcategories: [
      "Modegeschäft",
      "Schuhgeschäft",
      "Sportgeschäft",
      "Velogeschäft",
      "Elektronikgeschäft",
      "Haushaltswaren",
      "Blumenladen",
      "Tierbedarf",
      "Optiker",
      "Uhren & Schmuck",
      "Spielwaren",
      "Buchhandlung",
      "Drogerie",
      "Geschenkladen",
      "Fisch & Aquaristik",
    ],
  },
  {
    name: "Freizeit, Events & Vereine",
    description:
      "Freizeitangebote, Vereine, Eventdienstleister, Musik, Reisen, Kinder und Tiere.",
    keywords: [
      "event",
      "freizeit",
      "verein",
      "musik",
      "dj",
      "sport",
      "reise",
      "hotel",
      "kinder",
      "hund",
    ],
    subcategories: [
      "Eventlocation",
      "Eventtechnik",
      "DJ",
      "Musikschule",
      "Tanzschule",
      "Sportverein",
      "Freizeitangebot",
      "Reisebüro",
      "Hotel",
      "Ferienwohnung",
      "Camping",
      "Kinderbetreuung",
      "Hundeschule",
      "Tierpension",
    ],
  },
  {
    name: "Landwirtschaft & Regionales",
    description:
      "Hofprodukte, Landwirtschaft, Forst, regionale Lebensmittel, Tiere und Direktvermarktung.",
    keywords: [
      "landwirtschaft",
      "hofladen",
      "bauernhof",
      "regional",
      "forst",
      "brennholz",
      "winzer",
      "imkerei",
      "tierarzt",
      "pferd",
    ],
    subcategories: [
      "Bauernhof",
      "Hofladen",
      "Landmaschinen",
      "Forstbetrieb",
      "Brennholz",
      "Mosterei",
      "Winzer",
      "Gärtnerei",
      "Baumschule",
      "Imkerei",
      "Direktvermarktung",
      "Tierarzt",
      "Pferdebetrieb",
    ],
  },
];

export const mainCategories = categoryGroups.map((categoryGroup) => {
  return categoryGroup.name;
});

export const categories = Array.from(
  new Set(categoryGroups.flatMap((categoryGroup) => categoryGroup.subcategories))
);

function normalizeCategoryValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

export function getSubcategoriesForMainCategory(mainCategory: string) {
  const categoryGroup = categoryGroups.find((group) => {
    return group.name === mainCategory;
  });

  return categoryGroup?.subcategories ?? [];
}

export function findMainCategoryForSubCategory(subCategory: string) {
  const normalizedSubCategory = normalizeCategoryValue(subCategory);

  const categoryGroup = categoryGroups.find((group) => {
    return group.subcategories.some((item) => {
      return normalizeCategoryValue(item) === normalizedSubCategory;
    });
  });

  return categoryGroup?.name ?? "";
}

export function getCategorySearchItems() {
  return categoryGroups.flatMap((group): CategorySearchItem[] => [
    {
      mainCategory: group.name,
      label: group.name,
      type: "main",
      keywords: group.keywords,
    },
    ...group.subcategories.map((subCategory) => ({
      mainCategory: group.name,
      subCategory,
      label: subCategory,
      type: "sub" as const,
      keywords: [...group.keywords, subCategory],
    })),
  ]);
}

export function searchCategories(query: string) {
  const normalizedQuery = normalizeCategoryValue(query);

  if (!normalizedQuery) {
    return getCategorySearchItems();
  }

  return getCategorySearchItems().filter((item) => {
    const searchableText = normalizeCategoryValue(
      [item.label, item.mainCategory, item.subCategory ?? "", ...item.keywords].join(" ")
    );

    return searchableText.includes(normalizedQuery);
  });
}
