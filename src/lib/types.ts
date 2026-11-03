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

export type BaseElement = {
  id: string;
  type: 'text' | 'shape' | 'image' | 'icon';
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

export type El = TextElement | ShapeElement | ImageElement | IconElement;

export type Page = {
  id: string;
  name: string;
  background: Background;
  elements: El[];
  /** Speaker notes, shown in presenter view. */
  notes?: string;
  /** How this page enters when presenting. */
  transition?: PageTransition;
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
