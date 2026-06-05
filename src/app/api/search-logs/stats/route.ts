import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SearchLogGroup = {
  normalizedQuery: string;
  latestQuery: string;
  searchCount: number;
  zeroResultCount: number;
  totalResultCount: number;
  latestResultCount: number;
  latestAt: string;
};

export async function GET() {
  const searchLogs = await prisma.searchLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 500,
  });

  const groups = new Map<string, SearchLogGroup>();

  for (const searchLog of searchLogs) {
    const key = searchLog.normalizedQuery;

    const existingGroup = groups.get(key);

    if (!existingGroup) {
      groups.set(key, {
        normalizedQuery: searchLog.normalizedQuery,
        latestQuery: searchLog.query,
        searchCount: 1,
        zeroResultCount: searchLog.resultCount === 0 ? 1 : 0,
        totalResultCount: searchLog.resultCount,
        latestResultCount: searchLog.resultCount,
        latestAt: searchLog.createdAt.toISOString(),
      });

      continue;
    }

    existingGroup.searchCount += 1;
    existingGroup.totalResultCount += searchLog.resultCount;

    if (searchLog.resultCount === 0) {
      existingGroup.zeroResultCount += 1;
    }
  }

  const stats = Array.from(groups.values()).map((group) => ({
    ...group,
    averageResultCount:
      Math.round((group.totalResultCount / group.searchCount) * 10) / 10,
  }));

  const topSearches = [...stats].sort((a, b) => {
    if (b.searchCount !== a.searchCount) {
      return b.searchCount - a.searchCount;
    }

    return new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime();
  });

  const acquisitionOpportunities = [...stats]
    .filter((group) => group.latestResultCount === 0)
    .sort((a, b) => {
      if (b.searchCount !== a.searchCount) {
        return b.searchCount - a.searchCount;
      }

      return new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime();
    });

  return NextResponse.json({
    totalSearches: searchLogs.length,
    uniqueSearches: stats.length,
    zeroResultSearches: searchLogs.filter(
      (searchLog) => searchLog.resultCount === 0
    ).length,
    topSearches: topSearches.slice(0, 10),
    acquisitionOpportunities: acquisitionOpportunities.slice(0, 10),
  });
}