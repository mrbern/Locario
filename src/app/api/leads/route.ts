import { NextResponse } from "next/server";
import { canCompanyReceiveLeads } from "@/data/plans";
import { prisma } from "@/lib/prisma";

type LeadRequestBody = {
  companyId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  message?: string;
  sourceQuery?: string;
};

type LeadCompanySummary = {
  id: string;
  name: string;
  locationName: string | null;
  parentCompanyId: string | null;
  city: string;
  adress: string | null;
  parentCompany: {
    id: string;
    name: string;
    locationName: string | null;
    city: string;
    adress: string | null;
  } | null;
  locations: {
    id: string;
    name: string;
    locationName: string | null;
    city: string;
    adress: string | null;
  }[];
};

type LeadWithCompany = {
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
  company: LeadCompanySummary;
};

const companySelect = {
  id: true,
  name: true,
  locationName: true,
  parentCompanyId: true,
  city: true,
  adress: true,
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
};

function getSafeString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

function getCompanyDisplayName(company: LeadCompanySummary) {
  const locationName = company.locationName?.trim();

  if (locationName) {
    return `${company.name} · ${locationName}`;
  }

  return company.name;
}

function getCompanyRelationLabel(company: LeadCompanySummary) {
  if (company.parentCompany) {
    const parentLocationName = company.parentCompany.locationName?.trim();
    const parentDisplayName = parentLocationName
      ? `${company.parentCompany.name} · ${parentLocationName}`
      : company.parentCompany.name;

    return `Standort von ${parentDisplayName}`;
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

function mapCompany(company: LeadCompanySummary) {
  const companyAddress = company.adress ?? "";

  return {
    id: company.id,
    name: company.name,
    locationName: company.locationName ?? "",
    parentCompanyId: company.parentCompanyId ?? "",
    city: company.city,
    address: companyAddress,
    adress: companyAddress,
    parentCompany: company.parentCompany
      ? {
          id: company.parentCompany.id,
          name: company.parentCompany.name,
          locationName: company.parentCompany.locationName ?? "",
          city: company.parentCompany.city,
          address: company.parentCompany.adress ?? "",
          adress: company.parentCompany.adress ?? "",
        }
      : null,
    locations: company.locations.map((location) => ({
      id: location.id,
      name: location.name,
      locationName: location.locationName ?? "",
      city: location.city,
      address: location.adress ?? "",
      adress: location.adress ?? "",
    })),
  };
}

function mapLead(lead: LeadWithCompany) {
  const companyAddress = lead.company.adress ?? "";
  const parentCompany = lead.company.parentCompany;

  return {
    id: lead.id,
    companyId: lead.companyId,
    companyName: lead.company.name,
    companyBaseName: lead.company.name,
    companyDisplayName: getCompanyDisplayName(lead.company),
    companyLocationName: lead.company.locationName ?? "",
    companyCity: lead.company.city,
    companyAddress,
    companyParentCompanyId: lead.company.parentCompanyId ?? "",
    companyParentName: parentCompany?.name ?? "",
    companyParentLocationName: parentCompany?.locationName ?? "",
    companyRelationLabel: getCompanyRelationLabel(lead.company),
    company: mapCompany(lead.company),
    customerName: lead.customerName,
    customerEmail: lead.customerEmail ?? "",
    customerPhone: lead.customerPhone ?? "",
    message: lead.message,
    sourceQuery: lead.sourceQuery ?? "",
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export async function GET() {
  const leads = await prisma.lead.findMany({
    include: {
      company: {
        select: companySelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return NextResponse.json(leads.map(mapLead));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | LeadRequestBody
    | null;

  if (!body) {
    return NextResponse.json(
      {
        message: "Ungültige Anfrage.",
      },
      {
        status: 400,
      }
    );
  }

  const companyId = getSafeString(body.companyId);
  const customerName = getSafeString(body.customerName);
  const customerEmail = getSafeString(body.customerEmail);
  const customerPhone = getSafeString(body.customerPhone);
  const message = getSafeString(body.message);
  const sourceQuery = getSafeString(body.sourceQuery);

  if (!companyId) {
    return NextResponse.json(
      {
        message: "Firma ist erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  if (!customerName) {
    return NextResponse.json(
      {
        message: "Name ist erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  if (!customerEmail && !customerPhone) {
    return NextResponse.json(
      {
        message: "Bitte E-Mail oder Telefonnummer angeben.",
      },
      {
        status: 400,
      }
    );
  }

  if (!message) {
    return NextResponse.json(
      {
        message: "Nachricht ist erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      id: true,
      plan: true,
    },
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

  if (!canCompanyReceiveLeads(company.plan)) {
    return NextResponse.json(
      {
        message:
          "Diese Firma kann im aktuellen Paket keine Locario-Anfragen empfangen. Bitte nutze die öffentlichen Kontaktangaben der Firma.",
      },
      {
        status: 403,
      }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      companyId,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      message,
      sourceQuery: sourceQuery || null,
      status: "new",
    },
    include: {
      company: {
        select: companySelect,
      },
    },
  });

  return NextResponse.json(mapLead(lead), {
    status: 201,
  });
}
