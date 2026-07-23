import { NextResponse } from "next/server";
import { searchIntentPhrases } from "@/data/search-synonyms";

type SearchInterpretRequestBody = {
  query?: string;
  forceAI?: boolean;
};

type SearchInterpretResult = {
  expandedQuery: string;
  suggestedTerms: string[];
  detectedIntent: string;
  explanation: string;
  usedAI: boolean;
};

const defaultResult: SearchInterpretResult = {
  expandedQuery: "",
  suggestedTerms: [],
  detectedIntent: "Allgemein",
  explanation: "",
  usedAI: false,
};

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
  return getSafeString(value)
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

function queryMatchesPhrase(query: string, phrase: string) {
  const normalizedQuery = normalizeText(query);
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedQuery || !normalizedPhrase) {
    return false;
  }

  return normalizedQuery.includes(normalizedPhrase);
}

function getQueryWords(query: string) {
  return normalizeText(query)
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);
}

function queryLooksLikeNaturalLanguage(query: string) {
  const normalizedQuery = normalizeText(query);
  const words = getQueryWords(query);

  if (!normalizedQuery) {
    return false;
  }

  const naturalLanguageSignals = [
    "ich brauche jemanden",
    "ich suche jemanden",
    "suche jemanden",
    "wer kann",
    "wo finde",
    "wo gibt",
    "macht probleme",
    "macht geraeusche",
    "komische geraeusche",
    "funktioniert nicht",
    "ist kaputt",
    "kaputt",
    "defekt",
    "problem",
    "probleme",
    "stoerung",
    "reparieren lassen",
    "neu machen",
    "machen lassen",
    "brauche hilfe",
    "hilfe bei",
  ];

  if (naturalLanguageSignals.some((signal) => normalizedQuery.includes(signal))) {
    return true;
  }

  if (query.includes("?")) {
    return true;
  }

  return words.length >= 7;
}

function shouldUseAIForQuery(query: string, forceAI: boolean) {
  if (forceAI) {
    return true;
  }

  return queryLooksLikeNaturalLanguage(query);
}

function getFallbackInterpretation(query: string): SearchInterpretResult {
  const matchingPhrases = searchIntentPhrases.filter((phrase) =>
    phrase.triggers.some((trigger) => queryMatchesPhrase(query, trigger))
  );

  const suggestedTerms = uniqueValues(
    matchingPhrases.flatMap((phrase) => phrase.terms)
  );

  if (suggestedTerms.length === 0) {
    return {
      ...defaultResult,
      expandedQuery: query,
      explanation: "Regelbasierte Suche ohne zusätzliche KI-Erweiterung.",
      usedAI: false,
    };
  }

  return {
    expandedQuery: uniqueValues([query, ...suggestedTerms]).join(" "),
    suggestedTerms,
    detectedIntent: matchingPhrases[0]?.label ?? "Allgemein",
    explanation: "Regelbasierte Synonym-Schicht hat die Suche erweitert.",
    usedAI: false,
  };
}

function extractOutputText(responseData: unknown) {
  if (!responseData || typeof responseData !== "object") {
    return "";
  }

  const data = responseData as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        text?: unknown;
      }>;
    }>;
  };

  const outputText = getSafeString(data.output_text).trim();

  if (outputText) {
    return outputText;
  }

  return (
    data.output
      ?.flatMap((outputItem) => outputItem.content ?? [])
      .map((contentItem) => getSafeString(contentItem.text))
      .join("")
      .trim() ?? ""
  );
}

function parseAIResult(query: string, responseText: string): SearchInterpretResult {
  if (!responseText) {
    return getFallbackInterpretation(query);
  }

  try {
    const parsed = JSON.parse(responseText) as Partial<SearchInterpretResult>;

    const suggestedTerms = Array.isArray(parsed.suggestedTerms)
      ? parsed.suggestedTerms.map((term) => getSafeString(term).trim()).filter(Boolean)
      : [];

    const expandedQuery = getSafeString(parsed.expandedQuery).trim();

    return {
      expandedQuery:
        expandedQuery || uniqueValues([query, ...suggestedTerms]).join(" "),
      suggestedTerms: uniqueValues(suggestedTerms).slice(0, 16),
      detectedIntent:
        getSafeString(parsed.detectedIntent).trim() || "Allgemein",
      explanation:
        getSafeString(parsed.explanation).trim() ||
        "KI-Schicht hat die Suche semantisch erweitert.",
      usedAI: true,
    };
  } catch {
    return getFallbackInterpretation(query);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | SearchInterpretRequestBody
    | null;

  const query = getSafeString(body?.query).trim();

  if (!query) {
    return NextResponse.json(
      {
        message: "Suchbegriff ist erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const forceAI = body?.forceAI === true;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !shouldUseAIForQuery(query, forceAI)) {
    return NextResponse.json(getFallbackInterpretation(query));
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SEARCH_MODEL || "gpt-5",
        store: false,
        input: [
          {
            role: "system",
            content:
              "Du bist die semantische Suchschicht für Locario, eine regionale Plattform im Kanton Bern. Erweitere Suchanfragen in kurze, konkrete deutsche Suchbegriffe. Gib nur gültiges JSON zurück. Keine langen Erklärungen.",
          },
          {
            role: "user",
            content: `Suchanfrage: ${query}\n\nAufgabe: Erkenne die Absicht, übersetze Alltagssprache in passende Branchenbegriffe, korrigiere offensichtliche Schreibweisen und erweitere mit maximal 12 Suchbegriffen. Bewahre Ortsnamen. Keine erfundenen Firmen. Keine langen Sätze.`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "locario_search_interpretation",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                expandedQuery: {
                  type: "string",
                },
                suggestedTerms: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                detectedIntent: {
                  type: "string",
                },
                explanation: {
                  type: "string",
                },
              },
              required: [
                "expandedQuery",
                "suggestedTerms",
                "detectedIntent",
                "explanation",
              ],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(getFallbackInterpretation(query));
    }

    const data = await response.json();
    const responseText = extractOutputText(data);

    return NextResponse.json(parseAIResult(query, responseText));
  } catch {
    return NextResponse.json(getFallbackInterpretation(query));
  }
}
