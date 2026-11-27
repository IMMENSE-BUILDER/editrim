export type Align = 'left' | 'center' | 'right';
export type VAlign = 'top' | 'middle' | 'bottom';

export type Paint =
  | { kind: 'solid'; color: string }
  | { kind: 'linear'; from: string; to: string; angle: number }
  | { kind: 'none' };

export type Shadow = {
  x: number;
  y: number;
  blur: number;
  color: string;
};

export type Background =
  | { kind: 'solid'; color: string }
  | { kind: 'linear'; from: string; to: string; angle: number }
  | { kind: 'image'; src: string; overlay?: string; overlayOpacity?: number; blur?: number; fit?: 'cover' | 'contain' };

export type AnimPreset =
  | 'none'
  | 'fade'
  | 'rise'
  | 'drop'
  | 'pan-left'
  | 'pan-right'
  | 'pop'
  | 'zoom'
  | 'blur'
  | 'wipe'
  | 'bounce'
  | 'typewriter';

export type ElementAnimation = {
  enter: AnimPreset;
  exit: AnimPreset;
  emphasis: 'none' | 'pulse' | 'wiggle' | 'float';
  duration: number;
  delay: number;
};

export type ElementLink = {
  url?: string;
  pageId?: string;
};

export type TextEffect =
  | 'none'
  | 'shadow'
  | 'lift'
  | 'hollow'
  | 'splice'
  | 'echo'
  | 'neon'
  | 'glitch'
  | 'background';

export type ElementType =
  | 'text'
  | 'shape'
  | 'image'
  | 'icon'
  | 'chart'
  | 'table'
  | 'drawing'
  | 'qr'
  | 'grid'
  | 'mockup'
  | 'connector';

export type BaseElement = {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
  hidden?: boolean;
  groupId?: string;
  shadow?: Shadow | null;
  animation?: ElementAnimation;
  link?: ElementLink;
};

export type TextElement = BaseElement & {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  color: string;
  align: Align;
  valign: VAlign;
  lineHeight: number;
  letterSpacing: number;
  background?: Paint;
  backgroundRadius?: number;
  padding?: number;
  strokeColor?: string;
  strokeWidth?: number;
  curve?: number;
  effect?: TextEffect;
  effectColor?: string;
  effectIntensity?: number;
};

export type ShapeKind =
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'line'
  | 'star'
  | 'diamond'
  | 'hexagon'
  | 'blob'
  | 'heart'
  | 'arrow'
  | 'burst'
  | 'wave'
  | 'ring';

export type ShapeElement = BaseElement & {
  type: 'shape';
  shape: ShapeKind;
  fill: Paint;
  stroke: string;
  strokeWidth: number;
  radius: number;
  dash?: boolean;
};

export type ImageFilters = {
  brightness: number;
  contrast: number;
  saturate: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hue: number;
};

/** Frame shapes an image can be clipped to. */
export type MaskKind = 'none' | 'rect' | 'ellipse' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'blob' | 'heart';

export type ImageElement = BaseElement & {
  type: 'image';
  src: string;
  fit: 'cover' | 'contain';
  radius: number;
  filters: ImageFilters;
  flipX?: boolean;
  flipY?: boolean;
  overlay?: string;
  overlayOpacity?: number;
  /** Crop: zoom the photo inside its frame, 1 = untouched. */
  zoom?: number;
  /** Crop pan, as a fraction of the frame size. Clamped to the zoomed image. */
  offsetX?: number;
  offsetY?: number;
  /** Non-rectangular frame. Image edges are clipped to this shape. */
  mask?: MaskKind;
};

export type IconElement = BaseElement & {
  type: 'icon';
  icon: string;
  color: string;
  strokeWidth?: number;
};

export type ChartKind = 'bar' | 'column' | 'line' | 'area' | 'pie' | 'donut' | 'progress';

export type ChartElement = BaseElement & {
  type: 'chart';
  chartKind: ChartKind;
  data: {
    labels: string[];
    series: { name: string; values: number[] }[];
  };
  colors: string[];
  showLegend: boolean;
  showValues: boolean;
  showGrid: boolean;
  fontFamily: string;
  textColor: string;
  source?: { tableId: string };
};

export type TableMerge = { r: number; c: number; rs: number; cs: number };

export type TableElement = BaseElement & {
  type: 'table';
  cells: string[][];
  colWidths: number[];
  rowHeights: number[];
  merges: TableMerge[];
  header: boolean;
  headerFill: string;
  headerColor: string;
  fill: string;
  altFill?: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
  fontFamily: string;
  fontSize: number;
  padding: number;
  align: Align;
};

export type DrawingTool = 'pen' | 'marker' | 'highlighter';

export type DrawingStroke = {
  points: [number, number, number][];
  color: string;
  size: number;
  tool: DrawingTool;
  smoothing?: number;
};

export type DrawingElement = BaseElement & {
  type: 'drawing';
  strokes: DrawingStroke[];
  baseW: number;
  baseH: number;
};

export type QrElement = BaseElement & {
  type: 'qr';
  value: string;
  fg: string;
  bg: string;
  ecc: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  rounded: boolean;
};

export type GridCell = {
  x: number;
  y: number;
  w: number;
  h: number;
  src?: string;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
};

export type GridElement = BaseElement & {
  type: 'grid';
  cells: GridCell[];
  gap: number;
  radius: number;
  bg: string;
};

export type MockupDevice = 'phone' | 'tablet' | 'laptop' | 'browser' | 'poster' | 'polaroid';

export type MockupElement = BaseElement & {
  type: 'mockup';
  device: MockupDevice;
  src?: string;
  frameColor: string;
};

export type ConnectorEndpoint = {
  elementId?: string;
  x: number;
  y: number;
};

export type ConnectorRoute = 'straight' | 'elbow' | 'curved';

export type ConnectorElement = BaseElement & {
  type: 'connector';
  from: ConnectorEndpoint;
  to: ConnectorEndpoint;
  route: ConnectorRoute;
  stroke: string;
  strokeWidth: number;
  arrowStart: boolean;
  arrowEnd: boolean;
  dash?: boolean;
};

export type El =
  | TextElement
  | ShapeElement
  | ImageElement
  | IconElement
  | ChartElement
  | TableElement
  | DrawingElement
  | QrElement
  | GridElement
  | MockupElement
  | ConnectorElement;

export type Page = {
  id: string;
  name: string;
  background: Background;
  elements: El[];
  /** Speaker notes, shown in presenter view. */
  notes?: string;
  /** How this page enters when presenting. */
  transition?: PageTransition;
  /** Page playback duration in seconds for motion & present mode. */
  duration?: number;
};

export type PageTransition = 'none' | 'fade' | 'slide' | 'zoom';

export type DesignSize = { name: string; width: number; height: number };

export type Design = {
  id: string;
  title: string;
  category: string;
  size: DesignSize;
  pages: Page[];
  comments?: CanvasComment[];
  guides?: { x: number[]; y: number[] };
  createdAt: number;
  updatedAt: number;
  templateId?: string;
  /** Set when this design was produced by Resize from another design. */
  variantOf?: string;
  /** Shared id across every resize variant of one design. */
  rootId?: string;
  /** Brand kit captured when the design was created, for consistent reuse. */
  brandKitId?: string;
};

export type CanvasComment = {
  id: string;
  pageId: string;
  elementId?: string;
  x: number;
  y: number;
  text: string;
  author: string;
  createdAt: number;
  resolved?: boolean;
};

export type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  size: DesignSize;
  pages: Page[];
  tags: string[];
  featured?: boolean;
};

export type BrandKit = {
  name: string;
  colors: string[];
  fonts: string[];
  voice: string;
  /** Logo and brand asset references — `asset:<id>` or a data URL. */
  logos?: string[];
  /** Named colour sets inside one kit, applied as a group. */
  palettes?: { name: string; colors: string[] }[];
};

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
