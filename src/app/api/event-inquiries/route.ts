import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type EventInquiryRequestBody = {
  eventTitle?: string;
  organizerName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;

  desiredPlan?: string;

  category?: string;
  locationName?: string;
  eventDate?: string;

  description?: string;
  tags?: string[];

  message?: string;
  status?: string;
};

const allowedPlans = ["basic", "highlight", "premium"];

function getValidPlan(plan: string | undefined) {
  if (plan && allowedPlans.includes(plan)) {
    return plan;
  }

  return "highlight";
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

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string");
    }

    return [];
  } catch {
    return [];
  }
}

function mapEventInquiry(inquiry: {
  id: string;
  eventTitle: string;
  organizerName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  city: string;
  desiredPlan: string;
  category: string;
  locationName: string | null;
  eventDate: Date | null;
  description: string;
  tags: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: inquiry.id,

    eventTitle: inquiry.eventTitle,
    organizerName: inquiry.organizerName,
    contactName: inquiry.contactName,
    email: inquiry.email,
    phone: inquiry.phone ?? "",
    website: inquiry.website ?? "",
    city: inquiry.city,

    desiredPlan: inquiry.desiredPlan,

    category: inquiry.category,
    locationName: inquiry.locationName ?? "",
    eventDate: inquiry.eventDate?.toISOString() ?? "",

    description: inquiry.description,
    tags: parseJsonArray(inquiry.tags),

    message: inquiry.message,
    status: inquiry.status,

    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt.toISOString(),
  };
}

export async function GET() {
  const inquiries = await prisma.eventInquiry.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(inquiries.map(mapEventInquiry));
}

export async function POST(request: Request) {
  const body = (await request.json()) as EventInquiryRequestBody;

  if (
    !body.eventTitle?.trim() ||
    !body.organizerName?.trim() ||
    !body.contactName?.trim() ||
    !body.email?.trim() ||
    !body.city?.trim() ||
    !body.description?.trim() ||
    !body.message?.trim()
  ) {
    return NextResponse.json(
      {
        message:
          "Eventtitel, Veranstalter, Kontaktperson, E-Mail, Stadt, Beschreibung und Nachricht sind erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const inquiry = await prisma.eventInquiry.create({
    data: {
      eventTitle: body.eventTitle.trim(),
      organizerName: body.organizerName.trim(),
      contactName: body.contactName.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || null,
      website: body.website?.trim() || null,
      city: body.city.trim(),

      desiredPlan: getValidPlan(body.desiredPlan),

      category: body.category?.trim() || "Sonstiges",
      locationName: body.locationName?.trim() || null,
      eventDate: parseDate(body.eventDate),

      description: body.description.trim(),
      tags: JSON.stringify(body.tags ?? []),

      message: body.message.trim(),
      status: body.status?.trim() || "new",
    },
  });

  return NextResponse.json(mapEventInquiry(inquiry), {
    status: 201,
  });
}