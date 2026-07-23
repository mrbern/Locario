import { locationCoordinates } from "@/data/location-coordinates";
import { nearbyLocations } from "@/data/nearby-locations";
import { canCompanyUseAdvertising, getCompanyPlanLabel } from "@/data/plans";
import { getEventPlanLabel } from "@/data/event-plans";
import { searchSynonymGroups } from "@/data/search-synonyms";
import type { Company } from "@/types/company";
import type { LocarioEvent } from "@/types/event";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

export type SearchType = "all" | "companies" | "events";
export type SortMode = "relevance" | "distance";

export type QueryLocationFilter = {
  hasLocationFilter: boolean;
  targetLocation: string;
  targetLocationWords: string[];
  allowedLocations: Set<string>;
};

export type MatchScore = {
  businessScore: number;
  locationScore: number;
  freshnessScore: number;
  timeScore: number;
  planScore: number;
  intentScore: number;
  totalScore: number;
  businessWordCount: number;
  matchedBusinessWordCount: number;
  matchedWords: string[];
  reasons: string[];
};

export type UnifiedSearchResult = {
  id: string;
  type: "company" | "event";
  title: string;
  subtitle: string;
  city: string;
  description: string;
  imageUrl: string;
  href: string;
  primaryBadge: string;
  planKey: string;
  secondaryBadges: string[];
  tags: string[];
  distanceKm: number | null;
  locationRank: number;
  score: MatchScore;
  isHighlighted: boolean;
  meta: string;
  cta: string;
  locationName?: string;
  relationLabel?: string;
  parentCompanyName?: string;
  locationCount?: number;
  ad?: {
    title: string;
    description: string;
    cta: string;
  };
};

type SafeCompany = Company & {
  address?: string | null;
  adress?: string | null;
  companyName?: string | null;
  title?: string | null;
  parentCompanyId?: string | null;
  locationName?: string | null;
  parentCompany?: {
    id?: string;
    name?: string;
    locationName?: string | null;
    city?: string | null;
    address?: string | null;
    adress?: string | null;
  } | null;
  locations?: Array<{
    id?: string;
    name?: string;
    locationName?: string | null;
    city?: string | null;
    address?: string | null;
    adress?: string | null;
  }>;
  tags?: unknown;
  searchTerms?: unknown;
  subCategories?: unknown;
};

type PreferredSearchType = "all" | "companies" | "events";
type TimeIntent = "none" | "today" | "tomorrow" | "weekend";

type WeightedSearchText = {
  value: unknown;
  weight: number;
  label: string;
};

type SearchIntent = {
  preferredType: PreferredSearchType;
  label: string;
  timeIntent: TimeIntent;
  timeLabel: string;
};

export type SmartSearchMeta = {
  locationFilter: QueryLocationFilter;
  queryWords: string[];
  intent: SearchIntent;
};

export const smartSearchExamples = [
  "Werkstatt Wattenwil",
  "Ich brauche Kies",
  "Nissan kaufen",
  "Coiffeur in Bern",
  "Autolackiererei",
  "Reifenservice",
  "Elektriker Luzern",
  "Fisch kaufen",
  "Restaurant in der Nähe",
  "Bäckerei Umgebung",
  "Events dieses Wochenende",
  "Live Musik Wochenende",
  "Kinderprogramm Bern",
  "Konzert Thun",
  "Markt Bern",
  "Restaurant Wattenwil",
];

const stopWords = [
  "ich",
  "brauche",
  "brauch",
  "suche",
  "such",
  "will",
  "möchte",
  "moechte",
  "benötige",
  "benoetige",
  "hätte",
  "haette",
  "gern",
  "gerne",
  "einen",
  "eine",
  "ein",
  "den",
  "die",
  "das",
  "der",
  "dem",
  "des",
  "und",
  "oder",
  "mit",
  "für",
  "fuer",
  "in",
  "im",
  "am",
  "an",
  "aus",
  "von",
  "nach",
  "nähe",
  "naehe",
  "nahe",
  "umgebung",
  "umkreis",
  "near",
  "nearby",
  "regional",
  "lokal",
  "kaufen",
  "kaufe",
  "finden",
  "gibt",
  "es",
  "wo",
  "wer",
  "was",
  "bitte",
  "bei",
  "zum",
  "zur",
  "dieses",
  "diese",
  "dieser",
];

const timeWords = [
  "heute",
  "morgen",
  "wochenende",
  "weekend",
  "samstag",
  "sonntag",
  "freitag",
];

const eventIntentWords = [
  "event",
  "events",
  "veranstaltung",
  "veranstaltungen",
  "anlass",
  "anlaesse",
  "anlässe",
  "konzert",
  "musik",
  "livemusik",
  "live",
  "band",
  "dj",
  "party",
  "markt",
  "maerit",
  "märit",
  "flohmarkt",
  "sport",
  "turnier",
  "festival",
  "fest",
  "feier",
  "wochenende",
  "weekend",
  "kurs",
  "workshop",
  "seminar",
  "kultur",
  "theater",
  "comedy",
  "familie",
  "kinder",
  "kinderprogramm",
  "brunch",
  "degustation",
  "apero",
  "apéro",
  "ausstellung",
];

const synonymGroups = searchSynonymGroups;


export function getPlanBadgeClassName(plan: string | undefined) {
  if (plan === "premium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (plan === "pro" || plan === "highlight") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (plan === "starter") {
    return "border-blue-300/30 bg-blue-300/10 text-blue-100";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-300";
}

function getSafeString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function normalizeText(value: unknown) {
  const stringValue = getSafeString(value);

  return stringValue
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

function getWords(value: unknown) {
  return normalizeText(value)
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);
}

function getSafeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => getSafeString(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmedValue);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => getSafeString(item).trim())
          .filter(Boolean);
      }
    } catch {
      return trimmedValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function uniqueValues(values: string[]) {
  const seenValues = new Set<string>();
  const uniqueItems: string[] = [];

  values.forEach((value) => {
    const cleanValue = value.trim();
    const normalizedValue = normalizeText(cleanValue);

    if (!cleanValue || !normalizedValue || seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    uniqueItems.push(cleanValue);
  });

  return uniqueItems;
}

function getQueryWords(query: string) {
  const words = getWords(query);
  const meaningfulWords = words.filter((word) => !stopWords.includes(word));

  return meaningfulWords.length > 0 ? meaningfulWords : words;
}

function getExpandedWords(word: string) {
  const normalizedWord = normalizeText(word);

  const matchingGroup = synonymGroups.find((group) =>
    group.map(normalizeText).includes(normalizedWord)
  );

  if (!matchingGroup) {
    return [normalizedWord].filter(Boolean);
  }

  return Array.from(new Set(matchingGroup.map(normalizeText).filter(Boolean)));
}

function wordLooksLikeEventIntent(word: string) {
  const normalizedEventIntentWords = eventIntentWords.map(normalizeText);
  const expandedWords = getExpandedWords(word);

  return expandedWords.some((expandedWord) =>
    normalizedEventIntentWords.includes(expandedWord)
  );
}

function getBusinessQueryWords(
  query: string,
  locationFilter: QueryLocationFilter
) {
  return getQueryWords(query).filter((word) => {
    return !isQueryLocationWord(word, locationFilter) && !isTimeWord(word);
  });
}

function isEventOnlySearch(query: string, locationFilter: QueryLocationFilter) {
  const businessWords = getBusinessQueryWords(query, locationFilter);

  if (businessWords.length === 0) {
    return false;
  }

  return businessWords.every((word) => wordLooksLikeEventIntent(word));
}

function wordMatchesText(word: string, text: unknown) {
  const normalizedWord = normalizeText(word);
  const normalizedText = normalizeText(text);

  if (!normalizedWord || !normalizedText) {
    return false;
  }

  const textWords = normalizedText.split(" ").filter(Boolean);

  return textWords.some((textWord) => {
    if (textWord === normalizedWord) {
      return true;
    }

    if (normalizedWord.length >= 4 && textWord.includes(normalizedWord)) {
      return true;
    }

    if (textWord.length >= 4 && normalizedWord.includes(textWord)) {
      return true;
    }

    return false;
  });
}

function phraseMatchesText(query: string, text: unknown) {
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);

  if (!normalizedQuery || !normalizedText) {
    return false;
  }

  return (
    normalizedQuery.includes(normalizedText) ||
    normalizedText.includes(normalizedQuery)
  );
}

function isTimeWord(word: string) {
  return timeWords.includes(normalizeText(word));
}

function queryWantsNearby(query: string) {
  const normalizedQuery = normalizeText(query);

  return (
    normalizedQuery.includes("naehe") ||
    normalizedQuery.includes("nahe") ||
    normalizedQuery.includes("umgebung") ||
    normalizedQuery.includes("umkreis") ||
    normalizedQuery.includes("near me") ||
    normalizedQuery.includes("nearby")
  );
}

function getTimeIntent(query: string): {
  value: TimeIntent;
  label: string;
} {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery.includes("heute")) {
    return {
      value: "today",
      label: "Heute",
    };
  }

  if (normalizedQuery.includes("morgen")) {
    return {
      value: "tomorrow",
      label: "Morgen",
    };
  }

  if (
    normalizedQuery.includes("wochenende") ||
    normalizedQuery.includes("weekend") ||
    normalizedQuery.includes("samstag") ||
    normalizedQuery.includes("sonntag")
  ) {
    return {
      value: "weekend",
      label: "Wochenende",
    };
  }

  return {
    value: "none",
    label: "kein Zeitraum",
  };
}

function getSearchIntent(
  query: string,
  locationFilter: QueryLocationFilter
): SearchIntent {
  const nonLocationWords = getBusinessQueryWords(query, locationFilter);
  const hasEventIntent = nonLocationWords.some((word) =>
    wordLooksLikeEventIntent(word)
  );

  const timeIntent = getTimeIntent(query);

  if (hasEventIntent) {
    return {
      preferredType: "events",
      label: "Events",
      timeIntent: timeIntent.value,
      timeLabel: timeIntent.label,
    };
  }

  if (nonLocationWords.length > 0) {
    return {
      preferredType: "companies",
      label: "Firmen / Anbieter",
      timeIntent: timeIntent.value,
      timeLabel: timeIntent.label,
    };
  }

  return {
    preferredType: "all",
    label: "Allgemein",
    timeIntent: timeIntent.value,
    timeLabel: timeIntent.label,
  };
}

function getCompanyName(company: Company) {
  const safeCompany = company as SafeCompany;

  return (
    getSafeString(company.name).trim() ||
    getSafeString(safeCompany.companyName).trim() ||
    getSafeString(safeCompany.title).trim() ||
    "Unbenannte Firma"
  );
}

function getCompanyLocationName(company: Company) {
  return getSafeString((company as SafeCompany).locationName).trim();
}

function getCompanyPublicTitle(company: Company) {
  const companyName = getCompanyName(company);
  const locationName = getCompanyLocationName(company);

  if (locationName) {
    return `${companyName} · ${locationName}`;
  }

  return companyName;
}

function getCompanyLocationCount(company: Company) {
  const safeCompany = company as SafeCompany;

  return Array.isArray(safeCompany.locations) ? safeCompany.locations.length : 0;
}

function getCompanyRelationLabel(company: Company) {
  const safeCompany = company as SafeCompany;
  const parentName = getSafeString(safeCompany.parentCompany?.name).trim();
  const locationCount = getCompanyLocationCount(company);
  const locationName = getCompanyLocationName(company);

  if (safeCompany.parentCompanyId && parentName) {
    return `Standort von ${parentName}`;
  }

  if (safeCompany.parentCompanyId) {
    return "Filiale / Standort";
  }

  if (locationCount > 0) {
    return `Hauptfirma · ${locationCount} Standort${
      locationCount === 1 ? "" : "e"
    }`;
  }

  if (locationName) {
    return "Hauptsitz / Einzelstandort";
  }

  return "";
}

function getCompanyAddress(company: Company) {
  const safeCompany = company as SafeCompany;

  return (
    getSafeString(safeCompany.address).trim() ||
    getSafeString(safeCompany.adress).trim()
  );
}

function valueAlreadyContainsCity(value: string, city: string) {
  const normalizedValue = normalizeText(value);
  const normalizedCity = normalizeText(city);

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

function getEventLocationLine(event: LocarioEvent) {
  const locationName = event.locationName?.trim() || "";
  const address = event.address?.trim() || "";
  const city = event.city?.trim() || "";

  const parts = [locationName, address];

  if (
    city &&
    !valueAlreadyContainsCity(locationName, city) &&
    !valueAlreadyContainsCity(address, city)
  ) {
    parts.push(city);
  }

  return parts.filter(Boolean).join(", ") || "Ort offen";
}

function getDisplayedSubCategories(company: Company) {
  const safeCompany = company as SafeCompany;
  const subCategories = uniqueValues(
    getSafeStringArray(safeCompany.subCategories)
  );

  if (subCategories.length > 0) {
    return subCategories;
  }

  const subCategory = getSafeString(company.subCategory);
  const category = getSafeString(company.category);

  if (subCategory) {
    return [subCategory];
  }

  if (category) {
    return [category];
  }

  return [];
}

function getDisplayedMainCategory(company: Company) {
  return getSafeString(company.mainCategory, "Allgemein") || "Allgemein";
}

function getCompanyPlanRank(company: Company) {
  const plan = getSafeString(company.plan);

  if (plan === "premium") {
    return 4;
  }

  if (plan === "pro") {
    return 3;
  }

  if (plan === "starter") {
    return 2;
  }

  return 1;
}

function getEventPlanRank(event: LocarioEvent) {
  const plan = getSafeString(event.plan);

  if (plan === "premium") {
    return 4;
  }

  if (plan === "highlight") {
    return 3;
  }

  return 1;
}

function shouldShowAdvertising(company: Company) {
  const plan = getSafeString(company.plan);

  return Boolean(company.ad) && canCompanyUseAdvertising(plan);
}

function getNormalizedNearbyLocationMap() {
  const normalizedMap = new Map<string, string[]>();

  Object.entries(nearbyLocations).forEach(([location, locations]) => {
    const normalizedLocation = normalizeText(location);

    const normalizedLocations = [location, ...locations]
      .map(normalizeText)
      .filter(Boolean);

    normalizedMap.set(
      normalizedLocation,
      Array.from(new Set(normalizedLocations))
    );
  });

  return normalizedMap;
}

function queryContainsLocation(query: string, location: string) {
  const normalizedQuery = ` ${normalizeText(query)} `;
  const normalizedLocation = normalizeText(location);

  if (!normalizedLocation) {
    return false;
  }

  return normalizedQuery.includes(` ${normalizedLocation} `);
}

function addLocationWordsFromAddress(
  knownLocations: Set<string>,
  address: string
) {
  const words = getWords(address);

  words.forEach((word) => {
    if (word.length >= 3 && Number.isNaN(Number(word))) {
      knownLocations.add(word);
    }
  });
}

function getQueryLocationFilter(
  query: string,
  companies: Company[],
  events: LocarioEvent[]
): QueryLocationFilter {
  const normalizedNearbyMap = getNormalizedNearbyLocationMap();
  const knownLocations = new Set<string>();

  normalizedNearbyMap.forEach((locations, location) => {
    knownLocations.add(location);

    locations.forEach((nearbyLocation) => {
      knownLocations.add(nearbyLocation);
    });
  });

  companies.forEach((company) => {
    const safeCompany = company as SafeCompany;
    const normalizedCity = normalizeText(company.city);
    const normalizedAddress = normalizeText(getCompanyAddress(company));
    const normalizedLocationName = normalizeText(safeCompany.locationName);

    if (normalizedCity) {
      knownLocations.add(normalizedCity);
    }

    if (normalizedAddress) {
      addLocationWordsFromAddress(knownLocations, normalizedAddress);
    }

    if (normalizedLocationName) {
      knownLocations.add(normalizedLocationName);
    }

    if (safeCompany.parentCompany) {
      const normalizedParentCity = normalizeText(safeCompany.parentCompany.city);
      const normalizedParentAddress = normalizeText(
        safeCompany.parentCompany.address || safeCompany.parentCompany.adress
      );
      const normalizedParentLocationName = normalizeText(
        safeCompany.parentCompany.locationName
      );

      if (normalizedParentCity) {
        knownLocations.add(normalizedParentCity);
      }

      if (normalizedParentAddress) {
        addLocationWordsFromAddress(knownLocations, normalizedParentAddress);
      }

      if (normalizedParentLocationName) {
        knownLocations.add(normalizedParentLocationName);
      }
    }

    (safeCompany.locations ?? []).forEach((location) => {
      const normalizedLocationCity = normalizeText(location.city);
      const normalizedLocationAddress = normalizeText(
        location.address || location.adress
      );
      const normalizedChildLocationName = normalizeText(location.locationName);

      if (normalizedLocationCity) {
        knownLocations.add(normalizedLocationCity);
      }

      if (normalizedLocationAddress) {
        addLocationWordsFromAddress(knownLocations, normalizedLocationAddress);
      }

      if (normalizedChildLocationName) {
        knownLocations.add(normalizedChildLocationName);
      }
    });
  });

  events.forEach((event) => {
    const normalizedCity = normalizeText(event.city);
    const normalizedAddress = normalizeText(event.address);
    const normalizedLocationName = normalizeText(event.locationName);

    if (normalizedCity) {
      knownLocations.add(normalizedCity);
    }

    if (normalizedAddress) {
      addLocationWordsFromAddress(knownLocations, normalizedAddress);
    }

    if (normalizedLocationName) {
      knownLocations.add(normalizedLocationName);
    }
  });

  Object.keys(locationCoordinates).forEach((location) => {
    const normalizedLocation = normalizeText(location);

    if (normalizedLocation) {
      knownLocations.add(normalizedLocation);
    }
  });

  const matchingLocation = Array.from(knownLocations)
    .sort((a, b) => b.length - a.length)
    .find((location) => queryContainsLocation(query, location));

  if (!matchingLocation) {
    return {
      hasLocationFilter: false,
      targetLocation: "",
      targetLocationWords: [],
      allowedLocations: new Set(),
    };
  }

  const allowedLocations =
    normalizedNearbyMap.get(matchingLocation) ?? [matchingLocation];

  return {
    hasLocationFilter: true,
    targetLocation: matchingLocation,
    targetLocationWords: getWords(matchingLocation),
    allowedLocations: new Set(allowedLocations),
  };
}

function textContainsLocation(text: unknown, location: string) {
  const normalizedText = normalizeText(text);
  const normalizedLocation = normalizeText(location);

  if (!normalizedText || !normalizedLocation) {
    return false;
  }

  return normalizedText.includes(normalizedLocation);
}

function getLocationRankFromTexts(
  texts: unknown[],
  city: unknown,
  locationFilter: QueryLocationFilter
) {
  if (!locationFilter.hasLocationFilter) {
    return 0;
  }

  const normalizedCity = normalizeText(city);

  if (normalizedCity === locationFilter.targetLocation) {
    return 0;
  }

  if (
    texts.some((text) =>
      textContainsLocation(text, locationFilter.targetLocation)
    )
  ) {
    return 0;
  }

  if (locationFilter.allowedLocations.has(normalizedCity)) {
    return 1;
  }

  return 999;
}

function isQueryLocationWord(word: string, locationFilter: QueryLocationFilter) {
  if (!locationFilter.hasLocationFilter) {
    return false;
  }

  return locationFilter.targetLocationWords.includes(normalizeText(word));
}

function getCoordinateForCity(city: unknown) {
  const normalizedCity = normalizeText(city);

  return locationCoordinates[normalizedCity] ?? null;
}

function getCoordinateFromLatitudeLongitude(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  if (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return {
      latitude,
      longitude,
    };
  }

  return null;
}

function calculateDistanceKm(
  firstLocation: UserLocation,
  secondLocation: UserLocation
) {
  const earthRadiusKm = 6371;

  const latitudeDifference =
    ((secondLocation.latitude - firstLocation.latitude) * Math.PI) / 180;
  const longitudeDifference =
    ((secondLocation.longitude - firstLocation.longitude) * Math.PI) / 180;

  const firstLatitudeRadians = (firstLocation.latitude * Math.PI) / 180;
  const secondLatitudeRadians = (secondLocation.latitude * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(firstLatitudeRadians) *
      Math.cos(secondLatitudeRadians) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusKm * c * 10) / 10;
}

function getDistanceKm({
  city,
  latitude,
  longitude,
  userLocation,
}: {
  city: unknown;
  latitude?: number | null;
  longitude?: number | null;
  userLocation: UserLocation | null;
}) {
  if (!userLocation) {
    return null;
  }

  const directCoordinate = getCoordinateFromLatitudeLongitude(
    latitude,
    longitude
  );

  const fallbackCoordinate = getCoordinateForCity(city);
  const coordinate = directCoordinate ?? fallbackCoordinate;

  if (!coordinate) {
    return null;
  }

  return calculateDistanceKm(userLocation, coordinate);
}

function compareDistances(aDistance: number | null, bDistance: number | null) {
  if (aDistance === null && bDistance === null) {
    return 0;
  }

  if (aDistance === null) {
    return 1;
  }

  if (bDistance === null) {
    return -1;
  }

  return aDistance - bDistance;
}

function getCompanyTexts(company: Company): WeightedSearchText[] {
  const safeCompany = company as SafeCompany;
  const advertisingAllowed = shouldShowAdvertising(company);
  const address = getCompanyAddress(company);
  const locationName = getCompanyLocationName(company);
  const publicTitle = getCompanyPublicTitle(company);
  const relationLabel = getCompanyRelationLabel(company);
  const parentCompany = safeCompany.parentCompany;
  const childLocations = safeCompany.locations ?? [];

  const parentTexts = parentCompany
    ? [
        {
          value: parentCompany.name,
          weight: 30,
          label: "Hauptfirma",
        },
        {
          value: parentCompany.locationName,
          weight: 22,
          label: "Hauptfirma Standort",
        },
        {
          value: parentCompany.city,
          weight: 12,
          label: "Hauptfirma Ort",
        },
        {
          value: parentCompany.address || parentCompany.adress,
          weight: 12,
          label: "Hauptfirma Adresse",
        },
      ]
    : [];

  const childLocationTexts = childLocations.flatMap((location) => [
    {
      value: location.name,
      weight: 22,
      label: "Weiterer Standort",
    },
    {
      value: location.locationName,
      weight: 28,
      label: "Standortname",
    },
    {
      value: location.city,
      weight: 12,
      label: "Standort Ort",
    },
    {
      value: location.address || location.adress,
      weight: 12,
      label: "Standort Adresse",
    },
  ]);

  return [
    { value: "firma anbieter dienstleistung", weight: 12, label: "Typ" },
    { value: getCompanyName(company), weight: 32, label: "Name" },
    { value: publicTitle, weight: 36, label: "Name / Standort" },
    { value: locationName, weight: 34, label: "Standortname" },
    {
      value: relationLabel,
      weight: 22,
      label: "Standortbeziehung",
    },
    {
      value: safeCompany.parentCompanyId
        ? "standort filiale zweigstelle niederlassung"
        : childLocations.length > 0
          ? "hauptfirma hauptsitz hauptstandort standorte filialen"
          : "einzelstandort firma",
      weight: 24,
      label: "Standorttyp",
    },
    {
      value: getDisplayedMainCategory(company),
      weight: 38,
      label: "Hauptkategorie",
    },
    ...getDisplayedSubCategories(company).map((subCategory) => ({
      value: subCategory,
      weight: 46,
      label: "Unterkategorie",
    })),
    { value: company.category, weight: 38, label: "Kategorie" },
    { value: company.city, weight: 12, label: "Ort" },
    { value: address, weight: 14, label: "Adresse" },
    { value: getCompanyLocationLine(company), weight: 14, label: "Adresse" },
    ...parentTexts,
    ...childLocationTexts,
    { value: company.description, weight: 16, label: "Beschreibung" },
    { value: company.phone, weight: 3, label: "Telefon" },
    { value: company.email, weight: 3, label: "E-Mail" },
    { value: company.website, weight: 3, label: "Website" },
    ...getSafeStringArray((company as SafeCompany).tags).map((tag) => ({
      value: tag,
      weight: 42,
      label: "Tag",
    })),
    ...getSafeStringArray((company as SafeCompany).searchTerms).map((term) => ({
      value: term,
      weight: 46,
      label: "Suchbegriff",
    })),
    {
      value: advertisingAllowed ? company.ad?.title ?? "" : "",
      weight: 10,
      label: "Anzeige",
    },
    {
      value: advertisingAllowed ? company.ad?.description ?? "" : "",
      weight: 8,
      label: "Anzeige",
    },
  ];
}

function getEventTexts(event: LocarioEvent): WeightedSearchText[] {
  return [
    { value: "event events veranstaltung anlass", weight: 24, label: "Typ" },
    { value: event.title, weight: 44, label: "Titel" },
    { value: event.category, weight: 46, label: "Kategorie" },
    { value: event.organizerName, weight: 18, label: "Veranstalter" },
    { value: event.city, weight: 12, label: "Ort" },
    { value: event.locationName, weight: 18, label: "Lokalität" },
    { value: event.address, weight: 14, label: "Adresse" },
    { value: getEventLocationLine(event), weight: 14, label: "Adresse" },
    { value: event.description, weight: 18, label: "Beschreibung" },
    ...getSafeStringArray(event.tags).map((tag) => ({
      value: tag,
      weight: 42,
      label: "Event-Label",
    })),
    ...getSafeStringArray(event.searchTerms).map((term) => ({
      value: term,
      weight: 48,
      label: "Event-Suchbegriff",
    })),
    { value: event.website, weight: 4, label: "Website" },
    { value: event.ticketUrl, weight: 4, label: "Ticket" },
  ];
}

function getBestWeightedMatch(
  word: string,
  texts: WeightedSearchText[]
): WeightedSearchText | null {
  const expandedWords = getExpandedWords(word);
  let bestMatch: WeightedSearchText | null = null;

  for (const text of texts) {
    const matched = expandedWords.some((expandedWord) =>
      wordMatchesText(expandedWord, text.value)
    );

    if (!matched) {
      continue;
    }

    if (!bestMatch || text.weight > bestMatch.weight) {
      bestMatch = text;
    }
  }

  return bestMatch;
}

function getEventTimeScore(event: LocarioEvent, timeIntent: TimeIntent) {
  if (timeIntent === "none") {
    return 0;
  }

  const startsAtValue = getSafeString(event.startsAt);
  const startsAt = new Date(startsAtValue);

  if (!startsAtValue || Number.isNaN(startsAt.getTime())) {
    return 0;
  }

  const now = new Date();

  const eventDay = new Date(
    startsAt.getFullYear(),
    startsAt.getMonth(),
    startsAt.getDate()
  );

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const daysDifference = Math.round(
    (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (timeIntent === "today" && daysDifference === 0) {
    return 40;
  }

  if (timeIntent === "tomorrow" && daysDifference === 1) {
    return 40;
  }

  if (timeIntent === "weekend") {
    const day = startsAt.getDay();

    if (daysDifference >= 0 && daysDifference <= 7 && [5, 6, 0].includes(day)) {
      return 38;
    }
  }

  return 0;
}

function getEventFreshnessScore(event: LocarioEvent) {
  const startsAtValue = getSafeString(event.startsAt);
  const now = new Date();
  const startsAt = new Date(startsAtValue);

  if (!startsAtValue || Number.isNaN(startsAt.getTime())) {
    return 0;
  }

  const daysUntilEvent =
    (startsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (daysUntilEvent < -1) {
    return -80;
  }

  if (daysUntilEvent <= 7) {
    return 18;
  }

  if (daysUntilEvent <= 30) {
    return 10;
  }

  return 3;
}

function isEventStillRelevant(event: LocarioEvent) {
  const startsAtValue = getSafeString(event.startsAt);
  const startsAt = new Date(startsAtValue);

  if (!startsAtValue || Number.isNaN(startsAt.getTime())) {
    return true;
  }

  const oneDayAgo = Date.now() - 1000 * 60 * 60 * 24;

  return startsAt.getTime() >= oneDayAgo;
}

function formatEventDate(value: unknown) {
  const safeValue = getSafeString(value);
  const date = new Date(safeValue);

  if (!safeValue || Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateMatchScore({
  query,
  texts,
  city,
  locationFilter,
  planRank,
  entityType,
  searchIntent,
  freshnessScore = 0,
  timeScore = 0,
}: {
  query: string;
  texts: WeightedSearchText[];
  city: unknown;
  locationFilter: QueryLocationFilter;
  planRank: number;
  entityType: "company" | "event";
  searchIntent: SearchIntent;
  freshnessScore?: number;
  timeScore?: number;
}): MatchScore {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    const planScore = planRank * 2;

    return {
      businessScore: 1,
      locationScore: 0,
      freshnessScore,
      timeScore,
      planScore,
      intentScore: 0,
      totalScore: 1 + freshnessScore + timeScore + planScore,
      businessWordCount: 0,
      matchedBusinessWordCount: 0,
      matchedWords: [],
      reasons: ["Ohne Suchbegriff: sortiert nach Relevanz."],
    };
  }

  const normalizedCity = normalizeText(city);

  const businessWords = getBusinessQueryWords(query, locationFilter).filter(
    (word) => normalizeText(word) !== normalizedCity
  );

  let businessScore = 0;
  let locationScore = 0;
  let matchedBusinessWordCount = 0;
  let intentScore = 0;

  const matchedWords: string[] = [];
  const reasons: string[] = [];

  if (normalizedCity && normalizedQuery.includes(normalizedCity)) {
    locationScore += 45;
    reasons.push(`Ort passt zu ${getSafeString(city)}.`);
  }

  if (
    locationFilter.hasLocationFilter &&
    locationFilter.allowedLocations.has(normalizedCity)
  ) {
    if (normalizedCity === locationFilter.targetLocation) {
      locationScore += 45;
      reasons.push("Direkter Ortstreffer.");
    } else {
      locationScore += 25;
      reasons.push("Passend in der Umgebung.");
    }
  }

  for (const word of businessWords) {
    const bestMatch = getBestWeightedMatch(word, texts);

    if (bestMatch) {
      matchedBusinessWordCount += 1;
      businessScore += bestMatch.weight;
      matchedWords.push(word);
    }
  }

  if (texts.some((text) => phraseMatchesText(query, text.value))) {
    businessScore += 18;
    reasons.push("Suchbegriff passt als Phrase.");
  }

  if (searchIntent.preferredType === "companies" && entityType === "company") {
    intentScore += 18;
  }

  if (searchIntent.preferredType === "events" && entityType === "event") {
    intentScore += 28;
    reasons.push("Passt zur erkannten Event-Suche.");
  }

  if (queryWantsNearby(query)) {
    reasons.push("Nähe-Suche erkannt.");
  }

  if (timeScore > 0) {
    reasons.push(`Passt zum Zeitraum: ${searchIntent.timeLabel}.`);
  }

  if (matchedWords.length > 0) {
    reasons.push(`Passende Begriffe: ${matchedWords.slice(0, 4).join(", ")}.`);
  }

  const planScore = planRank * 2;

  if (planRank >= 3) {
    reasons.push("Hervorgehobener Eintrag.");
  }

  return {
    businessScore,
    locationScore,
    freshnessScore,
    timeScore,
    planScore,
    intentScore,
    totalScore:
      businessScore +
      locationScore +
      freshnessScore +
      timeScore +
      planScore +
      intentScore,
    businessWordCount: businessWords.length,
    matchedBusinessWordCount,
    matchedWords: uniqueValues(matchedWords),
    reasons: uniqueValues(reasons),
  };
}

function shouldIncludeResult(score: MatchScore) {
  if (score.businessWordCount > 0) {
    return score.matchedBusinessWordCount > 0;
  }

  return score.locationScore > 0 || score.businessScore > 0 || score.timeScore > 0;
}

function getCompanyHref(company: Company, query: string) {
  const companyId = getSafeString(company.id);
  const cleanedQuery = query.trim();

  if (!companyId) {
    return "/firmen";
  }

  if (!cleanedQuery) {
    return `/firmen/${companyId}`;
  }

  return `/firmen/${companyId}?q=${encodeURIComponent(cleanedQuery)}`;
}

function getEventHref(event: LocarioEvent, query: string) {
  const eventId = getSafeString(event.id);
  const cleanedQuery = query.trim();

  if (!eventId) {
    return "/events";
  }

  if (!cleanedQuery) {
    return `/events/${eventId}`;
  }

  return `/events/${eventId}?q=${encodeURIComponent(cleanedQuery)}`;
}

function mapCompanyToResult({
  company,
  query,
  userLocation,
  locationFilter,
  searchIntent,
}: {
  company: Company;
  query: string;
  userLocation: UserLocation | null;
  locationFilter: QueryLocationFilter;
  searchIntent: SearchIntent;
}): UnifiedSearchResult {
  const displayedSubCategories = getDisplayedSubCategories(company);
  const displayedMainCategory = getDisplayedMainCategory(company);
  const advertisingAllowed = shouldShowAdvertising(company);
  const companyPlan = getSafeString(company.plan, "pilot") || "pilot";
  const safeCompany = company as SafeCompany;
  const companyName = getCompanyName(company);
  const companyLocationName = getCompanyLocationName(company);
  const companyCity = getSafeString(company.city);
  const companyAddress = getCompanyAddress(company);
  const companyLocationLine = getCompanyLocationLine(company);
  const companyDescription = getSafeString(company.description);
  const relationLabel = getCompanyRelationLabel(company);
  const parentCompanyName = getSafeString(safeCompany.parentCompany?.name);
  const locationCount = getCompanyLocationCount(company);
  const childLocations = safeCompany.locations ?? [];
  const planRank = getCompanyPlanRank(company);

  const score = calculateMatchScore({
    query,
    texts: getCompanyTexts(company),
    city: companyCity,
    locationFilter,
    planRank,
    entityType: "company",
    searchIntent,
  });

  return {
    id: `company-${getSafeString(company.id, companyName)}`,
    type: "company",
    title: companyName,
    subtitle: displayedMainCategory,
    city: companyLocationLine,
    description: companyDescription,
    imageUrl: getSafeString(company.imageUrl),
    href: getCompanyHref(company, query),
    primaryBadge: getCompanyPlanLabel(companyPlan),
    planKey: companyPlan,
    secondaryBadges: uniqueValues([
      ...displayedSubCategories,
      companyLocationName,
      relationLabel,
    ]).slice(0, 4),
    tags: uniqueValues(getSafeStringArray((company as SafeCompany).tags)).slice(
      0,
      5
    ),
    distanceKm: getDistanceKm({
      city: companyCity,
      latitude: company.latitude,
      longitude: company.longitude,
      userLocation,
    }),
    locationRank: getLocationRankFromTexts(
      [
        companyCity,
        companyAddress,
        companyLocationName,
        companyLocationLine,
        safeCompany.parentCompany?.name,
        safeCompany.parentCompany?.locationName,
        safeCompany.parentCompany?.city,
        safeCompany.parentCompany?.address,
        safeCompany.parentCompany?.adress,
        ...childLocations.flatMap((location) => [
          location.name,
          location.locationName,
          location.city,
          location.address,
          location.adress,
        ]),
      ],
      companyCity,
      locationFilter
    ),
    score,
    isHighlighted: companyPlan === "premium" || companyPlan === "pro",
    meta: "Firma",
    cta: "Firma ansehen",
    locationName: companyLocationName,
    relationLabel,
    parentCompanyName,
    locationCount,
    ad:
      advertisingAllowed && company.ad
        ? {
            title: getSafeString(company.ad.title),
            description: getSafeString(company.ad.description),
            cta: getSafeString(company.ad.cta, "Mehr erfahren"),
          }
        : undefined,
  };
}

function mapEventToResult({
  event,
  query,
  userLocation,
  locationFilter,
  searchIntent,
}: {
  event: LocarioEvent;
  query: string;
  userLocation: UserLocation | null;
  locationFilter: QueryLocationFilter;
  searchIntent: SearchIntent;
}): UnifiedSearchResult {
  const eventPlan = getSafeString(event.plan, "basic") || "basic";
  const eventTitle = getSafeString(event.title, "Unbenanntes Event");
  const eventCity = getSafeString(event.city);
  const eventDescription = getSafeString(event.description);
  const organizerName = getSafeString(event.organizerName, "Veranstalter");
  const locationName = getSafeString(event.locationName);
  const eventAddress = getSafeString(event.address);
  const eventLocationLine = getEventLocationLine(event);
  const eventTags = uniqueValues(getSafeStringArray(event.tags));
  const planRank = getEventPlanRank(event);
  const timeScore = getEventTimeScore(event, searchIntent.timeIntent);

  const score = calculateMatchScore({
    query,
    texts: getEventTexts(event),
    city: eventCity,
    locationFilter,
    planRank,
    entityType: "event",
    searchIntent,
    freshnessScore: getEventFreshnessScore(event),
    timeScore,
  });

  return {
    id: `event-${getSafeString(event.id, eventTitle)}`,
    type: "event",
    title: eventTitle,
    subtitle: organizerName,
    city: eventLocationLine,
    description: eventDescription,
    imageUrl: getSafeString(event.imageUrl),
    href: getEventHref(event, query),
    primaryBadge: getEventPlanLabel(eventPlan),
    planKey: eventPlan,
    secondaryBadges: uniqueValues([
      getSafeString(event.category),
      locationName,
    ]).slice(0, 4),
    tags: uniqueValues([formatEventDate(event.startsAt), ...eventTags]).filter(
      Boolean
    ),
    distanceKm: getDistanceKm({
      city: eventCity,
      latitude: event.latitude,
      longitude: event.longitude,
      userLocation,
    }),
    locationRank: getLocationRankFromTexts(
      [eventCity, locationName, eventAddress, eventLocationLine],
      eventCity,
      locationFilter
    ),
    score,
    isHighlighted: eventPlan === "premium" || eventPlan === "highlight",
    meta: "Event",
    cta: "Event ansehen",
  };
}

export function getSmartSearchMeta({
  query,
  companies,
  events,
}: {
  query: string;
  companies: Company[];
  events: LocarioEvent[];
}): SmartSearchMeta {
  const locationFilter = getQueryLocationFilter(query, companies, events);
  const intent = getSearchIntent(query, locationFilter);

  const queryWords = getBusinessQueryWords(query, locationFilter);

  return {
    locationFilter,
    queryWords: uniqueValues(queryWords),
    intent,
  };
}

export function getUnifiedSearchResults({
  query,
  companies,
  events,
  userLocation,
  selectedType,
  sortMode,
}: {
  query: string;
  companies: Company[];
  events: LocarioEvent[];
  userLocation: UserLocation | null;
  selectedType: SearchType;
  sortMode: SortMode;
}) {
  const normalizedQuery = normalizeText(query);
  const shouldUseDistanceSort =
    Boolean(userLocation) && (sortMode === "distance" || queryWantsNearby(query));

  const searchMeta = getSmartSearchMeta({
    query,
    companies,
    events,
  });

  const shouldForceEventsOnly =
    selectedType === "all" &&
    searchMeta.intent.preferredType === "events" &&
    isEventOnlySearch(query, searchMeta.locationFilter);

  const activeEvents = events.filter((event) => {
    return event.isActive !== false && isEventStillRelevant(event);
  });

  const companyResults =
    selectedType === "events" || shouldForceEventsOnly
      ? []
      : companies.map((company) =>
          mapCompanyToResult({
            company,
            query,
            userLocation,
            locationFilter: searchMeta.locationFilter,
            searchIntent: searchMeta.intent,
          })
        );

  const eventResults =
    selectedType === "companies"
      ? []
      : activeEvents.map((event) =>
          mapEventToResult({
            event,
            query,
            userLocation,
            locationFilter: searchMeta.locationFilter,
            searchIntent: searchMeta.intent,
          })
        );

  return [...companyResults, ...eventResults]
    .filter((result) => {
      if (
        searchMeta.locationFilter.hasLocationFilter &&
        result.locationRank === 999
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return shouldIncludeResult(result.score);
    })
    .sort((firstResult, secondResult) => {
      if (
        searchMeta.locationFilter.hasLocationFilter &&
        firstResult.locationRank !== secondResult.locationRank
      ) {
        return firstResult.locationRank - secondResult.locationRank;
      }

      if (shouldUseDistanceSort) {
        const distanceDifference = compareDistances(
          firstResult.distanceKm,
          secondResult.distanceKm
        );

        if (distanceDifference !== 0) {
          return distanceDifference;
        }
      }

      if (secondResult.score.totalScore !== firstResult.score.totalScore) {
        return secondResult.score.totalScore - firstResult.score.totalScore;
      }

      if (firstResult.type !== secondResult.type) {
        if (searchMeta.intent.preferredType === "events") {
          return firstResult.type === "event" ? -1 : 1;
        }

        return firstResult.type === "company" ? -1 : 1;
      }

      return String(firstResult.title ?? "").localeCompare(
        String(secondResult.title ?? "")
      );
    });
}