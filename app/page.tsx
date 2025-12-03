"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Initial() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/starters");
  }, [router]);

  return null;
}