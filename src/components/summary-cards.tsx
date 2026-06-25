"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Region } from "@/lib/types";
import { getRegionColor } from "@/lib/colors";

export function SummaryCards({ regions }: { regions: Region[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {regions.map((region) => {
        const latest =
          region.progress.length > 0
            ? region.progress[region.progress.length - 1]
            : null;

        const color = getRegionColor(region.name, false);
        const isProvinsi = region.type === "provinsi";

        return (
          <Card
            key={region.id}
            className={`relative overflow-hidden transition-shadow hover:shadow-md ${
              isProvinsi
                ? "ring-2 ring-primary/40 shadow-sm"
                : "shadow-sm"
            }`}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: color }}
            />
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">
                  {region.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className={`text-2xl font-bold tabular-nums ${isProvinsi ? "text-primary" : ""}`}>
                {latest ? `${latest.percentage.toFixed(2)}%` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {region.progress.length} hari data
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
