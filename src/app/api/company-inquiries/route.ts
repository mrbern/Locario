import { NextResponse } from "next/server";
import { canCompanyUseAdvertising } from "@/data/plans";
import { prisma } from "@/lib/prisma";

type CompanyInquiryRequestBody = {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;

  desiredPlan?: string;

  mainCategory?: string;
  subCategory?: string;
  subCategories?: string[];
  category?: string;

  description?: string;
  tags?: string[];
  searchTerms?: string[];

  adTitle?: string;
  adDescription?: string;
  adCta?: string;

  message?: string;
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

const allowedPublicPlans = ["starter", "pro", "premium"];

function getValidDesiredPlan(plan: string | undefined) {
  if (plan && allowedPublicPlans.includes(plan)) {
    return plan;
  }

  return "starter";
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

export async function GET() {
  const inquiries = await prisma.companyInquiry.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(inquiries.map(mapCompanyInquiry));
}

export async function POST(request: Request) {
  const body = (await request.json()) as CompanyInquiryRequestBody;

  const companyName = body.companyName?.trim();
  const contactName = body.contactName?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim() || null;
  const website = body.website?.trim() || null;
  const city = body.city?.trim();

  const desiredPlan = getValidDesiredPlan(body.desiredPlan);

  const mainCategory = body.mainCategory?.trim() || "";
  const selectedSubCategories = (body.subCategories ?? [])
    .map((subCategory) => subCategory.trim())
    .filter(Boolean);

  const fallbackSubCategory =
    body.subCategory?.trim() || body.category?.trim() || "";

  const subCategories =
    selectedSubCategories.length > 0
      ? selectedSubCategories
      : fallbackSubCategory
        ? [fallbackSubCategory]
        : [];

  const primarySubCategory = subCategories[0] || "";
  const category = primarySubCategory;

  const description = body.description?.trim();
  const tags = (body.tags ?? []).map((tag) => tag.trim()).filter(Boolean);

  const searchTerms =
    body.searchTerms && body.searchTerms.length > 0
      ? body.searchTerms.map((term) => term.trim()).filter(Boolean)
      : [
          mainCategory.toLowerCase(),
          ...subCategories.map((subCategory) => subCategory.toLowerCase()),
          ...tags.map((tag) => tag.toLowerCase()),
        ].filter(Boolean);

  const message = body.message?.trim();

  const advertisingAllowed = canCompanyUseAdvertising(desiredPlan);

  const adTitle = advertisingAllowed ? body.adTitle?.trim() || null : null;
  const adDescription = advertisingAllowed
    ? body.adDescription?.trim() || null
    : null;
  const adCta = advertisingAllowed ? body.adCta?.trim() || null : null;

  if (
    !companyName ||
    !contactName ||
    !email ||
    !city ||
    !mainCategory ||
    subCategories.length === 0 ||
    !description ||
    tags.length === 0 ||
    !message
  ) {
    return NextResponse.json(
      {
        message:
          "Firmenname, Kontaktperson, E-Mail, Stadt, Hauptkategorie, mindestens eine Unterkategorie, Beschreibung, Suchbegriffe und Nachricht sind erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const inquiry = await prisma.companyInquiry.create({
    data: {
      companyName,
      contactName,
      email,
      phone,
      website,
      city,

      desiredPlan,

      mainCategory,
      subCategory: primarySubCategory,
      subCategories: JSON.stringify(subCategories),
      category,

      description,
      tags: JSON.stringify(tags),
      searchTerms: JSON.stringify(searchTerms),

      adTitle,
      adDescription,
      adCta,

      message,
      status: "new",
    },
  });

  return NextResponse.json(mapCompanyInquiry(inquiry), {
    status: 201,
  });
}

