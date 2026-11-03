import type { SVGProps } from 'react';

export type VellumIconName =
  | 'home' | 'projects' | 'templates' | 'brand' | 'spark' | 'print' | 'more'
  | 'elements' | 'text' | 'uploads' | 'background' | 'present' | 'share'
  | 'download' | 'undo' | 'redo' | 'help' | 'bell' | 'plus' | 'search'
  | 'fit' | 'play' | 'pause' | 'close' | 'chevronLeft' | 'chevronRight' | 'chevronUp' | 'chevronDown' | 'bolt' | 'alert'
  | 'arrowRight' | 'arrowUpRight' | 'arrowLeft' | 'check' | 'shuffle' | 'cloud' | 'lock'
  | 'unlock' | 'eye' | 'eyeOff' | 'chevronsUp' | 'chevronsDown' | 'comment' | 'page' | 'duplicate' | 'copy' | 'pencil' | 'external' | 'trash' | 'palette'
  | 'magic' | 'image' | 'code' | 'sheet' | 'video' | 'doc' | 'website'
  | 'layers' | 'sliders' | 'menu' | 'custom' | 'upload' | 'type' | 'social'
  | 'printable' | 'board'
  | 'alignLeft' | 'alignCenter' | 'alignRight'
  | 'alignTop' | 'alignMiddle' | 'alignBottom'
  | 'alignHorizontalStart' | 'alignHorizontalCenter' | 'alignHorizontalEnd'
  | 'alignVerticalStart' | 'alignVerticalCenter' | 'alignVerticalEnd'
  | 'distributeH' | 'distributeV' | 'layerFront' | 'layerBack'
  | 'group' | 'ungroup' | 'clipboard' | 'component' | 'paintBucket'
  | 'paintbrush' | 'language' | 'minus' | 'zoomIn' | 'zoomOut' | 'rotate' | 'clock'
  | 'info' | 'scan' | 'sidebar' | 'sidebarOpen' | 'refresh' | 'camera'
  | 'film' | 'music' | 'volume' | 'volumeOff' | 'scissors' | 'split'
  | 'skipStart' | 'skipEnd' | 'loop' | 'record' | 'waveform'
  | 'photo' | 'crop' | 'flipX' | 'flipY' | 'sun' | 'contrast' | 'thermometer'
  | 'histogram' | 'compare' | 'droplet';

const ICONS: Record<VellumIconName, string[]> = {
  home: ['M3 10.8 12 3.5l9 7.3V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.2Z', 'M9.5 21v-6h5v6'],
  projects: ['M3 7.5h6l1.8 2H21v10.5H3z', 'M3 7.5V5h4l1.5 2.5'],
  templates: ['M4 4h9v9H4z', 'M11 11h9v9h-9z', 'M7 8h3M15 15h2'],
  brand: ['M4 17 6.5 7l5.5 5 5.5-5L20 17z', 'M4 17h16'],
  spark: ['M12 2.8l1.7 5.4a4 4 0 0 0 2.6 2.6l5.4 1.7-5.4 1.7a4 4 0 0 0-2.6 2.6L12 21.2l-1.7-5.4a4 4 0 0 0-2.6-2.6L2.3 11.5l5.4-1.7a4 4 0 0 0 2.6-2.6L12 2.8z', 'M19 2v3M20.5 3.5h-3'],
  print: ['M7 8V3h10v5', 'M5 8h14a2 2 0 0 1 2 2v7H3v-7a2 2 0 0 1 2-2z', 'M7 14h10v7H7z', 'M17 11h.01'],
  more: ['M5 12h.01M12 12h.01M19 12h.01'],
  elements: ['M12 3l3 5H9l3-5z', 'M7 12h6v6H7z', 'M16 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  text: ['M5 5h14M12 5v14M8.5 19h7'],
  uploads: ['M12 16V4', 'M7 9l5-5 5 5', 'M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4'],
  background: ['M4 5h16v14H4z', 'M4 15l4-4 4 4 3-3 5 5', 'M8 9h.01'],
  present: ['M3 4h18v12H3z', 'M12 16v4', 'M8 22h8', 'M10 8l4 2-4 2z'],
  share: ['M8 12l8-6M8 12l8 6', 'M6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M18 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', 'M18 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'],
  download: ['M12 3v12', 'M7 10l5 5 5-5', 'M4 19h16'],
  undo: ['M9 7H5v4', 'M5 11a7 7 0 1 1 2 5'],
  redo: ['M15 7h4v4', 'M19 11a7 7 0 1 0-2 5'],
  help: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M9.8 9a2.4 2.4 0 0 1 4.6 1c0 1.6-2.4 1.7-2.4 3.3', 'M12 17h.01'],
  bell: ['M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  plus: ['M12 4v16M4 12h16'],
  search: ['M10.8 4a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6z', 'M16 16l5 5', 'M8 8h.01'],
  fit: ['M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'],
  play: ['M8 5l11 7-11 7z'],
  pause: ['M9 5v14M15 5v14'],
  close: ['M6 6l12 12M18 6L6 18'],
  chevronLeft: ['M15 5l-7 7 7 7'],
  chevronRight: ['M9 5l7 7-7 7'],
  arrowRight: ['M4 12h15M13 6l6 6-6 6'],
  arrowLeft: ['M20 12H5M11 6l-6 6 6 6'],
  chevronUp: ['M5 15l7-7 7 7'],
  chevronDown: ['M5 9l7 7 7-7'],
  bolt: ['M13 2 4.5 13.5H10L9 22l8.5-11.5H12L13 2Z'],
  alert: ['M12 3 2.5 20h19L12 3z', 'M12 9v5', 'M12 17h.01'],
  arrowUpRight: ['M7 17 17 7M8 7h9v9'],
  check: ['M20 6 9 17l-5-5'],
  shuffle: ['M3 7h3c4 0 5 10 9 10h6', 'M3 17h3c4 0 5-10 9-10h6', 'M18 4l3 3-3 3', 'M18 14l3 3-3 3'],
  cloud: ['M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z'],
  lock: ['M6 10h12v10H6z', 'M8 10V7a4 4 0 0 1 8 0v3', 'M12 14v2'],
  unlock: ['M6 10h12v10H6z', 'M9 10V7a4 4 0 0 1 7-2', 'M12 14v2'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  eyeOff: ['M3 3l18 18', 'M10.6 10.6a3 3 0 0 0 4.2 4.2', 'M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.2 4.3', 'M6.2 6.2A16 16 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 4.2-.9'],
  chevronsUp: ['M7 15l5-5 5 5', 'M7 9l5-5 5 5'],
  chevronsDown: ['M7 9l5 5 5-5', 'M7 15l5 5 5-5'],
  comment: ['M4 4h16v12H8l-4 4z', 'M8 9h8M8 12h5'],
  page: ['M6 3h8l4 4v14H6z', 'M14 3v5h5', 'M9 13h6M9 17h6'],
  duplicate: ['M8 8h11v11H8z', 'M5 16H4V4h11v1'],
  copy: ['M9 9h10v10H9z', 'M5 15H4V5h10v1'],
  pencil: ['M4 20l4-1 11-11-3-3L5 16l-1 4z', 'M13 5l3 3'],
  external: ['M14 4h6v6', 'M20 4 11 13', 'M20 14v6H4V4h6'],
  trash: ['M4 7h16', 'M9 3h6l1 4H8z', 'M6 7l1 14h10l1-14', 'M10 11v6M14 11v6'],
  palette: ['M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H13a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-3.3-4-6-9-6z', 'M7 10h.01M10 7h.01M15 8h.01'],
  magic: ['M4 20l10-10', 'M13 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z', 'M19 12l.5 1.5L21 14l-1.5.5L19 16l-.5-1.5L17 14l1.5-.5L19 12z'],
  image: ['M4 5h16v14H4z', 'M4 15l4-4 4 4 3-3 5 5', 'M9 9h.01'],
  code: ['M8 8l-4 4 4 4', 'M16 8l4 4-4 4', 'M13 5l-2 14'],
  sheet: ['M4 5h16v14H4z', 'M4 10h16M4 15h16M10 5v14M15 5v14'],
  video: ['M3 5h13v14H3z', 'M16 9l5-3v12l-5-3z'],
  doc: ['M6 3h8l4 4v14H6z', 'M14 3v5h5', 'M9 13h6M9 17h4'],
  website: ['M3 5h18v14H3z', 'M3 9h18', 'M8 13h.01M12 13h.01'],
  layers: ['M12 3l9 5-9 5-9-5 9-5z', 'M3 12l9 5 9-5', 'M3 16l9 5 9-5'],
  sliders: ['M4 6h10M18 6h2M4 12h2M10 12h10M4 18h10M18 18h2'],
  menu: ['M4 7h16M4 12h16M4 18h16'],
  custom: ['M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4'],
  upload: ['M12 16V4', 'M7 9l5-5 5 5', 'M4 19h16'],
  type: ['M5 5h14M12 5v14M8.5 19h7'],
  social: ['M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.3A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', 'M12 8v4l2 1'],
  printable: ['M5 8h14l-1 13H6L5 8z', 'M8 8V4h8v4', 'M9 13h6'],
  board: ['M4 4h16v12H4z', 'M8 20h8M12 16v4', 'M7 8h4v4H7z', 'M14 8h3M14 11h3'],
  alignLeft: ['M4 5v14', 'M8 9h12M8 15h8'],
  alignCenter: ['M12 4v16', 'M4 9h16M7 15h10'],
  alignRight: ['M20 5v14', 'M4 9h12M8 15h8'],
  alignTop: ['M4 4h16', 'M8 8h3v12H8z', 'M14 8h3v8h-3z'],
  alignMiddle: ['M3 12h18', 'M8 5h3v14H8z', 'M14 7h3v10h-3z'],
  alignBottom: ['M4 20h16', 'M8 4h3v12H8z', 'M14 8h3v8h-3z'],
  alignHorizontalStart: ['M4 4v16', 'M8 8h11v3H8z', 'M8 14h7v3H8z'],
  alignHorizontalCenter: ['M12 3v18', 'M5 8h14v3H5z', 'M7 14h10v3H7z'],
  alignHorizontalEnd: ['M20 4v16', 'M5 8h11v3H5z', 'M9 14h7v3H9z'],
  alignVerticalStart: ['M4 4h16', 'M8 8h3v11H8z', 'M14 8h3v7h-3z'],
  alignVerticalCenter: ['M3 12h18', 'M8 5h3v14H8z', 'M14 7h3v10h-3z'],
  alignVerticalEnd: ['M4 20h16', 'M8 5h3v11H8z', 'M14 9h3v7h-3z'],
  distributeH: ['M4 4v16M20 4v16', 'M9 7h6v4H9z', 'M7 14h10v3H7z'],
  distributeV: ['M4 4h16M4 20h16', 'M7 9h3v6H7z', 'M14 9h3v6h-3z'],
  layerFront: ['M9 9h11v11H9z', 'M4 15V4h11v5'],
  layerBack: ['M4 4h12v12H4z', 'M8 8h12v12H8z'],
  group: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
  ungroup: ['M4 4h6v6H4z', 'M14 14h6v6h-6z', 'M15 4h5M17.5 1.5v5', 'M4 15v5M1.5 17.5h5'],
  clipboard: ['M8 5h8v3H8z', 'M6 7h12v14H6z', 'M9 12h6M9 16h4'],
  component: ['M12 3l4 4-4 4-4-4z', 'M12 13l4 4-4 4-4-4z'],
  paintBucket: ['M4 12 12 4l8 8-8 8z', 'M8 8 4 12', 'M20 15c1.3 2 2 3 2 4a2 2 0 0 1-4 0c0-1 .7-2 2-4z'],
  paintbrush: ['M14 4l6 6-8 8H8v-4z', 'M8 14l-4 6 6-4'],
  language: ['M4 5h10', 'M9 3v2c0 4-3 7-5 8', 'M6 10c1.5 3 4 5 7 6', 'M13 20l4-9 4 9', 'M14.5 17h5'],
  minus: ['M5 12h14'],
  zoomIn: ['M10.8 4a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6z', 'M16 16l5 5', 'M10.8 7.8v6M7.8 10.8h6'],
  zoomOut: ['M10.8 4a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6z', 'M16 16l5 5', 'M7.8 10.8h6'],
  rotate: ['M20 11a8 8 0 1 0-2.3 5.7', 'M20 4v7h-7'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 11v5', 'M12 8h.01'],
  scan: ['M4 8V5a1 1 0 0 1 1-1h3', 'M16 4h3a1 1 0 0 1 1 1v3', 'M20 16v3a1 1 0 0 1-1 1h-3', 'M8 20H5a1 1 0 0 1-1-1v-3', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  sidebar: ['M3 5h18v14H3z', 'M9 5v14', 'M6 8h.01M6 11h.01'],
  sidebarOpen: ['M3 5h18v14H3z', 'M9 5v14', 'M13 9l3 3-3 3'],
  refresh: ['M20 12a8 8 0 1 1-2.3-5.7', 'M20 4v6h-6'],
  camera: ['M4 8h3l1.5-2h7L17 8h3v11H4z', 'M12 10.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z'],
  film: ['M4 4h16v16H4z', 'M8 4v16M16 4v16', 'M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4'],
  music: ['M9 18V6l10-2v12', 'M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z', 'M19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'],
  volume: ['M4 9h4l5-4v14l-5-4H4z', 'M16 9a4 4 0 0 1 0 6', 'M18.5 6.5a8 8 0 0 1 0 11'],
  volumeOff: ['M4 9h4l5-4v14l-5-4H4z', 'M16 9l5 6M21 9l-5 6'],
  scissors: ['M6 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M6 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M9 9l11 8M9 15 20 7'],
  split: ['M12 3v18', 'M4 6h5v4H4z', 'M15 14h5v4h-5z', 'M9 8h3M12 16h3'],
  skipStart: ['M19 5v14L8 12z', 'M5 5v14'],
  skipEnd: ['M5 5v14l11-7z', 'M19 5v14'],
  loop: ['M17 2l4 4-4 4', 'M3 11V9a4 4 0 0 1 4-4h14', 'M7 22l-4-4 4-4', 'M21 13v2a4 4 0 0 1-4 4H3'],
  record: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  waveform: ['M3 10v4M7 7v10M11 4v16M15 8v8M19 6v12M23 10v4'],
  photo: [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    'M14.31 8 20.05 17.94',
    'M9.69 8h11.48',
    'M7.38 12 4.51 6.96',
    'M9.69 16H3.95',
    'M14.31 16l2.87 5.04',
    'M16.62 12l2.87-5.04',
  ],
  crop: ['M6 2v14a2 2 0 0 0 2 2h14', 'M2 6h14a2 2 0 0 1 2 2v14'],
  flipX: ['M12 3v18', 'M8 7 3 12l5 5', 'M16 7l5 5-5 5'],
  flipY: ['M3 12h18', 'M7 8l5-5 5 5', 'M7 16l5 5 5-5'],
  sun: [
    'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z',
    'M12 2v2M12 20v2M4 12H2M22 12h-2',
    'M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19',
  ],
  contrast: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 3v18', 'M12 8a4 4 0 0 1 0 8z'],
  thermometer: ['M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z', 'M12 9v6'],
  histogram: ['M3 20h18', 'M6 20v-9h3v9', 'M11 20V5h3v15', 'M16 20v-6h3v6'],
  compare: ['M12 3v18', 'M8 8 4 12l4 4', 'M16 8l4 4-4 4'],
  droplet: ['M12 3s6 6.4 6 10.4A6 6 0 0 1 6 13.4C6 9.4 12 3 12 3z'],
};

export function VellumIcon({
  name,
  size = 18,
  strokeWidth = 1.65,
  className = '',
  ...rest
}: { name: VellumIconName; size?: number; strokeWidth?: number; className?: string } & Omit<SVGProps<SVGSVGElement>, 'name' | 'width' | 'height'>) {
  const paths = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`vellum-icon ${size <= 13 ? 'is-compact' : ''} ${className}`.trim()}
      data-vellum-icon={name}
      data-icon-size={size}
      aria-hidden="true"
      {...rest}
    >
      <g className="vellum-icon-echo" transform="translate(0.55 0.75)">
        {paths.map((d, index) => <path key={`echo-${index}`} d={d} />)}
      </g>
      <g className="vellum-icon-main">
        {paths.map((d, index) => <path key={index} d={d} />)}
      </g>
    </svg>
  );
}

export const VELLUM_ICON_NAMES = Object.keys(ICONS) as VellumIconName[];
