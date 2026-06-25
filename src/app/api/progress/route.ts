import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const progressWhere: Prisma.ProgressWhereInput = {};
  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    progressWhere.date = dateFilter;
  }

  const regions = await prisma.region.findMany({
    orderBy: { order: "asc" },
    include: {
      progress: {
        where: progressWhere,
        orderBy: { date: "asc" },
      },
    },
  });

  return NextResponse.json(regions);
}
