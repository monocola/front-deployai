"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  PLAN_FEATURES,
  type Plan,
  type PlanFeatureKey,
  type UpdatePlanFeaturesPayload,
} from "@/features/plans/models/plan.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PlanFeaturesFormProps {
  plan: Plan;
  saving: boolean;
  onSubmit: (payload: UpdatePlanFeaturesPayload) => Promise<void>;
}

export function PlanFeaturesForm({ plan, saving, onSubmit }: PlanFeaturesFormProps) {
  const [query, setQuery] = useState("");
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(() => ({
    ...plan.features.features,
  }));
  const [valuesMap, setValuesMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const key of PLAN_FEATURES) {
      initial[key] = plan.features.values[key] ?? "";
    }
    return initial;
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PLAN_FEATURES;
    return PLAN_FEATURES.filter((feature) => feature.toLowerCase().includes(q));
  }, [query]);

  const toggleFeature = (feature: PlanFeatureKey) => {
    setEnabledMap((prev) => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const features = PLAN_FEATURES.map((feature) => ({
      feature,
      enabled: !!enabledMap[feature],
      value: valuesMap[feature]?.trim() ? valuesMap[feature].trim() : null,
    }));
    await onSubmit({ features });
  };

  const enabledCount = PLAN_FEATURES.filter((f) => enabledMap[f]).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {enabledCount} de {PLAN_FEATURES.length} características activas
        </p>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar característica..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((feature) => (
          <div
            key={feature}
            className={cn(
              "rounded-lg border p-4 transition-colors",
              enabledMap[feature]
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card-elevated/30"
            )}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={!!enabledMap[feature]}
                onChange={() => toggleFeature(feature)}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">{feature}</span>
                <Input
                  value={valuesMap[feature]}
                  onChange={(e) =>
                    setValuesMap((prev) => ({ ...prev, [feature]: e.target.value }))
                  }
                  placeholder="Valor opcional (ej. 5, 24h)"
                  className="mt-2 h-8 text-xs"
                />
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar características
        </Button>
      </div>
    </form>
  );
}
