import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight, Bell, CircleHelp, Clapperboard, Copy,
  CreditCard, Download, FileImage, FileText, FolderOpen, Frame, Globe2,
  Heart, Home as HomeIcon, Image as ImageIcon, LayoutDashboard, LayoutTemplate,
  Layers3, Mail, Mic, MoreHorizontal, Palette, PanelLeftClose, PanelLeftOpen,
  PenTool, Pencil, Play, Plus, Presentation, Printer, RectangleHorizontal, Search, ShoppingBag,
  Sparkles, Table2, Trash2, Upload, UtensilsCrossed, Wand2, X, Crown,
} from 'lucide-react';
import { BrandMark } from '../components/Brand';
import { VellumIcon, type VellumIconName } from '../components/VellumIcon';
import { NewDesignModal } from '../components/NewDesignModal';
import { BrandKitModal } from '../components/BrandKitModal';
import { Modal } from '../components/Modal';
import { PagePreview } from '../components/PagePreview';
import { FormatGlyph } from '../components/FormatGlyph';
import { useToast } from '../components/Toast';
import {
  addAsset, createDesign, deleteDesign, duplicateDesign, getBrand, getDesign,
  listDesigns, saveDesign, storageUsage,
} from '../lib/storage';
import { exportDesign } from '../lib/export';
import { TEMPLATES } from '../lib/templates';
import { SIZE_PRESETS } from '../lib/presets';
import { compressImage, formatBytes, timeAgo } from '../lib/utils';
import { createImage } from '../editor/factory';
import type { Design } from '../lib/types';
import { createDocDesign, createSheetDesign, createWebsiteDesign, createWhiteboardDesign } from '../lib/homeDesigns';
import '../styles/home.css';

type FeatureKind = 'sheet' | 'website' | 'magic';
type RailPopover = 'notifications' | 'avatar' | 'more' | null;

const TYPE_META: Record<string, { icon: LucideIcon; color: string }> = {
  Instagram: { icon: Heart, color: '#ff6a79' },
  'Instagram Post': { icon: Heart, color: '#ff6a79' },
  'Instagram Portrait': { icon: Heart, color: '#ff6a79' },
  Story: { icon: Heart, color: '#ff6a79' },
  'Your Story': { icon: Heart, color: '#ff6a79' },
  'Facebook Story': { icon: Heart, color: '#ff6a79' },
  'Facebook Event Cover': { icon: RectangleHorizontal, color: '#ff6a46' },
  'X / Twitter Header': { icon: RectangleHorizontal, color: '#6c9dff' },
  'Threads Post': { icon: Heart, color: '#ff6a79' },
  'Bluesky Post': { icon: Heart, color: '#3d9bff' },
  'LinkedIn Post': { icon: Heart, color: '#6c9dff' },
  'X / Twitter Post': { icon: Heart, color: '#6c9dff' },
  'Pinterest Pin': { icon: Heart, color: '#ff6a79' },
  Presentation: { icon: Presentation, color: '#ff914f' },
  'Presentation 4:3': { icon: Presentation, color: '#ff914f' },
  'Keynote 16:10': { icon: Presentation, color: '#ff914f' },
  Poster: { icon: FileImage, color: '#b895ff' },
  Resume: { icon: FileText, color: '#6c9dff' },
  'Business card': { icon: CreditCard, color: '#7bd6ff' },
  YouTube: { icon: Play, color: '#ff6a46' },
  Menu: { icon: UtensilsCrossed, color: '#d8f55a' },
  Invitation: { icon: Mail, color: '#e8a3c5' },
  Logo: { icon: Sparkles, color: '#d8f55a' },
  Flyer: { icon: FileImage, color: '#ffb39f' },
  Banner: { icon: RectangleHorizontal, color: '#6c9dff' },
  Podcast: { icon: Mic, color: '#d8f55a' },
  'TikTok Video': { icon: Clapperboard, color: '#ff5da8' },
  'US Letter': { icon: FileText, color: '#6c9dff' },
  Doc: { icon: FileText, color: '#2ec4c6' },
  Document: { icon: FileText, color: '#6c9dff' },
  Whiteboard: { icon: PenTool, color: '#38c976' },
  Website: { icon: Globe2, color: '#3d9bff' },
  Sheet: { icon: Table2, color: '#4d8cff' },
  Video: { icon: Clapperboard, color: '#ff5da8' },
  'Mobile Video': { icon: Clapperboard, color: '#ff5da8' },
  'Landscape Video': { icon: Clapperboard, color: '#ff5da8' },
  'Desktop Wallpaper': { icon: ImageIcon, color: '#b895ff' },
  'Phone Wallpaper': { icon: ImageIcon, color: '#7bd6ff' },
  'Photo Collage': { icon: ImageIcon, color: '#ffb39f' },
  Certificate: { icon: FileText, color: '#d8f55a' },
  Invoice: { icon: FileText, color: '#6c9dff' },
  Letterhead: { icon: Mail, color: '#e8a3c5' },
  Brochure: { icon: FileImage, color: '#ffb39f' },
  Postcard: { icon: Mail, color: '#e8a3c5' },
  'Book Cover': { icon: FileText, color: '#b895ff' },
  'Magazine Cover': { icon: FileImage, color: '#ffb39f' },
  'Recipe Card': { icon: UtensilsCrossed, color: '#d8f55a' },
  'YouTube Banner': { icon: RectangleHorizontal, color: '#ff6a46' },
  'Podcast Cover': { icon: Mic, color: '#d8f55a' },
  'Album Cover': { icon: ImageIcon, color: '#b895ff' },
  'App Icon': { icon: Sparkles, color: '#d8f55a' },
  'GitHub Social': { icon: Globe2, color: '#6c9dff' },
  'Google Business Cover': { icon: RectangleHorizontal, color: '#3d9bff' },
  'Etsy Banner': { icon: ShoppingBag, color: '#ffb39f' },
  Newsletter: { icon: Mail, color: '#6c9dff' },
  Contract: { icon: FileText, color: '#6c9dff' },
  Proposal: { icon: FileText, color: '#6c9dff' },
  'Link in Bio': { icon: Globe2, color: '#3d9bff' },
  Code: { icon: Frame, color: '#b895ff' },
  Email: { icon: Mail, color: '#6c9dff' },
  'Email Header': { icon: Mail, color: '#6c9dff' },
  Upload: { icon: ImageIcon, color: '#b895ff' },
  Custom: { icon: Frame, color: '#b895ff' },
};

function typeMeta(category: string) {
  return TYPE_META[category] ?? { icon: LayoutTemplate, color: '#b895ff' };
}

function designArtWidth(design: Design, frameRatio = 1.55) {
  return Math.min(100, (84 * (design.size.width / design.size.height)) / frameRatio);
}

function formatCount(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'projects' ? 'projects' : 'home';
  const [entries, setEntries] = useState<Design[]>([]);
  const [brand, setBrand] = useState(() => getBrand());
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [newCustom, setNewCustom] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [feature, setFeature] = useState<FeatureKind | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [railPopover, setRailPopover] = useState<RailPopover>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Design | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<Design | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [printId, setPrintId] = useState('');
  const [printing, setPrinting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const reload = () => {
    const list = listDesigns()
      .map(meta => getDesign(meta.id))
      .filter((d): d is Design => Boolean(d));
    setEntries(list);
    setBrand(getBrand());
  };

  useEffect(() => {
    reload();
    document.title = view === 'projects' ? 'Projects — Vellum' : 'Home — Vellum';
  }, [view]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setMenuId(null);
        setRailPopover(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuId && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuId]);

  const usage = storageUsage();
  const pageCount = entries.reduce((n, d) => n + d.pages.length, 0);
  const recent = entries.slice(0, 8);
  const templateSuggestions = useMemo(() => {
    const preferred = ['cafe-opening', 'porter-pitch', 'night-shift', 'form-04', 'flash-sale', 'north-coast', 'elena-resume', 'north-mark'];
    return preferred.map(id => TEMPLATES.find(t => t.id === id)).filter((t): t is typeof TEMPLATES[number] => Boolean(t));
  }, []);

  const setView = (next: 'home' | 'projects') => {
    if (next === 'projects') setSearchParams({ view: 'projects' });
    else setSearchParams({});
    setRailPopover(null);
  };

  const startBlank = (w: number, h: number, title: string, category: string) => {
    const d = createDesign({ title, width: w, height: h, category });
    navigate(`/editor/${d.id}`);
  };

  const startDoc = () => navigate(`/editor/${createDocDesign().id}`);
  const startWhiteboard = () => navigate(`/editor/${createWhiteboardDesign().id}`);
  const startWebsite = () => {
    setFeature(null);
    navigate(`/editor/${createWebsiteDesign().id}`);
  };
  const startSheet = () => {
    setFeature(null);
    navigate(`/editor/${createSheetDesign().id}`);
  };

  const openCreate = (custom = false) => {
    setNewCustom(custom);
    setNewOpen(true);
    setRailPopover(null);
  };

  const openPrint = () => {
    setPrintId(current => current || entries[0]?.id || '');
    setPrintOpen(true);
    setRailPopover(null);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('Choose an image file to start a design', 'error');
      return;
    }
    setUploading(true);
    try {
      const data = await compressImage(file);
      const src = await addAsset(file.name, data);
      const design = createDesign({
        title: file.name.replace(/\.[^.]+$/, '') || 'Untitled upload',
        width: 1080,
        height: 1080,
        category: 'Upload',
      });
      const page = design.pages[0];
      const image = createImage(src, page, design.size, 1);
      image.x = 0;
      image.y = 0;
      image.w = design.size.width;
      image.h = design.size.height;
      image.fit = 'cover';
      image.radius = 0;
      image.name = 'Uploaded image';
      page.elements = [image];
      page.name = 'Upload';
      saveDesign(design);
      toast('Image imported — your design is ready');
      navigate(`/editor/${design.id}`);
    } catch {
      toast('That image could not be imported', 'error');
    } finally {
      setUploading(false);
    }
  };

  const onRename = (d: Design) => {
    setRenaming(d);
    setRenameValue(d.title);
    setMenuId(null);
  };

  const commitRename = () => {
    if (!renaming) return;
    const fresh = getDesign(renaming.id);
    if (fresh) {
      saveDesign({ ...fresh, title: renameValue.trim() || 'Untitled design' });
      toast('Design renamed');
    }
    setRenaming(null);
    reload();
  };

  const onDuplicate = (d: Design) => {
    const copy = duplicateDesign(d.id);
    setMenuId(null);
    if (copy) {
      reload();
      toast('Design duplicated');
    }
  };

  const onDownload = async (d: Design) => {
    setMenuId(null);
    try {
      await exportDesign(d, 0, { format: 'png', scale: 2, pages: 'current', transparent: false });
      toast('PNG downloaded');
    } catch {
      toast('Export failed — try opening the design', 'error');
    }
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteDesign(deleting.id);
    setDeleting(null);
    reload();
    toast('Design deleted');
  };

  const downloadPrintPdf = async () => {
    const chosen = entries.find(d => d.id === printId) ?? entries[0];
    if (!chosen) return;
    setPrinting(true);
    try {
      await exportDesign(chosen, 0, { format: 'pdf', scale: 2, pages: 'all', transparent: false });
      toast('Print-ready PDF downloaded');
    } catch {
      toast('PDF export failed — try again', 'error');
    } finally {
      setPrinting(false);
    }
  };

  const searchDesigns = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter(d => `${d.title} ${d.category}`.toLowerCase().includes(q)).slice(0, 6);
  }, [entries, query]);

  const searchTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TEMPLATES.filter(t => `${t.name} ${t.category} ${t.description} ${t.tags.join(' ')}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const searchPresets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SIZE_PRESETS.filter(p => `${p.name} ${p.group} ${p.hint}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const actions: { label: string; hint: string; icon: VellumIconName; run: () => void }[] = [
    { label: 'Create a presentation', hint: '16:9 deck', icon: 'present', run: () => startBlank(1920, 1080, 'Untitled presentation', 'Presentation') },
    { label: 'Open video studio', hint: 'Timeline, clips, audio and text overlays', icon: 'video', run: () => navigate('/videos') },
    { label: 'Browse design library', hint: `${SIZE_PRESETS.length} formats, from social to print`, icon: 'templates', run: () => openCreate() },
    { label: 'Open AI Studio', hint: 'Design, write, edit or review with AI', icon: 'spark', run: () => navigate('/editor/new#ai') },
    { label: 'Upload an image', hint: 'Turn a photo into a new design', icon: 'upload', run: () => fileRef.current?.click() },
    { label: 'Print-ready PDF', hint: 'Download a print PDF', icon: 'print', run: openPrint },
    { label: 'Custom size canvas', hint: 'Any dimensions', icon: 'custom', run: () => openCreate(true) },
    { label: 'Brand kit', hint: 'Colours, fonts and voice', icon: 'palette', run: () => setBrandOpen(true) },
    { label: 'Browse all templates', hint: 'Find a starting point', icon: 'templates', run: () => navigate('/templates') },
  ];
  const searchActions = query.trim()
    ? actions.filter(a => `${a.label} ${a.hint}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5)
    : [];

  const hasSearch = Boolean(query.trim());
  const firstSearchResult = searchDesigns[0] ?? searchTemplates[0] ?? searchPresets[0] ?? null;
  const openFirstResult = () => {
    if (searchDesigns[0]) navigate(`/editor/${searchDesigns[0].id}`);
    else if (searchTemplates[0]) navigate(`/editor/new?template=${searchTemplates[0].id}`);
    else if (searchPresets[0]) startBlank(searchPresets[0].w, searchPresets[0].h, `Untitled ${searchPresets[0].name.toLowerCase()}`, searchPresets[0].name);
    else if (searchActions[0]) searchActions[0].run();
  };

  const categories: { id: string; label: string; icon: VellumIconName; tone: string; outline?: boolean; run: () => void }[] = [
    { id: 'templates', label: 'Templates', icon: 'templates', tone: 'purple', run: () => navigate('/templates') },
    { id: 'presentation', label: 'Presentation', icon: 'present', tone: 'orange', run: () => startBlank(1920, 1080, 'Untitled presentation', 'Presentation') },
    { id: 'social', label: 'Social media', icon: 'social', tone: 'coral', run: () => startBlank(1080, 1080, 'Untitled social post', 'Instagram') },
    { id: 'video', label: 'Video', icon: 'video', tone: 'pink', run: () => navigate('/video') },
    { id: 'printables', label: 'Printables', icon: 'printable', tone: 'violet', run: () => navigate('/templates?category=Poster') },
    { id: 'doc', label: 'Doc', icon: 'doc', tone: 'teal', run: startDoc },
    { id: 'whiteboard', label: 'Whiteboard', icon: 'board', tone: 'green', run: startWhiteboard },
    { id: 'sheet', label: 'Sheet', icon: 'sheet', tone: 'blue', run: () => setFeature('sheet') },
    { id: 'website', label: 'Website', icon: 'website', tone: 'sky', run: () => setFeature('website') },
    { id: 'magic', label: 'Magic Layers', icon: 'magic', tone: 'magic', run: () => setFeature('magic') },
    { id: 'custom', label: 'Custom size', icon: 'custom', tone: 'outline', outline: true, run: () => openCreate(true) },
    { id: 'upload', label: 'Upload', icon: 'upload', tone: 'outline', outline: true, run: () => fileRef.current?.click() },
    { id: 'more', label: 'More', icon: 'more', tone: 'outline', outline: true, run: () => setMoreOpen(true) },
  ];

  const featureMeta = feature ? {
    sheet: {
      title: 'A sheet layout, not a spreadsheet.',
      subtitle: 'Rows and columns are editable design layers. Formulas and cell references are not available.',
      body: 'Create a clean table-style page for a content plan, budget or schedule. Every label is a text layer you can edit, style and export.',
      primary: 'Create a sheet layout',
      run: startSheet,
    },
    website: {
      title: 'A website page, not hosting.',
      subtitle: 'Design the page here. Publishing to a live domain is not part of this local-first build.',
      body: 'Create a responsive-looking website page with real layers, then export a PNG/PDF or share it as a design. Hosting and forms require a backend.',
      primary: 'Create website page',
      run: startWebsite,
    },
    magic: {
      title: 'Magic Layers needs a vision model.',
      subtitle: 'A text model cannot separate a flat image into editable objects.',
      body: 'Vellum will not pretend to do image segmentation. For now, use AI Illustration for vector art, or start from a template and rebuild the composition with real layers.',
      primary: 'Open AI Studio',
      run: () => { setFeature(null); navigate('/editor/new#ai'); },
    },
  }[feature] : null;

  return (
    <div className={`home ${collapsed ? 'rail-collapsed' : ''}`}>
      <aside className="home-rail">
        <button className="rail-collapse" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
          {collapsed ? <VellumIcon name="sidebarOpen" size={17} /> : <VellumIcon name="sidebar" size={17} />}
        </button>

        <button className="rail-create" onClick={() => openCreate()} title="Open design library">
          <span className="rail-create-icon"><VellumIcon name="plus" size={20} /></span>
          <span className="rail-label">Create</span>
        </button>

        <nav className="rail-nav" aria-label="Workspace">
          <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')} title="Home">
            <VellumIcon name="home" size={19} /><span className="rail-label">Home</span>
          </button>
          <button className={view === 'projects' ? 'active' : ''} onClick={() => setView('projects')} title="Projects">
            <VellumIcon name="projects" size={19} /><span className="rail-label">Projects</span>
          </button>
          <Link to="/templates" title="Templates">
            <VellumIcon name="templates" size={19} /><span className="rail-label">Templates</span>
          </Link>
          <button onClick={() => setBrandOpen(true)} title="Brand kit">
            <VellumIcon name="brand" size={19} /><span className="rail-label">Brand</span>
          </button>
          <button onClick={() => navigate('/editor/new#ai')} title="AI Studio">
            <VellumIcon name="spark" size={19} /><span className="rail-label">AI Studio</span>
          </button>
          <button onClick={openPrint} title="Print-ready PDF">
            <VellumIcon name="print" size={19} /><span className="rail-label">Print</span>
          </button>
          <button onClick={() => setRailPopover(railPopover === 'more' ? null : 'more')} title="More" aria-expanded={railPopover === 'more'}>
            <VellumIcon name="more" size={19} /><span className="rail-label">More</span>
          </button>
        </nav>

        <div className="rail-bottom">
          <button
            className="rail-bell"
            onClick={() => {
              setRailPopover(railPopover === 'notifications' ? null : 'notifications');
              setNotificationsRead(true);
            }}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={railPopover === 'notifications'}
          >
            <VellumIcon name="bell" size={18} />
            {!notificationsRead && <i />}
          </button>
          <button
            className="rail-avatar"
            onClick={() => setRailPopover(railPopover === 'avatar' ? null : 'avatar')}
            title="Local workspace"
            aria-label="Open profile menu"
            aria-expanded={railPopover === 'avatar'}
          >
            V
          </button>
        </div>

        {railPopover && <div className="rail-popover-backdrop" onClick={() => setRailPopover(null)} />}
        {railPopover === 'notifications' && (
          <div className="rail-popover rail-notifications">
            <div className="rail-popover-head"><strong>Updates</strong><button onClick={() => setRailPopover(null)}><VellumIcon name="close" size={14} /></button></div>
            <div className="rail-popover-item"><span className="rail-popover-dot" /><div><strong>Your designs are local</strong><p>Everything autosaves in this browser. Nothing is uploaded.</p></div></div>
            <div className="rail-popover-item"><span className="rail-popover-dot" /><div><strong>AI Studio is ready</strong><p>Design, edit, write and review with MiMo V2.6 Flash.</p></div></div>
            <div className="rail-popover-item"><span className="rail-popover-dot" /><div><strong>Find anything</strong><p>Press <span className="kbd">/</span> to search designs, templates and actions.</p></div></div>
          </div>
        )}
        {railPopover === 'avatar' && (
          <div className="rail-popover rail-profile">
            <div className="rail-popover-head"><strong>Local workspace</strong><button onClick={() => setRailPopover(null)}><VellumIcon name="close" size={14} /></button></div>
            <div className="rail-profile-id"><span>V</span><div><strong>You</strong><p>{formatCount(entries.length, 'design', 'designs')} · {formatCount(pageCount, 'page', 'pages')}</p></div></div>
            <div className="rail-storage"><div><span>Local storage</span><span>{formatBytes(usage)}</span></div><i><b style={{ width: `${Math.min(100, (usage / (5 * 1024 * 1024)) * 100)}%` }} /></i></div>
            <button onClick={() => { setRailPopover(null); setView('projects'); }}><VellumIcon name="projects" size={14} /> Projects</button>
            <button onClick={() => { setRailPopover(null); setBrandOpen(true); }}><VellumIcon name="palette" size={14} /> Brand kit</button>
            <button onClick={() => { setRailPopover(null); setHelpOpen(true); }}><VellumIcon name="help" size={14} /> Help</button>
          </div>
        )}
        {railPopover === 'more' && (
          <div className="rail-popover rail-more">
            <div className="rail-popover-head"><strong>More</strong><button onClick={() => setRailPopover(null)}><VellumIcon name="close" size={14} /></button></div>
            <button onClick={() => { setRailPopover(null); fileRef.current?.click(); }}><VellumIcon name="upload" size={14} /> Upload image</button>
            <button onClick={() => { setRailPopover(null); openCreate(true); }}><VellumIcon name="custom" size={14} /> Custom size</button>
            <button onClick={() => { setRailPopover(null); openPrint(); }}><VellumIcon name="print" size={14} /> Print-ready PDF</button>
            <button onClick={() => { setRailPopover(null); setHelpOpen(true); }}><VellumIcon name="help" size={14} /> Help &amp; shortcuts</button>
            <a href="https://github.com/IMMENSE-BUILDER/vellum" target="_blank" rel="noreferrer"><VellumIcon name="website" size={14} /> Source</a>
          </div>
        )}
      </aside>

      <main className="home-main">
        <div className="home-scroll">
          <section className="home-hero">
            <div className="home-topline">
              <Link to="/" className="home-brand" aria-label="Vellum home"><BrandMark size={24} /><span>Vellum</span></Link>
            </div>
            <h1 className="home-sr-title">{view === 'projects' ? 'Projects' : 'Home'}</h1>

            <div className="home-search-wrap">
              <VellumIcon name="search" size={21} />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && firstSearchResult) openFirstResult();
                  if (e.key === 'Escape') setQuery('');
                }}
                placeholder="Search anything"
                aria-label="Search designs, templates and actions"
              />
              {query ? <button className="home-search-clear" onClick={() => setQuery('')} aria-label="Clear search"><VellumIcon name="close" size={16} /></button> : <span className="home-search-key">/</span>}
            </div>

            {!hasSearch && view === 'home' && (
              <div className="home-categories">
                {categories.map((cat, i) => {
                  return (
                    <div className="home-cat-wrap" key={cat.id}>
                      {i === 1 && <span className="home-cat-sep" />}
                      <button className={`home-cat ${cat.outline ? 'is-outline' : ''} tone-${cat.tone}`} onClick={cat.run} title={cat.label} style={{ '--icon-index': i } as CSSProperties}>
                        <span className="home-cat-icon"><VellumIcon name={cat.icon} size={22} /></span>
                        <span className="home-cat-label">{cat.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {hasSearch && (
              <section className="home-search-results">
                <div className="home-results-head">
                  <span className="home-eyebrow">Search results</span>
                  <span>{searchDesigns.length + searchTemplates.length + searchPresets.length + searchActions.length} found</span>
                </div>
                {searchDesigns.length > 0 && (
                  <div className="home-result-group">
                    <h3>Your designs</h3>
                    {searchDesigns.map(d => (
                      <Link key={d.id} className="home-result-row" to={`/editor/${d.id}`} onClick={() => setQuery('')}>
                        <span className="home-result-thumb"><PagePreview page={d.pages[0]} size={d.size} /></span>
                        <span><strong>{d.title}</strong><small>{d.category} · {formatCount(d.pages.length, 'page', 'pages')} · {timeAgo(d.updatedAt)}</small></span>
                        <VellumIcon name="arrowUpRight" size={14} />
                      </Link>
                    ))}
                  </div>
                )}
                {searchPresets.length > 0 && (
                  <div className="home-result-group">
                    <h3>Formats</h3>
                    {searchPresets.map(preset => {
                      return (
                        <button
                          key={preset.id}
                          className="home-result-row action"
                          onClick={() => {
                            setQuery('');
                            startBlank(preset.w, preset.h, `Untitled ${preset.name.toLowerCase()}`, preset.name);
                          }}
                        >
                          <FormatGlyph formatId={preset.id} size="sm" ratio={preset.w / preset.h} />
                          <span><strong>{preset.name}</strong><small>{preset.group} · {preset.w}×{preset.h} · {preset.hint}</small></span>
                          <VellumIcon name="arrowUpRight" size={14} />
                        </button>
                      );
                    })}
                  </div>
                )}
                {searchTemplates.length > 0 && (
                  <div className="home-result-group">
                    <h3>Templates</h3>
                    {searchTemplates.map(t => (
                      <Link key={t.id} className="home-result-row" to={`/editor/new?template=${t.id}`} onClick={() => setQuery('')}>
                        <span className="home-result-thumb"><PagePreview page={t.pages[0]} size={t.size} /></span>
                        <span><strong>{t.name}</strong><small>{t.category} · {formatCount(t.pages.length, 'page', 'pages')}</small></span>
                        <VellumIcon name="arrowUpRight" size={14} />
                      </Link>
                    ))}
                  </div>
                )}
                {searchActions.length > 0 && (
                  <div className="home-result-group">
                    <h3>Actions</h3>
                    {searchActions.map(action => {
                      return (
                        <button key={action.label} className="home-result-row action" onClick={() => { setQuery(''); action.run(); }}>
                          <span className="home-result-action-icon"><VellumIcon name={action.icon} size={17} /></span>
                          <span><strong>{action.label}</strong><small>{action.hint}</small></span>
                          <VellumIcon name="arrowUpRight" size={14} />
                        </button>
                      );
                    })}
                  </div>
                )}
                {!searchDesigns.length && !searchTemplates.length && !searchPresets.length && !searchActions.length && (
                  <div className="home-no-results">
                    <VellumIcon name="search" size={22} /><h3>Nothing matches “{query}”.</h3>
                    <p>Try a design name, a template type, or an action like “AI” or “print”.</p>
                  </div>
                )}
              </section>
            )}

            {!hasSearch && view === 'home' && (
              <>
                <section className="home-section">
                  <div className="home-section-head">
                    <div><h2>Continue designing</h2></div>
                    <button onClick={() => setView('projects')}>See all <VellumIcon name="arrowUpRight" size={14} /></button>
                  </div>
                  {recent.length > 0 ? (
                    <div className="home-design-strip">
                      {recent.map(d => {
                        const meta = typeMeta(d.category);
                        const Icon = meta.icon;
                        return (
                          <Link to={`/editor/${d.id}`} className="home-design-card" key={d.id}>
                            <div className="home-design-thumb">
                              <div className="home-design-art" style={{ width: `${designArtWidth(d)}%` }}>
                                <PagePreview page={d.pages[0]} size={d.size} />
                              </div>
                            </div>
                            <strong>{d.title}</strong>
                            <span className="home-design-meta"><FormatGlyph name={d.category} size="micro" /> {d.category} · Edited {timeAgo(d.updatedAt)}</span>
                          </Link>
                        );
                      })}
                      <button className="home-design-card home-new-card" onClick={() => openCreate()}>
                        <span className="home-new-card-icon"><VellumIcon name="plus" size={22} /></span>
                        <strong>Start something new</strong>
                        <span className="home-design-meta">Blank canvas, any size</span>
                      </button>
                    </div>
                  ) : (
                    <div className="home-empty-continue">
                      <div><strong>No designs</strong></div>
                      <button className="btn home-btn-primary" onClick={() => openCreate()}><VellumIcon name="plus" size={14} /> Create</button>
                      <Link to="/templates" className="btn home-btn-ghost">Browse templates</Link>
                    </div>
                  )}
                </section>

                <section className="home-section">
                  <div className="home-section-head">
                    <div><h2>Templates for you</h2></div>
                    <Link to="/templates">See all <VellumIcon name="arrowUpRight" size={14} /></Link>
                  </div>
                  <div className="home-template-strip">
                    {templateSuggestions.map(t => (
                      <Link key={t.id} to={`/editor/new?template=${t.id}`} className="home-template-card">
                        <div className="home-template-thumb">
                          <div className="home-template-art" style={{ width: `${designArtWidth({ size: t.size } as Design, 0.8)}%` }}>
                            <PagePreview page={t.pages[0]} size={t.size} />
                          </div>
                        </div>
                        <strong>{t.name}</strong>
                        <span className="home-template-meta"><FormatGlyph name={t.category} size="micro" /> {t.category} · {formatCount(t.pages.length, 'page', 'pages')}</span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="home-section home-quiet-cta">
                  <div><h2>AI Studio</h2></div>
                  <button className="home-btn-ai" onClick={() => navigate('/editor/new#ai')}><VellumIcon name="spark" size={15} /> Open <VellumIcon name="arrowUpRight" size={14} /></button>
                </section>
              </>
            )}

            {!hasSearch && view === 'projects' && (
              <section className="home-section home-projects-section">
                <div className="home-section-head">
                  <div><h2>Projects</h2></div>
                  <div className="home-project-actions">
                    <span>{formatCount(entries.length, 'design', 'designs')} · {formatCount(pageCount, 'page', 'pages')}</span>
                    <button className="btn home-btn-primary" onClick={() => openCreate()}><VellumIcon name="plus" size={14} /> New design</button>
                  </div>
                </div>
                {entries.length > 0 ? (
                  <div className="home-project-grid">
                    {entries.map(d => {
                      const meta = typeMeta(d.category);
                      const Icon = meta.icon;
                      return (
                        <div className="home-project-card" key={d.id}>
                          <Link to={`/editor/${d.id}`} className="home-project-thumb">
                            <div className="home-project-art" style={{ width: `${designArtWidth(d, 1.1)}%` }}>
                              <PagePreview page={d.pages[0]} size={d.size} />
                            </div>
                            <span className="home-project-open">Open <VellumIcon name="arrowUpRight" size={12} /></span>
                          </Link>
                          <div className="home-project-info">
                            <div><Link to={`/editor/${d.id}`}>{d.title}</Link><span><FormatGlyph name={d.category} size="micro" /> {d.category} · {formatCount(d.pages.length, 'page', 'pages')} · {timeAgo(d.updatedAt)}</span></div>
                            <div className="home-project-menu-wrap" ref={menuId === d.id ? menuRef : undefined}>
                              <button
                                className="home-project-menu-btn"
                                onClick={() => setMenuId(menuId === d.id ? null : d.id)}
                                aria-label={`Options for ${d.title}`}
                                aria-haspopup="menu"
                                aria-expanded={menuId === d.id}
                              ><VellumIcon name="more" size={16} /></button>
                              {menuId === d.id && (
                                <div className="home-project-menu" role="menu" aria-label={`Options for ${d.title}`}>
                                  <button role="menuitem" onClick={() => { setMenuId(null); navigate(`/editor/${d.id}`); }}><VellumIcon name="pencil" size={13} /> Edit</button>
                                  <button role="menuitem" onClick={() => onRename(d)}><VellumIcon name="doc" size={13} /> Rename</button>
                                  <button role="menuitem" onClick={() => onDuplicate(d)}><VellumIcon name="duplicate" size={13} /> Duplicate</button>
                                  <button role="menuitem" onClick={() => onDownload(d)}><VellumIcon name="download" size={13} /> Download PNG</button>
                                  <button role="menuitem" onClick={() => { setMenuId(null); navigate(`/present/${d.id}`); }}><VellumIcon name="play" size={13} /> Present</button>
                                  <button role="menuitem" className="danger" onClick={() => { setMenuId(null); setDeleting(d); }}><VellumIcon name="trash" size={13} /> Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button className="home-project-add" onClick={() => openCreate()}>
                      <span><VellumIcon name="plus" size={22} /></span><strong>Create a new design</strong><small>Any size, blank or from a template</small>
                    </button>
                  </div>
                ) : (
                  <div className="home-empty-continue">
                    <span className="home-empty-icon"><VellumIcon name="magic" size={21} /></span>
                    <div><strong>No projects yet.</strong><p>Make your first design and it will show up here, saved in this browser.</p></div>
                    <button className="btn home-btn-primary" onClick={() => openCreate()}><VellumIcon name="plus" size={14} /> New design</button>
                  </div>
                )}
              </section>
            )}
          </section>
        </div>

        <button className="home-help" onClick={() => setHelpOpen(true)} title="Help"><VellumIcon name="help" size={22} /></button>
      </main>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ''; }} />
      {uploading && <div className="home-uploading"><span /><strong>Preparing your image…</strong></div>}

      <NewDesignModal open={newOpen} onClose={() => setNewOpen(false)} initialCustom={newCustom} initialGroup={newCustom ? 'Social' : 'Social'} />
      <BrandKitModal open={brandOpen} onClose={() => setBrandOpen(false)} onSaved={() => { setBrand(getBrand()); reload(); toast('Brand kit updated'); }} />

      <Modal
        open={Boolean(feature)}
        onClose={() => setFeature(null)}
        title={featureMeta?.title}
        subtitle={featureMeta?.subtitle}
        width={560}
        footer={featureMeta ? (
          <>
            <button className="btn btn-ghost" onClick={() => setFeature(null)}>Not now</button>
            {feature === 'magic' && <Link to="/templates" className="btn btn-secondary" onClick={() => setFeature(null)}>Browse templates</Link>}
            <button className="btn btn-cobalt" onClick={featureMeta.run}>{featureMeta.primary} <VellumIcon name="arrowUpRight" size={15} /></button>
          </>
        ) : undefined}
      >
        <p className="home-modal-copy">{featureMeta?.body}</p>
      </Modal>

      <Modal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        title="Print-ready PDF"
        width={560}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setPrintOpen(false)}>Cancel</button>
            <button className="btn btn-cobalt" onClick={downloadPrintPdf} disabled={printing || !entries.length}>
              {printing ? 'Rendering…' : 'Download PDF'} <VellumIcon name="download" size={15} />
            </button>
          </>
        }
      >
        {entries.length ? (
          <>
            <label className="field">
              <span className="field-label">Design</span>
              <select className="select" value={printDesignId()} onChange={e => setPrintId(e.target.value)}>
                {entries.map(d => <option key={d.id} value={d.id}>{d.title} — {d.size.width}×{d.size.height}</option>)}
              </select>
            </label>
          </>
        ) : (
          <div className="home-modal-empty"><strong>No designs yet.</strong><button className="btn btn-primary" onClick={() => { setPrintOpen(false); openCreate(); }}>Create a design</button></div>
        )}
      </Modal>

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Welcome to Vellum"
        width={640}
        footer={<button className="btn btn-cobalt" onClick={() => setHelpOpen(false)}>Back to work</button>}
      >
        <div className="home-help-grid">
          <div><VellumIcon name="spark" size={17} /><strong>Start anywhere</strong><p>Use a template, a category, a custom size or an upload. Everything can be edited.</p></div>
          <div><VellumIcon name="projects" size={17} /><strong>Your work is local</strong><p>Designs autosave in this browser. No account, no cloud, no surprise sharing.</p></div>
          <div><VellumIcon name="magic" size={17} /><strong>AI when you want it</strong><p>Design, edit, write, illustrate and review from the AI Studio tab in the editor.</p></div>
          <div><VellumIcon name="print" size={17} /><strong>Take it with you</strong><p>Export PNG, JPG or PDF. Use Print for a high-resolution PDF, all pages.</p></div>
        </div>
      </Modal>

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More ways to start"
        width={560}
      >
        <div className="home-more-grid">
          <button onClick={() => { setMoreOpen(false); openCreate(); }}><VellumIcon name="templates" size={18} /><strong>Design library</strong></button>
          <button onClick={() => { setMoreOpen(false); navigate('/video'); }}><VellumIcon name="video" size={18} /><strong>Video studio</strong></button>
          <button onClick={() => { setMoreOpen(false); openCreate(true); }}><VellumIcon name="custom" size={18} /><strong>Custom size</strong></button>
          <button onClick={() => { setMoreOpen(false); fileRef.current?.click(); }}><VellumIcon name="upload" size={18} /><strong>Upload image</strong></button>
          <button onClick={() => { setMoreOpen(false); openPrint(); }}><VellumIcon name="print" size={18} /><strong>Print-ready PDF</strong></button>
          <button onClick={() => { setMoreOpen(false); setBrandOpen(true); }}><VellumIcon name="palette" size={18} /><strong>Brand kit</strong></button>
          <button onClick={() => { setMoreOpen(false); navigate('/editor/new#ai'); }}><VellumIcon name="spark" size={18} /><strong>AI Studio</strong></button>
          <button onClick={() => { setMoreOpen(false); setHelpOpen(true); }}><VellumIcon name="help" size={18} /><strong>Help</strong></button>
        </div>
      </Modal>

      <Modal
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title="Rename design"
        footer={<><button className="btn btn-ghost" onClick={() => setRenaming(null)}>Cancel</button><button className="btn btn-cobalt" onClick={commitRename}>Save name</button></>}
      >
        <div className="field"><label className="field-label" htmlFor="home-rename">Design name</label><input id="home-rename" className="input" value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitRename()} autoFocus /></div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this design?"
        subtitle="This cannot be undone — the design is removed from this browser."
        footer={<><button className="btn btn-ghost" onClick={() => setDeleting(null)}>Keep it</button><button className="btn btn-danger" onClick={confirmDelete}>Delete design</button></>}
      >
        <div className="home-delete"><VellumIcon name="trash" size={18} /><div><strong>{deleting?.title}</strong><span>{deleting ? `${deleting.pages.length} pages · ${deleting.size.width}×${deleting.size.height}` : ''}</span></div></div>
      </Modal>
    </div>
  );

  function printDesignId() {
    return printId || entries[0]?.id || '';
  }
}

export function ProjectsRoute() {
  return <Navigate to="/dashboard?view=projects" replace />;
}
