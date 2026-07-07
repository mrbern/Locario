import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  canCompanyUseAdvertising,
  canCompanyUsePartnerDashboard,
} from "@/data/plans";
import { prisma } from "@/lib/prisma";

type CompanyRequestBody = {
  name?: string;
  companyName?: string;
  imageUrl?: string;

  plan?: string;

  mainCategory?: string;
  subCategory?: string;
  subCategories?: string[];
  category?: string;

  city?: string;
  address?: string;
  adress?: string;

  phone?: string;
  email?: string;
  website?: string;

  description?: string;
  tags?: string[];
  searchTerms?: string[];

  latitude?: number | null;
  longitude?: number | null;

  ad?: {
    title?: string;
    description?: string;
    cta?: string;
  };
};

type CompanyFromDatabase = {
  id: string;
  name: string;

  imageUrl: string | null;

  accessToken: string | null;
  plan: string;

  mainCategory: string;
  subCategory: string;
  subCategories: string;

  category: string;
  city: string;
  adress: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string;
  tags: string;
  searchTerms: string;

  latitude: number | null;
  longitude: number | null;

  ad: {
    id: string;
    title: string;
    description: string;
    cta: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;

  createdAt: Date;
  updatedAt: Date;
};

const allowedPlans = ["pilot", "starter", "pro", "premium"];

function getValidPlan(plan: string | undefined) {
  if (plan && allowedPlans.includes(plan)) {
    return plan;
  }

  return "pilot";
}

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item ?? "").trim())
        .filter(Boolean);
    }

    return [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function cleanStringArray(values: string[] | undefined) {
  return (values ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
}

function mapCompany(company: CompanyFromDatabase) {
  return {
    id: company.id,
    name: company.name,

    imageUrl: company.imageUrl ?? "",

    accessToken: company.accessToken ?? "",
    plan: company.plan,

    mainCategory: company.mainCategory,
    subCategory: company.subCategory,
    subCategories: parseJsonArray(company.subCategories),

    category: company.category,
    city: company.city,
    address: company.adress ?? "",
    adress: company.adress ?? "",

    phone: company.phone ?? "",
    email: company.email ?? "",
    website: company.website ?? "",

    description: company.description,
    tags: parseJsonArray(company.tags),
    searchTerms: parseJsonArray(company.searchTerms),

    latitude: company.latitude,
    longitude: company.longitude,

    ad: company.ad
      ? {
          id: company.ad.id,
          title: company.ad.title,
          description: company.ad.description,
          cta: company.ad.cta,
          companyId: company.ad.companyId,
          createdAt: company.ad.createdAt.toISOString(),
          updatedAt: company.ad.updatedAt.toISOString(),
        }
      : null,

    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export async function GET() {
  const companies = await prisma.company.findMany({
    include: {
      ad: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(companies.map(mapCompany));
}

export async function POST(request: Request) {
  const body = (await request.json()) as CompanyRequestBody;

  const name = body.name?.trim() || body.companyName?.trim() || "";
  const imageUrl = body.imageUrl?.trim() || null;

  const plan = getValidPlan(body.plan);

  const mainCategory = body.mainCategory?.trim() || "Allgemein";

  const selectedSubCategories = cleanStringArray(body.subCategories);
  const fallbackSubCategory =
    body.subCategory?.trim() || body.category?.trim() || "";

  const subCategories =
    selectedSubCategories.length > 0
      ? selectedSubCategories
      : fallbackSubCategory
        ? [fallbackSubCategory]
        : [];

  const primarySubCategory = subCategories[0] || "Allgemein";
  const category = body.category?.trim() || primarySubCategory;

  const city = body.city?.trim() || "";
  const address = body.address?.trim() || body.adress?.trim() || null;

  const phone = body.phone?.trim() || null;
  const email = body.email?.trim() || null;
  const website = body.website?.trim() || null;

  const description = body.description?.trim() || "";
  const tags = cleanStringArray(body.tags);

  const searchTerms =
    body.searchTerms && body.searchTerms.length > 0
      ? cleanStringArray(body.searchTerms)
      : [
          mainCategory.toLowerCase(),
          ...subCategories.map((subCategory) => subCategory.toLowerCase()),
          ...tags.map((tag) => tag.toLowerCase()),
        ].filter(Boolean);

  const latitude =
    typeof body.latitude === "number" && Number.isFinite(body.latitude)
      ? body.latitude
      : null;

  const longitude =
    typeof body.longitude === "number" && Number.isFinite(body.longitude)
      ? body.longitude
      : null;

  const advertisingAllowed = canCompanyUseAdvertising(plan);
  const partnerDashboardAllowed = canCompanyUsePartnerDashboard(plan);

  const adTitle = body.ad?.title?.trim() || "";
  const adDescription = body.ad?.description?.trim() || "";
  const adCta = body.ad?.cta?.trim() || "";

  const shouldCreateAd =
    advertisingAllowed && Boolean(adTitle || adDescription || adCta);

  if (!name || !city || !category || !description) {
    return NextResponse.json(
      {
        message:
          "Firmenname, Stadt, Kategorie und Beschreibung sind erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const company = await prisma.company.create({
    data: {
      name,
      imageUrl,

      accessToken: partnerDashboardAllowed ? randomUUID() : null,
      plan,

      mainCategory,
      subCategory: primarySubCategory,
      subCategories: JSON.stringify(subCategories),

      category,
      city,
      adress: address,

      phone,
      email,
      website,

      description,
      tags: JSON.stringify(tags),
      searchTerms: JSON.stringify(searchTerms),

      latitude,
      longitude,

      ad: shouldCreateAd
        ? {
            create: {
              title: adTitle || "Angebot",
              description: adDescription || "Mehr Informationen zur Firma.",
              cta: adCta || "Mehr erfahren",
            },
          }
        : undefined,
    },
    include: {
      ad: true,
    },
  });

  return NextResponse.json(mapCompany(company), {
    status: 201,
  });
}