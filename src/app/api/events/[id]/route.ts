import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

function getValidPlan(plan: string | undefined, fallbackPlan = "basic") {
  if (plan && allowedPlans.includes(plan)) {
    return plan;
  }

  return fallbackPlan;
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

function getUpdatedRequiredString(value: string | undefined, fallback: string) {
  if (value === undefined) {
    return fallback;
  }

  return value.trim();
}

function getUpdatedNullableString(
  value: string | undefined,
  fallback: string | null
) {
  if (value === undefined) {
    return fallback;
  }

  return value.trim() || null;
}

function getUpdatedCoordinate(
  value: number | null | undefined,
  fallback: number | null
) {
  if (value === undefined) {
    return fallback;
  }

  return getValidCoordinate(value);
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

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Event-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!event) {
    return NextResponse.json(
      {
        message: "Event wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(mapEvent(event));
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Event-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const existingEvent = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!existingEvent) {
    return NextResponse.json(
      {
        message: "Event wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  const body = (await request.json()) as EventRequestBody;

  const title = getUpdatedRequiredString(body.title, existingEvent.title);
  const organizerName = getUpdatedRequiredString(
    body.organizerName,
    existingEvent.organizerName
  );
  const category = getUpdatedRequiredString(
    body.category,
    existingEvent.category
  );
  const city = getUpdatedRequiredString(body.city, existingEvent.city);
  const description = getUpdatedRequiredString(
    body.description,
    existingEvent.description
  );

  const startsAt =
    body.startsAt === undefined
      ? existingEvent.startsAt
      : parseDate(body.startsAt);

  const endsAt =
    body.endsAt === undefined ? existingEvent.endsAt : parseDate(body.endsAt);

  const highlightUntil =
    body.highlightUntil === undefined
      ? existingEvent.highlightUntil
      : parseDate(body.highlightUntil);

  if (
    !title ||
    !organizerName ||
    !category ||
    !city ||
    !description ||
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

  const tags =
    body.tags === undefined
      ? parseStoredStringArray(existingEvent.tags)
      : getStringArray(body.tags);

  const searchTerms =
    body.searchTerms === undefined
      ? parseStoredStringArray(existingEvent.searchTerms)
      : getStringArray(body.searchTerms);

  const updatedEvent = await prisma.event.update({
    where: {
      id,
    },
    data: {
      title,
      imageUrl: getUpdatedNullableString(body.imageUrl, existingEvent.imageUrl),

      organizerName,
      category,
      plan: getValidPlan(body.plan, existingEvent.plan),

      city,
      locationName: getUpdatedNullableString(
        body.locationName,
        existingEvent.locationName
      ),
      address: getUpdatedNullableString(body.address, existingEvent.address),

      latitude: getUpdatedCoordinate(body.latitude, existingEvent.latitude),
      longitude: getUpdatedCoordinate(body.longitude, existingEvent.longitude),

      description,

      tags: JSON.stringify(tags),
      searchTerms: JSON.stringify(searchTerms),

      startsAt,
      endsAt,

      website: getUpdatedNullableString(body.website, existingEvent.website),
      ticketUrl: getUpdatedNullableString(
        body.ticketUrl,
        existingEvent.ticketUrl
      ),

      isActive:
        body.isActive === undefined ? existingEvent.isActive : body.isActive,

      highlightUntil,
    },
  });

  return NextResponse.json(mapEvent(updatedEvent));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Event-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const existingEvent = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!existingEvent) {
    return NextResponse.json(
      {
        message: "Event wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  await prisma.event.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Event wurde erfolgreich gelöscht.",
    id,
  });
}