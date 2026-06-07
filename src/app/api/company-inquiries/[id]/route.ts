import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CompanyInquiryStatusRequestBody = {
  status?: string;
};

type CompanyInquiryFromDatabase = {
  id: string;

  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  city: string;

  desiredPlan: string;

  mainCategory: string;
  subCategory: string;
  subCategories: string;
  category: string;

  description: string;
  tags: string;
  searchTerms: string;

  adTitle: string | null;
  adDescription: string | null;
  adCta: string | null;

  message: string;
  status: string;

  createdAt: Date;
  updatedAt: Date;
};

const allowedStatuses = ["new", "contacted", "converted", "rejected"];

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

function mapCompanyInquiry(inquiry: CompanyInquiryFromDatabase) {
  return {
    id: inquiry.id,

    companyName: inquiry.companyName,
    contactName: inquiry.contactName,
    email: inquiry.email,
    phone: inquiry.phone ?? "",
    website: inquiry.website ?? "",
    city: inquiry.city,

    desiredPlan: inquiry.desiredPlan,

    mainCategory: inquiry.mainCategory,
    subCategory: inquiry.subCategory,
    subCategories: parseJsonArray(inquiry.subCategories),
    category: inquiry.category,

    description: inquiry.description,
    tags: parseJsonArray(inquiry.tags),
    searchTerms: parseJsonArray(inquiry.searchTerms),

    adTitle: inquiry.adTitle ?? "",
    adDescription: inquiry.adDescription ?? "",
    adCta: inquiry.adCta ?? "",

    message: inquiry.message,
    status: inquiry.status,

    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt.toISOString(),
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Firmenanfrage-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const body = (await request.json()) as CompanyInquiryStatusRequestBody;

  if (!body.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json(
      {
        message: "Ungültiger Status für Firmenanfrage.",
      },
      {
        status: 400,
      }
    );
  }

  const existingInquiry = await prisma.companyInquiry.findUnique({
    where: {
      id,
    },
  });

  if (!existingInquiry) {
    return NextResponse.json(
      {
        message: "Firmenanfrage wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  const updatedInquiry = await prisma.companyInquiry.update({
    where: {
      id,
    },
    data: {
      status: body.status,
    },
  });

  return NextResponse.json(mapCompanyInquiry(updatedInquiry));
}
