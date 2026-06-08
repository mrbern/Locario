import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatuses = ["new", "in_progress", "done"];

type LeadWithCompany = {
  id: string;
  companyId: string;
  company: {
    name: string;
  };
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  message: string;
  sourceQuery: string | null;
  status: string;
  createdAt: Date;
};

function mapLead(lead: LeadWithCompany) {
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
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Keine Lead-ID übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;

  const status = body?.status;

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
      id,
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
      id,
    },
    data: {
      status,
    },
    include: {
      company: true,
    },
  });

  return NextResponse.json(mapLead(updatedLead));
}