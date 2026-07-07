import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateLeadRequestBody = {
  status?: string;
};

const allowedStatuses = ["new", "in_progress", "done"];

type LeadWithCompany = {
  id: string;
  companyId: string;
  company: {
    name: string;
    city: string;
    adress: string | null;
  };
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  message: string;
  sourceQuery: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function mapLead(lead: LeadWithCompany) {
  return {
    id: lead.id,
    companyId: lead.companyId,
    companyName: lead.company.name,
    companyCity: lead.company.city,
    companyAddress: lead.company.adress ?? "",
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

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const leadId = id?.trim();

  if (!leadId) {
    return NextResponse.json(
      {
        message: "Keine Lead-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | UpdateLeadRequestBody
    | null;

  const status = body?.status?.trim() || "";

  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      {
        message: "Ungültiger Lead-Status.",
      },
      {
        status: 400,
      }
    );
  }

  const existingLead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });

  if (!existingLead) {
    return NextResponse.json(
      {
        message: "Lead wurde nicht gefunden.",
      },
      {
        status: 404,
      }
    );
  }

  const updatedLead = await prisma.lead.update({
    where: {
      id: leadId,
    },
    data: {
      status,
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

  return NextResponse.json(mapLead(updatedLead));
}
