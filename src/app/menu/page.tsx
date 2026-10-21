"use client";

import { useEffect, useMemo, useState } from "react";
import { todayString, useLog } from "@/lib/storage";
import type { Location, Menu, MenuItem } from "@/lib/types";

const LAST_LOCATION_KEY = "utah-macros:last-location";

export default function MenuPage() {
  const { add } = useLog();
  const date = todayString();

  const [locations, setLocations] = useState<Location[] | null>(null);
  const [locationId, setLocationId] = useState<string>("");
  const [periodId, setPeriodId] = useState<string | undefined>(undefined);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load the list of dining locations once.
  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data: { locations?: Location[]; error?: string }) => {
        if (!data.locations) throw new Error(data.error);
        setLocations(data.locations);
        let last = "";
        try {
          last = localStorage.getItem(LAST_LOCATION_KEY) ?? "";
        } catch {}
        const start = data.locations.find((l) => l.id === last) ?? data.locations[0];
        if (start) setLocationId(start.id);
      })
      .catch(() => setError("Couldn't load dining locations. Check your connection and try again."));
  }, []);

  // Load the menu whenever the location or meal changes.
  useEffect(() => {
    if (!locationId) return;
    const params = new URLSearchParams({ location: locationId, date });
    if (periodId) params.set("period", periodId);
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/menu?${params}`)
      .then((r) => r.json())
      .then((data: Menu & { error?: string }) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setMenu(data);
      })
      .catch(() => !cancelled && setError("Couldn't load this menu. It may be closed today."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [locationId, periodId, date]);

  const locationName = locations?.find((l) => l.id === locationId)?.name ?? "";
  const periodName = menu?.periods.find((p) => p.id === menu.periodId)?.name ?? "";

  // Group items by station, filtered by the search box.
  const stations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const groups = new Map<string, MenuItem[]>();
    for (const item of menu?.items ?? []) {
      if (q && !item.name.toLowerCase().includes(q) && !item.station.toLowerCase().includes(q)) continue;
      groups.set(item.station, [...(groups.get(item.station) ?? []), item]);
    }
    return [...groups.entries()];
  }, [menu, search]);

  function chooseLocation(id: string) {
    setLocationId(id);
    setPeriodId(undefined);
    setMenu(null);
    try {
      localStorage.setItem(LAST_LOCATION_KEY, id);
    } catch {}
  }

  function logItem(item: MenuItem, servings: number) {
    add({
      date,
      name: item.name,
      source: [locationName, periodName].filter(Boolean).join(" · "),
      servings,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    });
    setSelected(null);
    setToast(`Added ${item.name}`);
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Dining menus</h1>

      <select
        value={locationId}
        onChange={(e) => chooseLocation(e.target.value)}
        disabled={!locations}
        className="w-full rounded-xl border border-border bg-card px-3 py-3 font-medium"
        aria-label="Dining location"
      >
        {!locations && <option>Loading locations…</option>}
        {locations?.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      {menu && menu.periods.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {menu.periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodId(p.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                p.id === menu.periodId ? "bg-accent text-white" : "border border-border bg-card"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <input
        type="search"
        placeholder="Search this menu"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-3 py-3"
      />

      {error && <p className="rounded-xl bg-accent-soft p-4 text-sm">{error}</p>}
      {loading && <p className="text-center text-muted">Loading menu…</p>}
      {!loading && !error && menu && stations.length === 0 && (
        <p className="text-center text-muted">{search ? "No matches." : "No menu posted for this meal."}</p>
      )}

      {!loading &&
        stations.map(([station, items]) => (
          <section key={station}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{station}</h2>
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {items.map((item) => (
                <li key={item.id}>
                  <button onClick={() => setSelected(item)} className="flex w-full items-center gap-3 p-4 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs tabular-nums text-muted">
                        {item.hasNutrition
                          ? `${item.portion} · ${item.calories} cal · P ${item.protein}g · C ${item.carbs}g · F ${item.fat}g`
                          : `${item.portion} · No nutrition info posted`}
                      </div>
                    </div>
                    <span className="text-2xl text-accent">+</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

      {selected && <ServingsSheet item={selected} onCancel={() => setSelected(null)} onAdd={logItem} />}

      {toast && (
        <div className="fixed inset-x-0 bottom-24 flex justify-center">
          <div className="rounded-full bg-foreground px-4 py-2 text-sm text-background">{toast}</div>
        </div>
      )}
    </div>
  );
}

function ServingsSheet({
  item,
  onCancel,
  onAdd,
}: {
  item: MenuItem;
  onCancel: () => void;
  onAdd: (item: MenuItem, servings: number) => void;
}) {
  const [servings, setServings] = useState(1);
  const step = (d: number) => setServings((s) => Math.max(0.5, Math.round((s + d) * 2) / 2));

  return (
    <div className="fixed inset-0 z-10 flex items-end bg-black/40" onClick={onCancel}>
      <div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold">{item.name}</h3>
        <p className="text-sm text-muted">{item.portion} per serving</p>
        {!item.hasNutrition && (
          <p className="mt-2 text-sm text-accent">The dining hall hasn&apos;t posted nutrition for this item, so it will log as 0.</p>
        )}

        <div className="my-5 flex items-center justify-center gap-6">
          <button onClick={() => step(-0.5)} className="h-12 w-12 rounded-full border border-border text-2xl" aria-label="Fewer servings">
            −
          </button>
          <div className="w-24 text-center">
            <div className="text-3xl font-bold tabular-nums">{servings}</div>
            <div className="text-xs text-muted">servings</div>
          </div>
          <button onClick={() => step(0.5)} className="h-12 w-12 rounded-full border border-border text-2xl" aria-label="More servings">
            +
          </button>
        </div>

        <div className="mb-5 grid grid-cols-4 text-center text-sm tabular-nums">
          <div>
            <div className="font-semibold">{Math.round(item.calories * servings)}</div>
            <div className="text-muted">cal</div>
          </div>
          <div>
            <div className="font-semibold">{Math.round(item.protein * servings)}g</div>
            <div className="text-muted">protein</div>
          </div>
          <div>
            <div className="font-semibold">{Math.round(item.carbs * servings)}g</div>
            <div className="text-muted">carbs</div>
          </div>
          <div>
            <div className="font-semibold">{Math.round(item.fat * servings)}g</div>
            <div className="text-muted">fat</div>
          </div>
        </div>

        <button onClick={() => onAdd(item, servings)} className="w-full rounded-xl bg-accent py-3 font-semibold text-white">
          Add to today
        </button>
      </div>
    </div>
  );
}
