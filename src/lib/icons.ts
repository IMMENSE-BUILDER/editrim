export type IconDef = { id: string; label: string; paths: string[]; filled?: boolean };

/**
 * A small, hand-picked graphic library. Stroked paths on a 24×24 grid so they
 * render identically in the editor (SVG) and in exports (Canvas Path2D).
 */
export const ICONS: IconDef[] = [
  { id: 'star', label: 'Star', paths: ['M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9 2.9-6z'] },
  { id: 'heart', label: 'Heart', paths: ['M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z'] },
  { id: 'sparkle', label: 'Sparkle', paths: ['M12 2.5l1.9 5.7a3 3 0 0 0 1.9 1.9l5.7 1.9-5.7 1.9a3 3 0 0 0-1.9 1.9L12 21.5l-1.9-5.7a3 3 0 0 0-1.9-1.9L2.5 12l5.7-1.9a3 3 0 0 0 1.9-1.9L12 2.5z', 'M19 2v3M20.5 3.5h-3'] },
  { id: 'bolt', label: 'Bolt', paths: ['M13 2 4.5 13.5H10L9 22l8.5-11.5H12L13 2z'] },
  { id: 'sun', label: 'Sun', paths: ['M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z', 'M12 1.5v2.5M12 20v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M1.5 12H4M20 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8'] },
  { id: 'moon', label: 'Moon', paths: ['M20.8 14.2A8.8 8.8 0 0 1 9.8 3.2 9.2 9.2 0 1 0 20.8 14.2z'] },
  { id: 'cloud', label: 'Cloud', paths: ['M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z'] },
  { id: 'leaf', label: 'Leaf', paths: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z', 'M2 21c0-3 1.9-5.4 5.1-6C10 14.5 12 13 13 12'] },
  { id: 'flower', label: 'Flower', paths: ['M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z', 'M12 8.2c0-3 1.5-5 3.7-5 1.9 0 3.2 1.5 3.2 3.3 0 1.9-1.3 3.4-3.3 3.7', 'M15.8 12c3 0 5 1.5 5 3.7 0 1.9-1.5 3.2-3.3 3.2-1.9 0-3.4-1.3-3.7-3.3', 'M12 15.8c0 3-1.5 5-3.7 5-1.9 0-3.2-1.5-3.2-3.3 0-1.9 1.3-3.4 3.3-3.7', 'M8.2 12c-3 0-5-1.5-5-3.7 0-1.9 1.5-3.2 3.3-3.2 1.9 0 3.4 1.3 3.7 3.3'] },
  { id: 'smile', label: 'Smile', paths: ['M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z', 'M8 14.2s1.6 2.2 4 2.2 4-2.2 4-2.2', 'M8.5 9.5h.01M15.5 9.5h.01'] },
  { id: 'arrow-right', label: 'Arrow right', paths: ['M4 12h15M13 6l6 6-6 6'] },
  { id: 'arrow-up-right', label: 'Arrow up right', paths: ['M7 17 17 7M8 7h9v9'] },
  { id: 'check', label: 'Check', paths: ['M20 6 9 17l-5-5'] },
  { id: 'plus', label: 'Plus', paths: ['M12 4v16M4 12h16'] },
  { id: 'cursor', label: 'Cursor', paths: ['M5 3l14 8.5-6.3 1.2-2 6.3L5 3z'] },
  { id: 'music', label: 'Music', paths: ['M9 18V5l12-2v13', 'M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3z', 'M21 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z'] },
  { id: 'camera', label: 'Camera', paths: ['M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z', 'M12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z'] },
  { id: 'coffee', label: 'Coffee', paths: ['M17 8h1.5a3.5 3.5 0 0 1 0 7H17', 'M3 8h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8z', 'M6 2v2M10 2v2M14 2v2'] },
  { id: 'plane', label: 'Plane', paths: ['M2 12l19-8-8 19-2.5-7.5L2 12z', 'M10.5 15.5 21 4'] },
  { id: 'home', label: 'Home', paths: ['M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z', 'M9 22V13h6v9'] },
  { id: 'globe', label: 'Globe', paths: ['M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z', 'M2.5 12h19', 'M12 2.5c2.5 2.6 3.8 5.8 3.8 9.5s-1.3 6.9-3.8 9.5c-2.5-2.6-3.8-5.8-3.8-9.5S9.5 5.1 12 2.5z'] },
  { id: 'diamond', label: 'Diamond', paths: ['M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5z'] },
  { id: 'crown', label: 'Crown', paths: ['M3 5l4.5 11h9L21 5l-6 5.5L12 4 9 10.5 3 5z'] },
  { id: 'eye', label: 'Eye', paths: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'] },
  { id: 'message', label: 'Message', paths: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z'] },
  { id: 'fire', label: 'Fire', paths: ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.5 5.5 12 2c0 3-2 4.5-3.5 6.5S7 12 7 14a5 5 0 0 0 5 5z', 'M12 18a3 3 0 0 0 3-3c0-1.2-.7-2.2-1.5-3S12 10 12 9c0 1.5-3 2-3 5a3 3 0 0 0 3 4z'] },
  { id: 'pin', label: 'Pin', paths: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'] },
  { id: 'gift', label: 'Gift', paths: ['M20 12v9H4v-9', 'M2 7h20v5H2z', 'M12 21V7', 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z', 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'] },
  { id: 'clock', label: 'Clock', paths: ['M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z', 'M12 6.5V12l3.5 2'] },
  { id: 'wave', label: 'Wave', paths: ['M2 9c2.5 0 2.5 3 5 3s2.5-3 5-3 2.5 3 5 3 2.5-3 5-3', 'M2 16c2.5 0 2.5 3 5 3s2.5-3 5-3 2.5 3 5 3 2.5-3 5-3'] },
];

export const iconById = (id: string) => ICONS.find(i => i.id === id) ?? ICONS[0];
