"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeSwitch } from "@/components/theme-switch";
import { SummaryCards } from "@/components/summary-cards";
import { DailyBarChart } from "@/components/daily-bar-chart";
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
  const [barDate, setBarDate] = useState("");
  const [lineStartDate, setLineStartDate] = useState("");
  const [lineEndDate, setLineEndDate] = useState("");

  // Set default bar date to latest available date when regions load
  useEffect(() => {
    if (!barDate && regions.length > 0) {
      const allDates = regions.flatMap((r) => r.progress.map((p) => p.date));
      if (allDates.length > 0) {
        setBarDate(allDates.sort().reverse()[0]);
      }
    }
  }, [regions, barDate]);

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
    fetch("/api/progress")
      .then((res) => res.json() as Promise<Region[]>)
      .then(setRegions)
      .catch(console.error);
  }, []);

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

  const lineChartRegions = useMemo(() => {
    if (!lineStartDate && !lineEndDate) return regions;
    return regions.map((r) => ({
      ...r,
      progress: r.progress.filter((p) => {
        if (lineStartDate && p.date < lineStartDate) return false;
        if (lineEndDate && p.date > lineEndDate) return false;
        return true;
      }),
    }));
  }, [regions, lineStartDate, lineEndDate]);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#231f20] dark:text-white whitespace-nowrap">
            Dashboard Monitoring SE2026 Bangka Belitung
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Progres Pendataan Lapangan
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/login">
            <Button size="sm" className="bg-[#f79039] hover:bg-[#e67e22] text-white font-semibold shadow-sm">
              Login Admin
            </Button>
          </Link>
          <ThemeSwitch />
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards regions={regions} />

      {/* Daily Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Progres per Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {regions.length > 0 && barDate ? (
            <DailyBarChart
              regions={regions}
              isDark={theme === "dark"}
              selectedDate={barDate}
              onDateChange={setBarDate}
            />
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              Memuat data...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Line Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Presentase Progres Harian
          </CardTitle>
          <div className="flex items-center gap-2">
            <DateRangePicker
              startDate={lineStartDate}
              endDate={lineEndDate}
              onStartDateChange={setLineStartDate}
              onEndDateChange={setLineEndDate}
            />
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
              regions={lineChartRegions}
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
