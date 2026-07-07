import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type EventInquiryRequestBody = {
  status?: string;
};

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

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Event-Anfrage-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const inquiry = await prisma.eventInquiry.findUnique({
    where: {
      id,
    },
  });

  if (!inquiry) {
    return NextResponse.json(
      {
        message: "Event-Anfrage wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(mapEventInquiry(inquiry));
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Event-Anfrage-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const existingInquiry = await prisma.eventInquiry.findUnique({
    where: {
      id,
    },
  });

  if (!existingInquiry) {
    return NextResponse.json(
      {
        message: "Event-Anfrage wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  const body = (await request.json()) as EventInquiryRequestBody;

  const updatedInquiry = await prisma.eventInquiry.update({
    where: {
      id,
    },
    data: {
      status: body.status?.trim() || existingInquiry.status,
    },
  });

  return NextResponse.json(mapEventInquiry(updatedInquiry));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Event-Anfrage-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const existingInquiry = await prisma.eventInquiry.findUnique({
    where: {
      id,
    },
  });

  if (!existingInquiry) {
    return NextResponse.json(
      {
        message: "Event-Anfrage wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  await prisma.eventInquiry.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Event-Anfrage wurde erfolgreich gelöscht.",
    id,
  });
}