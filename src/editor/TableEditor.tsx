import { useState } from 'react';
import type { TableElement, TableMerge } from '../lib/types';
import { evaluateTable } from '../lib/rich/formula';

type Props = {
  el: TableElement;
  onPatch: (patch: Partial<TableElement>, merge?: string) => void;
  onExit: () => void;
};

function normFracs(arr: number[] | undefined, n: number): number[] {
  if (!arr || arr.length !== n) return Array.from({ length: n }, () => 1 / Math.max(1, n));
  const sum = arr.reduce((a, b) => a + b, 0) || 1;
  return arr.map(v => v / sum);
}

export function TableEditor({ el, onPatch, onExit }: Props) {
  const rows = Math.max(1, el.cells.length);
  const cols = Math.max(1, el.cells[0]?.length ?? 1);
  const colFracs = normFracs(el.colWidths, cols);
  const rowFracs = normFracs(el.rowHeights, rows);

  const [anchor, setAnchor] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [focus, setFocus] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const evaluated = evaluateTable(el.cells);

  const rMin = Math.min(anchor.r, focus.r);
  const rMax = Math.max(anchor.r, focus.r);
  const cMin = Math.min(anchor.c, focus.c);
  const cMax = Math.max(anchor.c, focus.c);

  const setCell = (r: number, c: number, value: string) => {
    const next = el.cells.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : [...row],
    );
    onPatch({ cells: next }, `table-${el.id}`);
  };

  const moveFocus = (nr: number, nc: number) => {
    const r = Math.max(0, Math.min(rows - 1, nr));
    const c = Math.max(0, Math.min(cols - 1, nc));
    setAnchor({ r, c });
    setFocus({ r, c });
    requestAnimationFrame(() => {
      const inp = document.querySelector<HTMLInputElement>(
        `[data-table-id="${el.id}"] [data-rc="${r},${c}"]`,
      );
      inp?.focus();
    });
  };

  const mergeSelection = () => {
    if (rMin === rMax && cMin === cMax) return;
    const rs = rMax - rMin + 1;
    const cs = cMax - cMin + 1;
    const cleaned = (el.merges ?? []).filter(
      m => m.r + m.rs <= rMin || m.r > rMax || m.c + m.cs <= cMin || m.c > cMax,
    );
    const nextMerge: TableMerge = { r: rMin, c: cMin, rs, cs };
    onPatch({ merges: [...cleaned, nextMerge] });
  };

  const unmergeSelection = () => {
    const cleaned = (el.merges ?? []).filter(
      m => !(focus.r >= m.r && focus.r < m.r + m.rs && focus.c >= m.c && focus.c < m.c + m.cs),
    );
    onPatch({ merges: cleaned });
  };

  const addRow = () => {
    const next = [...el.cells.map(r => [...r]), Array.from({ length: cols }, () => '')];
    onPatch({
      cells: next,
      rowHeights: Array.from({ length: next.length }, () => 1 / next.length),
    });
  };

  const removeRow = () => {
    if (rows <= 1) return;
    const next = el.cells.filter((_, i) => i !== focus.r);
    onPatch({
      cells: next,
      rowHeights: Array.from({ length: next.length }, () => 1 / next.length),
      merges: (el.merges ?? []).filter(m => m.r + m.rs <= next.length),
    });
    setFocus({ r: Math.min(focus.r, next.length - 1), c: focus.c });
  };

  const addCol = () => {
    const next = el.cells.map(r => [...r, '']);
    onPatch({
      cells: next,
      colWidths: Array.from({ length: cols + 1 }, () => 1 / (cols + 1)),
    });
  };

  const removeCol = () => {
    if (cols <= 1) return;
    const next = el.cells.map(r => r.filter((_, c) => c !== focus.c));
    onPatch({
      cells: next,
      colWidths: Array.from({ length: cols - 1 }, () => 1 / (cols - 1)),
      merges: (el.merges ?? []).filter(m => m.c + m.cs <= cols - 1),
    });
    setFocus({ r: focus.r, c: Math.min(focus.c, cols - 2) });
  };

  return (
    <div
      data-table-id={el.id}
      style={{ position: 'relative', width: '100%', height: '100%', boxSizing: 'border-box' }}
      onPointerDown={e => e.stopPropagation()}
      onDoubleClick={e => e.stopPropagation()}
    >
      <div className="tbl-toolbar">
        <button type="button" onClick={mergeSelection}>Merge</button>
        <button type="button" onClick={unmergeSelection}>Unmerge</button>
        <button type="button" onClick={addRow}>+Row</button>
        <button type="button" onClick={addCol}>+Col</button>
        <button type="button" onClick={removeRow}>−Row</button>
        <button type="button" onClick={removeCol}>−Col</button>
        <button type="button" onClick={onExit}>Done</button>
      </div>
      <div
        style={{
          display: 'grid',
          width: '100%',
          height: '100%',
          gridTemplateColumns: colFracs.map(f => `${f * 100}%`).join(' '),
          gridTemplateRows: rowFracs.map(f => `${f * 100}%`).join(' '),
          border: `${el.borderWidth}px solid ${el.borderColor}`,
          boxSizing: 'border-box',
        }}
      >
        {(() => {
          const merges = el.merges ?? [];
          const spanAt = new Map<string, TableMerge>();
          const skip = new Set<string>();
          for (const m of merges) {
            if (m.r >= rows || m.c >= cols) continue;
            const rs = Math.max(1, Math.min(m.rs, rows - m.r));
            const cs = Math.max(1, Math.min(m.cs, cols - m.c));
            spanAt.set(`${m.r},${m.c}`, { r: m.r, c: m.c, rs, cs });
            for (let rr = m.r; rr < m.r + rs; rr++) {
              for (let cc = m.c; cc < m.c + cs; cc++) {
                if (rr !== m.r || cc !== m.c) skip.add(`${rr},${cc}`);
              }
            }
          }
          return el.cells.map((row, r) =>
            row.map((val, c) => {
              const key = `${r},${c}`;
              if (skip.has(key)) return null;
              const mg = spanAt.get(key);
              const isSel = r >= rMin && r <= rMax && c >= cMin && c <= cMax;
              const isFocused = focus.r === r && focus.c === c;
              const isHeader = el.header && r === 0;
              const shown = !isFocused && val.startsWith('=') ? String(evaluated[r]?.[c] ?? val) : val;
              return (
                <input
                  key={`${r}-${c}`}
                  data-rc={`${r},${c}`}
                  value={shown}
                  onFocus={() => setFocus({ r, c })}
                  onMouseDown={e => {
                    if (e.shiftKey) {
                      setFocus({ r, c });
                    } else {
                      setAnchor({ r, c });
                      setFocus({ r, c });
                    }
                  }}
                  onChange={e => setCell(r, c, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') { e.preventDefault(); onExit(); return; }
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const nextC = e.shiftKey ? c - 1 : c + 1;
                      if (nextC < 0) moveFocus(r - 1, cols - 1);
                      else if (nextC >= cols) moveFocus(r + 1, 0);
                      else moveFocus(r, nextC);
                      return;
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      moveFocus(e.shiftKey ? r - 1 : r + 1, c);
                      return;
                    }
                    if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(r - 1, c); return; }
                    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(r + 1, c); return; }
                    if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
                      e.preventDefault(); moveFocus(r, c - 1); return;
                    }
                    if (e.key === 'ArrowRight' && e.currentTarget.selectionEnd === e.currentTarget.value.length) {
                      e.preventDefault(); moveFocus(r, c + 1); return;
                    }
                  }}
                  style={{
                    gridColumn: mg && mg.cs > 1 ? `span ${mg.cs}` : undefined,
                    gridRow: mg && mg.rs > 1 ? `span ${mg.rs}` : undefined,
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    border: `${el.borderWidth}px solid ${el.borderColor}`,
                    padding: `0 ${el.padding}px`,
                    background: isHeader ? el.headerFill : r % 2 === 1 && el.altFill ? el.altFill : el.fill,
                    color: isHeader ? el.headerColor : el.textColor,
                    fontFamily: el.fontFamily,
                    fontSize: el.fontSize,
                    fontWeight: isHeader ? 700 : 500,
                    textAlign: el.align,
                    outline: isSel ? '2px solid #2440F0' : 'none',
                    outlineOffset: '-2px',
                  }}
                />
              );
            }),
          );
        })()}
      </div>
    </div>
  );
}
