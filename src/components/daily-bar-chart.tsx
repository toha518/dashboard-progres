"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { Region } from "@/lib/types";

const BAR_COLORS: Record<string, string> = {
  Provinsi: "#231f20",
  Bangka: "#f79039",
  Belitung: "#e63946",
  "Bangka Barat": "#06d6a0",
  "Bangka Tengah": "#3a86ff",
  "Bangka Selatan": "#ff006e",
  "Belitung Timur": "#8338ec",
  Pangkalpinang: "#ffbe0b",
};

const DARK_BAR_COLORS: Record<string, string> = {
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
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DailyBarChart({
  regions,
  isDark,
  selectedDate,
  onDateChange,
}: Props) {
  const colors = isDark ? DARK_BAR_COLORS : BAR_COLORS;

  // Get all available dates sorted descending
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    for (const r of regions) {
      for (const p of r.progress) {
        dates.add(p.date);
      }
    }
    return Array.from(dates).sort().reverse();
  }, [regions]);

  // Build bar data for selected date
  const barData = useMemo(() => {
    if (!selectedDate) return [];
    return regions
      .filter((r) => r.type !== "provinsi")
      .map((r) => {
        const prog = r.progress.find((p) => p.date === selectedDate);
        return {
          name: r.name,
          percentage: prog?.percentage ?? 0,
          code: r.code,
        };
      })
      .concat(
        (() => {
          const prov = regions.find((r) => r.type === "provinsi");
          const prog = prov?.progress.find((p) => p.date === selectedDate);
          return {
            name: "Provinsi",
            percentage: prog?.percentage ?? 0,
            code: prov?.code ?? "1900",
          };
        })()
      );
  }, [regions, selectedDate]);

  const formattedDate = selectedDate
    ? format(parseISO(selectedDate), "dd MMM yyyy")
    : "";

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Date selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-muted-foreground">Tanggal:</span>
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-[#1a1a2e] text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79039]"
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {format(parseISO(date), "dd MMM yyyy")}
              </option>
            ))}
          </select>
          {formattedDate && (
            <span className="text-xs text-muted-foreground ml-2">
              {barData.length > 0 &&
                `Rata-rata: ${(
                  barData
                    .filter((d) => d.name !== "Provinsi")
                    .reduce((sum, d) => sum + d.percentage, 0) /
                  Math.max(
                    barData.filter((d) => d.name !== "Provinsi").length,
                    1
                  )
                ).toFixed(2)}%`}
            </span>
          )}
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={barData}
            margin={{ top: 25, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#2a3a5c" : "#e8dcc8"}
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={isDark ? "#9ca3af" : "#6b5e4e"}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke={isDark ? "#9ca3af" : "#6b5e4e"}
              fontSize={11}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              formatter={(value: any) => `${Number(value).toFixed(2)}%`}
              contentStyle={{
                backgroundColor: isDark ? "#16213e" : "#ffffff",
                border: `1px solid ${isDark ? "#2a3a5c" : "#e8dcc8"}`,
                borderRadius: "8px",
                color: isDark ? "#e0e0e0" : "#231f20",
                fontSize: "12px",
              }}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="percentage"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              <LabelList
                dataKey="percentage"
                position="top"
                formatter={(v: any) => `${Number(v).toFixed(2)}%`}
                style={{
                  fontSize: "10px",
                  fill: isDark ? "#e0e0e0" : "#231f20",
                  fontWeight: 600,
                }}
              />
              {barData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={colors[entry.name] || "#666"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
