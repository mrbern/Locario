export type EventSearchTaxonomyEntry = {
  label: string;
  keywords: string[];
};

const eventSearchTaxonomy: EventSearchTaxonomyEntry[] = [
  {
    label: "Konzert",
    keywords: [
      "konzert",
      "musik",
      "live musik",
      "livemusik",
      "band",
      "sänger",
      "saenger",
      "sängerin",
      "saengerin",
      "auftritt",
      "bühne",
      "buehne",
      "festival",
      "openair",
      "rock",
      "pop",
      "jazz",
      "klassik",
      "chor",
      "orchester",
      "musikabend",
    ],
  },
  {
    label: "Party",
    keywords: [
      "party",
      "club",
      "dj",
      "disco",
      "tanzen",
      "ausgang",
      "nachtleben",
      "bar",
      "feiern",
      "afterwork",
      "ü30",
      "ue30",
      "90er party",
      "80er party",
      "techno",
      "house",
      "hip hop",
      "latin",
    ],
  },
  {
    label: "Markt",
    keywords: [
      "markt",
      "wochenmarkt",
      "flohmarkt",
      "handwerkermarkt",
      "weihnachtsmarkt",
      "adventsmarkt",
      "frühlingsmarkt",
      "fruehlingsmarkt",
      "herbstmarkt",
      "verkauf",
      "stände",
      "staende",
      "regional",
      "lokal",
      "produkte",
      "essen",
      "trinken",
    ],
  },
  {
    label: "Sport",
    keywords: [
      "sport",
      "turnier",
      "spiel",
      "match",
      "lauf",
      "rennen",
      "bike",
      "velo",
      "fussball",
      "eishockey",
      "tennis",
      "volleyball",
      "schwingen",
      "fitness",
      "wanderung",
      "training",
      "wettkampf",
      "meisterschaft",
    ],
  },
  {
    label: "Verein",
    keywords: [
      "verein",
      "vereinsanlass",
      "versammlung",
      "generalversammlung",
      "gv",
      "fest",
      "dorfverein",
      "musikverein",
      "turnverein",
      "sportverein",
      "schützenverein",
      "schuetzenverein",
      "feuerwehrverein",
      "vereinsfest",
    ],
  },
  {
    label: "Gewerbe",
    keywords: [
      "gewerbe",
      "gewerbeschau",
      "messe",
      "ausstellung",
      "tag der offenen tür",
      "tag der offenen tuer",
      "open house",
      "firma",
      "unternehmen",
      "business",
      "netzwerk",
      "networking",
      "lokale firmen",
      "angebot",
      "promotion",
    ],
  },
  {
    label: "Familie",
    keywords: [
      "familie",
      "familienevent",
      "kinder",
      "kinderevent",
      "spiel",
      "spass",
      "basteln",
      "märchen",
      "maerchen",
      "zauberer",
      "kasperlitheater",
      "familientag",
      "kinderprogramm",
      "eltern",
      "jugend",
      "spielplatz",
    ],
  },
  {
    label: "Kultur",
    keywords: [
      "kultur",
      "theater",
      "kabarett",
      "comedy",
      "lesung",
      "literatur",
      "museum",
      "ausstellung",
      "kunst",
      "vernissage",
      "film",
      "kino",
      "vortrag",
      "geschichte",
      "tradition",
      "brauchtum",
    ],
  },
  {
    label: "Gastronomie",
    keywords: [
      "gastronomie",
      "essen",
      "trinken",
      "food",
      "streetfood",
      "brunch",
      "degustation",
      "wein",
      "bier",
      "apero",
      "apéro",
      "dinner",
      "mittagessen",
      "grill",
      "bbq",
      "food festival",
      "kulinarik",
    ],
  },
  {
    label: "Kurs",
    keywords: [
      "kurs",
      "workshop",
      "seminar",
      "schulung",
      "weiterbildung",
      "lernen",
      "training",
      "einführung",
      "einfuehrung",
      "beratung",
      "coaching",
      "vortrag",
      "webinar",
      "infoabend",
    ],
  },
  {
    label: "Gesundheit",
    keywords: [
      "gesundheit",
      "prävention",
      "praevention",
      "pflege",
      "medizin",
      "therapie",
      "bewegung",
      "ernährung",
      "ernaehrung",
      "mental health",
      "entspannung",
      "yoga",
      "pilates",
      "fitness",
      "beratung",
      "vortrag",
    ],
  },
  {
    label: "Senioren",
    keywords: [
      "senioren",
      "pensionierte",
      "altersnachmittag",
      "jass",
      "kaffee",
      "treff",
      "ausflug",
      "bewegung",
      "mittagstisch",
      "gesellschaft",
      "spitex",
      "beratung",
    ],
  },
  {
    label: "Jugend",
    keywords: [
      "jugend",
      "teenager",
      "kids",
      "kinder",
      "jugendtreff",
      "ferienprogramm",
      "lager",
      "sport",
      "musik",
      "party",
      "workshop",
      "gaming",
      "schule",
    ],
  },
  {
    label: "Kirche",
    keywords: [
      "kirche",
      "gottesdienst",
      "andacht",
      "messe",
      "konfirmation",
      "firmung",
      "chor",
      "kirchenkonzert",
      "gemeinde",
      "advent",
      "weihnachten",
      "ostern",
      "bazar",
      "bazaar",
    ],
  },
  {
    label: "Dorf",
    keywords: [
      "dorf",
      "dorffest",
      "gemeinde",
      "lokal",
      "region",
      "fest",
      "begegnung",
      "treffpunkt",
      "platz",
      "halle",
      "schulhaus",
      "vereine",
      "familie",
    ],
  },
  {
    label: "Sonstiges",
    keywords: [
      "event",
      "veranstaltung",
      "anlass",
      "termin",
      "lokal",
      "regional",
      "heute",
      "morgen",
      "wochenende",
      "freitag",
      "samstag",
      "sonntag",
      "abend",
      "nachmittag",
      "programm",
    ],
  },
];

export const eventCategoryOptions = eventSearchTaxonomy.map((entry) => entry.label);

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function unique(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function findMatchingEntries(labels: string[]) {
  const normalizedLabels = labels.map(normalize).filter(Boolean);

  return eventSearchTaxonomy.filter((entry) => {
    const normalizedEntryLabel = normalize(entry.label);

    return normalizedLabels.some((label) => {
      return (
        label === normalizedEntryLabel ||
        label.includes(normalizedEntryLabel) ||
        normalizedEntryLabel.includes(label)
      );
    });
  });
}

export function getAutomaticEventSearchTerms({
  category,
  tags = [],
}: {
  category: string;
  tags?: string[];
}) {
  const labels = [category, ...tags];
  const matchingEntries = findMatchingEntries(labels);

  return unique([
    category,
    ...tags,
    ...matchingEntries.flatMap((entry) => entry.keywords),
  ]).map((term) => term.toLowerCase());
}

export function getEventSearchSuggestions({
  category,
  tags = [],
}: {
  category: string;
  tags?: string[];
}) {
  return getAutomaticEventSearchTerms({
    category,
    tags,
  }).slice(0, 80);
}