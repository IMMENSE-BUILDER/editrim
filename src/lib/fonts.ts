export type FontDef = {
  family: string;
  label: string;
  category: 'Sans' | 'Serif' | 'Display' | 'Mono' | 'Hand';
  weights: number[];
  note?: string;
};

export const FONTS: FontDef[] = [
  { family: 'Inter', label: 'Inter', category: 'Sans', weights: [400, 500, 600, 700, 800], note: 'Neutral workhorse' },
  { family: 'Bricolage Grotesque', label: 'Bricolage', category: 'Display', weights: [600, 700, 800], note: 'Editorial, characterful' },
  { family: 'Instrument Serif', label: 'Instrument Serif', category: 'Serif', weights: [400], note: 'High-contrast display' },
  { family: 'Playfair Display', label: 'Playfair', category: 'Serif', weights: [500, 700], note: 'Fashion & luxury' },
  { family: 'DM Serif Display', label: 'DM Serif', category: 'Serif', weights: [400], note: 'Warm headlines' },
  { family: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans', weights: [400, 500, 700], note: 'Modern tech' },
  { family: 'Bebas Neue', label: 'Bebas Neue', category: 'Display', weights: [400], note: 'Loud condensed' },
  { family: 'Archivo Black', label: 'Archivo Black', category: 'Display', weights: [400], note: 'Poster punch' },
  { family: 'Fraunces', label: 'Fraunces', category: 'Serif', weights: [400, 600, 700], note: 'Soft old-style' },
  { family: 'Manrope', label: 'Manrope', category: 'Sans', weights: [400, 600, 800], note: 'Friendly geometric' },
  { family: 'Libre Baskerville', label: 'Libre Baskerville', category: 'Serif', weights: [400, 700], note: 'Readable classic' },
  { family: 'Poppins', label: 'Poppins', category: 'Sans', weights: [400, 600, 700], note: 'Round & clear' },
  { family: 'Oswald', label: 'Oswald', category: 'Display', weights: [400, 600], note: 'Tall & narrow' },
  { family: 'Montserrat', label: 'Montserrat', category: 'Sans', weights: [400, 600, 800], note: 'Crisp & urban' },
  { family: 'Caveat', label: 'Caveat', category: 'Hand', weights: [400, 700], note: 'Handwritten notes' },
];

export const fontByFamily = (family: string) => FONTS.find(f => f.family === family) ?? FONTS[0];

export const FONT_CSS_STACK = (family: string) => {
  if (family === 'Instrument Serif') return '"Instrument Serif", Georgia, serif';
  return `"${family}", system-ui, sans-serif`;
};
