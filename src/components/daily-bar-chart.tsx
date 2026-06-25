"use client";

import { useMemo, useCallback } from "react";
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
import { formatDate } from "@/lib/date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Region } from "@/lib/types";
import { getRegionColor } from "@/lib/colors";

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
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    for (const r of regions) {
      for (const p of r.progress) {
        dates.add(p.date);
      }
    }
    return Array.from(dates).sort().reverse();
  }, [regions]);

  const barData = useMemo(() => {
    if (!selectedDate) return [];
    const formattedDate = formatDate(selectedDate, "dd MMM yyyy");
    return regions
      .filter((r) => r.type !== "provinsi")
      .map((r) => {
        const prog = r.progress.find((p) => p.date === selectedDate);
        return {
          name: r.name,
          percentage: prog?.percentage ?? 0,
          code: r.code,
          date: formattedDate,
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
            date: formattedDate,
          };
        })()
      );
  }, [regions, selectedDate]);

  const CustomBarTooltip = useCallback(
    ({ active, payload }: any) => {
      if (!active || !payload || payload.length === 0) return null;
      const data = payload[0].payload;
      const color = data?.color ?? getRegionColor(data?.name ?? "", isDark);

      return (
        <div
          className="rounded-xl shadow-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: isDark ? "#16213e" : "#ffffff",
            borderColor: isDark ? "#2a3a5c" : "#e8dcc8",
            color: isDark ? "#e0e0e0" : "#231f20",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-muted-foreground font-mono">
              {data?.code}
            </span>
          </div>
          <p className="font-semibold mb-1">{data?.name}</p>
          <p className="text-xs text-muted-foreground mb-1.5">{data?.date}</p>
          <p className="text-lg font-bold tabular-nums">
            {Number(data?.percentage).toFixed(2)}%
          </p>
        </div>
      );
    },
    [isDark]
  );

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-0 w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-muted-foreground">Tanggal:</span>
          <Select value={selectedDate} onValueChange={(v) => v && onDateChange(v)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue>
                {selectedDate ? formatDate(selectedDate, "dd MMM yyyy") : "Pilih tanggal"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDate(date, "dd MMM yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={barData}
            margin={{ top: 25, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#2a3a5c" : "#e8dcc8"}
              strokeOpacity={0.7}
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
            <Tooltip content={<CustomBarTooltip />} />
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
                  fill={getRegionColor(entry.name, isDark)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
