import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlignCenter, AlignLeft, AlignRight, AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd, AlignVerticalJustifyStart, BringToFront,
  ChevronDown, ChevronRight, ChevronUp, ClipboardPaste, Component,
  Copy, CopyPlus, Download, Languages, Layers, Lock, LockOpen,
  MessageSquare, PaintBucket, Paintbrush, SendToBack, Sparkles, Trash2,
  Ungroup, Wand2,
} from 'lucide-react';
import type { EditorStore } from './useEditor';
import type { Point } from '../lib/types';

export type CanvasMenuState = {
  kind: 'element' | 'page';
  x: number;
  y: number;
  elementId?: string;
  pagePoint?: Point;
};

type IconType = LucideIcon;

function Row({
  icon: Icon, label, shortcut, onClick, disabled, danger, submenu, active, onEnter,
}: {
  icon: IconType;
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
      <span className="cv-menu-icon"><Icon size={16} /></span>
      <span className="cv-menu-label">{label}</span>
      {shortcut && <span className="cv-menu-key">{shortcut}</span>}
      {submenu && <ChevronRight size={14} className="cv-menu-chev" />}
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
            <Row icon={ClipboardPaste} label="Paste" shortcut="Ctrl+V" disabled={!hasClipboard} onClick={act(() => onPaste(menu.pagePoint))} />
            <Row icon={Layers} label="Select all" shortcut="Ctrl+A" onClick={act(store.selectAll)} />
            <div className="cv-menu-sep" />
            <Row icon={CopyPlus} label="Add page" onClick={act(onAddPage)} />
            <Row icon={Copy} label="Duplicate page" onClick={act(onDuplicatePage)} />
            <Row icon={Component} label="Resize canvas" onClick={act(onResize)} />
            <Row icon={PaintBucket} label="Page background" onClick={act(onOpenBackground)} />
            <Row icon={MessageSquare} label="Comment here" onClick={act(onComment)} />
            <div className="cv-menu-sep" />
            <Row icon={Sparkles} label="Fit canvas" shortcut="Ctrl+Shift+1" onClick={act(onFit)} />
          </>
        ) : (
          <>
            <Row icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={act(onCopy)} />
            <Row icon={Paintbrush} label="Copy style" shortcut="Ctrl+Alt+C" onClick={act(() => onCopyStyle(menu.elementId))} />
            {styleLabel && <Row icon={Paintbrush} label={`Paste ${styleLabel}`} shortcut="Ctrl+Alt+V" onClick={act(onPasteStyle)} />}
            <Row icon={ClipboardPaste} label="Paste" shortcut="Ctrl+V" disabled={!hasClipboard} onClick={act(() => onPaste())} />
            <Row icon={CopyPlus} label="Duplicate" shortcut="Ctrl+D" onClick={act(store.duplicateSelected)} disabled={locked.length > 0} />
            <Row icon={Trash2} label="Delete" shortcut="Del" onClick={act(store.deleteSelected)} disabled={!canEdit} danger />

            <div className="cv-menu-sep" />

            <div className="cv-menu-subwrap" onPointerEnter={() => setSub('layer')}>
              <Row
                icon={Layers}
                label="Layer"
                submenu
                active={sub === 'layer'}
                onEnter={() => setSub('layer')}
                onClick={() => setSub(sub === 'layer' ? null : 'layer')}
                disabled={!canEdit}
              />
              {sub === 'layer' && (
                <div className={`cv-menu-sub ${flip ? 'is-flip' : ''}`} role="menu">
                  <Row icon={BringToFront} label="Bring to front" shortcut="Ctrl+Alt+]" onClick={act(() => store.reorder('front'))} />
                  <Row icon={ChevronUp} label="Bring forward" shortcut="Ctrl+]" onClick={act(() => store.reorder('forward'))} />
                  <Row icon={ChevronDown} label="Send backward" shortcut="Ctrl+[" onClick={act(() => store.reorder('backward'))} />
                  <Row icon={SendToBack} label="Send to back" shortcut="Ctrl+Alt+[" onClick={act(() => store.reorder('back'))} />
                </div>
              )}
            </div>

            <div className="cv-menu-subwrap" onPointerEnter={() => setSub('align')}>
              <Row
                icon={AlignCenter}
                label="Align to page"
                submenu
                active={sub === 'align'}
                onEnter={() => setSub('align')}
                onClick={() => setSub(sub === 'align' ? null : 'align')}
                disabled={!canEdit}
              />
              {sub === 'align' && (
                <div className={`cv-menu-sub ${flip ? 'is-flip' : ''}`} role="menu">
                  <Row icon={AlignLeft} label="Align left" onClick={act(() => store.align('left', 'page'))} />
                  <Row icon={AlignCenter} label="Center horizontally" onClick={act(() => store.align('hcenter', 'page'))} />
                  <Row icon={AlignRight} label="Align right" onClick={act(() => store.align('right', 'page'))} />
                  <Row icon={AlignVerticalJustifyStart} label="Align top" onClick={act(() => store.align('top', 'page'))} />
                  <Row icon={AlignVerticalJustifyCenter} label="Center vertically" onClick={act(() => store.align('vcenter', 'page'))} />
                  <Row icon={AlignVerticalJustifyEnd} label="Align bottom" onClick={act(() => store.align('bottom', 'page'))} />
                </div>
              )}
            </div>

            <div className="cv-menu-sep" />

            {anyGrouped ? (
              <Row icon={Ungroup} label="Ungroup" shortcut="Ctrl+Shift+G" onClick={act(store.ungroupSelected)} />
            ) : (
              <Row icon={Layers} label="Group" shortcut="Ctrl+G" onClick={act(store.groupSelected)} disabled={selected.length < 2} />
            )}
            <Row icon={Component} label="Create component" shortcut="Ctrl+Alt+K" onClick={act(onCreateComponent)} />
            <Row icon={MessageSquare} label="Comment" shortcut="Ctrl+Alt+N" onClick={act(onComment)} />

            <div className="cv-menu-subwrap" onPointerEnter={() => setSub('lock')}>
              <Row
                icon={Lock}
                label="Lock"
                submenu
                active={sub === 'lock'}
                onEnter={() => setSub('lock')}
                onClick={() => setSub(sub === 'lock' ? null : 'lock')}
              />
              {sub === 'lock' && (
                <div className={`cv-menu-sub ${flip ? 'is-flip' : ''}`} role="menu">
                  <Row icon={Lock} label="Lock selection" onClick={act(() => store.setLocked(true))} disabled={allLocked} />
                  <Row icon={LockOpen} label="Unlock selection" onClick={act(() => store.setLocked(false))} disabled={locked.length === 0} />
                  <div className="cv-menu-sep" />
                  <Row icon={Lock} label="Lock all on page" onClick={act(() => store.lockAllOnPage(true))} />
                  <Row icon={LockOpen} label="Unlock all on page" onClick={act(() => store.lockAllOnPage(false))} />
                </div>
              )}
            </div>

            <div className="cv-menu-sep" />

            <Row icon={PaintBucket} label="Apply colors to page" onClick={act(onApplyColors)} />
            <Row icon={Download} label="Download selection" onClick={act(onDownloadSelection)} />

            <div className="cv-menu-sep" />

            <Row icon={Wand2} label="Magic Write" onClick={act(onMagicWrite)} />
            <Row
              icon={Languages}
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
