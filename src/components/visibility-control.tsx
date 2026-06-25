"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, X } from "lucide-react";
import type { Region } from "@/lib/types";
import { getRegionColor } from "@/lib/colors";

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
      for (const r of regions) {
        if (visibleRegionIds.has(r.id) && r.type !== "provinsi") {
          onToggle(r.id);
        }
      }
    } else {
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
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
        Atur Tampilan
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  Atur Tampilan Grafik
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pilih wilayah yang ingin ditampilkan
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                className="shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between py-2.5 px-4 bg-muted/50 rounded-xl">
                <Label className="text-sm font-medium cursor-pointer">
                  Tampilkan Semua
                </Label>
                <Switch
                  checked={isAllVisible}
                  onCheckedChange={handleToggleAll}
                />
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {regions.map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <Label className="text-sm flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full inline-block shrink-0"
                        style={{
                          backgroundColor: getRegionColor(region.name, false),
                        }}
                      />
                      <span className="truncate">
                        <span className="text-muted-foreground text-xs mr-2 font-mono">
                          {region.code}
                        </span>
                        {region.name}
                      </span>
                    </Label>
                    <Switch
                      checked={visibleRegionIds.has(region.id)}
                      onCheckedChange={() => onToggle(region.id)}
                    />
                  </div>
                ))}
              </div>

              <Button
                className="w-full mt-2"
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
