"use client";

import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo, useCallback, Fragment } from "react";
import { format, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Region } from "@/lib/types";

const LIGHT_COLORS: Record<string, string> = {
  Provinsi: "#231f20",
  Bangka: "#f79039",
  Belitung: "#e63946",
  "Bangka Barat": "#06d6a0",
  "Bangka Tengah": "#3a86ff",
  "Bangka Selatan": "#ff006e",
  "Belitung Timur": "#8338ec",
  Pangkalpinang: "#ffbe0b",
};

const DARK_COLORS: Record<string, string> = {
  Provinsi: "#ffffff",
  Bangka: "#f79039",
  Belitung: "#ff6b6b",
  "Bangka Barat": "#06d6a0",
  "Bangka Tengah": "#5dade2",
  "Bangka Selatan": "#ff4d94",
  "Belitung Timur": "#af7ac5",
  Pangkalpinang: "#ffd166",
};

interface Props {
  regions: Region[];
  isDark: boolean;
  visibleRegionIds: Set<number>;
}

export function ProgressChart({ regions, isDark, visibleRegionIds }: Props) {
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const [scaleMax, setScaleMax] = useState<number | null>(null);

  const SCALE_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

  // Filter visible regions, sorted by order
  const visibleRegions = useMemo(
    () =>
      regions
        .filter((r) => visibleRegionIds.has(r.id))
        .sort((a, b) => a.order - b.order),
    [regions, visibleRegionIds]
  );

  // Collect all unique dates and sort them
  const allDates = useMemo(
    () =>
      Array.from(
        new Set(regions.flatMap((r) => r.progress.map((p) => p.date)))
      ).sort(),
    [regions]
  );

  // Transform data for Recharts
  const chartData = useMemo(
    () =>
      allDates.map((date) => {
        const entry: Record<string, string | number | undefined> = {
          date: format(parseISO(date), "dd MMM"),
        };
        for (const region of visibleRegions) {
          const prog = region.progress.find((p) => p.date === date);
          entry[region.name] = prog?.percentage ?? undefined;
        }
        return entry;
      }),
    [allDates, visibleRegions]
  );

  // Calculate dynamic Y-axis domain
  const allValues = useMemo(
    () => visibleRegions.flatMap((r) => r.progress.map((p) => p.percentage)),
    [visibleRegions]
  );

  const [domainMin, domainMax] = useMemo(() => {
    if (scaleMax !== null) return [0, scaleMax];
    if (allValues.length === 0) return [0, 100];
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const padding = Math.max(5, (dataMax - dataMin) * 0.15);
    return [Math.max(0, Math.floor(dataMin - padding)), Math.ceil(dataMax + padding)];
  }, [allValues, scaleMax]);

  // Y-axis ticks at 5% intervals
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const tickStart = Math.floor(domainMin / 5) * 5;
    for (let i = tickStart; i <= domainMax; i += 5) {
      ticks.push(i);
    }
    return ticks;
  }, [domainMin, domainMax]);

  // Custom tooltip sorted by percentage descending
  const CustomTooltip = useCallback(
    ({ active, payload, label }: any) => {
      if (!active || !payload || payload.length === 0) return null;
      // Deduplicate by dataKey (Area + Line both have same dataKey)
      const seen = new Set<string>();
      const unique = payload.filter((p: any) => {
        if (seen.has(p.dataKey)) return false;
        seen.add(p.dataKey);
        return true;
      });
      const sorted = [...unique].sort(
        (a: any, b: any) => (b.value ?? 0) - (a.value ?? 0)
      );
      return (
        <div
          className="rounded-xl shadow-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: isDark ? "#16213e" : "#ffffff",
            borderColor: isDark ? "#2a3a5c" : "#e8dcc8",
            color: isDark ? "#e0e0e0" : "#231f20",
          }}
        >
          <p className="font-semibold mb-2 text-xs opacity-70">{label}</p>
          {sorted.map((entry: any) => (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 py-0.5"
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                <span
                  style={
                    entry.name === "Provinsi"
                      ? {
                          color: isDark ? "#fbbf24" : "#d97706",
                          fontWeight: 700,
                        }
                      : undefined
                  }
                >
                  {entry.name}
                </span>
              </span>
              <span
                className="font-bold tabular-nums"
                style={
                  entry.name === "Provinsi"
                    ? {
                        color: isDark ? "#fbbf24" : "#d97706",
                        fontSize: "1.1em",
                      }
                    : undefined
                }
              >
                {Number(entry.value).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    },
    [isDark]
  );

  const isProvinsi = (name: string) => name === "Provinsi";

  return (
    <div id="progress-chart-container" className="relative">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Controls bar */}
          <div className="flex items-center justify-between mb-3">
            {/* Left: scale selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Skala maks:
              </span>
              <Select
                value={scaleMax !== null ? String(scaleMax) : "auto"}
                onValueChange={(v) =>
                  setScaleMax(v === "auto" ? null : Number(v))
                }
              >
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  {SCALE_OPTIONS.map((v) => (
                    <SelectItem key={v} value={String(v)}>
                      {v}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <defs>
                {visibleRegions.map((region) => (
                  <linearGradient
                    key={region.name}
                    id={`gradient-${region.name.replace(/\s+/g, "-")}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={colors[region.name] || "#666"}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={colors[region.name] || "#666"}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#2a3a5c" : "#e8dcc8"}
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="date"
                stroke={isDark ? "#9ca3af" : "#6b5e4e"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[domainMin, domainMax]}
                ticks={yTicks}
                stroke={isDark ? "#9ca3af" : "#6b5e4e"}
                fontSize={12}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {visibleRegions.map((region) => {
                const color = colors[region.name] || "#666";
                const prov = isProvinsi(region.name);
                return (
                  <Fragment key={region.name}>
                    {/* Area fill underneath the line */}
                    <Area
                      type="monotone"
                      dataKey={region.name}
                      fill={`url(#gradient-${region.name.replace(/\s+/g, "-")})`}
                      stroke="none"
                      isAnimationActive={false}
                      legendType="none"
                    />
                    <Line
                      type="monotone"
                      dataKey={region.name}
                      stroke={color}
                      strokeWidth={prov ? 3.5 : 2}
                      strokeDasharray={prov ? undefined : "5 3"}
                      dot={{ r: prov ? 4 : 2.5, strokeWidth: prov ? 2 : 1.5, fill: isDark ? "#16213e" : "#ffffff", stroke: color }}
                      activeDot={{ r: prov ? 7 : 5, strokeWidth: 2, stroke: isDark ? "#16213e" : "#ffffff", fill: color }}
                      connectNulls
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>

          {/* Custom legend sorted by order */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 pt-3 text-xs">
            {visibleRegions.map((region) => {
              const color = colors[region.name] || "#666";
              return (
                <span key={region.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  />
                  <span style={{ color }}>{region.name}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
