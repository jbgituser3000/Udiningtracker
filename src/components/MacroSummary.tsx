import type { Goals, Macros } from "@/lib/types";

function Bar({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted tabular-nums">
          {Math.round(value)} / {goal}
          {unit}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function MacroSummary({ totals, goals }: { totals: Macros; goals: Goals }) {
  const left = goals.calories - Math.round(totals.calories);
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-4xl font-bold tabular-nums">{Math.round(totals.calories)}</div>
          <div className="text-sm text-muted">of {goals.calories} calories</div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-semibold tabular-nums ${left < 0 ? "text-accent" : ""}`}>{Math.abs(left)}</div>
          <div className="text-sm text-muted">{left < 0 ? "over" : "left"}</div>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <Bar label="Protein" value={totals.protein} goal={goals.protein} unit="g" color="var(--protein)" />
        <Bar label="Carbs" value={totals.carbs} goal={goals.carbs} unit="g" color="var(--carbs)" />
        <Bar label="Fat" value={totals.fat} goal={goals.fat} unit="g" color="var(--fat)" />
      </div>
    </section>
  );
}
