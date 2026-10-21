export type Macros = {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
};

export type Location = {
  id: string;
  name: string;
  building?: string;
};

export type MenuPeriod = {
  id: string;
  name: string; // "Breakfast", "Lunch", "Dinner", ...
};

export type MenuItem = Macros & {
  id: string;
  name: string;
  station: string; // e.g. "Grill", "Pizza"
  portion: string; // e.g. "1 each", "4 oz"
  hasNutrition: boolean; // false when the dining hall didn't publish numbers
};

export type Menu = {
  periods: MenuPeriod[];
  periodId: string | null;
  items: MenuItem[];
};

export type LogEntry = Macros & {
  id: string;
  date: string; // YYYY-MM-DD, in the student's local time
  name: string;
  source: string; // where it came from, e.g. "Kahlert Village · Lunch" or "Custom"
  servings: number;
  loggedAt: number;
};

export type Goals = Macros;
