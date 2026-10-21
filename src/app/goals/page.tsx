"use client";

import { useState } from "react";
import { DEFAULT_GOALS, useGoals } from "@/lib/storage";
import type { Goals } from "@/lib/types";

const FIELDS: { key: keyof Goals; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "cal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

export default function GoalsPage() {
  const { goals, setGoals } = useGoals();
  const [draft, setDraft] = useState<Record<keyof Goals, string> | null>(null);
  const [saved, setSaved] = useState(false);

  // Start editing from the saved goals the first time a field changes.
  const values = draft ?? {
    calories: String(goals.calories),
    protein: String(goals.protein),
    carbs: String(goals.carbs),
    fat: String(goals.fat),
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = { ...goals };
    for (const f of FIELDS) {
      const n = Number(values[f.key]);
      if (Number.isFinite(n) && n >= 0) next[f.key] = Math.round(n);
    }
    setGoals(next);
    setDraft(null);
    setSaved(true);
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <h1 className="text-xl font-bold">Daily goals</h1>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex items-center justify-between gap-4">
            <span className="font-medium">{f.label}</span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={values[f.key]}
                onChange={(e) => {
                  setSaved(false);
                  setDraft({ ...values, [f.key]: e.target.value });
                }}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-right tabular-nums"
              />
              <span className="w-6 text-sm text-muted">{f.unit}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="submit" className="w-full rounded-xl bg-accent py-3 font-semibold text-white">
        {saved ? "Saved ✓" : "Save goals"}
      </button>
      <button
        type="button"
        onClick={() => {
          setGoals(DEFAULT_GOALS);
          setDraft(null);
        }}
        className="w-full py-2 text-sm text-muted"
      >
        Reset to defaults
      </button>
      <p className="text-xs text-muted">
        Not sure what to aim for? A registered dietitian can help you set goals that fit you.
      </p>
    </form>
  );
}
