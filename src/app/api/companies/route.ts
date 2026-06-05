import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  canCompanyUseAdvertising,
  canCompanyUsePartnerDashboard,
} from "@/data/plans";

type CompanyRequestBody = {
  name?: string;
  imageUrl?: string;
  plan?: string;

  mainCategory?: string;
  subCategory?: string;
  subCategories?: string[];

  category?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  tags?: string[];
  searchTerms?: string[];
  ad?: {
    title?: string;
    description?: string;
    cta?: string;
  };
};

type CompanyWithAd = {
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
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string;
  tags: string;
  searchTerms: string;
  ad: {
    title: string;
    description: string;
    cta: string;
  } | null;
};

const allowedPlans = ["pilot", "starter", "pro", "premium"];

function createAccessToken() {
  return randomUUID().replace(/-/g, "");
}

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
      return parsed.filter((item) => typeof item === "string");
    }

    return [];
  } catch {
    return [];
  }
}

async function syncAccessTokenForPlan(company: CompanyWithAd) {
  const shouldHavePartnerAccess = canCompanyUsePartnerDashboard(company.plan);

  if (shouldHavePartnerAccess && company.accessToken) {
    return company;
  }

  if (shouldHavePartnerAccess && !company.accessToken) {
    return prisma.company.update({
      where: {
        id: company.id,
      },
      data: {
        accessToken: createAccessToken(),
      },
      include: {
        ad: true,
      },
    });
  }

  if (!shouldHavePartnerAccess && company.accessToken) {
    return prisma.company.update({
      where: {
        id: company.id,
      },
      data: {
        accessToken: null,
      },
      include: {
        ad: true,
      },
    });
  }

  return company;
}

function mapCompany(company: CompanyWithAd) {
  const parsedSubCategories = parseJsonArray(company.subCategories);
  const shouldShowAccessToken = canCompanyUsePartnerDashboard(company.plan);

  return {
    id: company.id,
    name: company.name,
    imageUrl: company.imageUrl ?? "",
    accessToken: shouldShowAccessToken ? company.accessToken ?? "" : "",
    plan: company.plan,
    mainCategory: company.mainCategory,
    subCategory: company.subCategory,
    subCategories:
      parsedSubCategories.length > 0
        ? parsedSubCategories
        : [company.subCategory].filter(Boolean),
    category: company.category,
    city: company.city,
    phone: company.phone ?? "",
    email: company.email ?? "",
    website: company.website ?? "",
    description: company.description,
    tags: parseJsonArray(company.tags),
    searchTerms: parseJsonArray(company.searchTerms),
    ad:
      company.ad && canCompanyUseAdvertising(company.plan)
        ? {
            title: company.ad.title,
            description: company.ad.description,
            cta: company.ad.cta,
          }
        : undefined,
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

  const companiesWithCorrectAccessTokens = await Promise.all(
    companies.map((company) => syncAccessTokenForPlan(company))
  );

  return NextResponse.json(companiesWithCorrectAccessTokens.map(mapCompany));
}

export async function POST(request: Request) {
  const body = (await request.json()) as CompanyRequestBody;

  const plan = getValidPlan(body.plan);
  const mainCategory = body.mainCategory?.trim() || "Allgemein";

  const selectedSubCategories = (body.subCategories ?? [])
    .map((subCategory) => subCategory.trim())
    .filter(Boolean);

  const fallbackSubCategory =
    body.subCategory?.trim() || body.category?.trim() || "Allgemein";

  const subCategories =
    selectedSubCategories.length > 0
      ? selectedSubCategories
      : [fallbackSubCategory];

  const primarySubCategory = subCategories[0] || "Allgemein";
  const category = primarySubCategory;

  if (
    !body.name ||
    !mainCategory ||
    subCategories.length === 0 ||
    !body.city ||
    !body.description
  ) {
    return NextResponse.json(
      {
        message:
          "Firmenname, Hauptkategorie, mindestens eine Unterkategorie, Stadt und Beschreibung sind erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const tags = body.tags ?? [];

  const searchTerms =
    body.searchTerms && body.searchTerms.length > 0
      ? body.searchTerms
      : [
          mainCategory.toLowerCase(),
          ...subCategories.map((subCategory) => subCategory.toLowerCase()),
          ...tags.map((tag) => tag.toLowerCase()),
        ];

  const hasPartnerAccess = canCompanyUsePartnerDashboard(plan);

  const hasAd =
    canCompanyUseAdvertising(plan) &&
    (body.ad?.title?.trim() ||
      body.ad?.description?.trim() ||
      body.ad?.cta?.trim());

  const company = await prisma.company.create({
    data: {
      name: body.name.trim(),
      imageUrl: body.imageUrl?.trim() || null,
      accessToken: hasPartnerAccess ? createAccessToken() : null,
      plan,
      mainCategory,
      subCategory: primarySubCategory,
      subCategories: JSON.stringify(subCategories),
      category,
      city: body.city.trim(),
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      website: body.website?.trim() || null,
      description: body.description.trim(),
      tags: JSON.stringify(tags),
      searchTerms: JSON.stringify(searchTerms),
      ad: hasAd
        ? {
            create: {
              title: body.ad?.title || "Aktuelles Angebot",
              description: body.ad?.description || "",
              cta: body.ad?.cta || "Mehr erfahren",
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