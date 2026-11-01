import type { El } from './types';
import { uid } from './utils';

export type SavedComponent = {
  id: string;
  name: string;
  elements: El[];
  width: number;
  height: number;
  createdAt: number;
};

const KEY = 'vellum_components_v1';
const EVENT = 'vellum:components';

function read(): SavedComponent[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is SavedComponent =>
      Boolean(c) && typeof c.id === 'string' && Array.isArray(c.elements),
    );
  } catch {
    return [];
  }
}

function write(list: SavedComponent[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function listComponents(): SavedComponent[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveComponent(name: string, elements: El[], width: number, height: number): SavedComponent {
  const component: SavedComponent = {
    id: uid('cmp'),
    name: name.trim() || 'Untitled component',
    elements: structuredClone(elements),
    width,
    height,
    createdAt: Date.now(),
  };
  write([component, ...read()]);
  return component;
}

export function deleteComponent(id: string) {
  write(read().filter(c => c.id !== id));
}

export function onComponentsChange(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
