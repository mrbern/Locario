import { randomUUID } from "crypto";
import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaClient as PrismaClientType } from "../src/generated/prisma/client";

loadEnvConfig(process.cwd());

type PrismaRuntime = PrismaClientType;

type ColumnInfo = {
  name: string;
  dataType: string;
  udtName: string;
  isNullable: string;
  columnDefault: string | null;
};

type CompanySeed = {
  key: string;
  parentKey?: string;
  name: string;
  locationName?: string;
  plan: "starter" | "pro" | "premium" | "pilot";
  mainCategory: string;
  subCategories: string[];
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  description: string;
  tags: string[];
  searchTerms: string[];
  ad?: {
    title: string;
    description: string;
    cta: string;
  };
};

type EventSeed = {
  title: string;
  organizerName: string;
  plan: "basic" | "highlight" | "premium";
  category: string;
  city: string;
  locationName: string;
  address: string;
  startsAt: Date;
  latitude: number;
  longitude: number;
  website: string;
  ticketUrl: string;
  description: string;
  tags: string[];
  searchTerms: string[];
};

const now = new Date();

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function unique(values: string[]) {
  const seenValues = new Set<string>();
  const uniqueItems: string[] = [];

  values.forEach((value) => {
    const cleanValue = value.trim();
    const normalizedValue = normalize(cleanValue);

    if (!cleanValue || !normalizedValue || seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    uniqueItems.push(cleanValue);
  });

  return uniqueItems;
}

function futureDate(daysFromNow: number, hour = 18, minute = 30) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function makeCompany(seed: CompanySeed, parentCompanyId?: string) {
  const id = randomUUID();
  const subCategory = seed.subCategories[0] ?? seed.mainCategory;
  const allTags = unique([seed.mainCategory, ...seed.subCategories, ...seed.tags]);
  const searchTerms = unique([
    seed.mainCategory,
    ...seed.subCategories,
    ...seed.tags,
    ...seed.searchTerms,
    seed.city,
  ]).map((term) => term.toLowerCase());

  return {
    id,
    name: seed.name,
    companyName: seed.name,
    title: seed.name,
    accessToken: randomUUID(),
    plan: seed.plan,
    parentCompanyId: parentCompanyId ?? null,
    locationName: seed.locationName ?? "",
    mainCategory: seed.mainCategory,
    subCategory,
    subCategories: seed.subCategories,
    category: subCategory,
    city: seed.city,
    address: seed.address,
    adress: seed.address,
    latitude: seed.latitude,
    longitude: seed.longitude,
    phone: seed.phone,
    email: seed.email,
    website: seed.website,
    imageUrl: "",
    description: seed.description,
    tags: allTags,
    searchTerms,
    createdAt: now,
    updatedAt: now,
  };
}

function makeEvent(seed: EventSeed) {
  const id = randomUUID();
  const tags = unique([seed.category, ...seed.tags]);
  const searchTerms = unique([
    seed.category,
    ...seed.tags,
    ...seed.searchTerms,
    seed.city,
    seed.locationName,
  ]).map((term) => term.toLowerCase());

  return {
    id,
    title: seed.title,
    organizerName: seed.organizerName,
    plan: seed.plan,
    category: seed.category,
    city: seed.city,
    locationName: seed.locationName,
    address: seed.address,
    startsAt: seed.startsAt,
    eventDate: seed.startsAt,
    startDate: seed.startsAt,
    latitude: seed.latitude,
    longitude: seed.longitude,
    phone: "",
    email: `event-${normalize(seed.title)}@test.locario.ch`,
    website: seed.website,
    ticketUrl: seed.ticketUrl,
    imageUrl: "",
    description: seed.description,
    tags,
    searchTerms,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

const companySeeds: CompanySeed[] = [
  {
    key: "kies-wattenwil",
    name: "Berner Kies & Baustoffe AG",
    locationName: "Hauptsitz Wattenwil",
    plan: "premium",
    mainCategory: "Bau, Garten & Material",
    subCategories: ["Kieswerk", "Sand & Splitt", "Baustoffhandel", "Aushub & Erdarbeiten"],
    city: "Wattenwil",
    address: "Industriestrasse 4, 3665 Wattenwil",
    latitude: 46.7678,
    longitude: 7.5076,
    phone: "+41 33 111 10 10",
    email: "kies-wattenwil@test.locario.ch",
    website: "https://test.locario/berner-kies-wattenwil",
    description:
      "Regionale Lieferung von Kies, Sand, Splitt, Humus und Baustoffen für Bauunternehmen, Gartenbau und private Projekte im Raum Wattenwil und Thun.",
    tags: ["Kies", "Sand", "Splitt", "Baustoffe", "Material liefern"],
    searchTerms: ["ich brauche kies", "kies liefern", "sand liefern", "baumaterial", "gartenkies", "aushubmaterial"],
    ad: {
      title: "Kies und Splitt regional geliefert",
      description: "Baustoffe für Garten, Zufahrt und Baustelle direkt ab Standort Wattenwil.",
      cta: "Material anfragen",
    },
  },
  {
    key: "kies-thun",
    parentKey: "kies-wattenwil",
    name: "Berner Kies & Baustoffe AG",
    locationName: "Standort Thun",
    plan: "pro",
    mainCategory: "Bau, Garten & Material",
    subCategories: ["Kieswerk", "Sand & Splitt", "Baustoffhandel"],
    city: "Thun",
    address: "Gwattstrasse 88, 3604 Thun",
    latitude: 46.7434,
    longitude: 7.6296,
    phone: "+41 33 111 10 11",
    email: "kies-thun@test.locario.ch",
    website: "https://test.locario/berner-kies-thun",
    description:
      "Filiale für Kies, Sand, Splitt und Baustoffe im Raum Thun, ideal für schnelle Abholung und regionale Lieferungen.",
    tags: ["Kies", "Sand", "Splitt", "Thun", "Baustoffe"],
    searchTerms: ["kies thun", "sand thun", "splitt thun", "baustoffe thun", "material thun"],
  },
  {
    key: "garage-thun",
    name: "Garage Aareblick GmbH",
    locationName: "Werkstatt Thun",
    plan: "premium",
    mainCategory: "Auto, Garage & Fahrzeuge",
    subCategories: ["Garage", "Autowerkstatt", "Reifenservice", "Occasionen"],
    city: "Thun",
    address: "Aarestrasse 18, 3600 Thun",
    latitude: 46.7560,
    longitude: 7.6300,
    phone: "+41 33 222 20 20",
    email: "garage-thun@test.locario.ch",
    website: "https://test.locario/garage-aareblick-thun",
    description:
      "Autowerkstatt für Service, Diagnose, Bremsen, MFK-Vorbereitung, Reifenwechsel und Occasionen in Thun.",
    tags: ["Garage", "Autowerkstatt", "Reifen", "MFK", "Diagnose"],
    searchTerms: ["mein auto macht geräusche", "auto kaputt", "mechaniker", "pneu wechseln", "reifenservice", "autoservice"],
    ad: {
      title: "Gratis Kurzcheck bei Geräuschen",
      description: "Wir prüfen Motor, Bremsen und Fahrwerk und erklären die nächsten Schritte verständlich.",
      cta: "Fahrzeugcheck anfragen",
    },
  },
  {
    key: "garage-bern",
    parentKey: "garage-thun",
    name: "Garage Aareblick GmbH",
    locationName: "Annahme Bern",
    plan: "pro",
    mainCategory: "Auto, Garage & Fahrzeuge",
    subCategories: ["Garage", "Autowerkstatt", "Reifenservice"],
    city: "Bern",
    address: "Wankdorfallee 12, 3014 Bern",
    latitude: 46.9591,
    longitude: 7.4646,
    phone: "+41 31 222 20 21",
    email: "garage-bern@test.locario.ch",
    website: "https://test.locario/garage-aareblick-bern",
    description:
      "Annahmestelle in Bern für Service, Reifenwechsel, Diagnose und Reparaturen der Garage Aareblick.",
    tags: ["Garage", "Bern", "Autowerkstatt", "Pneu"],
    searchTerms: ["garage bern", "autowerkstatt bern", "pneu bern", "auto reparatur bern", "diagnose bern"],
  },
  {
    key: "garten-burgdorf",
    name: "Gartenbau Emmental GmbH",
    plan: "pro",
    mainCategory: "Bau, Garten & Material",
    subCategories: ["Gartenbau", "Gartenpflege", "Baggerarbeiten"],
    city: "Burgdorf",
    address: "Emmentalstrasse 35, 3400 Burgdorf",
    latitude: 47.0559,
    longitude: 7.6276,
    phone: "+41 34 333 30 30",
    email: "garten-burgdorf@test.locario.ch",
    website: "https://test.locario/gartenbau-emmental",
    description:
      "Gartenbau, Rasen, Hecken, Sitzplätze, Naturstein und Gartenunterhalt für private und gewerbliche Kunden im Emmental.",
    tags: ["Garten", "Rasen", "Hecken", "Naturstein", "Sitzplatz"],
    searchTerms: ["ich brauche jemanden für meinen garten", "garten neu machen", "rasen neu", "hecke schneiden", "gärtner burgdorf"],
    ad: {
      title: "Gartenplanung für Frühling und Sommer",
      description: "Vom Rasen bis zum Sitzplatz: Wir planen und bauen deinen Aussenbereich.",
      cta: "Gartenprojekt besprechen",
    },
  },
  {
    key: "haustechnik-interlaken",
    name: "Haustechnik Oberland AG",
    plan: "premium",
    mainCategory: "Handwerk & Reparaturen",
    subCategories: ["Heizung", "Sanitär", "Lüftung & Klima", "Notfalldienst"],
    city: "Interlaken",
    address: "Oberlandweg 7, 3800 Interlaken",
    latitude: 46.6863,
    longitude: 7.8632,
    phone: "+41 33 444 40 40",
    email: "haustechnik-interlaken@test.locario.ch",
    website: "https://test.locario/haustechnik-oberland",
    description:
      "Heizung, Sanitär, Boiler, Wärmepumpen und Notfalldienst für das Berner Oberland.",
    tags: ["Heizung", "Sanitär", "Boiler", "Wärmepumpe", "Notdienst"],
    searchTerms: ["heizung macht probleme", "kein warmwasser", "boiler kaputt", "rohrbruch", "abfluss verstopft", "sanitär interlaken"],
    ad: {
      title: "Heizung oder Wasserproblem?",
      description: "Schnelle Hilfe bei Störungen, Boilerproblemen und Rohrbruch im Berner Oberland.",
      cta: "Notfall melden",
    },
  },
  {
    key: "elektro-koeniz",
    name: "Elektro Lichtblick AG",
    plan: "pro",
    mainCategory: "Handwerk & Reparaturen",
    subCategories: ["Elektriker", "Notfalldienst"],
    city: "Köniz",
    address: "Schwarzenburgstrasse 210, 3098 Köniz",
    latitude: 46.9244,
    longitude: 7.4146,
    phone: "+41 31 555 50 50",
    email: "elektro-koeniz@test.locario.ch",
    website: "https://test.locario/elektro-lichtblick",
    description: "Elektroinstallationen, Lampen, Steckdosen, Sicherungen, Smart Home und Störungsdienst in Köniz und Bern.",
    tags: ["Elektriker", "Strom", "Lampen", "Steckdose", "Smart Home"],
    searchTerms: ["elektriker", "strom problem", "lampe montieren", "steckdose", "sicherung raus", "elektroinstallation"],
  },
  {
    key: "coiffeur-bern",
    name: "Coiffeur Bellezza Bern",
    plan: "starter",
    mainCategory: "Beauty, Gesundheit & Wohlbefinden",
    subCategories: ["Coiffeur", "Barbershop"],
    city: "Bern",
    address: "Kramgasse 46, 3011 Bern",
    latitude: 46.9480,
    longitude: 7.4474,
    phone: "+41 31 666 60 60",
    email: "coiffeur-bern@test.locario.ch",
    website: "https://test.locario/coiffeur-bellezza",
    description: "Coiffeur in Bern für Damen, Herren, Balayage, Farbe, Schnitt, Styling und Bartpflege.",
    tags: ["Coiffeur", "Haare", "Balayage", "Barber", "Färben"],
    searchTerms: ["haare schneiden", "balayage bern", "coiffeur bern", "barber bern", "haare färben"],
  },
  {
    key: "restaurant-bern",
    name: "Restaurant Matteblick",
    plan: "pro",
    mainCategory: "Gastro, Lebensmittel & Genuss",
    subCategories: ["Restaurant", "Take-away", "Catering"],
    city: "Bern",
    address: "Mattenenge 3, 3011 Bern",
    latitude: 46.9474,
    longitude: 7.4563,
    phone: "+41 31 777 70 70",
    email: "restaurant-bern@test.locario.ch",
    website: "https://test.locario/restaurant-matteblick",
    description: "Restaurant mit Mittagsmenüs, Abendessen, Take-away und Catering in der Berner Matte.",
    tags: ["Restaurant", "Mittagessen", "Take-away", "Catering", "Beiz"],
    searchTerms: ["wo essen gehen", "mittagessen bern", "take away", "essen bestellen", "restaurant in der nähe"],
    ad: {
      title: "Mittagsmenü in der Matte",
      description: "Frische regionale Küche, Take-away und Catering für Teams und Vereine.",
      cta: "Menü ansehen",
    },
  },
  {
    key: "baeckerei-aarberg",
    name: "Bäckerei Seeland",
    plan: "starter",
    mainCategory: "Gastro, Lebensmittel & Genuss",
    subCategories: ["Bäckerei", "Konditorei", "Café"],
    city: "Aarberg",
    address: "Stadtplatz 12, 3270 Aarberg",
    latitude: 47.0442,
    longitude: 7.2738,
    phone: "+41 32 888 80 80",
    email: "baeckerei-aarberg@test.locario.ch",
    website: "https://test.locario/baeckerei-seeland",
    description: "Bäckerei und Café mit Brot, Gipfeli, Sandwiches, Torten und regionalen Spezialitäten in Aarberg.",
    tags: ["Bäckerei", "Brot", "Gipfeli", "Café", "Konditorei"],
    searchTerms: ["bäckerei", "gipfeli", "brot", "kaffee", "konditorei", "sandwich"],
  },
  {
    key: "reinigung-muensingen",
    name: "Reinigungsservice Aaretal GmbH",
    plan: "pro",
    mainCategory: "Immobilien, Wohnen & Reinigung",
    subCategories: ["Reinigungsfirma", "Endreinigung", "Gebäudereinigung"],
    city: "Münsingen",
    address: "Aaretalstrasse 9, 3110 Münsingen",
    latitude: 46.8729,
    longitude: 7.5623,
    phone: "+41 31 999 90 90",
    email: "reinigung-muensingen@test.locario.ch",
    website: "https://test.locario/reinigung-aaretal",
    description: "Endreinigung, Umzugsreinigung, Büroreinigung, Treppenhausreinigung und Unterhaltsreinigung im Aaretal.",
    tags: ["Reinigung", "Endreinigung", "Umzugsreinigung", "Büroreinigung"],
    searchTerms: ["endreinigung", "wohnung reinigen", "putzen", "abgabereinigung", "büroreinigung", "reinigungsfirma"],
    ad: {
      title: "Endreinigung mit Abnahmehilfe",
      description: "Saubere Übergabe für Wohnungen und Häuser im Aaretal.",
      cta: "Offerte anfragen",
    },
  },
  {
    key: "umzug-belp",
    name: "Umzug & Reinigung Mittelland",
    plan: "starter",
    mainCategory: "Transport, Logistik & Entsorgung",
    subCategories: ["Umzugstransport", "Transportfirma", "Räumung"],
    city: "Belp",
    address: "Flughafenstrasse 22, 3123 Belp",
    latitude: 46.8918,
    longitude: 7.4986,
    phone: "+41 31 123 40 40",
    email: "umzug-belp@test.locario.ch",
    website: "https://test.locario/umzug-mittelland",
    description: "Umzug, Möbeltransport, Räumung, Entsorgung und Transporthilfe rund um Belp, Bern und Münsingen.",
    tags: ["Umzug", "Transport", "Räumung", "Entsorgung"],
    searchTerms: ["zügeln", "umzugsfirma", "möbeltransport", "räumung", "entsorgung", "umzugshilfe"],
  },
  {
    key: "solar-bern",
    name: "Solar Kraft Bern AG",
    plan: "premium",
    mainCategory: "Handwerk & Reparaturen",
    subCategories: ["Elektriker", "Solar & Photovoltaik"],
    city: "Bern",
    address: "Murtenstrasse 130, 3008 Bern",
    latitude: 46.9479,
    longitude: 7.4244,
    phone: "+41 31 234 50 50",
    email: "solar-bern@test.locario.ch",
    website: "https://test.locario/solar-kraft-bern",
    description: "Beratung, Planung und Montage von Photovoltaik, Solaranlagen, Batteriespeicher und Elektroanschluss in der Region Bern.",
    tags: ["Solar", "Photovoltaik", "PV", "Batteriespeicher", "Elektro"],
    searchTerms: ["solar firma bern", "photovoltaik", "solaranlage", "pv anlage", "batteriespeicher", "solar montieren"],
    ad: {
      title: "Solaranlage für dein Dach",
      description: "Wir prüfen Dach, Verbrauch und Speicherlösung für deine Region.",
      cta: "Solarcheck starten",
    },
  },
  {
    key: "kaminfeger-spiez",
    name: "Kaminfeger Oberland",
    plan: "starter",
    mainCategory: "Handwerk & Reparaturen",
    subCategories: ["Kaminfeger", "Heizung", "Notfalldienst"],
    city: "Spiez",
    address: "Seestrasse 41, 3700 Spiez",
    latitude: 46.6881,
    longitude: 7.6794,
    phone: "+41 33 345 60 60",
    email: "kaminfeger-spiez@test.locario.ch",
    website: "https://test.locario/kaminfeger-oberland",
    description: "Kaminfegerarbeiten, Feuerungskontrolle, Reinigung von Cheminée, Ofen, Kamin und Beratung im Berner Oberland.",
    tags: ["Kaminfeger", "Cheminée", "Ofen", "Feuerungskontrolle"],
    searchTerms: ["kaminfeger", "cheminée reinigen", "ofen reinigen", "kamin reinigen", "feuerungskontrolle"],
  },
  {
    key: "schreinerei-langnau",
    name: "Schreinerei Holzpunkt AG",
    plan: "pro",
    mainCategory: "Handwerk & Reparaturen",
    subCategories: ["Schreiner", "Innenausbau", "Küchenbau"],
    city: "Langnau im Emmental",
    address: "Dorfstrasse 14, 3550 Langnau im Emmental",
    latitude: 46.9409,
    longitude: 7.7877,
    phone: "+41 34 456 70 70",
    email: "schreinerei-langnau@test.locario.ch",
    website: "https://test.locario/schreinerei-holzpunkt",
    description: "Schreinerei für Möbel, Einbauschränke, Küchenumbau, Türen, Innenausbau und Holzarbeiten im Emmental.",
    tags: ["Schreiner", "Holz", "Möbel", "Küche", "Innenausbau"],
    searchTerms: ["schreiner", "möbel nach mass", "einbauschrank", "küchenumbau", "holzarbeiten", "innenausbau"],
  },
  {
    key: "maler-lyss",
    name: "Maler Plus Lyss",
    plan: "starter",
    mainCategory: "Handwerk & Reparaturen",
    subCategories: ["Maler & Gipser"],
    city: "Lyss",
    address: "Bielstrasse 28, 3250 Lyss",
    latitude: 47.0742,
    longitude: 7.3064,
    phone: "+41 32 567 80 80",
    email: "maler-lyss@test.locario.ch",
    website: "https://test.locario/maler-plus-lyss",
    description: "Malerarbeiten, Gipserarbeiten, Fassaden, Innenräume, Renovation und Tapezieren in Lyss und Umgebung.",
    tags: ["Maler", "Gipser", "Streichen", "Fassade", "Renovation"],
    searchTerms: ["wohnung streichen", "maler", "gipser", "fassade streichen", "tapezieren", "renovation"],
  },
  {
    key: "physio-thun",
    name: "Physiotherapie Vital Thun",
    plan: "pro",
    mainCategory: "Beauty, Gesundheit & Wohlbefinden",
    subCategories: ["Physiotherapie", "Massage", "Personal Training"],
    city: "Thun",
    address: "Bälliz 32, 3600 Thun",
    latitude: 46.7590,
    longitude: 7.6280,
    phone: "+41 33 678 90 90",
    email: "physio-thun@test.locario.ch",
    website: "https://test.locario/physio-vital-thun",
    description: "Physiotherapie, Massage, Rehabilitation, Rückenschmerzen, Sportverletzungen und Training in Thun.",
    tags: ["Physio", "Massage", "Rückenschmerzen", "Rehabilitation", "Training"],
    searchTerms: ["physio", "rückenschmerzen", "massage", "sportverletzung", "rehabilitation", "therapie"],
    ad: {
      title: "Rückencheck in Thun",
      description: "Analyse, Behandlung und Trainingsplan bei Rücken- oder Nackenschmerzen.",
      cta: "Termin anfragen",
    },
  },
  {
    key: "spitex-schwarzenburg",
    name: "Spitex Region Gantrisch",
    plan: "starter",
    mainCategory: "Beauty, Gesundheit & Wohlbefinden",
    subCategories: ["Spitex & Pflege", "Arztpraxis"],
    city: "Schwarzenburg",
    address: "Bahnhofstrasse 6, 3150 Schwarzenburg",
    latitude: 46.8174,
    longitude: 7.3419,
    phone: "+41 31 789 10 10",
    email: "spitex-schwarzenburg@test.locario.ch",
    website: "https://test.locario/spitex-gantrisch",
    description: "Regionale Pflege, Unterstützung zu Hause, Beratung und Betreuung im Raum Gantrisch und Schwarzenburg.",
    tags: ["Spitex", "Pflege", "Betreuung", "Senioren", "Gesundheit"],
    searchTerms: ["spitex", "pflege zuhause", "betreuung zuhause", "senioren hilfe", "pflege gantrisch"],
  },
  {
    key: "treuhand-bern",
    name: "Treuhand Fokus Bern GmbH",
    plan: "pro",
    mainCategory: "Dienstleistungen & Beratung",
    subCategories: ["Treuhand", "Steuerberatung", "Unternehmensberatung"],
    city: "Bern",
    address: "Bundesgasse 18, 3011 Bern",
    latitude: 46.9467,
    longitude: 7.4406,
    phone: "+41 31 890 20 20",
    email: "treuhand-bern@test.locario.ch",
    website: "https://test.locario/treuhand-fokus",
    description: "Treuhand, Buchhaltung, Steuererklärung, Lohnbuchhaltung, Abschluss und Beratung für KMU in Bern.",
    tags: ["Treuhand", "Buchhaltung", "Steuern", "KMU", "Lohnbuchhaltung"],
    searchTerms: ["treuhand bern", "buchhaltung", "steuererklärung", "lohnbuchhaltung", "firma gründen", "abschluss"],
  },
  {
    key: "marketing-bern",
    name: "Webdesign & Marketing Studio Bern",
    plan: "starter",
    mainCategory: "Dienstleistungen & Beratung",
    subCategories: ["Marketingagentur", "Webdesign", "Fotograf"],
    city: "Bern",
    address: "Lorrainestrasse 15, 3013 Bern",
    latitude: 46.9540,
    longitude: 7.4442,
    phone: "+41 31 901 30 30",
    email: "marketing-bern@test.locario.ch",
    website: "https://test.locario/webdesign-marketing-bern",
    description: "Webdesign, Websites, Branding, lokale SEO, Social Media, Fotografie und Online-Marketing für regionale Firmen.",
    tags: ["Webdesign", "Marketing", "SEO", "Website", "Social Media"],
    searchTerms: ["website erstellen", "webdesign", "homepage", "online marketing", "seo", "social media"],
  },
  {
    key: "it-biel",
    name: "IT Support Seeland GmbH",
    plan: "pro",
    mainCategory: "Dienstleistungen & Beratung",
    subCategories: ["IT Support", "Cybersecurity"],
    city: "Biel/Bienne",
    address: "Bahnhofstrasse 44, 2502 Biel/Bienne",
    latitude: 47.1368,
    longitude: 7.2468,
    phone: "+41 32 912 40 40",
    email: "it-biel@test.locario.ch",
    website: "https://test.locario/it-support-seeland",
    description: "IT Support, PC Hilfe, Netzwerk, Server, Backup, Cybersecurity und Helpdesk für KMU im Seeland.",
    tags: ["IT", "Support", "Netzwerk", "Cybersecurity", "Backup"],
    searchTerms: ["computerhilfe", "it support", "pc support", "netzwerk", "backup", "cybersecurity"],
    ad: {
      title: "IT-Check für KMU",
      description: "Wir prüfen Backup, Sicherheit und Netzwerk deiner Firma.",
      cta: "IT-Check buchen",
    },
  },
  {
    key: "tierarzt-interlaken",
    name: "Tierarztpraxis Oberland",
    plan: "starter",
    mainCategory: "Landwirtschaft & Regionales",
    subCategories: ["Tierarzt"],
    city: "Interlaken",
    address: "Höheweg 55, 3800 Interlaken",
    latitude: 46.6865,
    longitude: 7.8550,
    phone: "+41 33 923 50 50",
    email: "tierarzt-interlaken@test.locario.ch",
    website: "https://test.locario/tierarztpraxis-oberland",
    description: "Tierarztpraxis für Hunde, Katzen, Kleintiere, Vorsorge, Impfungen und Notfallabklärung im Berner Oberland.",
    tags: ["Tierarzt", "Hund", "Katze", "Notfall", "Haustiere"],
    searchTerms: ["tierarzt", "notfall tierarzt", "hund krank", "katze krank", "impfung hund", "tiermedizin"],
  },
  {
    key: "hundeschule-burgdorf",
    name: "Hundeschule Emmental",
    plan: "starter",
    mainCategory: "Freizeit, Events & Vereine",
    subCategories: ["Hundeschule", "Freizeitangebot"],
    city: "Burgdorf",
    address: "Kirchbergstrasse 60, 3400 Burgdorf",
    latitude: 47.0590,
    longitude: 7.6210,
    phone: "+41 34 934 60 60",
    email: "hundeschule-burgdorf@test.locario.ch",
    website: "https://test.locario/hundeschule-emmental",
    description: "Hundetraining, Welpenkurs, Alltagstraining, Rückruf, Leinenführigkeit und Einzelstunden im Emmental.",
    tags: ["Hundeschule", "Hundetraining", "Welpenkurs", "Hund"],
    searchTerms: ["hundeschule", "hundetraining", "welpenkurs", "hund erziehung", "training hund"],
  },
  {
    key: "hotel-spiez",
    name: "Hotel Seehof Spiez",
    plan: "premium",
    mainCategory: "Freizeit, Events & Vereine",
    subCategories: ["Hotel", "Eventlocation", "Restaurant"],
    city: "Spiez",
    address: "Seepromenade 11, 3700 Spiez",
    latitude: 46.6887,
    longitude: 7.6864,
    phone: "+41 33 945 70 70",
    email: "hotel-spiez@test.locario.ch",
    website: "https://test.locario/hotel-seehof-spiez",
    description: "Hotel, Restaurant und Eventlocation am Thunersee für Ferien, Seminare, Hochzeiten und regionale Anlässe.",
    tags: ["Hotel", "Übernachten", "Eventlocation", "Seminar", "Restaurant"],
    searchTerms: ["hotel spiez", "übernachten", "eventlocation", "seminarhotel", "hochzeit location", "restaurant hotel"],
    ad: {
      title: "Seminar oder Fest am See",
      description: "Räume, Zimmer und Gastronomie für private und geschäftliche Anlässe.",
      cta: "Anlass planen",
    },
  },
  {
    key: "eventtechnik-thun",
    name: "Eventtechnik Soundwerk Thun",
    plan: "pro",
    mainCategory: "Freizeit, Events & Vereine",
    subCategories: ["Eventtechnik", "DJ"],
    city: "Thun",
    address: "Industrieweg 3, 3608 Thun",
    latitude: 46.7514,
    longitude: 7.6211,
    phone: "+41 33 956 80 80",
    email: "eventtechnik-thun@test.locario.ch",
    website: "https://test.locario/eventtechnik-soundwerk",
    description: "Ton, Licht, Bühne, Mikrofone, DJ-Technik und technische Betreuung für Events, Vereine, Firmen und Hochzeiten.",
    tags: ["Eventtechnik", "Licht", "Ton", "DJ", "Bühne"],
    searchTerms: ["eventtechnik", "tontechnik", "lichttechnik", "dj", "mikrofon", "bühne mieten"],
  },
  {
    key: "velo-bern",
    name: "Velowerkstatt Breitsch",
    plan: "starter",
    mainCategory: "Detailhandel & Fachgeschäfte",
    subCategories: ["Velogeschäft", "Sportgeschäft"],
    city: "Bern",
    address: "Moserstrasse 21, 3014 Bern",
    latitude: 46.9555,
    longitude: 7.4502,
    phone: "+41 31 967 90 90",
    email: "velo-bern@test.locario.ch",
    website: "https://test.locario/velowerkstatt-breitsch",
    description: "Veloreparatur, E-Bike Service, Fahrradverkauf, Zubehör und schnelle Reparaturen in Bern-Breitenrain.",
    tags: ["Velo", "Bike", "E-Bike", "Reparatur", "Sport"],
    searchTerms: ["velo reparatur", "e bike service", "fahrrad", "bike shop", "velogeschäft", "pneu velo"],
  },
  {
    key: "metzgerei-muensingen",
    name: "Metzgerei Dorfplatz Münsingen",
    plan: "starter",
    mainCategory: "Gastro, Lebensmittel & Genuss",
    subCategories: ["Metzgerei", "Catering"],
    city: "Münsingen",
    address: "Dorfplatz 5, 3110 Münsingen",
    latitude: 46.8721,
    longitude: 7.5628,
    phone: "+41 31 978 10 10",
    email: "metzgerei-muensingen@test.locario.ch",
    website: "https://test.locario/metzgerei-dorfplatz",
    description: "Metzgerei mit regionalem Fleisch, Wurst, Grillfleisch, Charcuterie und Catering für Anlässe.",
    tags: ["Metzgerei", "Fleisch", "Grill", "Catering", "Regional"],
    searchTerms: ["metzgerei", "fleisch", "grillfleisch", "wurst", "catering", "charcuterie"],
  },
  {
    key: "hofladen-wattenwil",
    name: "Hofladen Grünegg",
    plan: "pro",
    mainCategory: "Landwirtschaft & Regionales",
    subCategories: ["Hofladen", "Bauernhof", "Direktvermarktung", "Imkerei"],
    city: "Wattenwil",
    address: "Grüneggweg 2, 3665 Wattenwil",
    latitude: 46.7685,
    longitude: 7.5005,
    phone: "+41 33 989 20 20",
    email: "hofladen-wattenwil@test.locario.ch",
    website: "https://test.locario/hofladen-gruenegg",
    description: "Hofladen mit Eiern, Gemüse, Honig, saisonalen Produkten und regionalen Spezialitäten direkt vom Hof.",
    tags: ["Hofladen", "Regional", "Eier", "Gemüse", "Honig"],
    searchTerms: ["hofladen", "direkt vom hof", "regionale produkte", "honig", "eier", "bauernhofladen"],
    ad: {
      title: "Frisch direkt vom Hof",
      description: "Saisonale Produkte aus Wattenwil und der Region Gantrisch.",
      cta: "Hofladen ansehen",
    },
  },
  {
    key: "schluessel-bern",
    name: "Schlüsseldienst 24 Bern",
    plan: "premium",
    mainCategory: "Immobilien, Wohnen & Reinigung",
    subCategories: ["Schlüsseldienst", "Sicherheitstechnik", "Notfalldienst"],
    city: "Bern",
    address: "Effingerstrasse 20, 3008 Bern",
    latitude: 46.9462,
    longitude: 7.4337,
    phone: "+41 31 990 30 30",
    email: "schluessel-bern@test.locario.ch",
    website: "https://test.locario/schluesseldienst-bern",
    description: "Türöffnung, Schlüsselservice, Zylinderwechsel, Einbruchschutz und Notfalldienst in Bern und Umgebung.",
    tags: ["Schlüsseldienst", "Notdienst", "Türöffnung", "Sicherheit"],
    searchTerms: ["ausgesperrt", "schlüsseldienst", "türöffnung", "notöffnung", "zylinder wechseln", "einbruchschutz"],
    ad: {
      title: "Ausgesperrt in Bern?",
      description: "Schnelle Türöffnung und Sicherheitsberatung im Raum Bern.",
      cta: "Soforthilfe anrufen",
    },
  },
  {
    key: "fisch-biel",
    name: "Fisch & Aquaristik Seeland",
    plan: "pro",
    mainCategory: "Detailhandel & Fachgeschäfte",
    subCategories: ["Fisch & Aquaristik", "Tierbedarf", "Lebensmittelgeschäft"],
    city: "Biel/Bienne",
    address: "Seevorstadt 25, 2502 Biel/Bienne",
    latitude: 47.1402,
    longitude: 7.2440,
    phone: "+41 32 991 40 40",
    email: "fisch-biel@test.locario.ch",
    website: "https://test.locario/fisch-aquaristik-seeland",
    description: "Fischladen und Aquaristik-Fachgeschäft mit Frischfisch, Aquarium-Zubehör, Futter und Beratung im Seeland.",
    tags: ["Fisch", "Aquaristik", "Aquarium", "Tierbedarf", "Frischfisch"],
    searchTerms: ["fisch kaufen", "fischladen", "aquarium", "aquaristik", "fischerei", "frischfisch"],
    ad: {
      title: "Frischfisch und Aquaristik-Beratung",
      description: "Regionale Auswahl, Zubehör und Beratung für Küche und Aquarium.",
      cta: "Angebot ansehen",
    },
  },
];

const eventSeeds: EventSeed[] = [
  {
    title: "Live Konzert am Mühleplatz Thun",
    organizerName: "Kulturverein Thun",
    plan: "premium",
    category: "Konzert",
    city: "Thun",
    locationName: "Mühleplatz",
    address: "Mühleplatz, 3600 Thun",
    startsAt: futureDate(5, 20, 0),
    latitude: 46.7581,
    longitude: 7.6289,
    website: "https://events.locario.test/live-konzert-thun",
    ticketUrl: "https://events.locario.test/live-konzert-thun/tickets",
    description: "Open-Air Konzert mit regionalen Bands, Foodständen und Abendstimmung mitten in Thun.",
    tags: ["Live Musik", "Band", "Openair", "Wochenende"],
    searchTerms: ["konzert thun", "live musik", "band", "openair", "wochenende"],
  },
  {
    title: "Familienmarkt Bern",
    organizerName: "Quartierverein Bern West",
    plan: "highlight",
    category: "Familie",
    city: "Bern",
    locationName: "Quartierplatz",
    address: "Brünnenplatz, 3027 Bern",
    startsAt: futureDate(7, 10, 0),
    latitude: 46.9455,
    longitude: 7.3775,
    website: "https://events.locario.test/familienmarkt-bern",
    ticketUrl: "",
    description: "Familienmarkt mit Spielständen, Kinderprogramm, regionalen Produkten und Verpflegung.",
    tags: ["Kinder", "Familie", "Markt", "Gratis"],
    searchTerms: ["kinderprogramm", "familie am wochenende", "markt bern", "mit kindern", "familienevent"],
  },
  {
    title: "Dorffest Wattenwil",
    organizerName: "Dorfverein Wattenwil",
    plan: "basic",
    category: "Dorf",
    city: "Wattenwil",
    locationName: "Dorfplatz Wattenwil",
    address: "Dorfplatz, 3665 Wattenwil",
    startsAt: futureDate(14, 17, 0),
    latitude: 46.7675,
    longitude: 7.5080,
    website: "https://events.locario.test/dorffest-wattenwil",
    ticketUrl: "",
    description: "Dorffest mit Musik, Vereinen, regionalem Essen und Begegnung für die ganze Gemeinde.",
    tags: ["Dorffest", "Verein", "Musik", "Essen"],
    searchTerms: ["dorffest", "vereinsfest", "dorf", "fest", "watttenwil", "wochenende"],
  },
  {
    title: "Jazzabend Burgdorf",
    organizerName: "Jazzclub Emmental",
    plan: "highlight",
    category: "Kultur",
    city: "Burgdorf",
    locationName: "Kulturhalle Burgdorf",
    address: "Sägegasse 13, 3400 Burgdorf",
    startsAt: futureDate(10, 19, 30),
    latitude: 47.0568,
    longitude: 7.6264,
    website: "https://events.locario.test/jazzabend-burgdorf",
    ticketUrl: "https://events.locario.test/jazzabend-burgdorf/tickets",
    description: "Jazzabend mit lokalen Musikern, Barbetrieb und gemütlicher Atmosphäre in Burgdorf.",
    tags: ["Jazz", "Kultur", "Live Musik", "Bar"],
    searchTerms: ["jazz", "kultur", "live musik", "konzert burgdorf", "abendprogramm"],
  },
  {
    title: "Foodtruck Festival Bern",
    organizerName: "Bern Streetfood",
    plan: "premium",
    category: "Gastronomie",
    city: "Bern",
    locationName: "Expo Areal Bern",
    address: "Mingerstrasse 6, 3014 Bern",
    startsAt: futureDate(16, 11, 0),
    latitude: 46.9588,
    longitude: 7.4670,
    website: "https://events.locario.test/foodtruck-festival-bern",
    ticketUrl: "",
    description: "Foodtrucks, Streetfood, Musik und regionale Getränke auf dem Expo Areal Bern.",
    tags: ["Foodtruck", "Streetfood", "Essen", "Trinken"],
    searchTerms: ["food festival", "streetfood", "essen", "foodtruck", "bern", "wochenende"],
  },
  {
    title: "Kinderprogramm Interlaken",
    organizerName: "Familienzentrum Oberland",
    plan: "basic",
    category: "Familie",
    city: "Interlaken",
    locationName: "Familienzentrum",
    address: "Marktgasse 2, 3800 Interlaken",
    startsAt: futureDate(3, 14, 0),
    latitude: 46.6860,
    longitude: 7.8580,
    website: "https://events.locario.test/kinderprogramm-interlaken",
    ticketUrl: "",
    description: "Basteln, Spiele, Geschichten und kleine Aktivitäten für Kinder und Familien in Interlaken.",
    tags: ["Kinder", "Familie", "Basteln", "Nachmittag"],
    searchTerms: ["kinderprogramm", "mit kindern", "familie", "interlaken", "basteln"],
  },
  {
    title: "Gewerbeschau Münsingen",
    organizerName: "Gewerbeverein Münsingen",
    plan: "highlight",
    category: "Gewerbe",
    city: "Münsingen",
    locationName: "Schlossgut Areal",
    address: "Schlossstrasse 8, 3110 Münsingen",
    startsAt: futureDate(21, 9, 0),
    latitude: 46.8725,
    longitude: 7.5638,
    website: "https://events.locario.test/gewerbeschau-muensingen",
    ticketUrl: "",
    description: "Lokale Firmen präsentieren Produkte, Dienstleistungen, Lehrstellen und Angebote aus der Region.",
    tags: ["Gewerbe", "Ausstellung", "Lokale Firmen", "Netzwerk"],
    searchTerms: ["gewerbeschau", "messe", "lokale firmen", "ausstellung", "münsingen"],
  },
  {
    title: "Yoga im Park Thun",
    organizerName: "Vital Thun",
    plan: "basic",
    category: "Gesundheit",
    city: "Thun",
    locationName: "Schadaupark",
    address: "Seestrasse 45, 3600 Thun",
    startsAt: futureDate(4, 8, 30),
    latitude: 46.7508,
    longitude: 7.6325,
    website: "https://events.locario.test/yoga-park-thun",
    ticketUrl: "",
    description: "Morgen-Yoga im Park für Einsteiger und Fortgeschrittene mit Blick auf See und Berge.",
    tags: ["Yoga", "Gesundheit", "Bewegung", "Outdoor"],
    searchTerms: ["yoga", "gesundheit", "bewegung", "park", "thun"],
  },
  {
    title: "Seemarkt Spiez",
    organizerName: "Marktkommission Spiez",
    plan: "highlight",
    category: "Markt",
    city: "Spiez",
    locationName: "Seepromenade",
    address: "Seepromenade, 3700 Spiez",
    startsAt: futureDate(9, 10, 0),
    latitude: 46.6885,
    longitude: 7.6860,
    website: "https://events.locario.test/seemarkt-spiez",
    ticketUrl: "",
    description: "Markt mit regionalen Produkten, Handwerk, Essen, Musik und Seeblick in Spiez.",
    tags: ["Markt", "Regional", "Handwerk", "Essen"],
    searchTerms: ["markt", "spiez", "regional", "wochenmarkt", "handwerkermarkt"],
  },
  {
    title: "Theaterabend Langnau",
    organizerName: "Theatergruppe Langnau",
    plan: "highlight",
    category: "Kultur",
    city: "Langnau im Emmental",
    locationName: "Gemeindesaal Langnau",
    address: "Dorfstrasse 20, 3550 Langnau im Emmental",
    startsAt: futureDate(18, 19, 0),
    latitude: 46.9398,
    longitude: 7.7872,
    website: "https://events.locario.test/theaterabend-langnau",
    ticketUrl: "https://events.locario.test/theaterabend-langnau/tickets",
    description: "Unterhaltsamer Theaterabend mit regionaler Theatergruppe, Pause und Barbetrieb.",
    tags: ["Theater", "Kultur", "Comedy", "Abend"],
    searchTerms: ["theater", "kultur", "comedy", "langnau", "abendprogramm"],
  },
  {
    title: "Vereinsfest Köniz",
    organizerName: "Vereine Köniz",
    plan: "basic",
    category: "Verein",
    city: "Köniz",
    locationName: "Schulhausplatz Köniz",
    address: "Schwarzenburgstrasse 258, 3098 Köniz",
    startsAt: futureDate(12, 16, 0),
    latitude: 46.9240,
    longitude: 7.4142,
    website: "https://events.locario.test/vereinsfest-koeniz",
    ticketUrl: "",
    description: "Vereinsfest mit Musik, Verpflegung, Spielangeboten und Begegnung für Köniz und Umgebung.",
    tags: ["Verein", "Fest", "Familie", "Musik"],
    searchTerms: ["vereinsfest", "fest", "köniz", "familie", "musik"],
  },
  {
    title: "Velotour Seeland",
    organizerName: "Bikeclub Biel-Seeland",
    plan: "basic",
    category: "Sport",
    city: "Biel/Bienne",
    locationName: "Bahnhof Biel",
    address: "Bahnhofplatz, 2502 Biel/Bienne",
    startsAt: futureDate(6, 9, 30),
    latitude: 47.1328,
    longitude: 7.2434,
    website: "https://events.locario.test/velotour-seeland",
    ticketUrl: "",
    description: "Geführte Velotour durchs Seeland mit Pausen, Aussicht und einfacher Strecke für Freizeitfahrer.",
    tags: ["Velo", "Sport", "Ausflug", "Outdoor"],
    searchTerms: ["velotour", "bike", "sport", "ausflug", "biel", "seeland"],
  },
  {
    title: "Comedy Night Bern",
    organizerName: "Comedy Bern",
    plan: "premium",
    category: "Kultur",
    city: "Bern",
    locationName: "Kellerbühne Bern",
    address: "Rathausgasse 12, 3011 Bern",
    startsAt: futureDate(11, 20, 0),
    latitude: 46.9486,
    longitude: 7.4511,
    website: "https://events.locario.test/comedy-night-bern",
    ticketUrl: "https://events.locario.test/comedy-night-bern/tickets",
    description: "Comedy-Abend mit mehreren Acts, Barbetrieb und Sitzplätzen mitten in Bern.",
    tags: ["Comedy", "Kultur", "Ausgang", "Abend"],
    searchTerms: ["comedy", "bern", "kultur", "ausgang", "abendprogramm"],
  },
  {
    title: "Hofladen Degustation Wattenwil",
    organizerName: "Hofladen Grünegg",
    plan: "basic",
    category: "Gastronomie",
    city: "Wattenwil",
    locationName: "Hofladen Grünegg",
    address: "Grüneggweg 2, 3665 Wattenwil",
    startsAt: futureDate(8, 13, 0),
    latitude: 46.7685,
    longitude: 7.5005,
    website: "https://events.locario.test/hofladen-degustation-wattenwil",
    ticketUrl: "",
    description: "Degustation von regionalen Produkten, Honig, Käse, Brot und saisonalen Spezialitäten direkt im Hofladen.",
    tags: ["Degustation", "Hofladen", "Regional", "Essen"],
    searchTerms: ["degustation", "hofladen", "regional", "essen", "watttenwil"],
  },
  {
    title: "Openair Aare Bern",
    organizerName: "Aare Kultur Bern",
    plan: "highlight",
    category: "Konzert",
    city: "Bern",
    locationName: "Aareufer",
    address: "Dalmaziquai, 3005 Bern",
    startsAt: futureDate(24, 18, 30),
    latitude: 46.9434,
    longitude: 7.4552,
    website: "https://events.locario.test/openair-aare-bern",
    ticketUrl: "https://events.locario.test/openair-aare-bern/tickets",
    description: "Sommerliches Openair an der Aare mit regionalen Bands, DJ, Essen und Abendprogramm.",
    tags: ["Openair", "Konzert", "DJ", "Sommer"],
    searchTerms: ["openair", "konzert", "dj", "bern", "live musik", "sommer"],
  },
];

function isJsonColumn(column: ColumnInfo) {
  return column.dataType === "json" || column.dataType === "jsonb";
}

function isArrayColumn(column: ColumnInfo) {
  return column.dataType === "ARRAY" || column.udtName.startsWith("_");
}

function getArrayCast(column: ColumnInfo) {
  const elementType = column.udtName.startsWith("_")
    ? column.udtName.slice(1)
    : "text";

  if (["text", "varchar", "bpchar"].includes(elementType)) {
    return "text[]";
  }

  return `${elementType}[]`;
}

function getPlaceholder(index: number, column: ColumnInfo) {
  if (isJsonColumn(column)) {
    return `$${index}::${column.dataType}`;
  }

  if (isArrayColumn(column)) {
    return `$${index}::${getArrayCast(column)}`;
  }

  return `$${index}`;
}

function coerceValue(value: unknown, column: ColumnInfo) {
  if (Array.isArray(value)) {
    if (isJsonColumn(column)) {
      return JSON.stringify(value);
    }

    if (isArrayColumn(column)) {
      return value;
    }

    return value.join(", ");
  }

  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    return JSON.stringify(value);
  }

  return value;
}

function fallbackValueForRequiredColumn(column: ColumnInfo) {
  const name = column.name;
  const dataType = column.dataType;

  if (column.columnDefault) {
    return undefined;
  }

  if (["id", "uuid"].includes(name) || column.udtName === "uuid") {
    return randomUUID();
  }

  if (["createdAt", "updatedAt", "startsAt", "eventDate", "startDate"].includes(name)) {
    return now;
  }

  if (dataType === "boolean") {
    return false;
  }

  if (["integer", "bigint", "smallint", "numeric", "double precision", "real"].includes(dataType)) {
    return 0;
  }

  if (dataType.includes("timestamp") || dataType === "date") {
    return now;
  }

  if (isArrayColumn(column)) {
    return [];
  }

  if (isJsonColumn(column)) {
    return JSON.stringify([]);
  }

  if (name === "status") {
    return "active";
  }

  if (name === "plan") {
    return "starter";
  }

  return "";
}

async function getColumns(prisma: PrismaRuntime, tableName: string): Promise<ColumnInfo[]> {
  const rows = await prisma.$queryRawUnsafe<
    Array<{
      column_name: string;
      data_type: string;
      udt_name: string;
      is_nullable: string;
      column_default: string | null;
    }>
  >(
    `SELECT column_name, data_type, udt_name, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    tableName
  );

  return rows.map((row) => ({
    name: row.column_name,
    dataType: row.data_type,
    udtName: row.udt_name,
    isNullable: row.is_nullable,
    columnDefault: row.column_default,
  }));
}

async function tableExists(prisma: PrismaRuntime, tableName: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    tableName
  );

  return Boolean(rows[0]?.exists);
}

async function hasColumn(prisma: PrismaRuntime, tableName: string, columnName: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     ) AS exists`,
    tableName,
    columnName
  );

  return Boolean(rows[0]?.exists);
}

async function insertRow(
  prisma: PrismaRuntime,
  tableName: string,
  row: Record<string, unknown>
) {
  const columns = await getColumns(prisma, tableName);

  if (columns.length === 0) {
    throw new Error(`Tabelle ${tableName} wurde nicht gefunden.`);
  }

  const insertColumns: ColumnInfo[] = [];
  const values: unknown[] = [];

  columns.forEach((column) => {
    let value = row[column.name];

    if (value === undefined && column.isNullable === "NO" && !column.columnDefault) {
      value = fallbackValueForRequiredColumn(column);
    }

    if (value === undefined) {
      return;
    }

    insertColumns.push(column);
    values.push(coerceValue(value, column));
  });

  const columnSql = insertColumns.map((column) => `"${column.name}"`).join(", ");
  const placeholderSql = insertColumns
    .map((column, index) => getPlaceholder(index + 1, column))
    .join(", ");

  await prisma.$executeRawUnsafe(
    `INSERT INTO "${tableName}" (${columnSql}) VALUES (${placeholderSql})`,
    ...values
  );
}

async function deleteOwnOldTestData(prisma: PrismaRuntime) {
  if (await tableExists(prisma, "CompanyAd")) {
    if (await hasColumn(prisma, "CompanyAd", "companyId")) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "CompanyAd"
         WHERE "companyId" IN (
           SELECT "id" FROM "Company"
           WHERE "email" LIKE '%@test.locario.ch'
              OR "website" LIKE 'https://test.locario/%'
         )`
      );
    }
  }

  if (await tableExists(prisma, "Lead")) {
    if (await hasColumn(prisma, "Lead", "companyId")) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "Lead"
         WHERE "companyId" IN (
           SELECT "id" FROM "Company"
           WHERE "email" LIKE '%@test.locario.ch'
              OR "website" LIKE 'https://test.locario/%'
         )`
      );
    }
  }

  if (await tableExists(prisma, "Company")) {
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Company"
       WHERE "email" LIKE '%@test.locario.ch'
          OR "website" LIKE 'https://test.locario/%'`
    );
  }

  if (await tableExists(prisma, "Event")) {
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Event"
       WHERE "email" LIKE '%@test.locario.ch'
          OR "website" LIKE 'https://events.locario.test/%'`
    );
  }
}

async function insertCompanies(prisma: PrismaRuntime) {
  const companyIdsByKey = new Map<string, string>();

  for (const seed of companySeeds) {
    const parentCompanyId = seed.parentKey ? companyIdsByKey.get(seed.parentKey) : undefined;
    const company = makeCompany(seed, parentCompanyId);

    await insertRow(prisma, "Company", company);
    companyIdsByKey.set(seed.key, company.id);

    if (seed.ad && (seed.plan === "pro" || seed.plan === "premium") && (await tableExists(prisma, "CompanyAd"))) {
      await insertRow(prisma, "CompanyAd", {
        id: randomUUID(),
        companyId: company.id,
        title: seed.ad.title,
        description: seed.ad.description,
        cta: seed.ad.cta,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

async function insertEvents(prisma: PrismaRuntime) {
  for (const seed of eventSeeds) {
    await insertRow(prisma, "Event", makeEvent(seed));
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL fehlt. Prüfe deine .env-Datei im Projektordner.");
  }

  const { PrismaClient } = await import("../src/generated/prisma/client");
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    // await deleteOwnOldTestData(prisma);
    await insertCompanies(prisma);
    await insertEvents(prisma);

    console.log("Fertig. 30 Testfirmen und 15 Testevents wurden eingefügt.");
    console.log("Hinweis: Das Script löscht bei erneutem Ausführen nur seine eigenen alten Testdaten mit @test.locario.ch / test.locario URLs.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
