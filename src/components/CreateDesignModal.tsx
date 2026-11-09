import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { EditrimIcon, type EditrimIconName } from './EditrimIcon';
import { PagePreview } from './PagePreview';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../lib/templates';
import { SIZE_PRESETS, type SizePreset } from '../lib/presets';
import { createDesign, saveDesign } from '../lib/storage';
import {
  createDocDesign,
  createSheetDesign,
  createWebsiteDesign,
  createWhiteboardDesign,
} from '../lib/homeDesigns';
import { createVideoProject, saveVideoProject } from '../lib/video/storage';
import type { Template } from '../lib/types';
import '../styles/create-design.css';

export type CreateDesignSection =
  | 'for-you'
  | 'templates'
  | 'presentations'
  | 'social'
  | 'photo'
  | 'videos'
  | 'printables'
  | 'docs'
  | 'whiteboards'
  | 'sheets'
  | 'websites'
  | 'custom'
  | 'upload'
  | 'more';

type BlankKind = 'doc' | 'whiteboard' | 'sheet' | 'website';

type Selection =
  | {
      kind: 'template';
      key: string;
      name: string;
      category: string;
      width: number;
      height: number;
      pages: number;
      template: Template;
    }
  | {
      kind: 'size';
      key: string;
      name: string;
      category: string;
      width: number;
      height: number;
      hint: string;
      size: SizePreset;
    }
  | {
      kind: 'video';
      key: string;
      name: string;
      category: string;
      width: number;
      height: number;
      hint: string;
    }
  | {
      kind: 'blank';
      key: string;
      name: string;
      category: string;
      width: number;
      height: number;
      hint: string;
      blank: BlankKind;
    };

type PhotoAction = {
  id: string;
  label: string;
  hint: string;
  icon: EditrimIconName;
  run: () => void;
};

const SECTIONS: { id: CreateDesignSection; label: string; icon: EditrimIconName; tone: string }[] = [
  { id: 'for-you', label: 'For you', icon: 'spark', tone: 'neutral' },
  { id: 'templates', label: 'Templates', icon: 'templates', tone: 'violet' },
  { id: 'presentations', label: 'Presentations', icon: 'present', tone: 'orange' },
  { id: 'social', label: 'Social media', icon: 'social', tone: 'rose' },
  { id: 'photo', label: 'Photo editor', icon: 'photo', tone: 'pink' },
  { id: 'videos', label: 'Videos', icon: 'video', tone: 'fuchsia' },
  { id: 'printables', label: 'Printables', icon: 'printable', tone: 'violet' },
  { id: 'docs', label: 'Docs', icon: 'doc', tone: 'teal' },
  { id: 'whiteboards', label: 'Whiteboards', icon: 'board', tone: 'green' },
  { id: 'sheets', label: 'Sheets', icon: 'sheet', tone: 'blue' },
  { id: 'websites', label: 'Websites', icon: 'website', tone: 'indigo' },
  { id: 'custom', label: 'Custom size', icon: 'custom', tone: 'neutral' },
  { id: 'upload', label: 'Upload', icon: 'upload', tone: 'neutral' },
  { id: 'more', label: 'More', icon: 'more', tone: 'neutral' },
];

const SOCIAL_FILTERS = [
  { id: 'popular', label: 'Popular' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'stories', label: 'Stories' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'sizes', label: 'Sizes' },
] as const;

const PRINT_FILTERS = [
  { id: 'popular', label: 'Popular' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'gifting', label: 'Gifting' },
  { id: 'stationery', label: 'Stationery' },
  { id: 'cards', label: 'Cards & Invites' },
  { id: 'sizes', label: 'Print sizes' },
] as const;

const PRINT_CATEGORIES: Record<string, string[]> = {
  popular: ['Poster', 'Flyer', 'Menu', 'Invitation', 'Business card', 'Certificate', 'Book cover', 'Magazine', 'Resume'],
  marketing: ['Poster', 'Flyer', 'Banner'],
  gifting: ['Certificate', 'Invitation'],
  stationery: ['Business card', 'Resume', 'Logo'],
  cards: ['Invitation'],
  sizes: [],
};

const SOCIAL_CATEGORIES: Record<string, string[]> = {
  popular: ['Instagram', 'Story', 'Banner'],
  instagram: ['Instagram'],
  stories: ['Story'],
  facebook: ['Banner'],
  linkedin: ['Banner'],
  sizes: [],
};

const SOCIAL_SIZE_IDS: Record<string, string[]> = {
  popular: ['ig-post', 'ig-story', 'fb-post', 'linkedin-post'],
  instagram: ['ig-post', 'ig-story', 'ig-portrait'],
  stories: ['ig-story', 'facebook-story'],
  facebook: ['fb-post', 'facebook-story', 'fb-cover'],
  linkedin: ['linkedin-post', 'linkedin-banner'],
  sizes: ['ig-post', 'ig-story', 'ig-portrait', 'fb-post', 'linkedin-post', 'x-post', 'tiktok', 'pinterest'],
};

const VIDEO_FORMATS = [
  { id: 'landscape', name: 'Landscape Video', width: 1920, height: 1080, hint: '16:9 · 30 fps' },
  { id: 'mobile', name: 'Mobile Video', width: 1080, height: 1920, hint: '9:16 · 30 fps' },
  { id: 'square', name: 'Square Video', width: 1080, height: 1080, hint: '1:1 · 30 fps' },
  { id: 'portrait', name: 'Portrait Video', width: 1080, height: 1350, hint: '4:5 · 30 fps' },
  { id: 'cinema', name: 'Cinema Video', width: 2560, height: 1080, hint: '21:9 · 30 fps' },
  { id: 'classic', name: 'Classic Video', width: 1440, height: 1080, hint: '4:3 · 30 fps' },
  { id: 'facebook', name: 'Facebook Video', width: 1280, height: 720, hint: '16:9 · 30 fps' },
  { id: 'reel', name: 'Instagram Reel', width: 1080, height: 1920, hint: '9:16 · 30 fps' },
  { id: 'tiktok', name: 'TikTok Video', width: 1080, height: 1920, hint: '9:16 · 30 fps' },
  { id: 'youtube', name: 'YouTube Video', width: 1920, height: 1080, hint: '16:9 · 30 fps' },
  { id: 'collage', name: 'Video Collage', width: 1080, height: 1080, hint: '1:1 · 30 fps' },
];

const PRESENTATION_SIZES: SizePreset[] = [
  { id: 'presentation', name: 'Presentation (16:9)', group: 'Presentation', w: 1920, h: 1080, hint: '16:9 widescreen' },
  { id: 'presentation-43', name: 'Presentation (4:3)', group: 'Presentation', w: 1600, h: 1200, hint: '4:3 classic' },
  { id: 'keynote-1610', name: 'Keynote (16:10)', group: 'Presentation', w: 1920, h: 1200, hint: '16:10 display' },
  { id: 'presentation-mobile', name: 'Presentation (Mobile)', group: 'Presentation', w: 1080, h: 1920, hint: '9:16 mobile' },
  { id: 'presentation-square', name: 'Brainstorm (Square)', group: 'Presentation', w: 1080, h: 1080, hint: '1:1 workshop' },
];

type BlankChoice = Extract<Selection, { kind: 'blank' }>;

const BLANK_CHOICES: Record<'docs' | 'whiteboards' | 'sheets' | 'websites', BlankChoice[]> = {
  docs: [
    { kind: 'blank', blank: 'doc', key: 'blank-doc', name: 'Doc (Digital)', category: 'Doc', width: 1240, height: 1754, hint: 'Blank document · A4' },
  ],
  whiteboards: [
    { kind: 'blank', blank: 'whiteboard', key: 'blank-whiteboard', name: 'Whiteboard', category: 'Whiteboard', width: 2400, height: 1600, hint: 'Freeform board' },
    { kind: 'blank', blank: 'whiteboard', key: 'blank-brainstorm', name: 'Brainstorm Whiteboard', category: 'Whiteboard', width: 2400, height: 1600, hint: 'Ideas and clusters' },
    { kind: 'blank', blank: 'whiteboard', key: 'blank-flowchart', name: 'Flowchart Whiteboard', category: 'Whiteboard', width: 2400, height: 1600, hint: 'Steps and decisions' },
    { kind: 'blank', blank: 'whiteboard', key: 'blank-team', name: 'Team Whiteboard', category: 'Whiteboard', width: 2400, height: 1600, hint: 'One board, many hands' },
    { kind: 'blank', blank: 'whiteboard', key: 'blank-planning', name: 'Planning Whiteboard', category: 'Whiteboard', width: 2400, height: 1600, hint: 'Weeks, owners, next steps' },
  ],
  sheets: [
    { kind: 'blank', blank: 'sheet', key: 'blank-sheet', name: 'Sheet', category: 'Sheet', width: 1600, height: 1000, hint: 'Table layout' },
  ],
  websites: [
    { kind: 'blank', blank: 'website', key: 'blank-website', name: 'Blank Website', category: 'Website', width: 1440, height: 900, hint: 'Desktop page' },
  ],
};

function findSize(id: string): SizePreset | undefined {
  return SIZE_PRESETS.find(preset => preset.id === id);
}

function artStyle(width: number, height: number): CSSProperties {
  const ratio = width / height;
  return ratio < 1.1
    ? { height: '82%', aspectRatio: `${width} / ${height}` }
    : { width: '86%', aspectRatio: `${width} / ${height}` };
}

function matchesQuery(template: Template, query: string): boolean {
  if (!query) return true;
  return `${template.name} ${template.category} ${template.description} ${template.tags.join(' ')}`
    .toLowerCase()
    .includes(query);
}

function sectionTitle(section: CreateDesignSection): string {
  const match = SECTIONS.find(item => item.id === section);
  return match?.label ?? 'Create a design';
}

function mockVariant(selection: Selection): string {
  if (selection.kind === 'video') return 'video';
  if (selection.kind === 'blank') return selection.blank === 'website' ? 'website' : selection.blank;
  if (selection.kind === 'size') {
    const group = selection.size.group;
    if (group === 'Presentation') return 'presentation';
    if (group === 'Print') return 'print';
    if (group === 'Brand') return 'brand';
    if (group === 'Web') return 'website';
    if (group === 'Docs') {
      if (selection.size.id === 'sheet') return 'sheet';
      if (selection.size.id === 'whiteboard') return 'whiteboard';
      return 'doc';
    }
    return 'social';
  }
  return 'social';
}

function DetailPreview({ selection }: { selection: Selection }) {
  if (selection.kind === 'template') {
    return (
      <span className="cdm-detail-art" style={artStyle(selection.width, selection.height)}>
        <PagePreview page={selection.template.pages[0]} size={selection.template.size} />
      </span>
    );
  }
  return (
    <span className="cdm-detail-art" style={artStyle(selection.width, selection.height)}>
      <MockArt variant={mockVariant(selection)} width={selection.width} height={selection.height} />
    </span>
  );
}

function MockArt({
  variant,
  width,
  height,
}: {
  variant: string;
  width: number;
  height: number;
}) {
  const style = artStyle(width, height);
  const content =
    variant === 'video' ? (
      <>
        <span className="cdm-mock-video-glow" />
        <span className="cdm-mock-play"><EditrimIcon name="play" size={15} /></span>
      </>
    ) : variant === 'presentation' ? (
      <>
        <span className="cdm-mock-chart-line" />
        <span className="cdm-mock-chart" />
        <span className="cdm-mock-line is-short" />
      </>
    ) : variant === 'sheet' ? (
      <span className="cdm-mock-table">
        {Array.from({ length: 12 }, (_, i) => <i key={i} />)}
      </span>
    ) : variant === 'whiteboard' ? (
      <>
        <span className="cdm-mock-sticky is-one" />
        <span className="cdm-mock-sticky is-two" />
        <span className="cdm-mock-arrow" />
      </>
    ) : variant === 'website' ? (
      <>
        <span className="cdm-mock-nav" />
        <span className="cdm-mock-hero" />
        <span className="cdm-mock-line" />
        <span className="cdm-mock-line is-short" />
      </>
    ) : variant === 'photo' ? (
      <span className="cdm-mock-photo"><EditrimIcon name="photo" size={18} /></span>
    ) : variant === 'doc' ? (
      <>
        <span className="cdm-mock-kicker" />
        <span className="cdm-mock-title" />
        <span className="cdm-mock-line" />
        <span className="cdm-mock-line" />
        <span className="cdm-mock-line is-short" />
      </>
    ) : variant === 'print' || variant === 'brand' ? (
      <>
        <span className="cdm-mock-print-block" />
        <span className="cdm-mock-line" />
        <span className="cdm-mock-line is-short" />
        <span className="cdm-mock-dot" />
      </>
    ) : (
      <>
        <span className="cdm-mock-avatar" />
        <span className="cdm-mock-line" />
        <span className="cdm-mock-line is-short" />
        <span className="cdm-mock-cta" />
      </>
    );
  return (
    <span className={`cdm-mock cdm-mock-${variant}`} style={style} aria-hidden="true">
      {content}
    </span>
  );
}

export function CreateDesignModal({
  open,
  onClose,
  initialSection = 'for-you',
  onUpload,
  onOpenBrand,
  onOpenPrint,
}: {
  open: boolean;
  onClose: () => void;
  initialSection?: CreateDesignSection;
  onUpload: (file: File) => void | Promise<void>;
  onOpenBrand?: () => void;
  onOpenPrint?: () => void;
}) {
  const navigate = useNavigate();
  const shellRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<CreateDesignSection>(initialSection);
  const [query, setQuery] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [socialFilter, setSocialFilter] = useState('popular');
  const [printFilter, setPrintFilter] = useState('popular');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [visibleTemplates, setVisibleTemplates] = useState(24);
  const [dragging, setDragging] = useState(false);
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1080);
  const [customUnit, setCustomUnit] = useState<'px' | 'in' | 'cm'>('px');

  const q = query.trim().toLowerCase();

  useEffect(() => {
    if (!open) return;
    setSection(initialSection);
    setQuery('');
    setTemplateCategory('All');
    setSocialFilter('popular');
    setPrintFilter('popular');
    setSelection(null);
    setVisibleTemplates(24);
  }, [open, initialSection]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('cdm-open');
    const frame = requestAnimationFrame(() => {
      const finePointer = window.matchMedia('(pointer: fine)').matches;
      const target = finePointer ? searchRef.current : shellRef.current;
      target?.focus({ preventScroll: true });
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !shellRef.current) return;
      const focusable = Array.from(shellRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove('cdm-open');
      document.removeEventListener('keydown', onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  const go = (next: CreateDesignSection) => {
    setSection(next);
    setSelection(null);
    setQuery('');
    setVisibleTemplates(24);
  };

  useEffect(() => {
    if (!open) return;
    const active = navRef.current?.querySelector<HTMLElement>('.cdm-nav-btn.is-active');
    active?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [open, section]);

  const templatePool = useMemo(() => {
    let pool: Template[] = [];
    if (section === 'templates') {
      pool = templateCategory === 'All'
        ? TEMPLATES
        : TEMPLATES.filter(template => template.category === templateCategory);
      if (q) {
        pool = TEMPLATES.filter(template => matchesQuery(template, q));
      }
    } else if (section === 'for-you') {
      pool = q ? TEMPLATES.filter(template => matchesQuery(template, q)) : TEMPLATES.slice(0, 8);
    } else if (section === 'social') {
      const cats = SOCIAL_CATEGORIES[socialFilter] ?? SOCIAL_CATEGORIES.popular;
      pool = cats.length
        ? TEMPLATES.filter(template => cats.includes(template.category))
        : [];
      if (q) pool = pool.filter(template => matchesQuery(template, q));
    } else if (section === 'presentations') {
      pool = TEMPLATES.filter(template => template.category === 'Presentation');
      if (q) pool = pool.filter(template => matchesQuery(template, q));
    } else if (section === 'printables') {
      const cats = PRINT_CATEGORIES[printFilter] ?? PRINT_CATEGORIES.popular;
      pool = cats.length
        ? TEMPLATES.filter(template => cats.includes(template.category))
        : [];
      if (q) pool = pool.filter(template => matchesQuery(template, q));
    } else if (section === 'docs') {
      pool = TEMPLATES.filter(template => ['Editorial', 'Resume'].includes(template.category));
      if (q) pool = pool.filter(template => matchesQuery(template, q));
    } else if (section === 'websites') {
      pool = TEMPLATES.filter(template => template.category === 'Web');
      if (q) pool = pool.filter(template => matchesQuery(template, q));
    }

    return pool;
  }, [section, templateCategory, socialFilter, printFilter, q]);

  const sizePool = useMemo(() => {
    let ids: string[] = [];
    if (section === 'for-you') ids = ['ig-post', 'ig-story', 'presentation', 'poster', 'business-card', 'website'];
    else if (section === 'social') ids = SOCIAL_SIZE_IDS[socialFilter] ?? SOCIAL_SIZE_IDS.popular;
    else if (section === 'presentations') return PRESENTATION_SIZES.filter(size => !q || `${size.name} ${size.hint}`.toLowerCase().includes(q));
    else if (section === 'printables') {
      ids = printFilter === 'sizes'
        ? ['business-card', 'poster', 'invitation', 'flyer', 'postcard', 'certificate', 'book-cover', 'magazine-cover', 'letter']
        : ['business-card', 'poster', 'invitation', 'flyer'];
    } else if (section === 'docs') ids = ['document', 'newsletter', 'letter'];
    else if (section === 'websites') ids = ['code', 'desktop'];
    else if (section === 'sheets') ids = [];

    return ids
      .map(findSize)
      .filter((size): size is SizePreset => Boolean(size))
      .filter(size => !q || `${size.name} ${size.hint}`.toLowerCase().includes(q));
  }, [section, socialFilter, printFilter, q]);

  const limitedTemplates = useMemo(() => {
    if (section === 'templates') return templatePool.slice(0, visibleTemplates);
    if (section === 'for-you') return templatePool.slice(0, 8);
    if (section === 'social') return templatePool.slice(0, 8);
    if (section === 'docs' || section === 'websites') return templatePool.slice(0, 8);
    return templatePool.slice(0, 12);
  }, [section, templatePool, visibleTemplates]);

  const chooseTemplate = (template: Template) => {
    setSelection({
      kind: 'template',
      key: `template:${template.id}`,
      name: template.name,
      category: template.category,
      width: template.size.width,
      height: template.size.height,
      pages: template.pages.length,
      template,
    });
  };

  const chooseSize = (size: SizePreset) => {
    setSelection({
      kind: 'size',
      key: `size:${size.id}`,
      name: size.name,
      category: size.group,
      width: size.w,
      height: size.h,
      hint: size.hint,
      size,
    });
  };

  const chooseVideo = (format: (typeof VIDEO_FORMATS)[number]) => {
    setSelection({
      kind: 'video',
      key: `video:${format.id}`,
      name: format.name,
      category: 'Video',
      width: format.width,
      height: format.height,
      hint: format.hint,
    });
  };

  const chooseBlank = (choice: BlankChoice) => {
    setSelection(choice);
  };

  const startSelection = () => {
    if (!selection) return;
    if (selection.kind === 'template') {
      onClose();
      navigate(`/editor/new?template=${selection.template.id}`);
      return;
    }
    if (selection.kind === 'size') {
      const design = createDesign({
        title: selection.name,
        width: selection.width,
        height: selection.height,
        category: selection.category,
      });
      onClose();
      navigate(`/editor/${design.id}`);
      return;
    }
    if (selection.kind === 'video') {
      const project = createVideoProject(selection.name);
      project.width = selection.width;
      project.height = selection.height;
      saveVideoProject(project);
      onClose();
      navigate(`/video/${project.id}`);
      return;
    }
    const factory = selection.blank === 'doc'
      ? createDocDesign
      : selection.blank === 'sheet'
        ? createSheetDesign
        : selection.blank === 'website'
          ? createWebsiteDesign
          : createWhiteboardDesign;
    const design = factory();
    design.title = selection.name;
    saveDesign(design);
    onClose();
    navigate(`/editor/${design.id}`);
  };

  const startCustom = () => {
    const factor = customUnit === 'in' ? 96 : customUnit === 'cm' ? 96 / 2.54 : 1;
    const width = Math.max(100, Math.min(6000, Math.round(customW * factor)));
    const height = Math.max(100, Math.min(6000, Math.round(customH * factor)));
    const design = createDesign({ title: 'Untitled design', width, height, category: 'Custom' });
    onClose();
    navigate(`/editor/${design.id}`);
  };

  const openUpload = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    onClose();
    void onUpload(file);
  };

  const selectedKey = selection?.key ?? '';

  const templateGrid = (list: Template[]) => (
    <div className="cdm-grid">
      {list.map(template => (
        <button
          key={template.id}
          className={`cdm-card ${selectedKey === `template:${template.id}` ? 'is-selected' : ''}`}
          onClick={() => chooseTemplate(template)}
          aria-label={`${template.name}, ${template.category}, ${template.size.width} by ${template.size.height}`}
        >
          <span className="cdm-card-preview">
            <span className="cdm-template-art" style={artStyle(template.size.width, template.size.height)}>
              <PagePreview page={template.pages[0]} size={template.size} />
            </span>
            {template.pages.length > 1 && <span className="cdm-pages">{template.pages.length} pages</span>}
          </span>
          <span className="cdm-card-name">{template.name}</span>
          <span className="cdm-card-meta">{template.category} · {template.size.width} × {template.size.height} · {template.pages.length}p</span>
        </button>
      ))}
    </div>
  );

  const sizeGrid = (list: SizePreset[]) => (
    <div className="cdm-grid">
      {list.map(size => {
        const preview = findSize(size.id);
        const variant = (() => {
          if (size.group === 'Presentation') return 'presentation';
          if (size.group === 'Print') return 'print';
          if (size.group === 'Brand') return 'brand';
          if (size.group === 'Web') return 'website';
          if (size.group === 'Docs') {
            if (size.id === 'sheet') return 'sheet';
            if (size.id === 'whiteboard') return 'whiteboard';
            return 'doc';
          }
          if (size.id.includes('video')) return 'video';
          return 'social';
        })();
        return (
          <button
            key={size.id}
            className={`cdm-card ${selectedKey === `size:${size.id}` ? 'is-selected' : ''}`}
            onClick={() => chooseSize(preview ?? size)}
            aria-label={`${size.name}, ${size.w} by ${size.h}`}
          >
            <span className="cdm-card-preview">
              <MockArt variant={variant} width={size.w} height={size.h} />
            </span>
            <span className="cdm-card-name">{size.name}</span>
            <span className="cdm-card-meta">{size.w} × {size.h} · {size.hint}</span>
          </button>
        );
      })}
    </div>
  );

  const actionGrid = (actions: PhotoAction[]) => (
    <div className="cdm-grid cdm-action-grid">
      {actions.map(action => (
        <button key={action.id} className="cdm-card cdm-action-card" onClick={action.run}>
          <span className="cdm-card-preview cdm-action-preview">
            <span className="cdm-action-icon"><EditrimIcon name={action.icon} size={26} /></span>
          </span>
          <span className="cdm-card-name">{action.label}</span>
          <span className="cdm-card-meta">{action.hint}</span>
        </button>
      ))}
    </div>
  );

  const blankGrid = (choices: BlankChoice[]) => (
    <div className="cdm-grid">
      {choices.map(choice => (
        <button
          key={choice.key}
          className={`cdm-card ${selectedKey === choice.key ? 'is-selected' : ''}`}
          onClick={() => chooseBlank(choice)}
        >
          <span className="cdm-card-preview">
            <MockArt variant={choice.blank} width={choice.width} height={choice.height} />
          </span>
          <span className="cdm-card-name">{choice.name}</span>
          <span className="cdm-card-meta">{choice.hint}</span>
        </button>
      ))}
    </div>
  );

  const sectionHeading = (title: string, count?: number) => (
    <div className="cdm-section-head">
      <h3>{title}</h3>
      {count !== undefined && <span>{count}</span>}
    </div>
  );

  const blankPool = ['docs', 'whiteboards', 'sheets', 'websites'].includes(section)
    ? BLANK_CHOICES[section as 'docs' | 'whiteboards' | 'sheets' | 'websites']
    : [];
  const blankVisible = blankPool.filter(choice => !q || `${choice.name} ${choice.hint}`.toLowerCase().includes(q));

  const hasResults = limitedTemplates.length > 0 || sizePool.length > 0 || blankVisible.length > 0;

  const chips = section === 'templates'
    ? TEMPLATE_CATEGORIES.map(category => ({
        id: category,
        label: category,
        active: templateCategory === category,
        run: () => {
          setTemplateCategory(category);
          setQuery('');
          setVisibleTemplates(24);
          setSelection(null);
        },
      }))
    : section === 'social'
      ? SOCIAL_FILTERS.map(filter => ({
          id: filter.id,
          label: filter.label,
          active: socialFilter === filter.id,
          run: () => {
            setSocialFilter(filter.id);
            setQuery('');
            setSelection(null);
          },
        }))
      : section === 'printables'
        ? PRINT_FILTERS.map(filter => ({
            id: filter.id,
            label: filter.label,
            active: printFilter === filter.id,
            run: () => {
              setPrintFilter(filter.id);
              setQuery('');
              setSelection(null);
            },
          }))
        : [];

  const showPhoto = section === 'photo';
  const showVideos = section === 'videos';
  const showCustom = section === 'custom';
  const showUpload = section === 'upload';
  const showMore = section === 'more';

  const photoActions: PhotoAction[] = [
    {
      id: 'open-photo',
      label: 'Open photo editor',
      hint: 'Adjust, crop, filters and text',
      icon: 'photo',
      run: () => { onClose(); navigate('/photo'); },
    },
    {
      id: 'upload-photo',
      label: 'Upload a photo',
      hint: 'JPG, PNG or WebP',
      icon: 'upload',
      run: () => go('upload'),
    },
    {
      id: 'photo-collage',
      label: 'Photo collage',
      hint: '1080 × 1080 · square grid',
      icon: 'templates',
      run: () => {
        const collage = findSize('photo-collage');
        if (collage) chooseSize(collage);
      },
    },
  ];

  const moreActions: PhotoAction[] = [
    { id: 'all-templates', label: 'Browse all templates', hint: `${TEMPLATES.length} designs, every category`, icon: 'templates', run: () => { onClose(); navigate('/templates'); } },
    { id: 'ai', label: 'AI Studio', hint: 'Design, write, edit or review', icon: 'spark', run: () => { onClose(); navigate('/editor/new#ai'); } },
    { id: 'photo', label: 'Photo editor', hint: 'Edit a photo on this device', icon: 'photo', run: () => { onClose(); navigate('/photo'); } },
    { id: 'video', label: 'Video studio', hint: 'Timeline, clips and overlays', icon: 'video', run: () => { onClose(); navigate('/videos'); } },
    { id: 'brand', label: 'Brand kit', hint: 'Colours, fonts and voice', icon: 'palette', run: () => { onClose(); onOpenBrand?.(); } },
    { id: 'print', label: 'Print-ready PDF', hint: 'Bleed, crop marks and 300 DPI', icon: 'print', run: () => { onClose(); onOpenPrint?.(); } },
    { id: 'custom', label: 'Custom size', hint: 'Any width and height', icon: 'custom', run: () => go('custom') },
    { id: 'upload', label: 'Upload an image', hint: 'Turn a photo into a design', icon: 'upload', run: () => go('upload') },
  ];

  const filterActions = (list: PhotoAction[]) => (
    q ? list.filter(action => `${action.label} ${action.hint}`.toLowerCase().includes(q)) : list
  );
  const filteredVideos = VIDEO_FORMATS.filter(format => !q || `${format.name} ${format.hint}`.toLowerCase().includes(q));
  const filteredPhotoActions = filterActions(photoActions);
  const filteredMoreActions = filterActions(moreActions);

  if (!open) return null;

  const modal = (
    <div
      className="cdm-overlay"
      onPointerDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={shellRef}
        className="cdm-shell"
        role="dialog"
        aria-modal="true"
        aria-label="Create a design"
        tabIndex={-1}
      >
        <button className="cdm-close" onClick={onClose} aria-label="Close create a design">
          <EditrimIcon name="close" size={20} />
        </button>

        <aside className="cdm-side">
          <h1 className="cdm-title">Create a design</h1>
          <nav className="cdm-nav" ref={navRef} aria-label="Create a design categories">
            {SECTIONS.map(item => (
              <button
                key={item.id}
                className={`cdm-nav-btn ${section === item.id ? 'is-active' : ''}`}
                onClick={() => go(item.id)}
                aria-current={section === item.id ? 'page' : undefined}
              >
                <span className={`cdm-nav-icon tone-${item.tone}`}>
                  <EditrimIcon name={item.icon} size={15} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="cdm-side-foot">
            <span className="cdm-side-dot" />
            {TEMPLATES.length} editable designs
          </div>
        </aside>

        <div className="cdm-main">
          {!showCustom && !showUpload && (
            <div className="cdm-top">
              <label className="cdm-search">
                <EditrimIcon name="search" size={18} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={event => {
                    setQuery(event.target.value);
                    setVisibleTemplates(24);
                  }}
                  placeholder="What would you like to create?"
                  aria-label="Search designs and sizes"
                />
                {query && (
                  <button className="cdm-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                    <EditrimIcon name="close" size={14} />
                  </button>
                )}
              </label>
            </div>
          )}

          <div className="cdm-content">
            {showCustom ? (
              <div className="cdm-custom">
                <h2>Custom size</h2>
                <p>Set the canvas exactly how you need it. You can change it later.</p>
                <div className="cdm-custom-fields">
                  <label>
                    <span>Width</span>
                    <input type="number" min={1} max={9999} value={customW} onChange={event => setCustomW(Math.max(1, Number(event.target.value) || 1))} />
                  </label>
                  <label>
                    <span>Height</span>
                    <input type="number" min={1} max={9999} value={customH} onChange={event => setCustomH(Math.max(1, Number(event.target.value) || 1))} />
                  </label>
                  <label>
                    <span>Units</span>
                    <select value={customUnit} onChange={event => setCustomUnit(event.target.value as 'px' | 'in' | 'cm')}>
                      <option value="px">px</option>
                      <option value="in">in</option>
                      <option value="cm">cm</option>
                    </select>
                  </label>
                  <button className="cdm-primary" onClick={startCustom}>Create new design</button>
                </div>
                <div className="cdm-custom-preview">
                  <div style={{ aspectRatio: `${customW} / ${customH}` }} />
                  <span>{customW} × {customH} {customUnit}</span>
                </div>
              </div>
            ) : showUpload ? (
              <div className="cdm-upload">
                <h2>Upload</h2>
                <div
                  className={`cdm-dropzone ${dragging ? 'is-dragging' : ''}`}
                  onDragOver={event => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={event => {
                    event.preventDefault();
                    setDragging(false);
                    openUpload(event.dataTransfer.files?.[0]);
                  }}
                  onClick={() => uploadRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') uploadRef.current?.click(); }}
                >
                  <span className="cdm-upload-icon"><EditrimIcon name="upload" size={34} /></span>
                  <strong>Drop your photo here</strong>
                  <span>or choose a file from this device</span>
                  <span className="cdm-upload-btn"><EditrimIcon name="upload" size={15} /> Upload files</span>
                  <small>JPG, PNG or WebP · stays on this device</small>
                </div>
                <input
                  ref={uploadRef}
                  className="cdm-file-input"
                  type="file"
                  accept="image/*"
                  onChange={event => openUpload(event.target.files?.[0])}
                />
              </div>
            ) : showPhoto ? (
              <>
                {sectionHeading('Edit your photo')}
                {filteredPhotoActions.length > 0 ? actionGrid(filteredPhotoActions) : (
                  <div className="cdm-empty"><strong>Nothing matches “{query.trim()}”.</strong><p>Try “photo”, “upload” or “collage”.</p></div>
                )}
                <div className="cdm-inline-note">
                  <EditrimIcon name="spark" size={14} />
                  Photos stay on this device. Nothing is uploaded to a server.
                </div>
              </>
            ) : showMore ? (
              <>
                {sectionHeading('More ways to get started')}
                {filteredMoreActions.length > 0 ? actionGrid(filteredMoreActions) : (
                  <div className="cdm-empty"><strong>Nothing matches “{query.trim()}”.</strong><p>Try “templates”, “photo” or “brand”.</p></div>
                )}
              </>
            ) : showVideos ? (
              <>
                {sectionHeading('Videos', filteredVideos.length)}
                {filteredVideos.length > 0 ? (
                  <div className="cdm-grid">
                    {filteredVideos.map(format => (
                      <button
                        key={format.id}
                        className={`cdm-card ${selectedKey === `video:${format.id}` ? 'is-selected' : ''}`}
                        onClick={() => chooseVideo(format)}
                      >
                        <span className="cdm-card-preview">
                          <MockArt variant="video" width={format.width} height={format.height} />
                        </span>
                        <span className="cdm-card-name">{format.name}</span>
                        <span className="cdm-card-meta">{format.width} × {format.height} · {format.hint}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="cdm-empty"><strong>Nothing matches “{query.trim()}”.</strong><p>Try “video”, “reel” or “YouTube”.</p></div>
                )}
                <div className="cdm-inline-note">
                  <EditrimIcon name="film" size={14} />
                  Creates a real video project with the timeline and media library ready.
                </div>
              </>
            ) : (
              <>
                {chips.length > 0 && (
                  <div className="cdm-chips" role="tablist" aria-label={`${sectionTitle(section)} filters`}>
                    {chips.map(chip => (
                      <button
                        key={chip.id}
                        role="tab"
                        aria-selected={chip.active}
                        className={`cdm-chip ${chip.active ? 'is-active' : ''}`}
                        onClick={chip.run}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                {section === 'templates' && !q && (
                  <div className="cdm-intro-row">
                    <p>{TEMPLATES.length} editable templates, filtered by category.</p>
                    <button className="cdm-text-link" onClick={() => { onClose(); navigate('/templates'); }}>
                      Open full gallery <EditrimIcon name="arrowUpRight" size={13} />
                    </button>
                  </div>
                )}

                {['docs', 'websites'].includes(section) && blankVisible.length > 0 && (
                  <section className="cdm-section">
                    {sectionHeading(section === 'docs' ? 'Start a document' : 'Start a website')}
                    {blankGrid(blankVisible)}
                  </section>
                )}

                {section === 'whiteboards' && blankVisible.length > 0 && (
                  <section className="cdm-section">
                    {sectionHeading('Whiteboards')}
                    {blankGrid(blankVisible)}
                  </section>
                )}

                {section === 'sheets' && blankVisible.length > 0 && (
                  <section className="cdm-section">
                    {sectionHeading('Sheets')}
                    {blankGrid(blankVisible)}
                  </section>
                )}

                {limitedTemplates.length > 0 && (
                  <section className="cdm-section">
                    {sectionHeading(
                      section === 'for-you' ? 'Popular' : section === 'docs' ? 'Documents' : section === 'websites' ? 'Website templates' : 'Templates',
                      limitedTemplates.length,
                    )}
                    {templateGrid(limitedTemplates)}
                    {section === 'templates' && templatePool.length > visibleTemplates && (
                      <button className="cdm-more-btn" onClick={() => setVisibleTemplates(value => value + 24)}>
                        Show more
                      </button>
                    )}
                  </section>
                )}

                {sizePool.length > 0 && (
                  <section className="cdm-section">
                    {sectionHeading(section === 'presentations' ? 'Presentation sizes' : section === 'social' ? 'Social sizes' : section === 'printables' ? 'Print sizes' : 'Sizes', sizePool.length)}
                    {sizeGrid(sizePool)}
                  </section>
                )}

                {!hasResults && (
                  <div className="cdm-empty">
                    <strong>Nothing matches “{query.trim()}”.</strong>
                    <p>Try another word, or browse all templates.</p>
                    <button className="cdm-primary" onClick={() => { setQuery(''); setTemplateCategory('All'); }}>Clear search</button>
                  </div>
                )}
              </>
            )}
          </div>

          {selection && (
            <div className="cdm-detail">
              <span className="cdm-detail-preview"><DetailPreview selection={selection} /></span>
              <div className="cdm-detail-copy">
                <strong>{selection.name}</strong>
                <span>
                  {selection.category} · {selection.width} × {selection.height}
                  {'pages' in selection ? ` · ${selection.pages} ${selection.pages === 1 ? 'page' : 'pages'}` : ''}
                  {'hint' in selection ? ` · ${selection.hint}` : ''}
                </span>
              </div>
              <button className="cdm-primary" onClick={startSelection}>
                Use this layout <EditrimIcon name="arrowRight" size={15} />
              </button>
              <button className="cdm-detail-close" onClick={() => setSelection(null)} aria-label="Clear selection">
                <EditrimIcon name="close" size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
