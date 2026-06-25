"use client";

import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
}

const PRESETS = [
  { label: "7 Hari", days: 7 },
  { label: "30 Hari", days: 30 },
  { label: "Semua", days: 0 },
] as const;

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  const getPresetDates = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }, []);

  const setPreset = (days: number) => {
    if (days === 0) {
      onStartDateChange("");
      onEndDateChange("");
    } else {
      const { start, end } = getPresetDates(days);
      onStartDateChange(start);
      onEndDateChange(end);
    }
  };

  const activePreset = useMemo(() => {
    if (!startDate && !endDate) return "Semua";
    const today = new Date().toISOString().split("T")[0];
    if (endDate !== today) return null;
    const { start: s7 } = getPresetDates(7);
    if (startDate === s7) return "7 Hari";
    const { start: s30 } = getPresetDates(30);
    if (startDate === s30) return "30 Hari";
    return null;
  }, [startDate, endDate, getPresetDates]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="start-date" className="text-xs whitespace-nowrap">
          Dari
        </Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full sm:w-[140px] h-8 text-xs"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="end-date" className="text-xs whitespace-nowrap">
          Sampai
        </Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full sm:w-[140px] h-8 text-xs"
        />
      </div>
      <div className="flex flex-wrap items-center">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {PRESETS.map(({ label, days }, i) => {
            const isActive = activePreset === label;
            return (
              <Button
                key={label}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 text-xs px-3 rounded-none font-medium ${
                  i < PRESETS.length - 1 ? "border-r border-border" : ""
                } ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setPreset(days)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
