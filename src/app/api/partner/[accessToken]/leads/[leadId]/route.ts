import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    accessToken: string;
    leadId: string;
  }>;
};

type UpdateLeadRequestBody = {
  status?: string;
};

const allowedStatuses = ["new", "in_progress", "done"];

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
}) {
  return {
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
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const { accessToken, leadId } = await context.params;
  const body = (await request.json()) as UpdateLeadRequestBody;

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

  if (!body.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json(
      {
        message: "Ungültiger Lead-Status.",
      },
      {
        status: 400,
      }
    );
  }

  const company = await prisma.company.findUnique({
    where: {
      accessToken,
    },
    select: {
      id: true,
    },
  });

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

  const existingLead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      companyId: company.id,
    },
  });

  if (!existingLead) {
    return NextResponse.json(
      {
        message: "Lead wurde für diese Firma nicht gefunden.",
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
      status: body.status,
    },
  });

  return NextResponse.json(mapLead(updatedLead));
}