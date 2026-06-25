"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import type { Region } from "@/lib/types";

export function ProgressTable({ regions }: { regions: Region[] }) {
  const allDates = Array.from(
    new Set(regions.flatMap((r) => r.progress.map((p) => p.date)))
  ).sort();

  const kabupaten = regions.filter((r) => r.type !== "provinsi");
  const provinsi = regions.find((r) => r.type === "provinsi");

  if (allDates.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        Belum ada data.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Tanggal</TableHead>
            {kabupaten.map((r) => (
              <TableHead key={r.id} className="whitespace-nowrap text-right">
                {r.code}
                <br />
                <span className="text-[10px] font-normal">{r.name}</span>
              </TableHead>
            ))}
            <TableHead className="whitespace-nowrap text-right font-bold">
              {provinsi?.code}
              <br />
              <span className="text-[10px] font-normal">Provinsi</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allDates.map((date) => (
            <TableRow key={date}>
              <TableCell className="whitespace-nowrap font-medium">
                {format(parseISO(date), "dd MMM yyyy")}
              </TableCell>
              {kabupaten.map((r) => {
                const p = r.progress.find((p) => p.date === date);
                return (
                  <TableCell key={r.id} className="text-right">
                    {p ? `${p.percentage.toFixed(2)}%` : "—"}
                  </TableCell>
                );
              })}
              <TableCell className="text-right font-bold">
                {provinsi
                  ? (() => {
                      const p = provinsi.progress.find(
                        (p) => p.date === date
                      );
                      return p ? `${p.percentage.toFixed(2)}%` : "—";
                    })()
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
