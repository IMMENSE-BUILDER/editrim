import { useEffect, useState } from 'react';
import { EditrimIcon, type EditrimIconName } from '../components/EditrimIcon';
import type { EditorStore } from './useEditor';
import type { Point } from '../lib/types';

export type CanvasMenuState = {
  kind: 'element' | 'page';
  x: number;
  y: number;
  elementId?: string;
  pagePoint?: Point;
};

type IconType = EditrimIconName;

function Row({
  icon, label, shortcut, onClick, disabled, danger, submenu, active, onEnter,
}: {
  icon: EditrimIconName;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  submenu?: boolean;
  active?: boolean;
  onEnter?: () => void;
}) {
  return (
    <button
      className={`cv-menu-row ${active ? 'is-open' : ''} ${danger ? 'is-danger' : ''}`}
      onClick={onClick}
      disabled={disabled}
      onPointerEnter={onEnter}
      aria-haspopup={submenu ? 'menu' : undefined}
      aria-expanded={submenu ? active : undefined}
    >
      <span className="cv-menu-icon"><EditrimIcon name={icon} size={16} /></span>
      <span className="cv-menu-label">{label}</span>
      {shortcut && <span className="cv-menu-key">{shortcut}</span>}
      {submenu && <EditrimIcon name="chevronRight" size={14} className="cv-menu-chev" />}
    </button>
  );
}

export function CanvasContextMenu({
  menu,
  onClose,
  store,
  hasClipboard,
  styleLabel,
  onCopy,
  onPaste,
  onCopyStyle,
  onPasteStyle,
  onCreateComponent,
  onComment,
  onApplyColors,
  onDownloadSelection,
  onMagicWrite,
  onTranslate,
  onOpenBackground,
  onResize,
  onAddPage,
  onDuplicatePage,
  onFit,
}: {
  menu: CanvasMenuState;
  onClose: () => void;
  store: EditorStore;
  hasClipboard: boolean;
  styleLabel: string | null;
  onCopy: () => void;
  onPaste: (at?: Point) => void;
  onCopyStyle: (elementId?: string) => void;
  onPasteStyle: () => void;
  onCreateComponent: () => void;
  onComment: () => void;
  onApplyColors: () => void;
  onDownloadSelection: () => void;
  onMagicWrite: () => void;
  onTranslate: () => void;
  onOpenBackground: () => void;
  onResize: () => void;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onFit: () => void;
}) {
  const [sub, setSub] = useState<'layer' | 'align' | 'lock' | null>(null);

  useEffect(() => {
    setSub(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu, onClose]);

  const width = 302;
  const left = Math.max(8, Math.min(menu.x, window.innerWidth - width - 10));
  const estimatedHeight = menu.kind === 'page' ? 320 : 646;
  const top = Math.max(8, Math.min(menu.y, window.innerHeight - estimatedHeight - 10));
  const flip = left + width + 244 > window.innerWidth;
  const won = () => {
    onClose();
  };
  const act = (fn: () => void) => () => {
    fn();
    won();
  };

  const selected = store.selected;
  const locked = selected.filter(e => e.locked);
  const allLocked = selected.length > 0 && locked.length === selected.length;
  const anyGrouped = selected.some(e => e.groupId);
  const textLayers = selected.filter(e => e.type === 'text');
  const canEdit = selected.some(e => !e.locked);

  return (
    <>
      <div
        className="cv-menu-backdrop"
        onPointerDown={won}
        onContextMenu={e => { e.preventDefault(); won(); }}
      />
      <div
        className="cv-menu"
        style={{ left, top }}
        role="menu"
        aria-label={menu.kind === 'element' ? 'Element menu' : 'Canvas menu'}
        onContextMenu={e => e.preventDefault()}
        onPointerDown={e => e.stopPropagation()}
      >
        {menu.kind === 'page' ? (
          <>
            <Row icon="clipboard" label="Paste" shortcut="Ctrl+V" disabled={!hasClipboard} onClick={act(() => onPaste(menu.pagePoint))} />
            <Row icon="layers" label="Select all" shortcut="Ctrl+A" onClick={act(store.selectAll)} />
            <div className="cv-menu-sep" />
            <Row icon="page" label="Add page" onClick={act(onAddPage)} />
            <Row icon="duplicate" label="Duplicate page" onClick={act(onDuplicatePage)} />
            <Row icon="component" label="Resize canvas" onClick={act(onResize)} />
            <Row icon="paintBucket" label="Page background" onClick={act(onOpenBackground)} />
            <Row icon="comment" label="Comment here" onClick={act(onComment)} />
            <div className="cv-menu-sep" />
            <Row icon="fit" label="Fit canvas" shortcut="Ctrl+Shift+1" onClick={act(onFit)} />
          </>
        ) : (
          <>
            <Row icon="copy" label="Copy" shortcut="Ctrl+C" onClick={act(onCopy)} />
            <Row icon="paintbrush" label="Copy style" shortcut="Ctrl+Alt+C" onClick={act(() => onCopyStyle(menu.elementId))} />
            {styleLabel && <Row icon="paintbrush" label={`Paste ${styleLabel}`} shortcut="Ctrl+Alt+V" onClick={act(onPasteStyle)} />}
            <Row icon="clipboard" label="Paste" shortcut="Ctrl+V" disabled={!hasClipboard} onClick={act(() => onPaste())} />
            <Row icon="duplicate" label="Duplicate" shortcut="Ctrl+D" onClick={act(store.duplicateSelected)} disabled={locked.length > 0} />
            <Row icon="trash" label="Delete" shortcut="Del" onClick={act(store.deleteSelected)} disabled={!canEdit} danger />

            <div className="cv-menu-sep" />

            <div className="cv-menu-subwrap" onPointerEnter={() => setSub('layer')}>
              <Row
                icon="layers"
                label="Layer"
                submenu
                active={sub === 'layer'}
                onEnter={() => setSub('layer')}
                onClick={() => setSub(sub === 'layer' ? null : 'layer')}
                disabled={!canEdit}
              />
              {sub === 'layer' && (
                <div className={`cv-menu-sub ${flip ? 'is-flip' : ''}`} role="menu">
                  <Row icon="layerFront" label="Bring to front" shortcut="Ctrl+Alt+]" onClick={act(() => store.reorder('front'))} />
                  <Row icon="chevronUp" label="Bring forward" shortcut="Ctrl+]" onClick={act(() => store.reorder('forward'))} />
                  <Row icon="chevronDown" label="Send backward" shortcut="Ctrl+[" onClick={act(() => store.reorder('backward'))} />
                  <Row icon="layerBack" label="Send to back" shortcut="Ctrl+Alt+[" onClick={act(() => store.reorder('back'))} />
                </div>
              )}
            </div>

            <div className="cv-menu-subwrap" onPointerEnter={() => setSub('align')}>
              <Row
                icon="alignCenter"
                label="Align to page"
                submenu
                active={sub === 'align'}
                onEnter={() => setSub('align')}
                onClick={() => setSub(sub === 'align' ? null : 'align')}
                disabled={!canEdit}
              />
              {sub === 'align' && (
                <div className={`cv-menu-sub ${flip ? 'is-flip' : ''}`} role="menu">
                  <Row icon="alignLeft" label="Align left" onClick={act(() => store.align('left', 'page'))} />
                  <Row icon="alignCenter" label="Center horizontally" onClick={act(() => store.align('hcenter', 'page'))} />
                  <Row icon="alignRight" label="Align right" onClick={act(() => store.align('right', 'page'))} />
                  <Row icon="alignTop" label="Align top" onClick={act(() => store.align('top', 'page'))} />
                  <Row icon="alignMiddle" label="Center vertically" onClick={act(() => store.align('vcenter', 'page'))} />
                  <Row icon="alignBottom" label="Align bottom" onClick={act(() => store.align('bottom', 'page'))} />
                </div>
              )}
            </div>

            <div className="cv-menu-sep" />

            {anyGrouped ? (
              <Row icon="ungroup" label="Ungroup" shortcut="Ctrl+Shift+G" onClick={act(store.ungroupSelected)} />
            ) : (
              <Row icon="group" label="Group" shortcut="Ctrl+G" onClick={act(store.groupSelected)} disabled={selected.length < 2} />
            )}
            <Row icon="component" label="Create component" shortcut="Ctrl+Alt+K" onClick={act(onCreateComponent)} />
            <Row icon="comment" label="Comment" shortcut="Ctrl+Alt+N" onClick={act(onComment)} />

            <div className="cv-menu-subwrap" onPointerEnter={() => setSub('lock')}>
              <Row
                icon="lock"
                label="Lock"
                submenu
                active={sub === 'lock'}
                onEnter={() => setSub('lock')}
                onClick={() => setSub(sub === 'lock' ? null : 'lock')}
              />
              {sub === 'lock' && (
                <div className={`cv-menu-sub ${flip ? 'is-flip' : ''}`} role="menu">
                  <Row icon="lock" label="Lock selection" onClick={act(() => store.setLocked(true))} disabled={allLocked} />
                  <Row icon="unlock" label="Unlock selection" onClick={act(() => store.setLocked(false))} disabled={locked.length === 0} />
                  <div className="cv-menu-sep" />
                  <Row icon="lock" label="Lock all on page" onClick={act(() => store.lockAllOnPage(true))} />
                  <Row icon="unlock" label="Unlock all on page" onClick={act(() => store.lockAllOnPage(false))} />
                </div>
              )}
            </div>

            <div className="cv-menu-sep" />

            <Row icon="paintBucket" label="Apply colors to page" onClick={act(onApplyColors)} />
            <Row icon="download" label="Download selection" onClick={act(onDownloadSelection)} />

            <div className="cv-menu-sep" />

            <Row icon="magic" label="Magic Write" onClick={act(onMagicWrite)} />
            <Row
              icon="language"
              label="Translate text"
              disabled={!textLayers.some(e => !e.locked)}
              onClick={act(onTranslate)}
            />
          </>
        )}
      </div>
    </>
  );
}
