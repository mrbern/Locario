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
  company: {
    name: string;
    city: string;
    adress: string | null;
  };
};

function getSafeString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

function mapLead(lead: LeadWithCompany) {
  const companyAddress = lead.company.adress ?? "";

  return {
    id: lead.id,
    companyId: lead.companyId,
    companyName: lead.company.name,
    companyCity: lead.company.city,
    companyAddress,
    company: {
      name: lead.company.name,
      city: lead.company.city,
      address: companyAddress,
      adress: companyAddress,
    },
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
        select: {
          name: true,
          city: true,
          adress: true,
        },
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
        select: {
          name: true,
          city: true,
          adress: true,
        },
      },
    },
  });

  return NextResponse.json(mapLead(lead), {
    status: 201,
  });
}
