"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import type { Region } from "@/lib/types";

const DOT_COLORS: Record<string, string> = {
  Provinsi: "#231f20",
  Bangka: "#f79039",
  Belitung: "#e63946",
  "Bangka Barat": "#06d6a0",
  "Bangka Tengah": "#3a86ff",
  "Bangka Selatan": "#ff006e",
  "Belitung Timur": "#8338ec",
  Pangkalpinang: "#ffbe0b",
};

interface Props {
  regions: Region[];
  visibleRegionIds: Set<number>;
  onToggle: (regionId: number) => void;
}

export function VisibilityControl({
  regions,
  visibleRegionIds,
  onToggle,
}: Props) {
  const [open, setOpen] = useState(false);

  const isAllVisible = regions.every((r) => visibleRegionIds.has(r.id));

  const handleToggleAll = useCallback(() => {
    if (isAllVisible) {
      // Hide all except provinsi
      for (const r of regions) {
        if (visibleRegionIds.has(r.id)) {
          onToggle(r.id);
        }
      }
    } else {
      // Show all
      for (const r of regions) {
        if (!visibleRegionIds.has(r.id)) {
          onToggle(r.id);
        }
      }
    }
  }, [isAllVisible, regions, visibleRegionIds, onToggle]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Eye className="h-4 w-4" />
        Atur Tampilan
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          {/* Modal */}
          <div className="relative bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Atur Tampilan Grafik</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <Label className="text-sm font-medium">Tampilkan Semua</Label>
              <Switch
                checked={isAllVisible}
                onCheckedChange={handleToggleAll}
              />
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {regions.map((region) => (
                <div
                  key={region.id}
                  className="flex items-center justify-between"
                >
                  <Label className="text-sm flex items-center gap-2 cursor-pointer">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{
                        backgroundColor:
                          DOT_COLORS[region.name] || "#666",
                      }}
                    />
                    {region.code} - {region.name}
                  </Label>
                  <Switch
                    checked={visibleRegionIds.has(region.id)}
                    onCheckedChange={() => onToggle(region.id)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
