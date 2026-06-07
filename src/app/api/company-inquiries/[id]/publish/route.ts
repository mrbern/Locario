import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { canCompanyUseAdvertising } from "@/data/plans";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
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

type CompanyWithAd = {
  id: string;
  name: string;
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

function createAccessToken() {
  return randomUUID().replace(/-/g, "");
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

function mapCompany(company: CompanyWithAd) {
  return {
    id: company.id,
    name: company.name,
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
  };
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

function buildSearchTerms(
  mainCategory: string,
  subCategories: string[],
  tags: string[],
  existingSearchTerms: string[]
) {
  if (existingSearchTerms.length > 0) {
    return existingSearchTerms;
  }

  return [
    mainCategory.toLowerCase(),
    ...subCategories.map((subCategory) => subCategory.toLowerCase()),
    ...tags.map((tag) => tag.toLowerCase()),
  ].filter(Boolean);
}

export async function POST(_request: Request, context: RouteContext) {
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

  const inquiry = await prisma.companyInquiry.findUnique({
    where: {
      id,
    },
  });

  if (!inquiry) {
    return NextResponse.json(
      {
        message: "Firmenanfrage wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  if (inquiry.status === "converted") {
    return NextResponse.json(
      {
        message: "Diese Firmenanfrage wurde bereits veröffentlicht.",
      },
      {
        status: 400,
      }
    );
  }

  const subCategories = parseJsonArray(inquiry.subCategories);
  const tags = parseJsonArray(inquiry.tags);
  const existingSearchTerms = parseJsonArray(inquiry.searchTerms);

  const primarySubCategory =
    subCategories[0] || inquiry.subCategory || inquiry.category;

  if (
    !inquiry.companyName.trim() ||
    !inquiry.city.trim() ||
    !inquiry.mainCategory.trim() ||
    !primarySubCategory.trim() ||
    !inquiry.description.trim() ||
    tags.length === 0
  ) {
    return NextResponse.json(
      {
        message:
          "Diese Firmenanfrage ist noch nicht vollständig genug, um veröffentlicht zu werden. Firmenname, Stadt, Hauptkategorie, Unterkategorie, Beschreibung und Suchbegriffe sind erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const advertisingAllowed = canCompanyUseAdvertising(inquiry.desiredPlan);

  const hasAd =
    advertisingAllowed &&
    (inquiry.adTitle?.trim() ||
      inquiry.adDescription?.trim() ||
      inquiry.adCta?.trim());

  const searchTerms = buildSearchTerms(
    inquiry.mainCategory,
    subCategories,
    tags,
    existingSearchTerms
  );

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: inquiry.companyName.trim(),
        accessToken: createAccessToken(),
        plan: inquiry.desiredPlan,

        mainCategory: inquiry.mainCategory,
        subCategory: primarySubCategory,
        subCategories: JSON.stringify(
          subCategories.length > 0 ? subCategories : [primarySubCategory]
        ),
        category: primarySubCategory,

        city: inquiry.city.trim(),
        phone: inquiry.phone?.trim() || null,
        email: inquiry.email.trim(),
        website: inquiry.website?.trim() || null,
        description: inquiry.description.trim(),
        tags: JSON.stringify(tags),
        searchTerms: JSON.stringify(searchTerms),

        ad: hasAd
          ? {
              create: {
                title: inquiry.adTitle?.trim() || "Aktuelles Angebot",
                description: inquiry.adDescription?.trim() || "",
                cta: inquiry.adCta?.trim() || "Mehr erfahren",
              },
            }
          : undefined,
      },
      include: {
        ad: true,
      },
    });

    const updatedInquiry = await tx.companyInquiry.update({
      where: {
        id: inquiry.id,
      },
      data: {
        status: "converted",
      },
    });

    return {
      company,
      inquiry: updatedInquiry,
    };
  });

  return NextResponse.json({
    company: mapCompany(result.company),
    inquiry: mapCompanyInquiry(result.inquiry),
  });
}
