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
};

export type DesignSize = { name: string; width: number; height: number };

export type Design = {
  id: string;
  title: string;
  category: string;
  size: DesignSize;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
  templateId?: string;
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
};

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
