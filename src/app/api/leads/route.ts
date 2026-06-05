import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canCompanyReceiveLeads } from "@/data/plans";

type LeadRequestBody = {
  companyId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  message?: string;
  sourceQuery?: string;
};

function mapLead(lead: {
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
  };
}) {
  return {
    id: lead.id,
    companyId: lead.companyId,
    companyName: lead.company.name,
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
  const body = (await request.json()) as LeadRequestBody;

  if (!body.companyId) {
    return NextResponse.json(
      {
        message: "Firma ist erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  if (!body.customerName || !body.customerName.trim()) {
    return NextResponse.json(
      {
        message: "Name ist erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  if (!body.customerEmail?.trim() && !body.customerPhone?.trim()) {
    return NextResponse.json(
      {
        message: "Bitte E-Mail oder Telefonnummer angeben.",
      },
      {
        status: 400,
      }
    );
  }

  if (!body.message || !body.message.trim()) {
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
      id: body.companyId,
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
          "Diese Firma kann im aktuellen Paket keine Neario-Anfragen empfangen. Bitte nutze die öffentlichen Kontaktangaben der Firma.",
      },
      {
        status: 403,
      }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      companyId: body.companyId,
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail?.trim() || null,
      customerPhone: body.customerPhone?.trim() || null,
      message: body.message.trim(),
      sourceQuery: body.sourceQuery?.trim() || null,
      status: "new",
    },
    include: {
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json(mapLead(lead), {
    status: 201,
  });
}