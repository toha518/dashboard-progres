import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { date?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { date } = body;
  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date. Must be in YYYY-MM-DD format" }, { status: 400 });
  }

  try {
    await prisma.progress.deleteMany({
      where: { date: new Date(date) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const VALID_REGION_NAMES = [
  "Bangka",
  "Belitung",
  "Bangka Barat",
  "Bangka Tengah",
  "Bangka Selatan",
  "Belitung Timur",
  "Pangkalpinang",
  "Provinsi",
] as const;

interface ProgressItem {
  regionId: number;
  percentage: number;
}

function validateInput(body: unknown): { date: string; values: ProgressItem[] } | string {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }

  const { date, values } = body as Record<string, unknown>;

  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Invalid date. Must be in YYYY-MM-DD format";
  }

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return "Invalid date. Must be a valid calendar date";
  }

  if (!Array.isArray(values) || values.length === 0) {
    return "Missing or empty 'values' array";
  }

  if (values.length !== VALID_REGION_NAMES.length) {
    return `Must provide exactly ${VALID_REGION_NAMES.length} values (one for each region)`;
  }

  for (const item of values) {
    if (!item || typeof item !== "object") {
      return "Each value must be an object with regionId and percentage";
    }
    const v = item as Record<string, unknown>;

    if (typeof v.regionId !== "number" || !Number.isInteger(v.regionId) || v.regionId <= 0) {
      return "Each value must have a valid positive integer regionId";
    }

    if (typeof v.percentage !== "number" || isNaN(v.percentage)) {
      return `Invalid percentage for regionId ${v.regionId}. Must be a number`;
    }

    if (v.percentage < 0 || v.percentage > 100) {
      return `Percentage for regionId ${v.regionId} must be between 0 and 100`;
    }
  }

  return { date, values: values as ProgressItem[] };
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const validated = validateInput(body);
  if (typeof validated === "string") {
    return NextResponse.json({ error: validated }, { status: 400 });
  }

  const { date, values } = validated;
  const dateObj = new Date(date);

  try {
    const regionIds = values.map((v) => v.regionId);
    const existingRegions = await prisma.region.findMany({
      where: { id: { in: regionIds } },
    });

    const foundNames = new Set(existingRegions.map((r) => r.name));
    const allValid = VALID_REGION_NAMES.every((name) => foundNames.has(name));

    if (!allValid || existingRegions.length !== VALID_REGION_NAMES.length) {
      return NextResponse.json(
        { error: `Each regionId must correspond to one of the ${VALID_REGION_NAMES.length} valid regions` },
        { status: 400 }
      );
    }

    // Upsert progress untuk setiap kabupaten/kota
    for (const item of values) {
      await prisma.progress.upsert({
        where: {
          regionId_date: { regionId: item.regionId, date: dateObj },
        },
        update: { percentage: item.percentage },
        create: {
          regionId: item.regionId,
          date: dateObj,
          percentage: item.percentage,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
