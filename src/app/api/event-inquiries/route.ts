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
  address?: string;

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
  address: string | null;
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
    address: inquiry.address ?? "",

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

  const eventTitle = body.eventTitle?.trim();
  const organizerName = body.organizerName?.trim();
  const contactName = body.contactName?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim() || null;
  const website = body.website?.trim() || null;
  const city = body.city?.trim();
  const address = body.address?.trim();

  const category = body.category?.trim() || "Sonstiges";
  const locationName = body.locationName?.trim() || null;
  const description = body.description?.trim();
  const message = body.message?.trim();

  const tags = (body.tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (
    !eventTitle ||
    !organizerName ||
    !contactName ||
    !email ||
    !city ||
    !address ||
    !description ||
    !message
  ) {
    return NextResponse.json(
      {
        message:
          "Eventtitel, Veranstalter, Kontaktperson, E-Mail, Stadt, Adresse, Beschreibung und Nachricht sind erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const inquiry = await prisma.eventInquiry.create({
    data: {
      eventTitle,
      organizerName,
      contactName,
      email,
      phone,
      website,
      city,
      address,

      desiredPlan: getValidPlan(body.desiredPlan),

      category,
      locationName,
      eventDate: parseDate(body.eventDate),

      description,
      tags: JSON.stringify(tags),

      message,
      status: body.status?.trim() || "new",
    },
  });

  return NextResponse.json(mapEventInquiry(inquiry), {
    status: 201,
  });
}