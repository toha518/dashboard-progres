"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/date";
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
    <div className="max-h-[600px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap sticky left-0 bg-card z-10">
              Tanggal
            </TableHead>
            {kabupaten.map((r) => (
              <TableHead
                key={r.id}
                className="whitespace-nowrap text-right"
              >
                <span className="text-[10px] font-mono text-muted-foreground">
                  {r.code}
                </span>
                <br />
                {r.name}
              </TableHead>
            ))}
            <TableHead className="whitespace-nowrap text-right font-bold">
              <span className="text-[10px] font-mono text-muted-foreground">
                {provinsi?.code}
              </span>
              <br />
              Provinsi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allDates.map((date, idx) => (
            <TableRow
              key={date}
              className={idx % 2 === 0 ? "bg-muted/30" : ""}
            >
              <TableCell className="whitespace-nowrap font-medium sticky left-0 bg-card z-10">
                {formatDate(date, "dd MMM yyyy")}
              </TableCell>
              {kabupaten.map((r) => {
                const p = r.progress.find((p) => p.date === date);
                return (
                  <TableCell key={r.id} className="text-right tabular-nums">
                    {p ? `${p.percentage.toFixed(2)}%` : "—"}
                  </TableCell>
                );
              })}
              <TableCell className="text-right font-bold tabular-nums">
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
