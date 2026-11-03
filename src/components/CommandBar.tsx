import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { EditrimIcon } from './EditrimIcon';
import { filterCommands, type StudioCommand } from '../lib/commands';
import '../styles/command.css';

type Group = {
  name: string;
  rows: { command: StudioCommand; index: number }[];
};

/** Spotlight-style quick actions palette. */
export function CommandBar({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: StudioCommand[];
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const baseId = useId().replace(/:/g, '');
  const listId = `${baseId}-actions`;

  const { groups, rows } = useMemo(() => {
    const filtered = filterCommands(commands, query);
    const order: string[] = [];
    const byGroup = new Map<string, StudioCommand[]>();
    for (const command of filtered) {
      if (!byGroup.has(command.group)) {
        byGroup.set(command.group, []);
        order.push(command.group);
      }
      byGroup.get(command.group)!.push(command);
    }
    let index = 0;
    const nextGroups: Group[] = order.map(name => ({
      name,
      rows: byGroup.get(name)!.map(command => ({ command, index: index++ })),
    }));
    return { groups: nextGroups, rows: nextGroups.flatMap(group => group.rows.map(row => row.command)) };
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery('');
    setActive(0);
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      const current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const movedIntoDialog = Boolean(current && current !== document.body && current.closest('[role="dialog"], .modal'));
      const stillInPalette = Boolean(current && panelRef.current?.contains(current));
      if (!movedIntoDialog && (stillInPalette || !current || current === document.body) && restoreRef.current?.isConnected) {
        restoreRef.current.focus({ preventScroll: true });
      }
    };
  }, [open]);

  useEffect(() => {
    setActive(index => Math.min(index, Math.max(rows.length - 1, 0)));
  }, [rows.length]);

  useEffect(() => {
    if (!open) return;
    rowRefs.current[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const runCommand = (command?: StudioCommand) => {
    if (!command) return;
    onClose();
    command.run();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (rows.length) setActive(index => (index + 1) % rows.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (rows.length) setActive(index => (index - 1 + rows.length) % rows.length);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      if (rows.length) setActive(rows.length - 1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      runCommand(rows[active]);
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  if (!open) return null;

  const activeId = rows.length ? `${baseId}-option-${active}` : undefined;

  return (
    <div
      className="cmd-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={panelRef}
        className="cmd-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Quick actions"
        onMouseDown={event => {
          if (!(event.target as HTMLElement).closest('input')) event.preventDefault();
        }}
      >
        <div className="cmd-search">
          <EditrimIcon name="search" size={17} />
          <input
            ref={inputRef}
            className="cmd-input"
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder="Search actions"
            aria-label="Search actions"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="cmd-esc">Esc</kbd>
        </div>

        <div
          className="cmd-list"
          id={listId}
          role="listbox"
          aria-label="Actions"
        >
          {rows.length === 0 && (
            <div className="cmd-empty">No actions match "{query.trim()}"</div>
          )}

          {groups.map(group => (
            <div className="cmd-group" key={group.name} role="group" aria-label={group.name}>
              <div className="cmd-group-title">{group.name}</div>
              {group.rows.map(({ command, index }) => (
                <div
                  key={command.id}
                  id={`${baseId}-option-${index}`}
                  ref={node => { rowRefs.current[index] = node; }}
                  className={`cmd-row ${index === active ? 'is-active' : ''}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => runCommand(command)}
                >
                  <span className="cmd-row-icon"><EditrimIcon name={command.icon} size={15} /></span>
                  <span className="cmd-row-label">{command.label}</span>
                  {command.hint && <span className="cmd-row-hint">{command.hint}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
