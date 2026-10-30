export type SizePreset = {
  id: string;
  name: string;
  group: string;
  w: number;
  h: number;
  hint: string;
};

export const GROUP_ORDER = ['Social', 'Presentation', 'Print', 'Brand', 'Web'];

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'ig-post', name: 'Instagram Post', group: 'Social', w: 1080, h: 1080, hint: 'Square · 1:1' },
  { id: 'ig-story', name: 'Instagram Story', group: 'Social', w: 1080, h: 1920, hint: 'Vertical · 9:16' },
  { id: 'ig-portrait', name: 'Instagram Portrait', group: 'Social', w: 1080, h: 1350, hint: 'Portrait · 4:5' },
  { id: 'linkedin-post', name: 'LinkedIn Post', group: 'Social', w: 1200, h: 1200, hint: 'Square · 1:1' },
  { id: 'x-post', name: 'X / Twitter Post', group: 'Social', w: 1600, h: 900, hint: 'Landscape · 16:9' },
  { id: 'fb-post', name: 'Facebook Post', group: 'Social', w: 1200, h: 630, hint: 'Landscape · 1.91:1' },
  { id: 'youtube-thumb', name: 'YouTube Thumbnail', group: 'Social', w: 1280, h: 720, hint: 'Landscape · 16:9' },
  { id: 'pinterest', name: 'Pinterest Pin', group: 'Social', w: 1000, h: 1500, hint: 'Tall · 2:3' },
  { id: 'tiktok', name: 'TikTok Video', group: 'Social', w: 1080, h: 1920, hint: 'Vertical · 9:16' },
  { id: 'presentation', name: 'Presentation', group: 'Presentation', w: 1920, h: 1080, hint: '16:9 widescreen' },
  { id: 'presentation-43', name: 'Presentation 4:3', group: 'Presentation', w: 1600, h: 1200, hint: '4:3 classic' },
  { id: 'a4', name: 'A4 Document', group: 'Print', w: 1240, h: 1754, hint: '210 × 297 mm' },
  { id: 'letter', name: 'US Letter', group: 'Print', w: 1275, h: 1650, hint: '8.5 × 11 in' },
  { id: 'poster', name: 'Poster', group: 'Print', w: 1587, h: 2245, hint: '18 × 24 in' },
  { id: 'resume', name: 'Resume', group: 'Print', w: 1240, h: 1754, hint: 'A4, print ready' },
  { id: 'menu', name: 'Menu', group: 'Print', w: 1240, h: 1754, hint: 'A4 portrait' },
  { id: 'flyer', name: 'Flyer', group: 'Print', w: 1240, h: 1754, hint: 'A4 portrait' },
  { id: 'business-card', name: 'Business Card', group: 'Print', w: 1050, h: 600, hint: '3.5 × 2 in' },
  { id: 'logo', name: 'Logo', group: 'Brand', w: 1000, h: 1000, hint: 'Square export' },
  { id: 'email-header', name: 'Email Header', group: 'Brand', w: 1200, h: 400, hint: 'Landscape · 3:1' },
  { id: 'linkedin-banner', name: 'LinkedIn Banner', group: 'Brand', w: 1584, h: 396, hint: 'Banner · 4:1' },
  { id: 'fb-cover', name: 'Facebook Cover', group: 'Web', w: 1640, h: 624, hint: 'Banner · 2.6:1' },
  { id: 'desktop', name: 'Desktop Wallpaper', group: 'Web', w: 1920, h: 1080, hint: '16:9 wallpaper' },
  { id: 'phone', name: 'Phone Wallpaper', group: 'Web', w: 1170, h: 2532, hint: 'iPhone ratio' },
];

export const findPreset = (id: string) => SIZE_PRESETS.find(p => p.id === id);
