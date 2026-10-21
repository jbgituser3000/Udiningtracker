"use client";

import Link from "next/link";
import { useState } from "react";
import MacroSummary from "@/components/MacroSummary";
import { todayString, useGoals, useLog } from "@/lib/storage";
import type { Macros } from "@/lib/types";

function shiftDay(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return todayString(d);
}

function dayLabel(date: string) {
  const today = todayString();
  if (date === today) return "Today";
  if (date === shiftDay(today, -1)) return "Yesterday";
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function TodayPage() {
  const [date, setDate] = useState(todayString);
  const { log, remove } = useLog();
  const { goals } = useGoals();

  const entries = log.filter((e) => e.date === date);
  const totals = entries.reduce<Macros>(
    (sum, e) => ({
      calories: sum.calories + e.calories * e.servings,
      protein: sum.protein + e.protein * e.servings,
      carbs: sum.carbs + e.carbs * e.servings,
      fat: sum.fat + e.fat * e.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <button onClick={() => setDate(shiftDay(date, -1))} className="px-2 py-1 text-2xl text-muted" aria-label="Previous day">
          ‹
        </button>
        <h1 className="text-xl font-bold">{dayLabel(date)}</h1>
        <button
          onClick={() => setDate(shiftDay(date, 1))}
          disabled={date >= todayString()}
          className="px-2 py-1 text-2xl text-muted disabled:opacity-20"
          aria-label="Next day"
        >
          ›
        </button>
      </header>

      <MacroSummary totals={totals} goals={goals} />

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Logged</h2>
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-muted">
            Nothing logged yet.{" "}
            <Link href="/menu" className="font-medium text-accent">
              Browse dining menus
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {entries.map((e) => (
              <li key={e.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {e.servings !== 1 && <span className="text-muted">{e.servings}× </span>}
                    {e.name}
                  </div>
                  <div className="truncate text-xs text-muted">{e.source}</div>
                  <div className="mt-1 text-xs tabular-nums text-muted">
                    {Math.round(e.calories * e.servings)} cal · P {Math.round(e.protein * e.servings)}g · C{" "}
                    {Math.round(e.carbs * e.servings)}g · F {Math.round(e.fat * e.servings)}g
                  </div>
                </div>
                <button onClick={() => remove(e.id)} className="px-2 text-xl text-muted" aria-label={`Remove ${e.name}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
