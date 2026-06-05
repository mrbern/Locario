import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SearchLogRequestBody = {
  query?: string;
  resultCount?: number;
};

function normalizeQuery(query: string) {
  return query.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function GET() {
  const searchLogs = await prisma.searchLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return NextResponse.json(searchLogs);
}

export async function POST(request: Request) {
  const body = (await request.json()) as SearchLogRequestBody;

  if (!body.query || !body.query.trim()) {
    return NextResponse.json(
      {
        message: "Suchanfrage ist erforderlich.",
      },
      {
        status: 400,
      }
    );
  }

  const searchLog = await prisma.searchLog.create({
    data: {
      query: body.query.trim(),
      normalizedQuery: normalizeQuery(body.query),
      resultCount: body.resultCount ?? 0,
    },
  });

  return NextResponse.json(searchLog, {
    status: 201,
  });
}