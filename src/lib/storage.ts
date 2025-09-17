// src/lib/storage.ts
import type { AppState } from '@/lib/types';

const STORAGE_KEY = 'comar-audit-state';

function emptyState(): AppState {
  return {
    findings: [],
    capas: [],
    evidence: [],
    lastSaved: new Date().toISOString(),
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return emptyState(); // SSR safeguard
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.findings || !parsed.capas || !parsed.evidence) {
      return emptyState();
    }
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveState(next: AppState) {
  if (typeof window === 'undefined') return;
  const withTimestamp: AppState = { ...next, lastSaved: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
}

export function updateState(mutator: (s: AppState) => AppState) {
  const current = loadState();
  const next = mutator(current);
  saveState(next);
  return next;
}
