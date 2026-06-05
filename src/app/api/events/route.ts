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

  description?: string;

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
      description: body.description.trim(),
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