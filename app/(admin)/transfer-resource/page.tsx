"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getStoredUser, isManagerAuthenticated } from "@/core/auth/auth-api";
import { TransferResourcePage } from "@/features/transfer-resource/pages/transfer-resource-page";

export default function TransferResourceRoute() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isManagerAuthenticated() || getStoredUser()?.role !== "MANAGER") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return <TransferResourcePage />;
}
