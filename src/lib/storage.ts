"use client";

// Saves the food log and goals in the browser (localStorage), so each student's
// data stays on their own phone. No accounts needed for version 1.

import { useCallback, useSyncExternalStore } from "react";
import type { Goals, LogEntry } from "./types";

const LOG_KEY = "utah-macros:log";
const GOALS_KEY = "utah-macros:goals";

export const DEFAULT_GOALS: Goals = { calories: 2200, protein: 150, carbs: 250, fat: 70 };

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener); // keeps multiple tabs in sync
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    // Private browsing or blocked storage: fall back to defaults.
  }
  // Return the same object while the stored text is unchanged, so React doesn't re-render forever.
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked; nothing else we can do.
  }
  listeners.forEach((l) => l());
}

const EMPTY_LOG: LogEntry[] = [];

export function useLog() {
  const log = useSyncExternalStore(
    subscribe,
    () => read<LogEntry[]>(LOG_KEY, EMPTY_LOG),
    () => EMPTY_LOG,
  );

  const add = useCallback((entry: Omit<LogEntry, "id" | "loggedAt">) => {
    const current = read<LogEntry[]>(LOG_KEY, EMPTY_LOG);
    const full: LogEntry = { ...entry, id: crypto.randomUUID(), loggedAt: Date.now() };
    write(LOG_KEY, [...current, full]);
  }, []);

  const remove = useCallback((id: string) => {
    write(LOG_KEY, read<LogEntry[]>(LOG_KEY, EMPTY_LOG).filter((e) => e.id !== id));
  }, []);

  return { log, add, remove };
}

export function useGoals() {
  const goals = useSyncExternalStore(
    subscribe,
    () => read<Goals>(GOALS_KEY, DEFAULT_GOALS),
    () => DEFAULT_GOALS,
  );
  const setGoals = useCallback((g: Goals) => write(GOALS_KEY, g), []);
  return { goals, setGoals };
}

// Today's date as YYYY-MM-DD in the phone's own time zone.
export function todayString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
