import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type EventRequestBody = {
  title?: string;
  imageUrl?: string;

  organizerName?: string;
  category?: string;
  plan?: string;

  city?: string;
  locationName?: string;
  address?: string;

  latitude?: number | null;
  longitude?: number | null;

  description?: string;

  tags?: string[];
  searchTerms?: string[];

  startsAt?: string;
  endsAt?: string;

  website?: string;
  ticketUrl?: string;

  isActive?: boolean;
  highlightUntil?: string;
};

const allowedPlans = ["basic", "highlight", "premium"];

function getValidPlan(plan: string | undefined) {
  if (plan && allowedPlans.includes(plan)) {
    return plan;
  }

  return "basic";
}

function parseDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getValidCoordinate(value: number | null | undefined) {
  if (typeof value !== "number") {
    return null;
  }

  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (typeof item === "number" || typeof item === "boolean") {
        return String(item).trim();
      }

      return "";
    })
    .filter(Boolean);
}

function parseStoredStringArray(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") {
            return item.trim();
          }

          if (typeof item === "number" || typeof item === "boolean") {
            return String(item).trim();
          }

          return "";
        })
        .filter(Boolean);
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function mapEvent(event: {
  id: string;
  title: string;
  imageUrl: string | null;
  organizerName: string;
  category: string;
  plan: string;
  city: string;
  locationName: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string;
  tags: string;
  searchTerms: string;
  startsAt: Date;
  endsAt: Date | null;
  website: string | null;
  ticketUrl: string | null;
  isActive: boolean;
  highlightUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: event.id,
    title: event.title,
    imageUrl: event.imageUrl ?? "",
    organizerName: event.organizerName,
    category: event.category,
    plan: event.plan,
    city: event.city,
    locationName: event.locationName ?? "",
    address: event.address ?? "",
    latitude: event.latitude,
    longitude: event.longitude,
    description: event.description,
    tags: parseStoredStringArray(event.tags),
    searchTerms: parseStoredStringArray(event.searchTerms),
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? "",
    website: event.website ?? "",
    ticketUrl: event.ticketUrl ?? "",
    isActive: event.isActive,
    highlightUntil: event.highlightUntil?.toISOString() ?? "",
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: [
      {
        startsAt: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return NextResponse.json(events.map(mapEvent));
}

export async function POST(request: Request) {
  const body = (await request.json()) as EventRequestBody;

  const startsAt = parseDate(body.startsAt);
  const endsAt = parseDate(body.endsAt);
  const highlightUntil = parseDate(body.highlightUntil);

  if (
    !body.title?.trim() ||
    !body.organizerName?.trim() ||
    !body.category?.trim() ||
    !body.city?.trim() ||
    !body.description?.trim() ||
    !startsAt
  ) {
    return NextResponse.json(
      {
        message:
          "Titel, Veranstalter, Kategorie, Stadt, Beschreibung und Startdatum sind erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const tags = getStringArray(body.tags);
  const searchTerms = getStringArray(body.searchTerms);

  const event = await prisma.event.create({
    data: {
      title: body.title.trim(),
      imageUrl: body.imageUrl?.trim() || null,
      organizerName: body.organizerName.trim(),
      category: body.category.trim(),
      plan: getValidPlan(body.plan),
      city: body.city.trim(),
      locationName: body.locationName?.trim() || null,
      address: body.address?.trim() || null,
      latitude: getValidCoordinate(body.latitude),
      longitude: getValidCoordinate(body.longitude),
      description: body.description.trim(),
      tags: JSON.stringify(tags),
      searchTerms: JSON.stringify(searchTerms),
      startsAt,
      endsAt,
      website: body.website?.trim() || null,
      ticketUrl: body.ticketUrl?.trim() || null,
      isActive: body.isActive ?? true,
      highlightUntil,
    },
  });

  return NextResponse.json(mapEvent(event), {
    status: 201,
  });
}