"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { toast } from "sonner";
import {
  CalendarDays,
  MapPin,
  Pencil,
  Save,
  Trash2,
  TrendingUp,
} from "lucide-react";

const REGIONS = [
  { id: 0, name: "Bangka" },
  { id: 0, name: "Belitung" },
  { id: 0, name: "Bangka Barat" },
  { id: 0, name: "Bangka Tengah" },
  { id: 0, name: "Bangka Selatan" },
  { id: 0, name: "Belitung Timur" },
  { id: 0, name: "Pangkalpinang" },
];

interface RegionData {
  id: number;
  name: string;
  type: string;
  progress: { date: string; percentage: number }[];
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data: RegionData[]) => {
        setRegions(data);
        for (const r of data) {
          const idx = REGIONS.findIndex((rr) => rr.name === r.name);
          if (idx >= 0) REGIONS[idx].id = r.id;
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allDates = useMemo(
    () =>
      Array.from(
        new Set(regions.flatMap((r) => r.progress.map((p) => p.date)))
      )
        .sort()
        .reverse(),
    [regions]
  );

  const latestProvinsi = useMemo(() => {
    const prov = regions.find((r) => r.type === "provinsi");
    if (!prov || prov.progress.length === 0) return null;
    return prov.progress[prov.progress.length - 1];
  }, [regions]);

  const handleEdit = (selectedDate: string) => {
    const dateOnly = selectedDate.split("T")[0];
    setDate(dateOnly);
    const newValues: Record<string, string> = {};
    for (const region of regions) {
      const prog = region.progress.find((p) => p.date === selectedDate);
      if (prog) {
        newValues[region.name] = String(prog.percentage);
      }
    }
    setValues(newValues);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info(`Mengedit data ${formatDate(dateOnly, "dd MMM yyyy")}`);
  };

  const handleDelete = async (selectedDate: string) => {
    if (
      !confirm(
        `Yakin hapus data tanggal ${formatDate(selectedDate, "dd MMM yyyy")}?`
      )
    )
      return;

    const dateOnly = selectedDate.split("T")[0];
    try {
      const res = await fetch("/api/admin/progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateOnly }),
      });

      if (res.ok) {
        toast.success("Data berhasil dihapus");
        const fresh = await fetch("/api/progress").then((r) => r.json());
        setRegions(fresh);
      } else {
        const err = await res.json();
        toast.error(`Gagal: ${err.error}`);
      }
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = REGIONS.map((r) => ({
      regionId: r.id,
      percentage: parseFloat((values[r.name] || "0").replace(",", ".")),
    }));

    try {
      const res = await fetch("/api/admin/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, values: payload }),
      });

      if (res.ok) {
        toast.success("Data berhasil disimpan");
        setValues({});
        const fresh = await fetch("/api/progress").then((r) => r.json());
        setRegions(fresh);
      } else {
        const err = await res.json();
        toast.error(`Gagal: ${err.error}`);
      }
    } catch {
      toast.error("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-xs text-muted-foreground">
            Kelola data progres harian SE2026
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hari Data
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allDates.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              rekaman data tersimpan
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tanggal Terbaru
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {allDates.length > 0
                ? formatDate(allDates[0], "dd MMM yyyy")
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              input terakhir
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progres Provinsi
            </CardTitle>
            <MapPin className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {latestProvinsi
                ? `${latestProvinsi.percentage.toFixed(1)}%`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              capaian terkini
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Save className="size-4 text-primary" />
            Input Data Progres Harian
          </CardTitle>
          <CardDescription>
            Isi persentase progres untuk setiap kabupaten/kota
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="max-w-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {REGIONS.map((r) => (
                <div key={r.name} className="space-y-1.5">
                  <Label htmlFor={r.name} className="text-sm">
                    {r.name}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={r.name}
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={values[r.name] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9,.\-]/g, "");
                        setValues((prev) => ({
                          ...prev,
                          [r.name]: val,
                        }));
                      }}
                      required
                    />
                    <span className="text-muted-foreground text-sm w-4">%</span>
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="size-4" />
              {saving ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Input</CardTitle>
          <CardDescription>
            {allDates.length} rekaman data progres harian
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allDates.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Belum ada data.
            </p>
          ) : (
            <Table>
              <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap sticky left-0 bg-card z-10">
                      Tanggal
                    </TableHead>
                    {REGIONS.map((r) => (
                      <TableHead
                        key={r.name}
                        className="whitespace-nowrap text-right"
                      >
                        {r.name}
                      </TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap text-right font-bold">
                      Provinsi
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-center">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDates.map((date, idx) => (
                    <TableRow key={date}>
                      <TableCell className="whitespace-nowrap font-medium sticky left-0 bg-card z-10">
                        {formatDate(date, "dd MMM yyyy")}
                        {idx === 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] h-4"
                          >
                            Terbaru
                          </Badge>
                        )}
                      </TableCell>
                      {REGIONS.map((r) => {
                        const region = regions.find(
                          (rr) => rr.name === r.name
                        );
                        const prog = region?.progress.find(
                          (p) => p.date === date
                        );
                        return (
                          <TableCell key={r.name} className="text-right">
                            {prog
                              ? `${prog.percentage.toFixed(2).replace(".", ",")}%`
                              : "—"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-bold">
                        {(() => {
                          const prov = regions.find(
                            (r) => r.type === "provinsi"
                          );
                          const p = prov?.progress.find(
                            (p) => p.date === date
                          );
                          return p
                            ? `${p.percentage.toFixed(1).replace(".", ",")}%`
                            : "—";
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(date)}
                            title="Edit"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(date)}
                            title="Hapus"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
