import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffbee] dark:bg-[#1a1a2e] p-4">
      <h1 className="text-6xl font-bold text-[#f79039] mb-4">404</h1>
      <p className="text-xl text-[#231f20] dark:text-white mb-8">
        Halaman tidak ditemukan
      </p>
      <Link href="/">
        <Button>Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
}
