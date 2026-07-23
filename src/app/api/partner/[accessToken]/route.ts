import { NextResponse } from "next/server";
import { canCompanyUseAdvertising } from "@/data/plans";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    accessToken: string;
  }>;
};

type PartnerProfileRequestBody = {
  imageUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  ad?: {
    title?: string;
    description?: string;
    cta?: string;
  };
};

type PartnerCompanyLocation = {
  id: string;
  name: string;
  locationName: string | null;
  city: string;
  adress: string | null;
};

type PartnerCompany = {
  id: string;
  name: string;
  imageUrl: string | null;
  accessToken: string | null;
  plan: string;
  parentCompanyId: string | null;
  locationName: string | null;
  parentCompany: PartnerCompanyLocation | null;
  locations: PartnerCompanyLocation[];
  mainCategory: string;
  subCategory: string;
  subCategories: string;
  category: string;
  city: string;
  adress: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string;
  tags: string;
  searchTerms: string;
  createdAt: Date;
  updatedAt: Date;
  ad: {
    title: string;
    description: string;
    cta: string;
  } | null;
  leads: {
    id: string;
    companyId: string;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    message: string;
    sourceQuery: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

function getSafeString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmedValue);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => getSafeString(item).trim())
        .filter(Boolean);
    }
  } catch {
    // Fallback unten verwenden.
  }

  return trimmedValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCompanyDisplayName(company: {
  name: string;
  locationName: string | null;
}) {
  const locationName = company.locationName?.trim();

  if (locationName) {
    return `${company.name} · ${locationName}`;
  }

  return company.name;
}

function getCompanyRelationLabel(company: PartnerCompany) {
  if (company.parentCompany) {
    return `Standort von ${getCompanyDisplayName(company.parentCompany)}`;
  }

  if (company.locations.length > 0) {
    return `${company.locations.length} Standort${
      company.locations.length === 1 ? "" : "e"
    }`;
  }

  if (company.locationName) {
    return "Hauptsitz / Einzelstandort";
  }

  return "Einzelstandort";
}

function mapLocation(location: PartnerCompanyLocation) {
  return {
    id: location.id,
    name: location.name,
    locationName: location.locationName ?? "",
    city: location.city,
    address: location.adress ?? "",
    adress: location.adress ?? "",
  };
}

function mapPartnerDashboard(company: PartnerCompany) {
  const address = company.adress ?? "";
  const companyDisplayName = getCompanyDisplayName(company);
  const companyRelationLabel = getCompanyRelationLabel(company);

  return {
    company: {
      id: company.id,
      name: company.name,
      companyName: company.name,
      imageUrl: company.imageUrl ?? "",
      accessToken: company.accessToken ?? "",
      plan: company.plan,
      parentCompanyId: company.parentCompanyId ?? null,
      locationName: company.locationName ?? "",
      parentCompany: company.parentCompany
        ? mapLocation(company.parentCompany)
        : null,
      locations: company.locations.map(mapLocation),
      mainCategory: company.mainCategory,
      subCategory: company.subCategory,
      subCategories: parseJsonArray(company.subCategories),
      category: company.category,
      city: company.city,
      address,
      adress: address,
      latitude: company.latitude,
      longitude: company.longitude,
      phone: company.phone ?? "",
      email: company.email ?? "",
      website: company.website ?? "",
      description: company.description,
      tags: parseJsonArray(company.tags),
      searchTerms: parseJsonArray(company.searchTerms),
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      ad: company.ad
        ? {
            title: company.ad.title,
            description: company.ad.description,
            cta: company.ad.cta,
          }
        : null,
    },
    leads: company.leads.map((lead) => ({
      id: lead.id,
      companyId: lead.companyId,
      companyName: company.name,
      companyBaseName: company.name,
      companyDisplayName,
      companyLocationName: company.locationName ?? "",
      companyCity: company.city,
      companyAddress: address,
      companyParentCompanyId: company.parentCompanyId ?? "",
      companyParentName: company.parentCompany?.name ?? "",
      companyParentLocationName: company.parentCompany?.locationName ?? "",
      companyRelationLabel,
      customerName: lead.customerName,
      customerEmail: lead.customerEmail ?? "",
      customerPhone: lead.customerPhone ?? "",
      message: lead.message,
      sourceQuery: lead.sourceQuery ?? "",
      status: lead.status,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    })),
  };
}

async function findPartnerCompany(accessToken: string) {
  return prisma.company.findUnique({
    where: {
      accessToken,
    },
    include: {
      ad: true,
      parentCompany: {
        select: {
          id: true,
          name: true,
          locationName: true,
          city: true,
          adress: true,
        },
      },
      locations: {
        select: {
          id: true,
          name: true,
          locationName: true,
          city: true,
          adress: true,
        },
        orderBy: [
          {
            city: "asc" as const,
          },
          {
            name: "asc" as const,
          },
        ],
      },
      leads: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { accessToken } = await context.params;

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Kein Zugangscode übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const company = await findPartnerCompany(accessToken);

  if (!company) {
    return NextResponse.json(
      {
        message: "Partner-Zugang wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(mapPartnerDashboard(company));
}

export async function PUT(request: Request, context: RouteContext) {
  const { accessToken } = await context.params;

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Kein Zugangscode übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const existingCompany = await prisma.company.findUnique({
    where: {
      accessToken,
    },
    select: {
      id: true,
      plan: true,
    },
  });

  if (!existingCompany) {
    return NextResponse.json(
      {
        message: "Partner-Zugang wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  const body = (await request.json()) as PartnerProfileRequestBody;

  if (!body.description || !body.description.trim()) {
    return NextResponse.json(
      {
        message: "Beschreibung ist erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const hasAd = Boolean(
    body.ad?.title?.trim() ||
      body.ad?.description?.trim() ||
      body.ad?.cta?.trim()
  );

  const advertisingAllowed = canCompanyUseAdvertising(existingCompany.plan);

  if (hasAd && !advertisingAllowed) {
    return NextResponse.json(
      {
        message: "Werbeanzeigen sind in diesem Paket nicht verfügbar.",
      },
      {
        status: 403,
      }
    );
  }

  await prisma.company.update({
    where: {
      id: existingCompany.id,
    },
    data: {
      imageUrl:
        body.imageUrl !== undefined ? body.imageUrl.trim() || null : undefined,
      phone: body.phone !== undefined ? body.phone.trim() || null : undefined,
      email: body.email !== undefined ? body.email.trim() || null : undefined,
      website:
        body.website !== undefined ? body.website.trim() || null : undefined,
      description: body.description.trim(),
    },
  });

  if (advertisingAllowed && hasAd) {
    await prisma.advertisement.upsert({
      where: {
        companyId: existingCompany.id,
      },
      create: {
        companyId: existingCompany.id,
        title: body.ad?.title?.trim() || "Aktuelles Angebot",
        description: body.ad?.description?.trim() || "",
        cta: body.ad?.cta?.trim() || "Mehr erfahren",
      },
      update: {
        title: body.ad?.title?.trim() || "Aktuelles Angebot",
        description: body.ad?.description?.trim() || "",
        cta: body.ad?.cta?.trim() || "Mehr erfahren",
      },
    });
  } else {
    await prisma.advertisement.deleteMany({
      where: {
        companyId: existingCompany.id,
      },
    });
  }

  const updatedCompany = await findPartnerCompany(accessToken);

  if (!updatedCompany) {
    return NextResponse.json(
      {
        message: "Firma konnte nach dem Speichern nicht geladen werden.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(mapPartnerDashboard(updatedCompany));
}
