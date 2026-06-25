"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Region } from "@/lib/types";

const COLORS: Record<string, string> = {
  Provinsi: "#231f20",
  Bangka: "#f79039",
  Belitung: "#e63946",
  "Bangka Barat": "#06d6a0",
  "Bangka Tengah": "#3a86ff",
  "Bangka Selatan": "#ff006e",
  "Belitung Timur": "#8338ec",
  Pangkalpinang: "#ffbe0b",
};

export function SummaryCards({ regions }: { regions: Region[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {regions.map((region) => {
        const latest =
          region.progress.length > 0
            ? region.progress[region.progress.length - 1]
            : null;
        const prev =
          region.progress.length > 1
            ? region.progress[region.progress.length - 2]
            : null;

        const change =
          latest && prev ? (latest.percentage - prev.percentage).toFixed(2) : null;

        return (
          <Card
            key={region.id}
            className={`${region.type === "provinsi" ? "ring-2 ring-[#231f20] dark:ring-white" : ""}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: COLORS[region.name] }}
                />
                <span className="truncate">
                  <span className="text-[10px] text-muted-foreground mr-1 font-mono">
                    {region.code}
                  </span>
                  {region.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {latest ? `${latest.percentage.toFixed(2)}%` : "—"}
              </p>
              {change && (
                <p
                  className={`text-xs mt-1 ${
                    Number(change) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {Number(change) >= 0 ? "↑" : "↓"} {Math.abs(Number(change))}%
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
