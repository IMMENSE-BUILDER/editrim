import type { ComponentType, CSSProperties, ReactNode } from 'react';
import {
  AppWindow, AtSign, Award, BarChart3, Book, BookOpen, CalendarDays, Camera,
  Clapperboard, Cloud, Code, CreditCard, Disc3, FileSignature, FileText,
  Globe2, Image as ImageIcon, LayoutGrid, LayoutTemplate, Link2,
  Mail, MailOpen, Megaphone, Mic, Monitor, MonitorPlay, Music2, Newspaper,
  PanelTop, PenTool, Pin, Presentation, Receipt, ScrollText, Send, ShoppingBag,
  Smartphone, Sparkles, Store, Table2, Utensils, UtensilsCrossed,
} from 'lucide-react';
import { SIZE_PRESETS } from '../lib/presets';

type GlyphProps = { size?: number; strokeWidth?: number };
type FormatVisual = { icon: ComponentType<GlyphProps>; tone: string };

function BrandSvg({ size = 24, strokeWidth = 2, children }: GlyphProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const Instagram = (p: GlyphProps) => (
  <BrandSvg {...p}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </BrandSvg>
);
const Linkedin = (p: GlyphProps) => (
  <BrandSvg {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </BrandSvg>
);
const Twitter = (p: GlyphProps) => (
  <BrandSvg {...p}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </BrandSvg>
);
const Facebook = (p: GlyphProps) => (
  <BrandSvg {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </BrandSvg>
);
const Youtube = (p: GlyphProps) => (
  <BrandSvg {...p}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3v6z" />
  </BrandSvg>
);
const Github = (p: GlyphProps) => (
  <BrandSvg {...p}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </BrandSvg>
);

export const FORMAT_VISUALS: Record<string, FormatVisual> = {
  'ig-post': { icon: Instagram, tone: '#ff6a79' },
  'ig-story': { icon: Smartphone, tone: '#ff6a79' },
  'ig-portrait': { icon: Camera, tone: '#ff8b9c' },
  'linkedin-post': { icon: Linkedin, tone: '#3d9bff' },
  'x-post': { icon: Twitter, tone: '#8a96ad' },
  'fb-post': { icon: Facebook, tone: '#3d9bff' },
  'youtube-thumb': { icon: Youtube, tone: '#ff5f52' },
  pinterest: { icon: Pin, tone: '#ff5f79' },
  tiktok: { icon: Music2, tone: '#ff5da8' },
  'photo-collage': { icon: LayoutGrid, tone: '#b895ff' },
  'mobile-video': { icon: Clapperboard, tone: '#ff5da8' },
  'landscape-video': { icon: MonitorPlay, tone: '#ff5da8' },
  email: { icon: Mail, tone: '#6c9dff' },
  'facebook-story': { icon: Smartphone, tone: '#3d9bff' },
  'facebook-event': { icon: CalendarDays, tone: '#3d9bff' },
  'x-header': { icon: PanelTop, tone: '#8a96ad' },
  'threads-post': { icon: AtSign, tone: '#b9a7ff' },
  'bluesky-post': { icon: Cloud, tone: '#55b6ff' },
  presentation: { icon: Presentation, tone: '#ff914f' },
  'presentation-43': { icon: Presentation, tone: '#ff914f' },
  'keynote-1610': { icon: MonitorPlay, tone: '#ff914f' },
  letter: { icon: FileText, tone: '#b895ff' },
  poster: { icon: ImageIcon, tone: '#b895ff' },
  resume: { icon: ScrollText, tone: '#6c9dff' },
  menu: { icon: UtensilsCrossed, tone: '#d8f55a' },
  flyer: { icon: Megaphone, tone: '#ffb39f' },
  'business-card': { icon: CreditCard, tone: '#7bd6ff' },
  certificate: { icon: Award, tone: '#d8f55a' },
  invoice: { icon: Receipt, tone: '#6c9dff' },
  letterhead: { icon: FileSignature, tone: '#e8a3c5' },
  invitation: { icon: MailOpen, tone: '#e8a3c5' },
  brochure: { icon: BookOpen, tone: '#ffb39f' },
  postcard: { icon: Send, tone: '#e8a3c5' },
  'book-cover': { icon: Book, tone: '#b895ff' },
  'magazine-cover': { icon: Newspaper, tone: '#ffb39f' },
  'recipe-card': { icon: Utensils, tone: '#d8f55a' },
  'email-header': { icon: Mail, tone: '#6c9dff' },
  'linkedin-banner': { icon: PanelTop, tone: '#6c9dff' },
  'youtube-banner': { icon: Youtube, tone: '#ff5f52' },
  'podcast-cover': { icon: Mic, tone: '#d8f55a' },
  'album-cover': { icon: Disc3, tone: '#b9a7ff' },
  'app-icon': { icon: AppWindow, tone: '#d8f55a' },
  'fb-cover': { icon: Facebook, tone: '#3d9bff' },
  desktop: { icon: Monitor, tone: '#b9a7ff' },
  phone: { icon: Smartphone, tone: '#7bd6ff' },
  'link-in-bio': { icon: Link2, tone: '#3d9bff' },
  code: { icon: Code, tone: '#b9a7ff' },
  website: { icon: Globe2, tone: '#3d9bff' },
  'github-social': { icon: Github, tone: '#a8a4b3' },
  'google-business': { icon: Store, tone: '#55b6ff' },
  'etsy-banner': { icon: ShoppingBag, tone: '#ff914f' },
  doc: { icon: FileText, tone: '#2ec4c6' },
  document: { icon: ScrollText, tone: '#6c9dff' },
  sheet: { icon: Table2, tone: '#4d8cff' },
  whiteboard: { icon: PenTool, tone: '#38c976' },
  newsletter: { icon: Mail, tone: '#6c9dff' },
  contract: { icon: FileSignature, tone: '#6c9dff' },
  proposal: { icon: BarChart3, tone: '#6c9dff' },
  logo: { icon: Sparkles, tone: '#d8f55a' },
};

const CATEGORY_ALIASES: Record<string, string> = {
  Instagram: 'ig-post',
  Story: 'ig-story',
  Presentation: 'presentation',
  Poster: 'poster',
  Resume: 'resume',
  'Business card': 'business-card',
  YouTube: 'youtube-thumb',
  Menu: 'menu',
  Invitation: 'invitation',
  Logo: 'logo',
  Flyer: 'flyer',
  Banner: 'linkedin-banner',
  Podcast: 'podcast-cover',
  Editorial: 'doc',
  'Book cover': 'book-cover',
  Magazine: 'magazine-cover',
  'Album cover': 'album-cover',
  Web: 'website',
  Certificate: 'certificate',
  Video: 'landscape-video',
  Upload: 'photo-collage',
};

const NAME_TO_FORMAT = new Map(SIZE_PRESETS.map(preset => [preset.name, preset.id]));

export function formatVisual(idOrName?: string): FormatVisual {
  if (!idOrName) return { icon: LayoutTemplate, tone: '#b895ff' };
  const id = FORMAT_VISUALS[idOrName] ? idOrName : NAME_TO_FORMAT.get(idOrName) ?? CATEGORY_ALIASES[idOrName];
  return FORMAT_VISUALS[id ?? ''] ?? { icon: LayoutTemplate, tone: '#b895ff' };
}

export function FormatGlyph({
  formatId,
  name,
  ratio,
  size = 'md',
  className = '',
}: {
  formatId?: string;
  name?: string;
  ratio?: number;
  size?: 'micro' | 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const meta = formatVisual(formatId ?? name);
  const Icon = meta.icon;
  const iconSize = size === 'micro' ? 10 : size === 'xs' ? 12 : size === 'sm' ? 15 : size === 'lg' ? 22 : 18;
  const marker = ratio && ratio !== 1
    ? (ratio > 1 ? { width: 11, height: 7 } : { width: 5, height: 11 })
    : { width: 8, height: 8 };
  return (
    <span
      className={`format-glyph format-glyph-${size} ${className}`}
      style={{ '--format-tone': meta.tone } as CSSProperties}
      aria-hidden="true"
    >
      <Icon size={iconSize} strokeWidth={1.7} />
      {ratio !== undefined && size !== 'micro' && <span className="format-glyph-ratio" style={marker} />}
    </span>
  );
}
