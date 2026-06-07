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

  description?: string;

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
  description: string;
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
    description: event.description,
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

  const updatedEvent = await prisma.event.update({
    where: {
      id,
    },
    data: {
      title: body.title.trim(),
      imageUrl:
        body.imageUrl !== undefined
          ? body.imageUrl.trim() || null
          : existingEvent.imageUrl,
      organizerName: body.organizerName.trim(),
      category: body.category.trim(),
      plan: getValidPlan(body.plan, existingEvent.plan),
      city: body.city.trim(),
      locationName: body.locationName?.trim() || null,
      address: body.address?.trim() || null,
      description: body.description.trim(),
      startsAt,
      endsAt,
      website: body.website?.trim() || null,
      ticketUrl: body.ticketUrl?.trim() || null,
      isActive: body.isActive ?? existingEvent.isActive,
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
