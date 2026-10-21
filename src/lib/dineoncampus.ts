// Reads University of Utah dining menus from Dine On Campus, the menu system
// Chartwells (the U's dining provider) publishes at https://dineoncampus.com/utah.
//
// NOTE: Dine On Campus has no documented public API. These endpoints are the ones
// its own website calls. They were written without being able to reach the site,
// so run `npm run check-menu` once you have network access to confirm the shapes.
// If Dine On Campus changes them, this is the only file that needs updating.

import "server-only";
import type { Location, Menu, MenuItem, MenuPeriod } from "./types";

const API = "https://api.dineoncampus.com/v1";
const SITE_SLUG = "utah";

// Cache responses on the server so we don't hit Dine On Campus on every page view.
const ONE_HOUR = 60 * 60;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: ONE_HOUR },
  });
  if (!res.ok) {
    throw new Error(`Dine On Campus returned ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

async function getSiteId(): Promise<string> {
  const data = await getJson<{ site?: { id?: string } }>(`/sites/${SITE_SLUG}/info`);
  if (!data.site?.id) throw new Error("Could not find the University of Utah site on Dine On Campus");
  return data.site.id;
}

type RawLocation = { id: string; name: string };
type RawBuilding = { id: string; name: string; locations?: RawLocation[] };

export async function getLocations(): Promise<Location[]> {
  const siteId = await getSiteId();
  const data = await getJson<{ buildings?: RawBuilding[]; locations?: RawLocation[] }>(
    `/locations/all_locations?platform=0&site_id=${siteId}&for_menus=true&with_address=false&with_buildings=true`,
  );

  const locations: Location[] = [];
  for (const building of data.buildings ?? []) {
    for (const loc of building.locations ?? []) {
      locations.push({ id: loc.id, name: loc.name, building: building.name });
    }
  }
  // Some sites return a flat list instead of buildings.
  for (const loc of data.locations ?? []) {
    if (!locations.some((l) => l.id === loc.id)) locations.push({ id: loc.id, name: loc.name });
  }
  return locations.sort((a, b) => a.name.localeCompare(b.name));
}

type RawNutrient = { name?: string; value?: string | number; value_numeric?: string | number };
type RawItem = {
  id: string;
  name: string;
  portion?: string;
  calories?: string | number;
  nutrients?: RawNutrient[];
};
type RawCategory = { name: string; items?: RawItem[] };
type RawPeriodsResponse = {
  periods?: { id: string; name: string; sort_order?: number }[];
  menu?: { periods?: { id: string; categories?: RawCategory[] } | null };
};

// date is YYYY-MM-DD. periodId is optional; without it you get the first meal of the day.
export async function getMenu(locationId: string, date: string, periodId?: string): Promise<Menu> {
  const path = periodId
    ? `/location/${locationId}/periods/${periodId}?platform=0&date=${date}`
    : `/location/${locationId}/periods?platform=0&date=${date}`;
  const data = await getJson<RawPeriodsResponse>(path);

  const periods: MenuPeriod[] = (data.periods ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((p) => ({ id: p.id, name: p.name }));

  const menuPeriod = data.menu?.periods;
  const items: MenuItem[] = [];
  for (const category of menuPeriod?.categories ?? []) {
    for (const raw of category.items ?? []) {
      items.push(toMenuItem(raw, category.name));
    }
  }

  return { periods, periodId: menuPeriod?.id ?? periodId ?? periods[0]?.id ?? null, items };
}

// Turns "12", "12 g", "less than 1 gram" or "-" into a number (or null if there's no number).
export function parseAmount(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  if (/less than 1/i.test(value)) return 0;
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function findNutrient(nutrients: RawNutrient[], pattern: RegExp): number | null {
  const found = nutrients.find((n) => n.name && pattern.test(n.name));
  if (!found) return null;
  return parseAmount(found.value_numeric ?? found.value);
}

export function toMenuItem(raw: RawItem, station: string): MenuItem {
  const nutrients = raw.nutrients ?? [];
  const calories = findNutrient(nutrients, /^calories/i) ?? parseAmount(raw.calories);
  const protein = findNutrient(nutrients, /^protein/i);
  const carbs = findNutrient(nutrients, /carbohydrate/i);
  const fat = findNutrient(nutrients, /^total fat/i);

  return {
    id: raw.id,
    name: raw.name.trim(),
    station,
    portion: raw.portion?.trim() || "1 serving",
    calories: Math.round(calories ?? 0),
    protein: round1(protein ?? 0),
    carbs: round1(carbs ?? 0),
    fat: round1(fat ?? 0),
    hasNutrition: calories !== null || protein !== null || carbs !== null || fat !== null,
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
