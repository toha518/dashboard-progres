"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/date";
import { ThemeSwitch } from "@/components/theme-switch";
import { SummaryCards } from "@/components/summary-cards";
import { DailyBarChart } from "@/components/daily-bar-chart";
import { ProgressChart } from "@/components/progress-chart";
import { ProgressTable } from "@/components/progress-table";
import { DateRangePicker } from "@/components/date-range-picker";
import { VisibilityControl } from "@/components/visibility-control";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import type { Region } from "@/lib/types";

export default function Home() {
  const { theme } = useTheme();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [barDate, setBarDate] = useState("");
  const [lineStartDate, setLineStartDate] = useState("");
  const [lineEndDate, setLineEndDate] = useState("");

  useEffect(() => {
    if (!barDate && regions.length > 0) {
      const allDates = regions.flatMap((r) => r.progress.map((p) => p.date));
      if (allDates.length > 0) {
        setBarDate(allDates.sort().reverse()[0]);
      }
    }
  }, [regions, barDate]);

  const [visibleRegionIds, setVisibleRegionIds] = useState<Set<number>>(
    new Set()
  );

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
    setLoading(true);
    fetch("/api/progress")
      .then((res) => res.json() as Promise<Region[]>)
      .then(setRegions)
      .catch(console.error)
      .finally(() => setLoading(false));
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

  const latestDate = useMemo(() => {
    const allDates = regions.flatMap((r) => r.progress.map((p) => p.date));
    if (allDates.length === 0) return null;
    return allDates.sort().reverse()[0];
  }, [regions]);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              Dashboard Monitoring SE2026
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Progres Pendataan Lapangan Bangka Belitung
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/login">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
            >
              Login Admin
            </Button>
          </Link>
          <ThemeSwitch />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            Ringkasan per Wilayah
          </h2>
          {latestDate && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              — {formatDate(latestDate, "EEEE, dd MMM yyyy")}
            </span>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-3 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <SummaryCards regions={regions} />
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            Progres per Tanggal
          </CardTitle>
          <CardDescription>
            Perbandingan progres seluruh kabupaten/kota pada tanggal tertentu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-[320px] w-full" />
            </div>
          ) : regions.length > 0 && barDate ? (
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

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Presentase Progres Harian
            </CardTitle>
            <CardDescription>
              Tren progres harian seluruh wilayah dari waktu ke waktu
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : regions.length > 0 ? (
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Tabel Data</CardTitle>
          <CardDescription>
            Data detail progres per tanggal untuk seluruh wilayah
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <ProgressTable regions={regions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
