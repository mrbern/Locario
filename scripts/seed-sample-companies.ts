import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import type { prisma as PrismaSingleton } from "../src/lib/prisma";

let prisma: typeof PrismaSingleton;

type SampleCompany = {
  name: string;
  plan: "starter" | "pro" | "premium" | "pilot";
  mainCategory: string;
  subCategory: string;
  subCategories: string[];
  category: string;
  city: string;
  adress: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  tags: string[];
  searchTerms: string[];
  locationName?: string;
  parentKey?: string;
  latitude?: number;
  longitude?: number;
  ad?: {
    title: string;
    description: string;
    cta: string;
  };
};

const sampleCompanies: SampleCompany[] = [
  {
    name: "Berner Kies & Baustoffe AG",
    plan: "premium",
    mainCategory: "Bau, Garten & Material",
    subCategory: "Kieswerk",
    subCategories: ["Kieswerk", "Sand & Splitt", "Baustoffhandel"],
    category: "Kieswerk",
    city: "Wattenwil",
    adress: "Gewerbestrasse 12",
    phone: "+41 33 000 10 10",
    email: "info@berner-kies.ch",
    website: "https://www.berner-kies.ch",
    description:
      "Regionales Kieswerk für Kies, Sand, Splitt, Schotter, Humus und Baustoffe. Lieferung für Baustellen, Gartenbau und Privatkunden im Raum Wattenwil, Thun und Bern.",
    tags: ["Kies", "Sand", "Splitt", "Baustoffe", "Lieferung"],
    searchTerms: [
      "kies wattenwil",
      "kies liefern",
      "sand kaufen",
      "schotter",
      "split",
      "baustoffe",
      "baumaterial",
      "humus",
      "material liefern",
    ],
    latitude: 46.7695,
    longitude: 7.5087,
    ad: {
      title: "Kies und Sand direkt aus der Region",
      description: "Baustoffe für Garten, Bau und Umgebung schnell anfragen.",
      cta: "Material anfragen",
    },
  },
  {
    name: "Berner Kies & Baustoffe AG",
    plan: "pro",
    mainCategory: "Bau, Garten & Material",
    subCategory: "Baustoffhandel",
    subCategories: ["Kieswerk", "Sand & Splitt", "Baustoffhandel"],
    category: "Baustoffhandel",
    city: "Thun",
    adress: "Industriestrasse 8",
    phone: "+41 33 000 10 20",
    email: "thun@berner-kies.ch",
    website: "https://www.berner-kies.ch",
    description:
      "Standort Thun für Kies, Sand, Splitt und Baustoffe. Ideal für Bauunternehmen, Gartenbauer und Privatkunden in der Region Thun.",
    tags: ["Standort Thun", "Kies", "Baustoffe", "Sand"],
    searchTerms: [
      "kies thun",
      "baustoffe thun",
      "sand thun",
      "split thun",
      "material thun",
    ],
    locationName: "Standort Thun",
    parentKey: "Berner Kies & Baustoffe AG|Wattenwil|",
    latitude: 46.757,
    longitude: 7.627,
  },
  {
    name: "Garage Aareblick GmbH",
    plan: "premium",
    mainCategory: "Auto, Garage & Fahrzeuge",
    subCategory: "Garage",
    subCategories: ["Garage", "Autowerkstatt", "Reifenservice", "Carrosserie"],
    category: "Garage",
    city: "Thun",
    adress: "Aarestrasse 44",
    phone: "+41 33 000 20 20",
    email: "info@garage-aareblick.ch",
    website: "https://www.garage-aareblick.ch",
    description:
      "Autogarage in Thun für Service, Reparaturen, Diagnose, MFK, Pneuwechsel, Reifenservice, Bremsen, Geräusche am Auto und Fahrzeugcheck.",
    tags: ["Garage", "Autowerkstatt", "Pneu", "Reparatur", "MFK"],
    searchTerms: [
      "garage thun",
      "auto macht geräusche",
      "auto reparatur",
      "pneu wechseln",
      "reifenservice",
      "mfk",
      "autoservice",
      "bremsen",
      "diagnose",
    ],
    latitude: 46.757,
    longitude: 7.627,
    ad: {
      title: "Pneuwechsel und Fahrzeugcheck",
      description: "Jetzt Termin für Service, Reifen oder Diagnose anfragen.",
      cta: "Termin anfragen",
    },
  },
  {
    name: "Coiffeur Bellezza Bern",
    plan: "pro",
    mainCategory: "Beauty, Gesundheit & Wohlbefinden",
    subCategory: "Coiffeur",
    subCategories: ["Coiffeur", "Barbershop"],
    category: "Coiffeur",
    city: "Bern",
    adress: "Kramgasse 18",
    phone: "+41 31 000 30 30",
    email: "hello@bellezza-bern.ch",
    website: "https://www.bellezza-bern.ch",
    description:
      "Coiffeur in Bern für Damen, Herren, Balayage, Färben, Haarschnitt, Styling, Barber und Beratung.",
    tags: ["Coiffeur", "Balayage", "Haarschnitt", "Barber"],
    searchTerms: [
      "coiffeur bern",
      "friseur bern",
      "balayage bern",
      "haare schneiden",
      "haarschnitt",
      "barber",
      "färben",
      "styling",
    ],
    latitude: 46.948,
    longitude: 7.4474,
  },
  {
    name: "Gartenbau Emmental GmbH",
    plan: "pro",
    mainCategory: "Bau, Garten & Material",
    subCategory: "Gartenbau",
    subCategories: ["Gartenbau", "Gartenpflege", "Aushub & Erdarbeiten"],
    category: "Gartenbau",
    city: "Burgdorf",
    adress: "Gartenweg 7",
    phone: "+41 34 000 40 40",
    email: "info@gartenbau-emmental.ch",
    website: "https://www.gartenbau-emmental.ch",
    description:
      "Gartenbau und Gartenpflege im Emmental. Neue Rasenflächen, Sitzplätze, Naturstein, Hecken schneiden, Bepflanzung und Gartenunterhalt.",
    tags: ["Gartenbau", "Rasen", "Gartenpflege", "Naturstein"],
    searchTerms: [
      "gärtner",
      "gartenbau",
      "neuer rasen",
      "rasen machen",
      "garten gestalten",
      "hecke schneiden",
      "gartenpflege",
      "sitzplatz",
      "naturstein",
    ],
    latitude: 47.059,
    longitude: 7.6279,
  },
  {
    name: "Elektro Lichtblick AG",
    plan: "starter",
    mainCategory: "Handwerk & Reparaturen",
    subCategory: "Elektriker",
    subCategories: ["Elektriker", "Notfalldienst"],
    category: "Elektriker",
    city: "Köniz",
    adress: "Schwarzenburgstrasse 95",
    phone: "+41 31 000 50 50",
    email: "info@elektro-lichtblick.ch",
    website: "https://www.elektro-lichtblick.ch",
    description:
      "Elektriker für Elektroinstallationen, Steckdosen, Lampen, Strom, Sicherungen, Smart Home und Reparaturen in Köniz und Umgebung Bern.",
    tags: ["Elektriker", "Strom", "Lampen", "Steckdose"],
    searchTerms: [
      "elektriker köniz",
      "elektriker bern",
      "strom problem",
      "lampe montieren",
      "steckdose",
      "elektroinstallation",
      "sicherung",
    ],
    latitude: 46.9244,
    longitude: 7.4146,
  },
  {
    name: "Haustechnik Oberland AG",
    plan: "premium",
    mainCategory: "Handwerk & Reparaturen",
    subCategory: "Heizung",
    subCategories: ["Heizung", "Sanitär", "Lüftung & Klima"],
    category: "Heizung",
    city: "Interlaken",
    adress: "Höheweg 55",
    phone: "+41 33 000 60 60",
    email: "service@haustechnik-oberland.ch",
    website: "https://www.haustechnik-oberland.ch",
    description:
      "Haustechnik im Berner Oberland für Heizung, Sanitär, Wärmepumpe, Boiler, Wasser, Notfalldienst und Service.",
    tags: ["Heizung", "Sanitär", "Wärmepumpe", "Boiler"],
    searchTerms: [
      "heizung macht probleme",
      "heizung kaputt",
      "sanitär",
      "boiler",
      "wärmepumpe",
      "wasser problem",
      "notdienst heizung",
      "haustechnik",
    ],
    latitude: 46.6863,
    longitude: 7.8632,
    ad: {
      title: "Heizung oder Boiler macht Probleme?",
      description: "Service im Berner Oberland direkt anfragen.",
      cta: "Service anfragen",
    },
  },
  {
    name: "Restaurant Matteblick",
    plan: "pro",
    mainCategory: "Gastro, Lebensmittel & Genuss",
    subCategory: "Restaurant",
    subCategories: ["Restaurant", "Take-away", "Café"],
    category: "Restaurant",
    city: "Bern",
    adress: "Mattenenge 4",
    phone: "+41 31 000 70 70",
    email: "info@matteblick.ch",
    website: "https://www.matteblick.ch",
    description:
      "Restaurant in Bern mit regionaler Küche, Mittagessen, Abendessen, Take-away, Brunch und saisonalen Angeboten.",
    tags: ["Restaurant", "Take-away", "Brunch", "Bern"],
    searchTerms: [
      "restaurant bern",
      "essen gehen",
      "takeaway bern",
      "take away",
      "mittagessen",
      "abendessen",
      "brunch",
      "beiz",
    ],
    latitude: 46.948,
    longitude: 7.4474,
  },
  {
    name: "Bäckerei Seeland",
    plan: "starter",
    mainCategory: "Gastro, Lebensmittel & Genuss",
    subCategory: "Bäckerei",
    subCategories: ["Bäckerei", "Konditorei", "Café"],
    category: "Bäckerei",
    city: "Aarberg",
    adress: "Stadtplatz 3",
    phone: "+41 32 000 80 80",
    email: "info@baeckerei-seeland.ch",
    website: "https://www.baeckerei-seeland.ch",
    description:
      "Bäckerei und Konditorei in Aarberg mit Brot, Gipfeli, Gebäck, Sandwiches, Kaffee und regionalen Spezialitäten.",
    tags: ["Bäckerei", "Brot", "Gipfeli", "Konditorei"],
    searchTerms: [
      "bäckerei aarberg",
      "brot kaufen",
      "gipfeli",
      "kaffee",
      "konditorei",
      "gebäck",
      "sandwich",
    ],
    latitude: 47.0446,
    longitude: 7.2758,
  },
  {
    name: "Umzug & Reinigung Mittelland",
    plan: "pro",
    mainCategory: "Immobilien, Wohnen & Reinigung",
    subCategory: "Umzugsfirma",
    subCategories: ["Umzugsfirma", "Reinigungsfirma", "Endreinigung"],
    category: "Umzugsfirma",
    city: "Münsingen",
    adress: "Bahnhofstrasse 22",
    phone: "+41 31 000 90 90",
    email: "info@umzug-mittelland.ch",
    website: "https://www.umzug-mittelland.ch",
    description:
      "Umzugsfirma und Reinigungsfirma für Umzug, Zügeln, Möbeltransport, Endreinigung und Wohnungsabgabe im Raum Bern-Mittelland.",
    tags: ["Umzug", "Reinigung", "Endreinigung", "Transport"],
    searchTerms: [
      "umzug",
      "zügeln",
      "umzugsfirma",
      "endreinigung",
      "wohnungsreinigung",
      "abgabereinigung",
      "möbeltransport",
    ],
    latitude: 46.872,
    longitude: 7.5638,
  },
];

function companyKey(company: SampleCompany) {
  return `${company.name}|${company.city}|${company.locationName ?? ""}`;
}

async function findExistingCompany(company: SampleCompany) {
  return prisma.company.findFirst({
    where: {
      name: company.name,
      city: company.city,
      locationName: company.locationName ?? null,
    },
    select: {
      id: true,
      name: true,
      city: true,
      locationName: true,
    },
  });
}

async function main() {
  ({ prisma } = await import("../src/lib/prisma"));
  const createdOrExisting = new Map<string, string>();
  let created = 0;
  let skipped = 0;

  for (const company of sampleCompanies) {
    const existingCompany = await findExistingCompany(company);

    if (existingCompany) {
      createdOrExisting.set(companyKey(company), existingCompany.id);
      skipped += 1;
      continue;
    }

    const parentCompanyId = company.parentKey
      ? createdOrExisting.get(company.parentKey) ?? null
      : null;

    const createdCompany = await prisma.company.create({
      data: {
        name: company.name,
        imageUrl: null,
        accessToken: randomUUID(),
        plan: company.plan,
        parentCompanyId,
        locationName: company.locationName ?? null,
        mainCategory: company.mainCategory,
        subCategory: company.subCategory,
        subCategories: JSON.stringify(company.subCategories),
        category: company.category,
        city: company.city,
        adress: company.adress,
        phone: company.phone,
        email: company.email,
        website: company.website,
        description: company.description,
        tags: JSON.stringify(company.tags),
        searchTerms: JSON.stringify(company.searchTerms),
        latitude: company.latitude ?? null,
        longitude: company.longitude ?? null,
        ad: company.ad
          ? {
              create: company.ad,
            }
          : undefined,
      },
      select: {
        id: true,
      },
    });

    createdOrExisting.set(companyKey(company), createdCompany.id);
    created += 1;
  }

  console.log(`Fertig. ${created} Musterfirmen erstellt, ${skipped} vorhandene übersprungen.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
