"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { todayString, useLog } from "@/lib/storage";

// For food that isn't on a dining hall menu: snacks, off-campus meals, etc.
const FIELDS = [
  { key: "calories", label: "Calories", unit: "cal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
] as const;

type Key = (typeof FIELDS)[number]["key"];

export default function AddCustomPage() {
  const router = useRouter();
  const { add } = useLog();
  const [name, setName] = useState("");
  const [values, setValues] = useState<Record<Key, string>>({ calories: "", protein: "", carbs: "", fat: "" });

  const num = (v: string) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    add({
      date: todayString(),
      name: name.trim(),
      source: "Custom",
      servings: 1,
      calories: num(values.calories),
      protein: num(values.protein),
      carbs: num(values.carbs),
      fat: num(values.fat),
    });
    router.push("/");
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="text-xl font-bold">Add custom food</h1>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <input
          required
          placeholder="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
        />
        {FIELDS.map((f) => (
          <label key={f.key} className="flex items-center justify-between gap-4">
            <span className="font-medium">{f.label}</span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="0"
                value={values[f.key]}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-right tabular-nums"
              />
              <span className="w-6 text-sm text-muted">{f.unit}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="submit" className="w-full rounded-xl bg-accent py-3 font-semibold text-white">
        Add to today
      </button>
    </form>
  );
}
