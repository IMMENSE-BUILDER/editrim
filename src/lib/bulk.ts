import type { Page, TextElement } from './types';
import { uid } from './utils';

/** Rows past this limit are never generated — the UI warns before truncating. */
export const MAX_ROWS = 100;

export type CsvDelimiter = ',' | ';' | '\t';

export type CsvParse = {
  headers: string[];
  rows: string[][];
  delimiter: CsvDelimiter;
  /** Set when the source is malformed, so the UI can block and explain. */
  error?: string;
};

const DELIMITERS: CsvDelimiter[] = [',', ';', '\t'];
const TOKEN_ONLY = /^\{\{\s*([^{}]+?)\s*\}\}$|^\{\s*([^{}]+?)\s*\}$/;
const DOUBLE_TOKEN = /\{\{\s*([^{}]+?)\s*\}\}/g;

/**
 * Reads one line of raw CSV until the first newline that is not inside quotes,
 * counting delimiters outside quotes. Comma wins ties because it is the default.
 */
function detectDelimiter(text: string): CsvDelimiter {
  const counts: Record<CsvDelimiter, number> = { ',': 0, ';': 0, '\t': 0 };
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        i++;
        continue;
      }
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (ch === '\n' || ch === '\r') break;
    if (ch === ',' || ch === ';' || ch === '\t') counts[ch]++;
  }

  let best: CsvDelimiter = ',';
  for (const delimiter of DELIMITERS) {
    if (counts[delimiter] > counts[best]) best = delimiter;
  }
  return best;
}

function readRows(text: string, delimiter: CsvDelimiter) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let fieldStarted = false;

  const pushField = () => {
    row.push(field);
    field = '';
    fieldStarted = false;
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else if (ch === '\r') {
        if (text[i + 1] === '\n') i++;
        field += '\n';
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"' && !fieldStarted) {
      quoted = true;
      fieldStarted = true;
      continue;
    }
    if (ch === delimiter) {
      pushField();
      continue;
    }
    if (ch === '\r') {
      if (text[i + 1] === '\n') i++;
      pushRow();
      continue;
    }
    if (ch === '\n') {
      pushRow();
      continue;
    }
    field += ch;
    fieldStarted = true;
  }

  if (quoted) {
    if (fieldStarted || field.length || row.length) pushRow();
    return { rows, unterminated: true };
  }
  if (fieldStarted || field.length || row.length) pushRow();
  return { rows, unterminated: false };
}

/** Trim, name blank headers, and make every header unique (case-insensitively). */
function uniqueHeaders(raw: string[]): string[] {
  const seen = new Set<string>();
  return raw.map((cell, index) => {
    const base = cell.trim() || `Column ${index + 1}`;
    let name = base;
    let suffix = 2;
    while (seen.has(name.toLowerCase())) {
      name = `${base} (${suffix})`;
      suffix++;
    }
    seen.add(name.toLowerCase());
    return name;
  });
}

/**
 * RFC4180-ish CSV parse: quoted fields, doubled quotes inside quotes, CRLF/LF,
 * newlines inside quoted fields, delimiter auto-detected from the first line.
 * Fully empty rows are dropped. Rows are padded/trimmed to the header width.
 */
export function parseCsv(text: string): CsvParse {
  const source = text.replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(source);
  const { rows: rawRows, unterminated } = readRows(source, delimiter);
  const quoteError = 'The CSV ends inside a quoted value. Close the quote and try again.';

  const rows = rawRows.filter(row => row.some(cell => cell.trim() !== ''));
  if (!rows.length) {
    return {
      headers: [],
      rows: [],
      delimiter,
      error: unterminated ? quoteError : 'No rows found. Add a header row and at least one data row.',
    };
  }

  const headers = uniqueHeaders(rows[0]);
  let overflow = '';
  const data = rows.slice(1).map((row, index) => {
    const cells = row.map(cell => cell.trim());
    if (!overflow && cells.length > headers.length && cells.slice(headers.length).some(cell => cell !== '')) {
      const columns = `${headers.length} ${headers.length === 1 ? 'column' : 'columns'}`;
      overflow = `Row ${index + 2} has ${cells.length} values but there ${headers.length === 1 ? 'is' : 'are'} ${columns}. Check the delimiter.`;
    }
    return headers.map((_, column) => cells[column] ?? '');
  });

  return {
    headers,
    rows: data,
    delimiter,
    error: unterminated ? quoteError : overflow || undefined,
  };
}

/** Lowercase key used for header / token / label comparison. */
export function keyOf(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

/** Look up a cell without caring about header casing. */
function cellOf(row: Record<string, string>, key: string): string | undefined {
  const wanted = keyOf(key);
  for (const [name, value] of Object.entries(row)) {
    if (keyOf(name) === wanted) return value;
  }
  return undefined;
}

/**
 * Replaces {{key}} and {key} with row values. Keys are matched case-insensitively
 * and trimmed; tokens without a matching column are left exactly as written.
 */
export function replaceTokens(text: string, row: Record<string, string>): string {
  const token = /\{\{\s*([^{}]+?)\s*\}\}|\{\s*([^{}]+?)\s*\}/g;
  return text.replace(token, (match, double: string | undefined, single: string | undefined) => {
    const key = (double ?? single ?? '').trim();
    if (!key) return match;
    const value = cellOf(row, key);
    return value === undefined ? match : value;
  });
}

/**
 * Clones a page for one CSV row. Mapped text layers take the cell verbatim;
 * `__text__` and unmapped layers keep their copy and get token replacement.
 * Non-text layers are cloned untouched.
 */
export function applyRow(
  page: Page,
  mapping: Record<string, string | '__text__'>,
  row: Record<string, string>,
  index: number,
): Page {
  const next = structuredClone(page);
  next.id = uid('p');
  next.name = `Row ${index + 1}`;

  for (const el of next.elements) {
    if (el.type !== 'text') continue;
    const column = mapping[el.id];
    if (column && column !== '__text__') {
      const value = cellOf(row, column);
      if (value !== undefined) {
        el.text = value;
        continue;
      }
    }
    el.text = replaceTokens(el.text, row);
  }

  return next;
}

/* ---------- auto matching ---------- */

const LABEL_GROUPS: string[][] = [
  ['name', 'full name', 'contact name', 'customer name', 'person'],
  ['title', 'headline', 'heading', 'subject'],
  ['company', 'organization', 'organisation', 'brand', 'employer', 'business'],
  ['role', 'position', 'job', 'job title', 'job role'],
];

const IDENTITY_LABELS = new Set(['name', 'full name', 'title', 'headline', 'heading']);

function groupFor(label: string): string[] | null {
  const key = keyOf(label);
  return LABEL_GROUPS.find(group => group.includes(key)) ?? null;
}

/** Maps text layers whose text is exactly a token (e.g. `{{name}}`) to that column. */
export function autoMatchTokens(page: Page, headers: string[]): Record<string, string> {
  const byKey = new Map<string, string>();
  for (const header of headers) {
    const key = keyOf(header);
    if (key && !byKey.has(key)) byKey.set(key, header);
  }

  const mapping: Record<string, string> = {};
  for (const el of page.elements) {
    if (el.type !== 'text') continue;
    const match = el.text.trim().match(TOKEN_ONLY);
    if (!match) continue;
    const token = (match[1] ?? match[2] ?? '').trim();
    const header = byKey.get(keyOf(token));
    if (header) mapping[el.id] = header;
  }
  return mapping;
}

/**
 * High-confidence column matching by element name, token-only text, exact short
 * copy, or tight synonym groups. Templates rarely name layers semantically, so
 * an unmistakable hero text (40px+, 1.4× the next size) can fill an identity
 * column such as Name or Title. Everything else stays unmapped.
 */
export function autoMatch(page: Page, headers: string[]): Record<string, string> {
  const byKey = new Map<string, string>();
  for (const header of headers) {
    const key = keyOf(header);
    if (key && !byKey.has(key)) byKey.set(key, header);
  }

  const mapping: Record<string, string> = {};
  const used = new Set<string>();
  const text = page.elements.filter((el): el is TextElement => el.type === 'text');

  const assign = (el: TextElement, header: string | undefined) => {
    if (!header || mapping[el.id] || used.has(header)) return;
    mapping[el.id] = header;
    used.add(header);
  };

  const findHeader = (label: string): string | undefined => {
    const key = keyOf(label);
    if (!key) return undefined;
    const exact = byKey.get(key);
    if (exact) return exact;
    const group = groupFor(key);
    if (!group) return undefined;
    for (const candidate of group) {
      const header = byKey.get(candidate);
      if (header) return header;
    }
    return undefined;
  };

  // 1. Token-only text is the strongest signal.
  for (const el of text) {
    const match = el.text.trim().match(TOKEN_ONLY);
    if (!match) continue;
    assign(el, byKey.get(keyOf((match[1] ?? match[2] ?? '').trim())));
  }

  // 2. Layer name, including a few well-known synonyms.
  for (const el of text) {
    if (mapping[el.id]) continue;
    assign(el, findHeader(el.name));
  }

  // 3. Short literal copy that names a column ("Company", "Title").
  for (const el of text) {
    if (mapping[el.id]) continue;
    const copy = el.text.replace(/\s+/g, ' ').trim();
    if (!copy || copy.length > 32 || copy.split(' ').length > 4) continue;
    assign(el, byKey.get(keyOf(copy)));
  }

  // 4. Hero fallback — the one obviously largest text becomes the name/title.
  const identity = headers.find(header => IDENTITY_LABELS.has(keyOf(header)) && !used.has(header));
  if (identity) {
    const free = text
      .filter(el => !mapping[el.id] && !el.hidden)
      .sort((a, b) => b.fontSize - a.fontSize || b.w * b.h - a.w * a.h);
    const hero = free[0];
    const runnerUp = free[1];
    if (hero && hero.fontSize >= 40 && (!runnerUp || hero.fontSize >= runnerUp.fontSize * 1.4)) {
      mapping[hero.id] = identity;
    }
  }

  return mapping;
}

/** Unique {{token}} names in text layers, in the order they appear. */
export function scanTokens(page: Page): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const el of page.elements) {
    if (el.type !== 'text') continue;
    const pattern = new RegExp(DOUBLE_TOKEN.source, 'g');
    for (const match of el.text.matchAll(pattern)) {
      const name = match[1].trim();
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      tokens.push(name);
    }
  }
  return tokens;
}

/** Zip a header list and a row into the record shape `applyRow` expects. */
export function rowToRecord(headers: string[], row: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = row[index] ?? '';
  });
  return record;
}
