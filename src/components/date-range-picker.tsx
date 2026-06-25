"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="start-date" className="text-sm whitespace-nowrap">
          Dari
        </Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="end-date" className="text-sm whitespace-nowrap">
          Sampai
        </Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
