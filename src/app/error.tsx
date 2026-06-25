"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffbee] dark:bg-[#1a1a2e] p-4">
      <h1 className="text-4xl font-bold text-[#f79039] mb-4">
        Terjadi Kesalahan
      </h1>
      <p className="text-[#231f20] dark:text-white mb-8 text-center max-w-md">
        Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
      </p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
