import type { Company } from "@/types/company";

export const companies: Company[] = [
  {
    id: "1",
    name: "Müller Baustoffe AG",
    category: "Baumaterial",
    city: "Bern",
    phone: "+41 31 000 00 00",
    email: "info@mueller-baustoffe.ch",
    website: "https://example.ch",
    description:
      "Kies, Sand, Schotter und Baumaterial für private und gewerbliche Kunden in der Region Bern.",
    tags: ["Kies", "Sand", "Schotter", "Baumaterial", "Lieferung"],
    searchTerms: [
      "kies",
      "sand",
      "schotter",
      "split",
      "splitt",
      "steine",
      "baumaterial",
      "material liefern",
      "baustoffe",
      "aushub",
      "gartensteine",
      "kies liefern",
    ],
    ad: {
      title: "10% Rabatt auf Kieslieferungen",
      description:
        "Sichere dir jetzt ein regionales Angebot für Kies, Sand und Schotter direkt ab Werk.",
      cta: "Angebot anfragen",
    },
  },
  {
    id: "2",
    name: "Coiffeur Bella",
    category: "Beauty & Pflege",
    city: "Zürich",
    phone: "+41 44 000 00 00",
    email: "kontakt@coiffeur-bella.ch",
    website: "https://example.ch",
    description:
      "Moderner Coiffeur für Damen, Herren und Kinder mit persönlicher Beratung.",
    tags: ["Coiffeur", "Haarschnitt", "Beauty", "Pflege"],
    searchTerms: [
      "coiffeur",
      "friseur",
      "friseurin",
      "haare",
      "haare schneiden",
      "haarschnitt",
      "bart",
      "styling",
      "beauty",
      "pflege",
      "damenhaarschnitt",
      "herrenhaarschnitt",
    ],
    ad: {
      title: "Neukunden erhalten 15% Rabatt",
      description:
        "Buche deinen ersten Termin bei Coiffeur Bella und profitiere vom Willkommensangebot.",
      cta: "Termin anfragen",
    },
  },
  {
    id: "3",
    name: "Autohaus Keller Nissan",
    category: "Autohaus",
    city: "Aarau",
    phone: "+41 62 000 00 00",
    email: "verkauf@autohaus-keller.ch",
    website: "https://example.ch",
    description:
      "Nissan Neuwagen, Occasionen, Leasing, Probefahrten und Service.",
    tags: ["Nissan", "Auto", "Leasing", "Occasion", "Garage"],
    searchTerms: [
      "nissan",
      "auto",
      "auto kaufen",
      "neuwagen",
      "occasion",
      "gebrauchtwagen",
      "leasing",
      "garage",
      "probefahrt",
      "service",
      "fahrzeug",
      "autohaus",
    ],
    ad: {
      title: "Nissan Probefahrt vereinbaren",
      description:
        "Teste aktuelle Nissan Modelle und erhalte ein persönliches Leasingangebot.",
      cta: "Probefahrt buchen",
    },
  },
];

