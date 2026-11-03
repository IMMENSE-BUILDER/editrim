import type { EditrimIconName } from '../components/EditrimIcon';

export type StudioCommand = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: EditrimIconName;
  keywords?: string[];
  run: () => void;
};

/** Rank commands by how well they match a query; exact-prefix beats substring. */
export function filterCommands(commands: StudioCommand[], query: string): StudioCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  const scored: { command: StudioCommand; score: number }[] = [];
  for (const command of commands) {
    const haystack = [command.label, command.group, ...(command.keywords ?? [])].join(' ').toLowerCase();
    if (!haystack.includes(q)) continue;
    let score = 3;
    if (command.label.toLowerCase().startsWith(q)) score = 0;
    else if (command.label.toLowerCase().split(/\s+/).some(word => word.startsWith(q))) score = 1;
    else if (haystack.includes(q)) score = 2;
    scored.push({ command, score });
  }
  return scored.sort((a, b) => a.score - b.score || a.command.label.localeCompare(b.command.label)).map(item => item.command);
}

export type { EditrimIconName };
