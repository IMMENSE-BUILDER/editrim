import { useEffect, useMemo, useRef, useState } from 'react';
import { EditrimIcon } from './EditrimIcon';
import { Modal } from './Modal';
import { PagePreview } from './PagePreview';
import { useToast } from './Toast';
import { applyRow, autoMatch, autoMatchTokens, MAX_ROWS, parseCsv, rowToRecord, scanTokens } from '../lib/bulk';
import type { DesignSize, Page, TextElement } from '../lib/types';
import '../styles/bulk.css';

const KEEP = '__text__';
const STEPS = ['Data', 'Map', 'Preview'];

const SAMPLE_CSV = [
  'Name,Role,Company',
  'Ada Lovelace,Engineer,Analytical Engines',
  'Grace Hopper,Admiral,US Navy',
  'Linus Torvalds,Kernel,Linux Foundation',
].join('\n');

const delimiterLabel = (delimiter: string) =>
  delimiter === ';' ? 'Semicolons' : delimiter === '\t' ? 'Tabs' : 'Commas';

const snippet = (text: string) => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat || 'Empty text';
};

function buildTokenMapping(page: Page, headers: string[]): Record<string, string> {
  const next: Record<string, string> = {};
  for (const el of page.elements) {
    if (el.type === 'text') next[el.id] = KEEP;
  }
  Object.assign(next, autoMatchTokens(page, headers));
  return next;
}

function buildAutoMapping(page: Page, headers: string[]): Record<string, string> {
  const next: Record<string, string> = {};
  for (const el of page.elements) {
    if (el.type === 'text') next[el.id] = KEEP;
  }
  Object.assign(next, autoMatch(page, headers));
  return next;
}

/** Bulk create: turn CSV rows into pages, one row each. */
export function BulkCreateModal({
  open,
  onClose,
  page,
  size,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  page: Page;
  size: DesignSize;
  onGenerate: (pages: Page[]) => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [previewRow, setPreviewRow] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const seededFor = useRef('');

  const textElements = useMemo(
    () => page.elements.filter((el): el is TextElement => el.type === 'text'),
    [page],
  );
  const tokens = useMemo(() => scanTokens(page), [page]);

  // Every open starts clean on step 1.
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCsvText('');
    setFileName('');
    setMapping({});
    setPreviewRow(0);
    setDragging(false);
    setTouched(false);
    seededFor.current = '';
  }, [open]);

  const parsed = useMemo(() => (csvText.trim() ? parseCsv(csvText) : null), [csvText]);
  const headers = parsed?.headers ?? [];
  const rows = parsed?.rows ?? [];
  const keptRows = rows.slice(0, MAX_ROWS);

  const dataError = !parsed
    ? touched
      ? 'Paste a CSV or choose a file to begin.'
      : ''
    : parsed.error
      ? parsed.error
      : !headers.length
        ? 'No columns found in the first row.'
        : !rows.length
          ? 'Add at least one data row below the header.'
          : '';
  const warning = rows.length > MAX_ROWS
    ? `Only the first ${MAX_ROWS} of ${rows.length} rows will be created.`
    : '';

  const dataSignature = parsed ? `${parsed.delimiter}|${headers.join('\u0001')}` : '';

  // Step 2 opens with token columns already matched; auto-match fills the rest.
  useEffect(() => {
    if (!open || step !== 2 || !parsed || dataError) return;
    if (seededFor.current === dataSignature) return;
    seededFor.current = dataSignature;
    setMapping(buildTokenMapping(page, headers));
  }, [open, step, parsed, dataError, dataSignature, page, headers]);

  const mappingFor = (el: TextElement): string => {
    const value = mapping[el.id];
    return value && (value === KEEP || headers.includes(value)) ? value : KEEP;
  };

  const safeRow = Math.min(previewRow, Math.max(0, keptRows.length - 1));
  const previewRecord = keptRows.length ? rowToRecord(headers, keptRows[safeRow]) : {};

  const previewPage = useMemo(() => {
    if (!keptRows.length) return page;
    return applyRow(page, mapping, rowToRecord(headers, keptRows[safeRow]), safeRow);
  }, [page, mapping, headers, keptRows, safeRow]);

  const applied = textElements
    .map(el => ({ el, column: mappingFor(el) }))
    .filter(entry => entry.column !== KEEP)
    .map(entry => ({ id: entry.el.id, name: entry.el.name, value: previewRecord[entry.column] ?? '' }));

  const canContinue = !!parsed && !dataError && rows.length > 0 && headers.length > 0;
  const mappedCount = textElements.filter(el => mappingFor(el) !== KEEP).length;
  const ratio = size.width / size.height;
  const frameWidth = Math.round(Math.min(320, Math.max(150, 360 * ratio)));

  const runAutoMatch = () => {
    if (!headers.length) return;
    setMapping(buildAutoMapping(page, headers));
  };

  const readCsvFile = async (file: File) => {
    try {
      const text = await file.text();
      setCsvText(text.replace(/^\uFEFF/, ''));
      setFileName(file.name);
      setDragging(false);
      setTouched(true);
      const check = parseCsv(text);
      if (check.error) toast(check.error, 'error');
    } catch {
      toast('Couldn’t read that file. Try another CSV.', 'error');
    }
  };

  const generate = () => {
    if (!keptRows.length) return;
    const pages = keptRows.map((row, index) => applyRow(page, mapping, rowToRecord(headers, row), index));
    onGenerate(pages);
  };

  const stepSubtitle =
    step === 1 ? 'Drop a CSV or paste it below. The first row is the header.'
      : step === 2 ? 'Match each text layer to a column, or keep the original copy.'
        : 'Check a row, then create one page for every row.';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk create"
      subtitle={stepSubtitle}
      width={760}
      className="bulk-modal"
      footer={
        step === 1 ? (
          <>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-cobalt" disabled={!canContinue} onClick={() => setStep(2)}>
              Continue <EditrimIcon name="arrowRight" size={15} />
            </button>
          </>
        ) : step === 2 ? (
          <>
            <button type="button" className="btn btn-ghost bulk-back" onClick={() => setStep(1)}>
              <EditrimIcon name="chevronLeft" size={15} /> Back
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="btn btn-cobalt"
              disabled={!textElements.length}
              onClick={() => {
                setPreviewRow(0);
                setStep(3);
              }}
            >
              Preview <EditrimIcon name="arrowRight" size={15} />
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-ghost bulk-back" onClick={() => setStep(2)}>
              <EditrimIcon name="chevronLeft" size={15} /> Back
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-cobalt" disabled={!keptRows.length} onClick={generate}>
              Create {keptRows.length} {keptRows.length === 1 ? 'page' : 'pages'}
            </button>
          </>
        )
      }
    >
      <div className="bulk">
        <div className="bulk-steps">
          {STEPS.map((label, index) => {
            const number = index + 1;
            const state = step === number ? 'is-active' : step > number ? 'is-done' : '';
            return (
              <div key={label} className={`bulk-step ${state}`}>
                <span className="bulk-step-dot">
                  {step > number ? <EditrimIcon name="check" size={11} /> : number}
                </span>
                <span className="bulk-step-label">{label}</span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <>
            <div
              className={`bulk-drop ${dragging ? 'is-dragging' : ''}`}
              onDragOver={event => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={event => {
                const next = event.relatedTarget;
                if (!(next instanceof Node) || !event.currentTarget.contains(next)) setDragging(false);
              }}
              onDrop={event => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) void readCsvFile(file);
              }}
            >
              <span className="bulk-drop-icon"><EditrimIcon name="upload" size={20} /></span>
              <span className="bulk-drop-title">{fileName || 'Drop a CSV here'}</span>
              <span className="bulk-drop-hint">First row is the header. Comma, semicolon or tab separated.</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                <EditrimIcon name="sheet" size={14} /> Choose file
              </button>
              <input
                ref={fileRef}
                className="bulk-file"
                type="file"
                accept=".csv,text/csv"
                data-autofocus="false"
                onChange={event => {
                  const file = event.target.files?.[0];
                  if (file) void readCsvFile(file);
                  event.target.value = '';
                }}
              />
            </div>

            <div className="bulk-or"><span>or paste it</span></div>

            <div className="bulk-paste-head">
              <label className="field-label" htmlFor="bulk-csv">Paste CSV</label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setCsvText(SAMPLE_CSV);
                  setFileName('');
                  setTouched(true);
                }}
              >
                <EditrimIcon name="plus" size={14} /> Sample CSV
              </button>
            </div>
            <textarea
              id="bulk-csv"
              className="input bulk-textarea"
              rows={6}
              spellCheck={false}
              placeholder={'Name,Role,Company\nAda,Engineer,Analytical Engines'}
              value={csvText}
              onChange={event => {
                setCsvText(event.target.value);
                setFileName('');
                setTouched(true);
              }}
            />

            {parsed && (
              <div className="bulk-meta">
                <span><strong>{rows.length}</strong> {rows.length === 1 ? 'row' : 'rows'}</span>
                <span aria-hidden="true">·</span>
                <span><strong>{headers.length}</strong> {headers.length === 1 ? 'column' : 'columns'}</span>
                <span className="chip">{delimiterLabel(parsed.delimiter)}</span>
              </div>
            )}

            {dataError && <p className="bulk-error">{dataError}</p>}
            {warning && <p className="bulk-warn">{warning}</p>}

            {parsed && headers.length > 0 && rows.length > 0 && (
              <div className="bulk-table-wrap">
                <table className="bulk-table">
                  <thead>
                    <tr>
                      <th className="bulk-row-num" scope="col"><span className="sr-only">Row</span></th>
                      {headers.map((header, index) => (
                        <th key={`${header}-${index}`} scope="col">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="bulk-row-num">{rowIndex + 2}</td>
                        {headers.map((_, cellIndex) => {
                          const cell = row[cellIndex] ?? '';
                          return (
                            <td key={cellIndex} className={cell ? undefined : 'is-empty'} title={cell}>
                              {cell || '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rows.length > 5 && (
              <p className="bulk-hint">Showing the first 5 of {rows.length} rows.</p>
            )}
          </>
        )}

        {step === 2 && (
          <>
            {tokens.length > 0 && (
              <div className="bulk-tokens">
                <EditrimIcon name="page" size={13} />
                <span>Tokens found:</span>
                {tokens.map(token => (
                  <code key={token} className="bulk-token">{`{{${token}}}`}</code>
                ))}
                <span className="bulk-tokens-note">Matching columns fill these in automatically.</span>
              </div>
            )}

            <div className="bulk-map-head">
              <div>
                <span className="field-label">Text layers</span>
                <p className="bulk-hint">
                  {textElements.length
                    ? `${mappedCount} of ${textElements.length} layers use a column. The rest keep their copy.`
                    : 'No text on this page yet.'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={runAutoMatch}
                disabled={!textElements.length || !headers.length}
              >
                <EditrimIcon name="check" size={14} /> Auto-match
              </button>
            </div>

            {textElements.length === 0 ? (
              <div className="bulk-empty">
                <strong>Add text to this page first.</strong>
                <span>Bulk create fills text layers. Add one, then come back.</span>
              </div>
            ) : (
              <div className="bulk-map">
                {textElements.map(el => (
                  <div className="bulk-map-row" key={el.id}>
                    <div className="bulk-map-meta">
                      <span className="bulk-map-name">{el.name}</span>
                      <span className="bulk-map-snippet" title={el.text}>{snippet(el.text)}</span>
                    </div>
                    <select
                      className="select bulk-map-select"
                      value={mappingFor(el)}
                      aria-label={`Column for ${el.name}`}
                      onChange={event => {
                        const value = event.target.value;
                        setMapping(prev => ({ ...prev, [el.id]: value }));
                      }}
                    >
                      <option value={KEEP}>Keep text</option>
                      {headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {warning && <p className="bulk-warn">{warning}</p>}
          </>
        )}

        {step === 3 && (
          <>
            {warning && <p className="bulk-warn">{warning}</p>}
            <div className="bulk-preview">
              <div className="bulk-preview-left">
                <div className="bulk-stepper">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setPreviewRow(row => Math.max(0, row - 1))}
                    disabled={safeRow === 0}
                    aria-label="Previous row"
                  >
                    <EditrimIcon name="chevronLeft" size={16} />
                  </button>
                  <span className="bulk-stepper-label">Row {safeRow + 1} of {keptRows.length}</span>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setPreviewRow(row => Math.min(keptRows.length - 1, row + 1))}
                    disabled={safeRow >= keptRows.length - 1}
                    aria-label="Next row"
                  >
                    <EditrimIcon name="chevronRight" size={16} />
                  </button>
                </div>
                <div className="bulk-stage">
                  <div className="bulk-frame" style={{ width: frameWidth }}>
                    <PagePreview page={previewPage} size={size} ariaLabel={`Preview of row ${safeRow + 1}`} />
                  </div>
                </div>
              </div>

              <div className="bulk-applied-head">
                <span className="field-label">Applied values</span>
                {applied.length ? (
                  <ul className="bulk-applied">
                    {applied.map(item => (
                      <li key={item.id}>
                        <span className="bulk-applied-name" title={item.name}>{item.name}</span>
                        <span
                          className={`bulk-applied-value ${item.value ? '' : 'is-empty'}`}
                          title={item.value || 'Empty cell'}
                        >
                          {item.value || 'Empty cell'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="bulk-hint">
                    No layers are mapped to columns yet. Original text is kept for every row.
                  </p>
                )}
                {tokens.length > 0 && (
                  <p className="bulk-hint">
                    Tokens in other layers: {tokens.map(token => `{{${token}}}`).join(', ')}. Unknown tokens stay as written.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
