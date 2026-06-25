"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ThemeSwitch } from "@/components/theme-switch";
import { SummaryCards } from "@/components/summary-cards";
import { ProgressChart } from "@/components/progress-chart";
import { ProgressTable } from "@/components/progress-table";
import { DateRangePicker } from "@/components/date-range-picker";
import { VisibilityControl } from "@/components/visibility-control";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Region } from "@/lib/types";

export default function Home() {
  const { theme } = useTheme();
  const [regions, setRegions] = useState<Region[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const allRegionIds = regions.map((r) => r.id);
  const [visibleRegionIds, setVisibleRegionIds] = useState<Set<number>>(
    new Set()
  );

  // Sync visibleRegionIds when regions data loads
  useEffect(() => {
    if (regions.length > 0) {
      setVisibleRegionIds((prev) => {
        const ids = regions.map((r) => r.id);
        if (ids.every((id) => prev.has(id))) return prev;
        return new Set(ids);
      });
    }
  }, [regions]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/progress?${params.toString()}`)
      .then((res) => res.json() as Promise<Region[]>)
      .then(setRegions)
      .catch(console.error);
  }, [startDate, endDate]);

  const handleToggleRegion = useCallback((regionId: number) => {
    setVisibleRegionIds((prev) => {
      const next = new Set(prev);
      if (next.has(regionId)) {
        next.delete(regionId);
      } else {
        next.add(regionId);
      }
      return next;
    });
  }, []);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#231f20] dark:text-white">
            Dashboard Monitoring SE2026 Bangka Belitung
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Progres Pendataan Lapangan
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              Login Admin
            </Button>
          </Link>
          <ThemeSwitch />
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards regions={regions} />

      {/* Line Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Presentase Progres Harian
          </CardTitle>
          <div className="flex items-center gap-2">
            <VisibilityControl
              regions={regions}
              visibleRegionIds={visibleRegionIds}
              onToggle={handleToggleRegion}
            />
          </div>
        </CardHeader>
        <CardContent>
          {regions.length > 0 ? (
            <ProgressChart
              regions={regions}
              isDark={theme === "dark"}
              visibleRegionIds={visibleRegionIds}
            />
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">
              Memuat data...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tabel Data</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressTable regions={regions} />
        </CardContent>
      </Card>
    </div>
  );
}
