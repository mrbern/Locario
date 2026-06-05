import { NextResponse } from "next/server";
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

function mapPartnerDashboard(company: {
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
}) {
  return {
    company: {
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
      phone: company.phone ?? "",
      email: company.email ?? "",
      website: company.website ?? "",
      description: company.description,
      tags: parseJsonArray(company.tags),
      searchTerms: parseJsonArray(company.searchTerms),
      ad: company.ad
        ? {
            title: company.ad.title,
            description: company.ad.description,
            cta: company.ad.cta,
          }
        : undefined,
    },
    leads: company.leads.map((lead) => ({
      id: lead.id,
      companyId: lead.companyId,
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

  const hasAd =
    body.ad?.title?.trim() ||
    body.ad?.description?.trim() ||
    body.ad?.cta?.trim();

  await prisma.company.update({
    where: {
      id: existingCompany.id,
    },
    data: {
      imageUrl:
        body.imageUrl !== undefined ? body.imageUrl.trim() || null : undefined,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      website: body.website?.trim() || null,
      description: body.description.trim(),
    },
  });

  if (hasAd) {
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