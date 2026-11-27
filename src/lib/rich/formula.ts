/**
 * Safe recursive-descent spreadsheet formula evaluator.
 * Supports A1 cell references, A1:B5 ranges, SUM, AVERAGE/AVG, MIN, MAX, COUNT,
 * arithmetic (+ - * /), unary +/-, and parentheses. Never uses eval or Function.
 */

type Tok =
  | { t: 'num'; v: number }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'comma' }
  | { t: 'colon' };

function tokenize(expr: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      const v = Number(expr.slice(i, j));
      if (!Number.isFinite(v)) throw new Error('#ERR');
      out.push({ t: 'num', v });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[A-Za-z0-9_]/.test(expr[j])) j++;
      out.push({ t: 'id', v: expr.slice(i, j).toUpperCase() });
      i = j;
      continue;
    }
    if (ch === '(') { out.push({ t: 'lp' }); i++; continue; }
    if (ch === ')') { out.push({ t: 'rp' }); i++; continue; }
    if (ch === ',') { out.push({ t: 'comma' }); i++; continue; }
    if (ch === ':') { out.push({ t: 'colon' }); i++; continue; }
    if ('+-*/'.includes(ch)) { out.push({ t: 'op', v: ch }); i++; continue; }
    throw new Error('#ERR');
  }
  return out;
}

export function parseCellRef(ref: string): { r: number; c: number } | null {
  const m = /^([A-Z]+)([1-9][0-9]*)$/.exec(ref.toUpperCase());
  if (!m) return null;
  let col = 0;
  for (let i = 0; i < m[1].length; i++) {
    col = col * 26 + (m[1].charCodeAt(i) - 64);
  }
  return { r: Number(m[2]) - 1, c: col - 1 };
}

export function formatCellRef(r: number, c: number): string {
  let n = c + 1;
  let col = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    n = Math.floor((n - 1) / 26);
  }
  return `${col}${r + 1}`;
}

export function evaluateTable(cells: string[][]): (string | number)[][] {
  const rows = cells.length;
  const cols = cells.reduce((m, row) => Math.max(m, row.length), 0);
  const memo: ((string | number) | undefined)[][] = Array.from({ length: rows }, () => Array(cols).fill(undefined));
  const visiting = new Set<string>();

  const toNum = (val: string | number): number => {
    if (typeof val === 'number') return val;
    const trimmed = val.trim();
    if (!trimmed) return 0;
    if (trimmed === '#CYCLE' || trimmed === '#ERR') throw new Error(trimmed);
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const evalCell = (r: number, c: number): string | number => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return 0;
    const cached = memo[r][c];
    if (cached !== undefined) return cached;
    const raw = (cells[r]?.[c] ?? '').toString();
    const trimmed = raw.trim();
    if (!trimmed.startsWith('=')) {
      memo[r][c] = raw;
      return raw;
    }
    const key = `${r},${c}`;
    if (visiting.has(key)) {
      return '#CYCLE';
    }
    visiting.add(key);
    let result: string | number;
    try {
      const val = evalFormula(trimmed.slice(1));
      result = Number.isInteger(val) ? val : Number(val.toFixed(6));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '#ERR';
      result = msg === '#CYCLE' ? '#CYCLE' : '#ERR';
    } finally {
      visiting.delete(key);
    }
    memo[r][c] = result;
    return result;
  };

  const evalRangeValues = (a: string, b: string): number[] => {
    const pa = parseCellRef(a);
    const pb = parseCellRef(b);
    if (!pa || !pb) throw new Error('#ERR');
    const r0 = Math.min(pa.r, pb.r);
    const r1 = Math.max(pa.r, pb.r);
    const c0 = Math.min(pa.c, pb.c);
    const c1 = Math.max(pa.c, pb.c);
    const vals: number[] = [];
    for (let rr = r0; rr <= r1; rr++) {
      for (let cc = c0; cc <= c1; cc++) {
        const v = evalCell(rr, cc);
        if (v === '#CYCLE') throw new Error('#CYCLE');
        if (v === '#ERR') throw new Error('#ERR');
        if (typeof v === 'number') {
          vals.push(v);
        } else {
          const t = v.trim();
          if (t !== '') {
            const num = Number(t);
            if (Number.isFinite(num)) vals.push(num);
          }
        }
      }
    }
    return vals;
  };

  const evalFormula = (src: string): number => {
    const toks = tokenize(src);
    let pos = 0;
    const peek = () => toks[pos];
    const next = () => toks[pos++];

    const parseExpr = (): number => {
      let left = parseTerm();
      while (peek()?.t === 'op' && (peek() as { t: 'op'; v: string }).v in { '+': 1, '-': 1 }) {
        const op = (next() as { t: 'op'; v: string }).v;
        const right = parseTerm();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    };

    const parseTerm = (): number => {
      let left = parseUnary();
      while (peek()?.t === 'op' && (peek() as { t: 'op'; v: string }).v in { '*': 1, '/': 1 }) {
        const op = (next() as { t: 'op'; v: string }).v;
        const right = parseUnary();
        if (op === '/') {
          if (right === 0) throw new Error('#ERR');
          left /= right;
        } else {
          left *= right;
        }
      }
      return left;
    };

    const parseUnary = (): number => {
      const p = peek();
      if (p?.t === 'op' && (p.v === '+' || p.v === '-')) {
        next();
        const v = parseUnary();
        return p.v === '-' ? -v : v;
      }
      return parsePrimary();
    };

    const parsePrimary = (): number => {
      const p = peek();
      if (!p) throw new Error('#ERR');
      if (p.t === 'num') {
        next();
        return p.v;
      }
      if (p.t === 'lp') {
        next();
        const v = parseExpr();
        if (next()?.t !== 'rp') throw new Error('#ERR');
        return v;
      }
      if (p.t === 'id') {
        next();
        if (peek()?.t === 'lp') {
          next(); // (
          const args: number[] = [];
          if (peek()?.t !== 'rp') {
            while (true) {
              const first = peek();
              if (first?.t === 'id' && toks[pos + 1]?.t === 'colon' && toks[pos + 2]?.t === 'id') {
                const a = (next() as { t: 'id'; v: string }).v;
                next(); // :
                const b = (next() as { t: 'id'; v: string }).v;
                args.push(...evalRangeValues(a, b));
              } else {
                args.push(parseExpr());
              }
              if (peek()?.t === 'comma') { next(); continue; }
              break;
            }
          }
          if (next()?.t !== 'rp') throw new Error('#ERR');
          return callFunc(p.v, args);
        }
        const ref = parseCellRef(p.v);
        if (!ref) throw new Error('#ERR');
        const cv = evalCell(ref.r, ref.c);
        return toNum(cv);
      }
      throw new Error('#ERR');
    };

    const out = parseExpr();
    if (pos !== toks.length) throw new Error('#ERR');
    return out;
  };

  const callFunc = (name: string, args: number[]): number => {
    switch (name) {
      case 'SUM': return args.reduce((a, b) => a + b, 0);
      case 'AVERAGE':
      case 'AVG': return args.length ? args.reduce((a, b) => a + b, 0) / args.length : 0;
      case 'MIN': return args.length ? Math.min(...args) : 0;
      case 'MAX': return args.length ? Math.max(...args) : 0;
      case 'COUNT': return args.length;
      default: throw new Error('#ERR');
    }
  };

  const out: (string | number)[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: (string | number)[] = [];
    for (let c = 0; c < (cells[r]?.length ?? 0); c++) {
      row.push(evalCell(r, c));
    }
    out.push(row);
  }
  return out;
}
