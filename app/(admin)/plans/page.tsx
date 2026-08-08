import { Suspense } from "react";
import { PlansListPage } from "@/features/plans/pages/plans-list-page";

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-muted">Cargando…</div>}>
      <PlansListPage />
    </Suspense>
  );
}
