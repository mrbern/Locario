import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    accessToken: string;
    leadId: string;
  }>;
};

type UpdateLeadRequestBody = {
  status?: unknown;
};

const allowedStatuses = ["new", "in_progress", "done"] as const;
type LeadStatus = (typeof allowedStatuses)[number];

function isAllowedLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === "string" &&
    allowedStatuses.includes(value.trim() as LeadStatus)
  );
}

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

  if (!accessToken?.trim()) {
    return NextResponse.json(
      {
        message: "Kein Zugangscode übergeben.",
      },
      {
        status: 400,
      }
    );
  }

  if (!leadId?.trim()) {
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

  if (!body || !isAllowedLeadStatus(body.status)) {
    return NextResponse.json(
      {
        message: "Ungültiger Lead-Status.",
      },
      {
        status: 400,
      }
    );
  }

  const status = body.status.trim() as LeadStatus;

  const company = await prisma.company.findUnique({
    where: {
      accessToken: accessToken.trim(),
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
      id: leadId.trim(),
      companyId: company.id,
    },
    select: {
      id: true,
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
      id: existingLead.id,
    },
    data: {
      status,
    },
  });

  return NextResponse.json(mapLead(updatedLead));
}
