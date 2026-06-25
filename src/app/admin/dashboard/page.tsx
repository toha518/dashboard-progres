"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
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
import { format, parseISO } from "date-fns";

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
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data: RegionData[]) => {
        setRegions(data);
        // Map region IDs
        for (const r of data) {
          const idx = REGIONS.findIndex((rr) => rr.name === r.name);
          if (idx >= 0) REGIONS[idx].id = r.id;
        }
      })
      .catch(console.error);
  }, []);

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
  };

  const handleDelete = async (selectedDate: string) => {
    if (!confirm(`Yakin hapus data tanggal ${format(parseISO(selectedDate), "dd MMM yyyy")}?`)) return;

    const dateOnly = selectedDate.split("T")[0];
    try {
      const res = await fetch("/api/admin/progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateOnly }),
      });

      if (res.ok) {
        setMessage("Data berhasil dihapus!");
        const fresh = await fetch("/api/progress").then((r) => r.json());
        setRegions(fresh);
      } else {
        const err = await res.json();
        setMessage(`Gagal: ${err.error}`);
      }
    } catch {
      setMessage("Gagal menghapus data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

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
        setMessage("Data berhasil disimpan!");
        setValues({});
        // Refresh data
        const fresh = await fetch("/api/progress").then((r) => r.json());
        setRegions(fresh);
      } else {
        const err = await res.json();
        setMessage(`Gagal: ${err.error}`);
      }
    } catch {
      setMessage("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) return null;

  // Collect all dates for history
  const allDates = Array.from(
    new Set(regions.flatMap((r) => r.progress.map((p) => p.date)))
  ).sort().reverse();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          Logout
        </Button>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Input Data Progres Harian</CardTitle>
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
                <div key={r.name} className="space-y-1">
                  <Label htmlFor={r.name}>{r.name}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={r.name}
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={values[r.name] ?? ""}
                      onChange={(e) => {
                        // Only allow digits, comma, dot, and minus
                        const val = e.target.value.replace(/[^0-9,.\-]/g, "");
                        setValues((prev) => ({
                          ...prev,
                          [r.name]: val,
                        }));
                      }}
                      required
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              ))}
            </div>

            {message && (
              <p
                className={`text-sm ${
                  message.startsWith("Gagal")
                    ? "text-red-500"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {message}
              </p>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Input</CardTitle>
        </CardHeader>
        <CardContent>
          {allDates.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Belum ada data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                    {REGIONS.map((r) => (
                      <TableHead key={r.name} className="whitespace-nowrap text-right">
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
                  {allDates.map((date) => (
                    <TableRow key={date}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {format(parseISO(date), "dd MMM yyyy")}
                      </TableCell>
                      {REGIONS.map((r) => {
                        const region = regions.find((rr) => rr.name === r.name);
                        const prog = region?.progress.find(
                          (p) => p.date === date
                        );
                        return (
                          <TableCell key={r.name} className="text-right">
                            {prog ? `${prog.percentage.toFixed(2).replace(".", ",")}%` : "—"}
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
                          return p ? `${p.percentage.toFixed(1).replace(".", ",")}%` : "—";
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(date)}
                            title="Edit"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(date)}
                            title="Hapus"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
