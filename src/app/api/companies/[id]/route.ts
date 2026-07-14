import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  canCompanyUseAdvertising,
  canCompanyUsePartnerDashboard,
} from "@/data/plans";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CompanyRequestBody = {
  name?: string;
  imageUrl?: string;
  plan?: string;

  parentCompanyId?: string | null;
  locationName?: string | null;

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

type CompanySummaryFromDatabase = {
  id: string;
  name: string;
  locationName: string | null;
  city: string;
  adress: string | null;
};

type CompanyWithRelations = {
  id: string;
  name: string;
  imageUrl: string | null;
  accessToken: string | null;
  plan: string;

  parentCompanyId: string | null;
  locationName: string | null;
  parentCompany: CompanySummaryFromDatabase | null;
  locations: CompanySummaryFromDatabase[];

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
  createdAt?: Date;
  updatedAt?: Date;
  ad: {
    title: string;
    description: string;
    cta: string;
  } | null;
};

type ParentCompanyChainRecord = {
  parentCompanyId: string | null;
};

const allowedPlans = ["pilot", "starter", "pro", "premium"];

const companySummarySelect = {
  id: true,
  name: true,
  locationName: true,
  city: true,
  adress: true,
};

const companyInclude = {
  ad: true,
  parentCompany: {
    select: companySummarySelect,
  },
  locations: {
    select: companySummarySelect,
    orderBy: [
      {
        city: "asc" as const,
      },
      {
        name: "asc" as const,
      },
    ],
  },
};

function createAccessToken() {
  return randomUUID().replace(/-/g, "");
}

function getValidPlan(plan: string | undefined, fallbackPlan = "pilot") {
  if (plan && allowedPlans.includes(plan)) {
    return plan;
  }

  return fallbackPlan;
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

function cleanNullableString(value: string | null | undefined) {
  const cleanedValue = value?.trim() ?? "";

  return cleanedValue || null;
}

function getRequestAddress(body: CompanyRequestBody, fallbackAddress = "") {
  if (body.address !== undefined) {
    return body.address.trim();
  }

  if (body.adress !== undefined) {
    return body.adress.trim();
  }

  return fallbackAddress;
}

function getUpdatedCoordinate(
  value: number | null | undefined,
  fallbackValue: number | null
) {
  if (value === undefined) {
    return fallbackValue;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function mapCompanySummary(company: CompanySummaryFromDatabase | null) {
  if (!company) {
    return null;
  }

  return {
    id: company.id,
    name: company.name,
    locationName: company.locationName ?? "",
    city: company.city,
    address: company.adress ?? "",
    adress: company.adress ?? "",
  };
}

async function parentWouldCreateCycle(
  requestedParentCompanyId: string,
  ownCompanyId: string
) {
  let currentParentCompanyId: string | null = requestedParentCompanyId;
  const visitedCompanyIds = new Set<string>();

  while (currentParentCompanyId) {
    if (currentParentCompanyId === ownCompanyId) {
      return true;
    }

    if (visitedCompanyIds.has(currentParentCompanyId)) {
      return true;
    }

    visitedCompanyIds.add(currentParentCompanyId);

    const parentRecord: ParentCompanyChainRecord | null =
      await prisma.company.findUnique({
        where: {
          id: currentParentCompanyId,
        },
        select: {
          parentCompanyId: true,
        },
      });

    currentParentCompanyId = parentRecord?.parentCompanyId ?? null;
  }

  return false;
}

async function getValidParentCompanyId(
  parentCompanyId: string | null,
  ownCompanyId: string
) {
  if (!parentCompanyId) {
    return null;
  }

  if (parentCompanyId === ownCompanyId) {
    throw new Error("Eine Firma kann nicht ihr eigener Hauptstandort sein.");
  }

  const parentCompany = await prisma.company.findUnique({
    where: {
      id: parentCompanyId,
    },
    select: {
      id: true,
    },
  });

  if (!parentCompany) {
    throw new Error("Die ausgewählte Hauptfirma wurde nicht gefunden.");
  }

  const createsCycle = await parentWouldCreateCycle(parentCompanyId, ownCompanyId);

  if (createsCycle) {
    throw new Error(
      "Diese Standort-Verknüpfung ist nicht möglich, weil dadurch eine Schleife entstehen würde."
    );
  }

  return parentCompany.id;
}

async function syncAccessTokenForPlan(company: CompanyWithRelations) {
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
      include: companyInclude,
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
      include: companyInclude,
    });
  }

  return company;
}

function mapCompany(company: CompanyWithRelations) {
  const parsedSubCategories = parseJsonArray(company.subCategories);
  const shouldShowAccessToken = canCompanyUsePartnerDashboard(company.plan);
  const address = company.adress ?? "";

  return {
    id: company.id,
    name: company.name,
    imageUrl: company.imageUrl ?? "",
    accessToken: shouldShowAccessToken ? company.accessToken ?? "" : "",
    plan: company.plan,

    parentCompanyId: company.parentCompanyId,
    locationName: company.locationName ?? "",
    parentCompany: mapCompanySummary(company.parentCompany),
    locations: company.locations.map(mapCompanySummary).filter(Boolean),

    mainCategory: company.mainCategory,
    subCategory: company.subCategory,
    subCategories:
      parsedSubCategories.length > 0
        ? parsedSubCategories
        : [company.subCategory].filter(Boolean),
    category: company.category,
    city: company.city,
    address,
    adress: address,
    phone: company.phone ?? "",
    email: company.email ?? "",
    website: company.website ?? "",
    description: company.description,
    tags: parseJsonArray(company.tags),
    searchTerms: parseJsonArray(company.searchTerms),
    latitude: company.latitude,
    longitude: company.longitude,
    ad:
      company.ad && canCompanyUseAdvertising(company.plan)
        ? {
            title: company.ad.title,
            description: company.ad.description,
            cta: company.ad.cta,
          }
        : undefined,
    createdAt: company.createdAt?.toISOString(),
    updatedAt: company.updatedAt?.toISOString(),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Firmen-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const company = await prisma.company.findUnique({
    where: {
      id,
    },
    include: companyInclude,
  });

  if (!company) {
    return NextResponse.json(
      {
        message: "Firma wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  const companyWithCorrectAccessToken = await syncAccessTokenForPlan(company);

  return NextResponse.json(mapCompany(companyWithCorrectAccessToken));
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Firmen-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const existingCompany = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!existingCompany) {
    return NextResponse.json(
      {
        message: "Firma wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  const body = (await request.json()) as CompanyRequestBody;

  const plan = getValidPlan(body.plan, existingCompany.plan);
  const mainCategory = body.mainCategory?.trim() || "Allgemein";

  const requestedParentCompanyId =
    body.parentCompanyId !== undefined
      ? cleanNullableString(body.parentCompanyId)
      : existingCompany.parentCompanyId;

  const locationName =
    body.locationName !== undefined
      ? cleanNullableString(body.locationName)
      : existingCompany.locationName;

  let parentCompanyId: string | null = null;

  try {
    parentCompanyId = await getValidParentCompanyId(requestedParentCompanyId, id);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Die Standort-Verknüpfung konnte nicht geprüft werden.",
      },
      {
        status: 400,
      }
    );
  }

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
  const address = getRequestAddress(body, existingCompany.adress ?? "");

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

  await prisma.company.update({
    where: {
      id,
    },
    data: {
      name: body.name.trim(),
      imageUrl:
        body.imageUrl !== undefined
          ? body.imageUrl.trim() || null
          : existingCompany.imageUrl,
      accessToken: hasPartnerAccess
        ? existingCompany.accessToken || createAccessToken()
        : null,
      plan,

      parentCompanyId,
      locationName,

      mainCategory,
      subCategory: primarySubCategory,
      subCategories: JSON.stringify(subCategories),
      category,
      city: body.city.trim(),
      adress: address || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      website: body.website?.trim() || null,
      description: body.description.trim(),
      tags: JSON.stringify(tags),
      searchTerms: JSON.stringify(searchTerms),
      latitude: getUpdatedCoordinate(body.latitude, existingCompany.latitude),
      longitude: getUpdatedCoordinate(body.longitude, existingCompany.longitude),
    },
  });

  if (hasAd) {
    await prisma.advertisement.upsert({
      where: {
        companyId: id,
      },
      create: {
        companyId: id,
        title: body.ad?.title || "Aktuelles Angebot",
        description: body.ad?.description || "",
        cta: body.ad?.cta || "Mehr erfahren",
      },
      update: {
        title: body.ad?.title || "Aktuelles Angebot",
        description: body.ad?.description || "",
        cta: body.ad?.cta || "Mehr erfahren",
      },
    });
  } else {
    await prisma.advertisement.deleteMany({
      where: {
        companyId: id,
      },
    });
  }

  const updatedCompany = await prisma.company.findUnique({
    where: {
      id,
    },
    include: companyInclude,
  });

  if (!updatedCompany) {
    return NextResponse.json(
      {
        message: "Firma konnte nach dem Bearbeiten nicht geladen werden.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(mapCompany(updatedCompany));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Firmen-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const existingCompany = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!existingCompany) {
    return NextResponse.json(
      {
        message: "Firma wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  await prisma.company.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Firma wurde erfolgreich gelöscht.",
    id,
  });
}