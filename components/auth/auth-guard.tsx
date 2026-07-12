"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser, getStoredUser, isManagerAuthenticated } from "@/core/auth/auth-api";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!isManagerAuthenticated()) {
        router.replace("/login");
        return;
      }

      try {
        const user = await fetchCurrentUser();
        if (user.role !== "MANAGER") {
          router.replace("/login");
          return;
        }
        setReady(true);
      } catch {
        const stored = getStoredUser();
        if (stored?.role === "MANAGER") {
          setReady(true);
        } else {
          router.replace("/login");
        }
      }
    }

    verify();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
