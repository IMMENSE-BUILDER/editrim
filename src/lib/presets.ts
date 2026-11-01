export type SizePreset = {
  id: string;
  name: string;
  group: string;
  w: number;
  h: number;
  hint: string;
};

export const GROUP_ORDER = ['Social', 'Presentation', 'Print', 'Brand', 'Web', 'Docs'];

export const SIZE_PRESETS: SizePreset[] = [
  /* Social */
  { id: 'ig-post', name: 'Instagram Post', group: 'Social', w: 1080, h: 1080, hint: 'Square · 1:1' },
  { id: 'ig-story', name: 'Your Story', group: 'Social', w: 1080, h: 1920, hint: 'Story · 9:16' },
  { id: 'ig-portrait', name: 'Instagram Portrait', group: 'Social', w: 1080, h: 1350, hint: 'Portrait · 4:5' },
  { id: 'linkedin-post', name: 'LinkedIn Post', group: 'Social', w: 1200, h: 1200, hint: 'Square · 1:1' },
  { id: 'x-post', name: 'X / Twitter Post', group: 'Social', w: 1600, h: 900, hint: 'Landscape · 16:9' },
  { id: 'fb-post', name: 'Facebook Post', group: 'Social', w: 1200, h: 630, hint: 'Landscape · 1.91:1' },
  { id: 'youtube-thumb', name: 'YouTube Thumbnail', group: 'Social', w: 1280, h: 720, hint: 'Landscape · 16:9' },
  { id: 'pinterest', name: 'Pinterest Pin', group: 'Social', w: 1000, h: 1500, hint: 'Tall · 2:3' },
  { id: 'tiktok', name: 'TikTok Video', group: 'Social', w: 1080, h: 1920, hint: 'Vertical · 9:16' },
  { id: 'photo-collage', name: 'Photo Collage', group: 'Social', w: 1080, h: 1080, hint: 'Square grid' },
  { id: 'mobile-video', name: 'Mobile Video', group: 'Social', w: 1080, h: 1920, hint: 'Vertical · 9:16' },
  { id: 'landscape-video', name: 'Landscape Video', group: 'Social', w: 1920, h: 1080, hint: 'Widescreen · 16:9' },
  { id: 'email', name: 'Email', group: 'Social', w: 1200, h: 1600, hint: 'Newsletter · 3:4' },
  { id: 'facebook-story', name: 'Facebook Story', group: 'Social', w: 1080, h: 1920, hint: 'Story · 9:16' },
  { id: 'facebook-event', name: 'Facebook Event Cover', group: 'Social', w: 1920, h: 1005, hint: 'Event · 1.91:1' },
  { id: 'x-header', name: 'X / Twitter Header', group: 'Social', w: 1500, h: 500, hint: 'Profile header · 3:1' },
  { id: 'threads-post', name: 'Threads Post', group: 'Social', w: 1080, h: 1080, hint: 'Square · 1:1' },
  { id: 'bluesky-post', name: 'Bluesky Post', group: 'Social', w: 1200, h: 675, hint: 'Landscape · 16:9' },

  /* Presentation */
  { id: 'presentation', name: 'Presentation', group: 'Presentation', w: 1920, h: 1080, hint: '16:9 widescreen' },
  { id: 'presentation-43', name: 'Presentation 4:3', group: 'Presentation', w: 1600, h: 1200, hint: '4:3 classic' },
  { id: 'keynote-1610', name: 'Keynote 16:10', group: 'Presentation', w: 1920, h: 1200, hint: '16:10 display' },

  /* Print */
  { id: 'letter', name: 'US Letter', group: 'Print', w: 1275, h: 1650, hint: '8.5 × 11 in' },
  { id: 'poster', name: 'Poster', group: 'Print', w: 1587, h: 2245, hint: '18 × 24 in' },
  { id: 'resume', name: 'Resume', group: 'Print', w: 1240, h: 1754, hint: 'A4 · print ready' },
  { id: 'menu', name: 'Menu', group: 'Print', w: 1240, h: 1754, hint: 'A4 portrait' },
  { id: 'flyer', name: 'Flyer', group: 'Print', w: 1240, h: 1754, hint: 'A4 portrait' },
  { id: 'business-card', name: 'Business Card', group: 'Print', w: 1050, h: 600, hint: '3.5 × 2 in' },
  { id: 'certificate', name: 'Certificate', group: 'Print', w: 1240, h: 1754, hint: 'A4 portrait' },
  { id: 'invoice', name: 'Invoice', group: 'Print', w: 1240, h: 1754, hint: 'A4 portrait' },
  { id: 'letterhead', name: 'Letterhead', group: 'Print', w: 1240, h: 1754, hint: 'A4 stationery' },
  { id: 'invitation', name: 'Invitation', group: 'Print', w: 1080, h: 1080, hint: 'Square card' },
  { id: 'brochure', name: 'Brochure', group: 'Print', w: 1754, h: 1240, hint: 'A4 landscape' },
  { id: 'postcard', name: 'Postcard', group: 'Print', w: 1748, h: 1240, hint: '6 × 4 in' },
  { id: 'book-cover', name: 'Book Cover', group: 'Print', w: 1600, h: 2400, hint: '2:3 print' },
  { id: 'magazine-cover', name: 'Magazine Cover', group: 'Print', w: 1240, h: 1754, hint: 'A4 portrait' },
  { id: 'recipe-card', name: 'Recipe Card', group: 'Print', w: 1240, h: 1754, hint: 'A4 recipe' },

  /* Brand */
  { id: 'logo', name: 'Logo', group: 'Brand', w: 1000, h: 1000, hint: 'Square export' },
  { id: 'email-header', name: 'Email Header', group: 'Brand', w: 1200, h: 400, hint: 'Landscape · 3:1' },
  { id: 'linkedin-banner', name: 'Banner', group: 'Brand', w: 1584, h: 396, hint: 'LinkedIn · 4:1' },
  { id: 'youtube-banner', name: 'YouTube Banner', group: 'Brand', w: 2560, h: 1440, hint: 'Channel art · 16:9' },
  { id: 'podcast-cover', name: 'Podcast Cover', group: 'Brand', w: 1000, h: 1000, hint: 'Square artwork' },
  { id: 'album-cover', name: 'Album Cover', group: 'Brand', w: 1400, h: 1400, hint: 'Square artwork' },
  { id: 'app-icon', name: 'App Icon', group: 'Brand', w: 1024, h: 1024, hint: 'Square icon' },

  /* Web */
  { id: 'fb-cover', name: 'Facebook Cover', group: 'Web', w: 1640, h: 624, hint: 'Cover · 2.6:1' },
  { id: 'desktop', name: 'Desktop Wallpaper', group: 'Web', w: 1920, h: 1080, hint: '16:9 wallpaper' },
  { id: 'phone', name: 'Phone Wallpaper', group: 'Web', w: 1170, h: 2532, hint: 'iPhone ratio' },
  { id: 'link-in-bio', name: 'Link in Bio', group: 'Web', w: 1080, h: 1920, hint: 'Vertical · 9:16' },
  { id: 'code', name: 'Code', group: 'Web', w: 1440, h: 900, hint: 'Web canvas' },
  { id: 'website', name: 'Website', group: 'Web', w: 1440, h: 900, hint: 'Desktop page' },
  { id: 'github-social', name: 'GitHub Social', group: 'Web', w: 1280, h: 640, hint: 'Repo preview · 2:1' },
  { id: 'google-business', name: 'Google Business Cover', group: 'Web', w: 1024, h: 576, hint: 'Business · 16:9' },
  { id: 'etsy-banner', name: 'Etsy Banner', group: 'Web', w: 1200, h: 300, hint: 'Shop banner · 4:1' },

  /* Docs */
  { id: 'doc', name: 'Doc', group: 'Docs', w: 1240, h: 1754, hint: 'A4 document' },
  { id: 'document', name: 'Document', group: 'Docs', w: 1240, h: 1754, hint: 'A4 print' },
  { id: 'sheet', name: 'Sheet', group: 'Docs', w: 1600, h: 1000, hint: 'Table layout' },
  { id: 'whiteboard', name: 'Whiteboard', group: 'Docs', w: 2400, h: 1600, hint: 'Wide board · 3:2' },
  { id: 'newsletter', name: 'Newsletter', group: 'Docs', w: 1200, h: 1600, hint: 'Long-form · 3:4' },
  { id: 'contract', name: 'Contract', group: 'Docs', w: 1240, h: 1754, hint: 'A4 legal' },
  { id: 'proposal', name: 'Proposal', group: 'Docs', w: 1240, h: 1754, hint: 'A4 proposal' },
];

export const findPreset = (id: string) => SIZE_PRESETS.find(p => p.id === id);
