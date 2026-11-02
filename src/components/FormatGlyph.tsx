import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AppWindow, AtSign, Award, BarChart3, Book, BookOpen, CalendarDays, Camera,
  Clapperboard, Cloud, Code, CreditCard, Disc3, Facebook, FileSignature, FileText,
  Github, Globe2, Image as ImageIcon, Instagram, LayoutGrid, LayoutTemplate, Link2,
  Linkedin, Mail, MailOpen, Megaphone, Mic, Monitor, MonitorPlay, Music2, Newspaper,
  PanelTop, PenTool, Pin, Presentation, Receipt, ScrollText, Send, ShoppingBag,
  Smartphone, Sparkles, Store, Table2, Twitter, Utensils, UtensilsCrossed, Youtube,
} from 'lucide-react';
import { SIZE_PRESETS } from '../lib/presets';

type FormatVisual = { icon: LucideIcon; tone: string };

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
