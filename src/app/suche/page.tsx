"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { nearbyLocations } from "@/data/nearby-locations";
import { companies as demoCompanies } from "@/data/companies";
import { locationCoordinates } from "@/data/location-coordinates";
import {
  canCompanyUseAdvertising,
  getCompanyPlanLabel,
} from "@/data/plans";
import type { Company } from "@/types/company";

type UserLocation = {
  latitude: number;
  longitude: number;
};

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
  "einen",
  "eine",
  "ein",
  "den",
  "die",
  "das",
  "der",
  "dem",
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
  "kaufen",
  "kaufe",
  "finden",
];

const businessSynonyms: Record<string, string[]> = {
  werkstatt: [
    "werkstatt",
    "garage",
    "autogarage",
    "auto garage",
    "autowerkstatt",
    "autoservice",
    "reparatur",
    "fahrzeugservice",
  ],
  garage: [
    "garage",
    "autogarage",
    "auto garage",
    "werkstatt",
    "autowerkstatt",
    "autoservice",
  ],
  backerei: [
    "backerei",
    "baeckerei",
    "bäckerei",
    "konditorei",
    "confiserie",
    "cafe",
    "brot",
    "gipfeli",
  ],
  baeckerei: [
    "backerei",
    "baeckerei",
    "bäckerei",
    "konditorei",
    "confiserie",
    "cafe",
    "brot",
    "gipfeli",
  ],
};

type CompanyMatchScore = {
  businessScore: number;
  locationScore: number;
  totalScore: number;
  businessWordCount: number;
  matchedBusinessWordCount: number;
};

type QueryLocationFilter = {
  hasLocationFilter: boolean;
  targetLocation: string;
  targetLocationWords: string[];
  allowedLocations: Set<string>;
};

type SearchResult = {
  company: Company;
  locationRank: number;
  distanceKm: number | null;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function getWords(value: string) {
  return normalizeText(value)
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);
}

function getQueryWords(query: string) {
  const words = getWords(query);
  const meaningfulWords = words.filter((word) => !stopWords.includes(word));

  return meaningfulWords.length > 0 ? meaningfulWords : words;
}

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

function getPlanRank(company: Company) {
  if (company.plan === "premium") {
    return 4;
  }

  if (company.plan === "pro") {
    return 3;
  }

  if (company.plan === "starter") {
    return 2;
  }

  return 1;
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

function companyHasImage(company: Company) {
  return Boolean(company.imageUrl && company.imageUrl.trim());
}

function getCityWords(companyCity: string) {
  return getWords(companyCity);
}

function isCompanyCityWord(word: string, companyCity: string) {
  const normalizedWord = normalizeText(word);
  const normalizedCity = normalizeText(companyCity);
  const cityWords = getCityWords(companyCity);

  if (!normalizedWord || !normalizedCity) {
    return false;
  }

  return normalizedWord === normalizedCity || cityWords.includes(normalizedWord);
}

function isLocationOnlyTerm(term: string, companyCity: string) {
  const normalizedTerm = normalizeText(term);
  const normalizedCity = normalizeText(companyCity);
  const cityWords = getCityWords(companyCity);

  if (!normalizedTerm || !normalizedCity) {
    return false;
  }

  return normalizedTerm === normalizedCity || cityWords.includes(normalizedTerm);
}

function getFilteredBusinessTerms(values: string[], companyCity: string) {
  return values
    .map(normalizeText)
    .filter(Boolean)
    .filter((value) => !isLocationOnlyTerm(value, companyCity));
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

function getQueryLocationFilter(
  query: string,
  companies: Company[]
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
    const normalizedCity = normalizeText(company.city);

    if (normalizedCity) {
      knownLocations.add(normalizedCity);
    }
  });

  Object.keys(locationCoordinates).forEach((location) => {
    knownLocations.add(normalizeText(location));
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

function getCompanyLocationRank(
  company: Company,
  locationFilter: QueryLocationFilter
) {
  if (!locationFilter.hasLocationFilter) {
    return 0;
  }

  const normalizedCity = normalizeText(company.city);

  if (normalizedCity === locationFilter.targetLocation) {
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

function getExpandedBusinessWords(word: string) {
  const normalizedWord = normalizeText(word);
  const synonyms = businessSynonyms[normalizedWord] ?? [];

  return Array.from(
    new Set([normalizedWord, ...synonyms.map(normalizeText)].filter(Boolean))
  );
}

function wordMatchesText(word: string, text: string) {
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

function hasBusinessWordMatch(word: string, businessTexts: string[]) {
  const expandedWords = getExpandedBusinessWords(word);

  return expandedWords.some((expandedWord) =>
    businessTexts.some((text) => wordMatchesText(expandedWord, text))
  );
}

function hasBusinessPhraseMatch(query: string, businessTexts: string[]) {
  const normalizedQuery = normalizeText(query);

  return businessTexts.some((text) => {
    const normalizedText = normalizeText(text);

    if (!normalizedText) {
      return false;
    }

    return normalizedQuery.includes(normalizedText);
  });
}

function getBusinessTexts(company: Company) {
  const advertisingAllowed = shouldShowAdvertising(company);

  const filteredTags = getFilteredBusinessTerms(company.tags, company.city);
  const filteredSearchTerms = getFilteredBusinessTerms(
    company.searchTerms,
    company.city
  );

  return [
    company.name,
    getDisplayedMainCategory(company),
    ...getDisplayedSubCategories(company),
    company.category,
    company.description,
    ...filteredTags,
    ...filteredSearchTerms,
    advertisingAllowed ? company.ad?.title ?? "" : "",
    advertisingAllowed ? company.ad?.description ?? "" : "",
    advertisingAllowed ? company.ad?.cta ?? "" : "",
  ]
    .map(normalizeText)
    .filter(Boolean);
}

function calculateCompanyMatchScore(
  query: string,
  company: Company,
  locationFilter: QueryLocationFilter
): CompanyMatchScore {
  const normalizedQuery = normalizeText(query);
  const queryWords = getQueryWords(query);

  if (!normalizedQuery) {
    return {
      businessScore: 1,
      locationScore: 0,
      totalScore: 1,
      businessWordCount: 0,
      matchedBusinessWordCount: 0,
    };
  }

  const companyCity = normalizeText(company.city);
  const businessTexts = getBusinessTexts(company);

  const businessWords = queryWords.filter((word) => {
    return (
      !isCompanyCityWord(word, company.city) &&
      !isQueryLocationWord(word, locationFilter)
    );
  });

  let businessScore = 0;
  let locationScore = 0;
  let matchedBusinessWordCount = 0;

  if (companyCity && normalizedQuery.includes(companyCity)) {
    locationScore += 45;
  }

  if (
    locationFilter.hasLocationFilter &&
    locationFilter.allowedLocations.has(companyCity)
  ) {
    locationScore += companyCity === locationFilter.targetLocation ? 45 : 25;
  }

  for (const word of queryWords) {
    if (isCompanyCityWord(word, company.city)) {
      locationScore += 26;
    }
  }

  if (businessWords.length > 0) {
    for (const word of businessWords) {
      if (hasBusinessWordMatch(word, businessTexts)) {
        matchedBusinessWordCount += 1;
        businessScore += 30;
      }
    }
  }

  if (hasBusinessPhraseMatch(query, businessTexts)) {
    businessScore += 20;
  }

  const displayedMainCategory = normalizeText(getDisplayedMainCategory(company));
  const displayedSubCategories =
    getDisplayedSubCategories(company).map(normalizeText);
  const companyCategory = normalizeText(company.category);
  const companyName = normalizeText(company.name);
  const companyDescription = normalizeText(company.description);
  const companyTags = getFilteredBusinessTerms(company.tags, company.city);
  const companySearchTerms = getFilteredBusinessTerms(
    company.searchTerms,
    company.city
  );

  for (const word of businessWords) {
    const expandedWords = getExpandedBusinessWords(word);

    if (
      expandedWords.some((expandedWord) =>
        displayedSubCategories.some((subCategory) =>
          wordMatchesText(expandedWord, subCategory)
        )
      )
    ) {
      businessScore += 18;
    }

    if (
      expandedWords.some((expandedWord) =>
        wordMatchesText(expandedWord, displayedMainCategory)
      )
    ) {
      businessScore += 16;
    }

    if (
      expandedWords.some((expandedWord) =>
        wordMatchesText(expandedWord, companyCategory)
      )
    ) {
      businessScore += 14;
    }

    if (
      expandedWords.some((expandedWord) =>
        wordMatchesText(expandedWord, companyName)
      )
    ) {
      businessScore += 12;
    }

    if (
      expandedWords.some((expandedWord) =>
        companyTags.some((tag) => wordMatchesText(expandedWord, tag))
      )
    ) {
      businessScore += 12;
    }

    if (
      expandedWords.some((expandedWord) =>
        companySearchTerms.some((term) => wordMatchesText(expandedWord, term))
      )
    ) {
      businessScore += 12;
    }

    if (
      expandedWords.some((expandedWord) =>
        wordMatchesText(expandedWord, companyDescription)
      )
    ) {
      businessScore += 4;
    }
  }

  if (shouldShowAdvertising(company) && businessScore > 0) {
    businessScore += 3;
  }

  return {
    businessScore,
    locationScore,
    totalScore: businessScore + locationScore,
    businessWordCount: businessWords.length,
    matchedBusinessWordCount,
  };
}

function shouldIncludeCompany(matchScore: CompanyMatchScore) {
  if (matchScore.businessWordCount > 0) {
    return matchScore.matchedBusinessWordCount > 0;
  }

  return matchScore.locationScore > 0 || matchScore.businessScore > 0;
}

function getCoordinateForCity(city: string) {
  const normalizedCity = normalizeText(city);

  return locationCoordinates[normalizedCity] ?? null;
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

function getCompanyDistanceKm(company: Company, userLocation: UserLocation | null) {
  if (!userLocation) {
    return null;
  }

  const companyCoordinate = getCoordinateForCity(company.city);

  if (!companyCoordinate) {
    return null;
  }

  return calculateDistanceKm(userLocation, companyCoordinate);
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

function getSearchResultsForQuery(
  query: string,
  companies: Company[],
  userLocation: UserLocation | null
): SearchResult[] {
  const normalizedQuery = normalizeText(query);
  const locationFilter = getQueryLocationFilter(query, companies);

  if (!normalizedQuery) {
    return [...companies]
      .map((company) => ({
        company,
        distanceKm: getCompanyDistanceKm(company, userLocation),
      }))
      .sort((a, b) => {
        if (userLocation) {
          const distanceDifference = compareDistances(
            a.distanceKm,
            b.distanceKm
          );

          if (distanceDifference !== 0) {
            return distanceDifference;
          }
        }

        const planDifference = getPlanRank(b.company) - getPlanRank(a.company);

        if (planDifference !== 0) {
          return planDifference;
        }

        return a.company.name.localeCompare(b.company.name);
      })
      .map((item) => ({
        company: item.company,
        locationRank: 0,
        distanceKm: item.distanceKm,
      }));
  }

  return companies
    .map((company) => {
      const matchScore = calculateCompanyMatchScore(
        query,
        company,
        locationFilter
      );
      const locationRank = getCompanyLocationRank(company, locationFilter);
      const distanceKm = getCompanyDistanceKm(company, userLocation);

      return {
        company,
        matchScore,
        planRank: getPlanRank(company),
        locationRank,
        distanceKm,
      };
    })
    .filter((item) => {
      if (locationFilter.hasLocationFilter && item.locationRank === 999) {
        return false;
      }

      return shouldIncludeCompany(item.matchScore);
    })
    .sort((a, b) => {
      if (
        locationFilter.hasLocationFilter &&
        a.locationRank !== b.locationRank
      ) {
        return a.locationRank - b.locationRank;
      }

      if (userLocation) {
        const distanceDifference = compareDistances(
          a.distanceKm,
          b.distanceKm
        );

        if (distanceDifference !== 0) {
          return distanceDifference;
        }
      }

      if (b.matchScore.businessScore !== a.matchScore.businessScore) {
        return b.matchScore.businessScore - a.matchScore.businessScore;
      }

      if (b.planRank !== a.planRank) {
        return b.planRank - a.planRank;
      }

      if (b.matchScore.totalScore !== a.matchScore.totalScore) {
        return b.matchScore.totalScore - a.matchScore.totalScore;
      }

      return a.company.name.localeCompare(b.company.name);
    })
    .map((item) => ({
      company: item.company,
      locationRank: item.locationRank,
      distanceKm: item.distanceKm,
    }));
}

function getResultsForQuery(
  query: string,
  companies: Company[],
  userLocation: UserLocation | null
) {
  return getSearchResultsForQuery(query, companies, userLocation).map(
    (item) => item.company
  );
}

function getCompanyHref(company: Company, query: string) {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) {
    return `/firmen/${company.id}`;
  }

  return `/firmen/${company.id}?q=${encodeURIComponent(cleanedQuery)}`;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [initialUrlQuery, setInitialUrlQuery] = useState("");
  const [databaseCompanies, setDatabaseCompanies] = useState<Company[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchLogMessage, setSearchLogMessage] = useState("");

  const hasSavedInitialUrlQuery = useRef(false);

  const examples = [
    "Werkstatt Wattenwil",
    "Bäckerei Wattenwil",
    "Garage Wattenwil",
    "Wattenwil",
    "Ich brauche Kies",
    "Kies Bern",
    "Coiffeur Zürich",
    "Nissan kaufen",
    "Garage Aarau",
    "Occasionen Aarau",
    "Autolackiererei",
    "Reifenservice",
    "Elektriker Luzern",
  ];

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlQuery = searchParams.get("q") ?? "";

    if (urlQuery.trim()) {
      setQuery(urlQuery);
      setInitialUrlQuery(urlQuery);
    }

    const savedUserLocation = window.localStorage.getItem(
      "neario-user-location"
    );

    if (savedUserLocation) {
      try {
        const parsedLocation = JSON.parse(savedUserLocation) as UserLocation;

        if (
          typeof parsedLocation.latitude === "number" &&
          typeof parsedLocation.longitude === "number"
        ) {
          setUserLocation(parsedLocation);
          setLocationMessage("Standortsortierung ist aktiv.");
        }
      } catch {
        window.localStorage.removeItem("neario-user-location");
      }
    }

    loadCompanies();
  }, []);

  const allCompanies = useMemo(() => {
    return [...demoCompanies, ...databaseCompanies];
  }, [databaseCompanies]);

  const searchResults = useMemo(() => {
    return getSearchResultsForQuery(query, allCompanies, userLocation);
  }, [query, allCompanies, userLocation]);

  const results = useMemo(() => {
    return searchResults.map((item) => item.company);
  }, [searchResults]);

  const directResults = useMemo(() => {
    return searchResults.filter((item) => item.locationRank === 0);
  }, [searchResults]);

  const nearbyResults = useMemo(() => {
    return searchResults.filter((item) => item.locationRank === 1);
  }, [searchResults]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!initialUrlQuery.trim()) {
      return;
    }

    if (hasSavedInitialUrlQuery.current) {
      return;
    }

    hasSavedInitialUrlQuery.current = true;

    const matchingResults = getResultsForQuery(
      initialUrlQuery,
      allCompanies,
      userLocation
    );
    saveSearchLog(initialUrlQuery, matchingResults.length);
  }, [isLoading, initialUrlQuery, allCompanies, userLocation]);

  async function loadCompanies() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/companies", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Firmen konnten nicht geladen werden.");
      }

      const data = (await response.json()) as Company[];
      setDatabaseCompanies(data);
    } catch {
      setErrorMessage(
        "Die Firmen aus der Datenbank konnten nicht geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSearchLog(searchQuery: string, resultCount: number) {
    const cleanedQuery = searchQuery.trim();

    if (!cleanedQuery) {
      return;
    }

    try {
      setIsSavingSearch(true);
      setSearchLogMessage("");

      const response = await fetch("/api/search-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: cleanedQuery,
          resultCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Suchanfrage konnte nicht gespeichert werden.");
      }

      setSearchLogMessage("Suchanfrage wurde gespeichert.");

      setTimeout(() => {
        setSearchLogMessage("");
      }, 2500);
    } catch {
      setSearchLogMessage(
        "Suchanfrage konnte nicht gespeichert werden. Die Suche funktioniert trotzdem."
      );

      setTimeout(() => {
        setSearchLogMessage("");
      }, 3500);
    } finally {
      setIsSavingSearch(false);
    }
  }

  async function runSearch(searchQuery: string) {
    const cleanedQuery = searchQuery.trim();

    setQuery(searchQuery);

    if (!cleanedQuery) {
      window.history.replaceState(null, "", "/suche");
      return;
    }

    window.history.replaceState(
      null,
      "",
      `/suche?q=${encodeURIComponent(cleanedQuery)}`
    );

    const matchingResults = getResultsForQuery(
      cleanedQuery,
      allCompanies,
      userLocation
    );

    await saveSearchLog(cleanedQuery, matchingResults.length);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch(query);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Dein Browser unterstützt die Standorterkennung nicht."
      );
      return;
    }

    setIsDetectingLocation(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(detectedLocation);
        window.localStorage.setItem(
          "neario-user-location",
          JSON.stringify(detectedLocation)
        );
        setLocationMessage(
          "Standort wurde erkannt. Ergebnisse werden nach Nähe sortiert."
        );
        setIsDetectingLocation(false);
      },
      () => {
        setLocationMessage(
          "Standort konnte nicht erkannt werden oder wurde abgelehnt."
        );
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000 * 60 * 10,
      }
    );
  }

  function clearCurrentLocation() {
    setUserLocation(null);
    window.localStorage.removeItem("neario-user-location");
    setLocationMessage("Standortsortierung wurde deaktiviert.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-14rem] top-[10rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[18rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/30">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/70" />
              Neario Suche
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
              Was suchst du{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
                in deiner Nähe?
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Suche nach Produkten, Dienstleistungen oder Firmen. Neario zeigt
              fachlich passende Treffer im gesuchten Ort, in Nachbardörfern und
              optional nach deiner Nähe sortiert an.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <SearchStat value={results.length.toString()} label="Treffer" />
              <SearchStat
                value={directResults.length.toString()}
                label="direkt"
              />
              <SearchStat
                value={nearbyResults.length.toString()}
                label="Umgebung"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm font-bold text-cyan-100">
                Standortsortierung
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Nutze deinen Standort, damit passende Firmen zusätzlich nach
                Distanz sortiert und mit Kilometerangabe angezeigt werden.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isDetectingLocation}
                  className="rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDetectingLocation
                    ? "Standort wird erkannt..."
                    : userLocation
                      ? "Standort aktualisieren"
                      : "Standort verwenden"}
                </button>

                {userLocation && (
                  <button
                    type="button"
                    onClick={clearCurrentLocation}
                    className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    Deaktivieren
                  </button>
                )}
              </div>

              {locationMessage && (
                <p className="mt-3 text-sm text-cyan-100">
                  {locationMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 rounded-[2rem] border border-white/10 bg-white/10 p-2 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl md:flex"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-[1.5rem] bg-white px-5 py-5 text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-500"
            placeholder="Zum Beispiel: Werkstatt Wattenwil"
          />

          <button
            type="submit"
            disabled={isSavingSearch}
            className="mt-2 w-full rounded-[1.5rem] bg-gradient-to-r from-cyan-300 to-cyan-500 px-9 py-5 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:w-auto"
          >
            {isSavingSearch ? "Speichert..." : "Suchen"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => runSearch(example)}
              className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
            >
              {example}
            </button>
          ))}
        </div>

        {searchLogMessage && (
          <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm font-semibold text-cyan-100 shadow-xl shadow-cyan-950/20">
            {searchLogMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-5 font-semibold text-red-200">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-slate-300 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-300" />
              Firmen werden geladen...
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="mt-12 flex flex-col justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-slate-950/20 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                  Suchergebnisse
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  {results.length} Ergebnis
                  {results.length === 1 ? "" : "se"} gefunden
                </h2>

                <p className="mt-2 text-slate-400">
                  Passend nach Leistung, Ort, Nachbardörfern
                  {userLocation ? " und Distanz." : "."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ResultBadge label="Direkt" value={directResults.length} />
                <ResultBadge label="Umgebung" value={nearbyResults.length} />
              </div>
            </div>

            <CompanyResultGrid results={directResults} query={query} />

            {nearbyResults.length > 0 && (
              <section className="mt-14">
                <div className="mb-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/10" />

                  <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-center shadow-lg shadow-cyan-950/20">
                    <p className="text-sm font-black text-cyan-100">
                      In der Umgebung
                    </p>
                    <p className="text-xs text-slate-400">
                      Passende Firmen aus Nachbardörfern
                    </p>
                  </div>

                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/10" />
                </div>

                <CompanyResultGrid results={nearbyResults} query={query} />
              </section>
            )}

            {results.length === 0 && (
              <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/20">
                <div className="max-w-2xl">
                  <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                    Keine Treffer
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    Keine passende Firma gefunden
                  </h2>

                  <p className="mt-4 text-slate-300">
                    Neario speichert solche Suchanfragen. So erkennst du später,
                    welche Firmen oder Branchen in deiner Region gefragt sind.
                  </p>

                  <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                    <p className="font-bold text-cyan-100">
                      Chance für Neario
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      Wenn viele Nutzer nach einem Angebot suchen, aber keine
                      Treffer finden, ist das ein starkes Signal für neue
                      Akquise.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function SearchStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-3xl font-black text-cyan-200">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ResultBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

function CompanyResultGrid({
  results,
  query,
}: {
  results: SearchResult[];
  query: string;
}) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-7 grid gap-6 md:grid-cols-2">
      {results.map((result) => {
        const company = result.company;
        const displayedMainCategory = getDisplayedMainCategory(company);
        const displayedSubCategories = getDisplayedSubCategories(company);
        const advertisingVisible = shouldShowAdvertising(company);
        const hasImage = companyHasImage(company);

        return (
          <Link
            key={company.id}
            href={getCompanyHref(company, query)}
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.09]"
          >
            <div className="relative h-40 overflow-hidden">
              {hasImage ? (
                <img
                  src={company.imageUrl}
                  alt={company.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-slate-950" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_16rem)]" />
                </>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-3 py-1 text-sm font-bold text-cyan-100 backdrop-blur">
                  {displayedMainCategory}
                </span>

                <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-sm font-bold text-slate-200 backdrop-blur">
                  {company.city}
                </span>

                {result.distanceKm !== null && (
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm font-bold text-emerald-100 backdrop-blur">
                    ca. {result.distanceKm} km
                  </span>
                )}
              </div>

              {shouldShowPlanBadge(company) && (
                <div
                  className={`absolute right-5 top-5 rounded-full border px-3 py-1 text-xs font-black backdrop-blur ${getPlanBadgeClassName(
                    company.plan
                  )}`}
                >
                  {getCompanyPlanLabel(company.plan)}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {displayedSubCategories.slice(0, 4).map((subCategory) => (
                  <span
                    key={subCategory}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100"
                  >
                    {subCategory}
                  </span>
                ))}

                {displayedSubCategories.length > 4 && (
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
                    +{displayedSubCategories.length - 4} weitere
                  </span>
                )}
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight">
                {company.name}
              </h2>

              <p className="mt-4 text-slate-300">{company.description}</p>

              {advertisingVisible && company.ad && (
                <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                    Anzeige
                  </p>

                  <h3 className="mt-2 font-black text-white">
                    {company.ad.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-300">
                    {company.ad.description}
                  </p>

                  <div className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-cyan-300 to-cyan-500 px-4 py-2 text-sm font-black text-slate-950">
                    {company.ad.cta}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {company.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition group-hover:bg-cyan-300">
                Firma ansehen
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}