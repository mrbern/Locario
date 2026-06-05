export type CategoryGroup = {
  name: string;
  subcategories: string[];
};

export const categoryGroups: CategoryGroup[] = [
  {
    name: "Bau, Garten & Material",
    subcategories: [
      "Kieswerk",
      "Sand & Splitt",
      "Baustoffhandel",
      "Bauunternehmen",
      "Gartenbau",
      "Gartenpflege",
      "Aushub & Erdarbeiten",
      "Baggerarbeiten",
      "Beton & Zement",
      "Muldenservice",
      "Gerüstbau",
      "Plattenleger",
      "Bodenleger",
      "Fenster & Türen",
      "Storen & Beschattung",
    ],
  },
  {
    name: "Handwerk & Reparaturen",
    subcategories: [
      "Elektriker",
      "Sanitär",
      "Heizung",
      "Lüftung & Klima",
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
    ],
  },
  {
    name: "Auto, Garage & Fahrzeuge",
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
      "Fitnesscenter",
      "Personal Training",
      "Ernährungsberatung",
    ],
  },
  {
    name: "Gastro, Lebensmittel & Genuss",
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
    ],
  },
  {
    name: "Freizeit, Events & Vereine",
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

export const categories = categoryGroups.flatMap((categoryGroup) => {
  return categoryGroup.subcategories;
});

export function getSubcategoriesForMainCategory(mainCategory: string) {
  const categoryGroup = categoryGroups.find((group) => {
    return group.name === mainCategory;
  });

  return categoryGroup?.subcategories ?? [];
}

export function findMainCategoryForSubCategory(subCategory: string) {
  const categoryGroup = categoryGroups.find((group) => {
    return group.subcategories.includes(subCategory);
  });

  return categoryGroup?.name ?? "";
}