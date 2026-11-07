import type {
  Background,
  IconElement,
  ImageElement,
  ImageFilters,
  Page,
  Paint,
  Shadow,
  ShapeElement,
  ShapeKind,
  TextElement,
} from './types';
import { uid } from './utils';

/**
 * Shared primitives for hand-built template collections.
 * Keep templates editable: text, shapes, images and icons only.
 */

export const INK = '#14130F';
export const PAPER = '#F4F1EA';
export const CREAM = '#F7F0E3';
export const COBALT = '#2440F0';
export const LIME = '#D8F55A';
export const CORAL = '#FF6A46';

export const FONTS = {
  display: 'Bricolage Grotesque',
  serif: 'Instrument Serif',
  editorial: 'Playfair Display',
  dmSerif: 'DM Serif Display',
  grotesk: 'Space Grotesk',
  condensed: 'Bebas Neue',
  black: 'Archivo Black',
  fraunces: 'Fraunces',
  manrope: 'Manrope',
  baskerville: 'Libre Baskerville',
  poppins: 'Poppins',
  oswald: 'Oswald',
  montserrat: 'Montserrat',
  caveat: 'Caveat',
  inter: 'Inter',
} as const;

export const P = (color: string): Paint => ({ kind: 'solid', color });
export const G = (from: string, to: string, angle = 135): Paint => ({ kind: 'linear', from, to, angle });
export const NONE: Paint = { kind: 'none' };

export const bgSolid = (color: string): Background => ({ kind: 'solid', color });
export const bgGrad = (from: string, to: string, angle = 135): Background => ({ kind: 'linear', from, to, angle });
export const bgImage = (src: string, overlay?: string, overlayOpacity = 0.4): Background => ({
  kind: 'image',
  src,
  overlay,
  overlayOpacity,
});

type TextOpts = Partial<Omit<TextElement, 'type' | 'id' | 'x' | 'y' | 'w' | 'h' | 'text'>>;

export function T(text: string, x: number, y: number, w: number, h: number, opts: TextOpts = {}): TextElement {
  return {
    id: uid('t'),
    type: 'text',
    name: opts.name ?? (text.slice(0, 24).replace(/\n/g, ' ') || 'Text'),
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    text,
    fontFamily: FONTS.inter,
    fontSize: 48,
    fontWeight: 400,
    color: INK,
    align: 'left',
    valign: 'top',
    lineHeight: 1.2,
    letterSpacing: 0,
    shadow: null,
    ...opts,
  };
}

type ShapeOpts = Omit<Partial<ShapeElement>, 'fill'> & { fill?: Paint | string };

export function S(shape: ShapeKind, x: number, y: number, w: number, h: number, opts: ShapeOpts = {}): ShapeElement {
  const { fill, ...rest } = opts;
  return {
    id: uid('s'),
    type: 'shape',
    name: opts.name ?? shape[0].toUpperCase() + shape.slice(1),
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    shape,
    fill: typeof fill === 'string' ? P(fill) : fill ?? P(INK),
    stroke: 'transparent',
    strokeWidth: 0,
    radius: 0,
    shadow: null,
    ...rest,
  };
}

const FILTERS: ImageFilters = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 };
type ImageOpts = Partial<Omit<ImageElement, 'type' | 'id' | 'x' | 'y' | 'w' | 'h' | 'src'>>;

export function IMG(src: string, x: number, y: number, w: number, h: number, opts: ImageOpts = {}): ImageElement {
  return {
    id: uid('i'),
    type: 'image',
    name: opts.name ?? 'Image',
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    src,
    fit: 'cover',
    radius: 0,
    filters: { ...FILTERS },
    shadow: null,
    ...opts,
  };
}

export function IC(
  icon: string,
  x: number,
  y: number,
  size: number,
  color: string,
  strokeWidth = 1.7,
  opts: Partial<IconElement> = {},
): IconElement {
  return {
    id: uid('ic'),
    type: 'icon',
    name: icon,
    x, y, w: size, h: size,
    rotation: 0,
    opacity: 1,
    icon,
    color,
    strokeWidth,
    shadow: null,
    ...opts,
  };
}

export const SH = (x: number, y: number, blur: number, color: string): Shadow => ({ x, y, blur, color });

/** Consistent image grade helper for hand-built template packs. */
export const fx = (over: Partial<ImageFilters> = {}): ImageFilters => ({
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hue: 0,
  ...over,
});

/** Hairline rule that stays editable as a shape. */
export const rule = (x: number, y: number, w: number, color: string, thickness = 1) =>
  S('line', x, y, w, thickness, { fill: NONE, stroke: color, strokeWidth: thickness });

export function page(
  name: string,
  background: Background,
  elements: (TextElement | ShapeElement | ImageElement | IconElement)[],
): Page {
  return { id: uid('p'), name, background, elements };
}

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

/**
 * A deliberately broad, verified photo library for template collections.
 * Every id resolves through images.unsplash.com and is CORS-enabled.
 * Keep keys descriptive: templates should say what the image is, not its index.
 */
export const PHOTOS = {
  /* People */
  portrait: U('photo-1494790108377-be9c29b29330'),
  womanPortrait: U('photo-1534528741775-53994a69daeb'),
  womanPortrait2: U('photo-1524504388940-b1c1722653e1'),
  womanPortrait3: U('photo-1531123897727-8f129e1688ce'),
  womanPortrait4: U('photo-1544005313-94ddf0286df2'),
  womanPortrait5: U('photo-1517841905240-472988babdf9'),
  manPortrait: U('photo-1500648767791-00dcc994a43e'),
  manPortrait2: U('photo-1506794778202-cad84cf45f1d'),
  manPortrait3: U('photo-1507003211169-0a1dd7228f2d'),
  manPortrait4: U('photo-1527980965255-d3b416303d12'),
  manPortrait5: U('photo-1492562080023-ab3db95bfbce'),
  athlete: U('photo-1517836357463-d25dfeac3438'),
  child: U('photo-1503454537195-1dcabb73ffb9'),
  baby: U('photo-1519689680058-324335c77eba'),
  baby2: U('photo-1544126592-807ade215a0b'),
  wedding: U('photo-1519741497674-611481863552'),
  wedding2: U('photo-1511285560929-80b456fea0bc'),
  wedding5: U('photo-1464366400600-7168b8af9bc3'),
  dog: U('photo-1517849845537-4d257902454a'),
  cat: U('photo-1518791841217-8f162f1e1131'),

  /* Food and drink */
  food: U('photo-1504674900247-0877df9cc836'),
  salad: U('photo-1546069901-ba9599a7e63c'),
  pizza: U('photo-1565299624946-b28f40a0ae38'),
  grill: U('photo-1555939594-58d7cb561ad1'),
  veggies: U('photo-1512621776951-a57141f2eefd'),
  toast: U('photo-1482049016688-2d3e1b311543'),
  dessert: U('photo-1551024506-0bccd828d307'),
  iceCream: U('photo-1563805042-7684c019e1cb'),
  cake: U('photo-1578985545062-69928b1d9587'),
  bread: U('photo-1509440159596-0249088772ff'),
  kitchen: U('photo-1556911220-bff31c812dba'),
  restaurant: U('photo-1414235077428-338989a2e8c0'),
  restaurantInterior: U('photo-1517248135467-4c7edcad34c4'),
  restaurant2: U('photo-1552566626-52f8b828add9'),
  restaurant3: U('photo-1555396273-367ea4eb4db5'),
  coffee: U('photo-1495474472287-4d71bcdd2085'),
  coffee2: U('photo-1509042239860-f550ce710b93'),
  coffeeBeans: U('photo-1447933601403-0c6688de566e'),
  coffeeCup: U('photo-1511920170033-f8396924c348'),
  cocktail: U('photo-1513558161293-cdaf765ed2fd'),
  cocktail2: U('photo-1551024709-8f23befc6f87'),
  cocktail3: U('photo-1544145945-f90425340c7e'),
  bar: U('photo-1514362545857-3bc16c4c7d1b'),
  wine: U('photo-1510812431401-41d2bd2722f3'),
  wine2: U('photo-1506377247377-2a5b3b417ebb'),
  tomato: U('photo-1592924357228-91a4daadcfea'),

  /* Interiors / architecture */
  interior: U('photo-1616486338812-3dadae4b4ace'),
  interior2: U('photo-1586023492125-27b2c045efd7'),
  interior3: U('photo-1600210492486-724fe5c67fb0'),
  interior4: U('photo-1600607687939-ce8a6c25118c'),
  interior5: U('photo-1600566753086-00f18fb6b3ea'),
  interior6: U('photo-1615529182904-14819c35db37'),
  interior7: U('photo-1615874959474-d609969a20ed'),
  apartment: U('photo-1522708323590-d24dbb6b0267'),
  arch: U('photo-1487958449943-2429e8be8625'),
  building: U('photo-1486406146926-c627a92ad1ab'),
  architecture2: U('photo-1511818966892-d7d671e672a2'),
  architecture3: U('photo-1449157291145-7efd050a4d0e'),
  architecture5: U('photo-1481253127861-534498168948'),
  architecture6: U('photo-1518005020951-eccb494ad742'),
  office: U('photo-1497366754035-f200968a6e72'),
  office2: U('photo-1497366216548-37526070297c'),
  office3: U('photo-1524758631624-e2822e304c36'),
  office4: U('photo-1497215842964-222b430dc094'),
  officeInterior: U('photo-1497366811353-6870744d04b2'),
  workspace: U('photo-1504384308090-c894fdcc538d'),
  workspace2: U('photo-1497215728101-856f4ea42174'),
  desk: U('photo-1454165804606-c3d57bc86b40'),
  techDesk: U('photo-1519389950473-47ba0277781c'),

  /* Fashion / product */
  fashionRack: U('photo-1483985988355-763728e1935b'),
  fashion: U('photo-1445205170230-053b83016050'),
  fashion2: U('photo-1490481651871-ab68de25d43d'),
  fashion3: U('photo-1529139574466-a303027c1d8b'),
  fashion4: U('photo-1485968579580-b6d095142e6e'),
  fashion5: U('photo-1539109136881-3be0616acf4b'),
  fashionModel: U('photo-1515886657613-9f3515b0c78f'),
  tshirt: U('photo-1521572163474-6864f9cf17ab'),
  tshirt2: U('photo-1523381210434-271e8be1f52b'),
  hoodie: U('photo-1556821840-3a63f95609a7'),
  shoe: U('photo-1542291026-7eec264c27ff'),
  nikeShoe: U('photo-1549298916-b41d501d3772'),
  shoe2: U('photo-1600185365483-26d7a4cc7519'),
  shoe3: U('photo-1595950653106-6c9ebd614d3a'),
  shoe4: U('photo-1543163521-1bf539c55dd2'),
  bag: U('photo-1584917865442-de89df76afd3'),
  bag2: U('photo-1553062407-98eeb64c6a62'),
  bag3: U('photo-1590874103328-eac38a683ce7'),
  watch: U('photo-1523275335684-37898b6baf30'),
  watch2: U('photo-1523170335258-f5ed11844a49'),
  watch3: U('photo-1524805444758-089113d48a6d'),
  watch4: U('photo-1434056886845-dac89ffe9b56'),
  perfume: U('photo-1547996160-81dfa63595aa'),
  skincare: U('photo-1592945403244-b3fbafd7f539'),
  skincare2: U('photo-1556228720-195a672e8a03'),
  skincare3: U('photo-1608248543803-ba4f8c70ae0b'),
  skincare4: U('photo-1571781926291-c477ebfd024b'),
  makeup: U('photo-1596462502278-27bfdc403348'),

  /* Nature / travel */
  mountain: U('photo-1464822759023-fed622ff2c3b'),
  lakeMountain: U('photo-1501785888041-af3ef285b470'),
  snowMountain: U('photo-1519681393784-d120267933ba'),
  forest: U('photo-1441974231531-c6227db76b6e'),
  fogHills: U('photo-1470071459604-3b5ec3a7fe05'),
  beach: U('photo-1507525428034-b723cf961d3e'),
  ocean: U('photo-1518837695005-2083093ee35b'),
  oceanWaves: U('photo-1505118380757-91f5f5632de0'),
  desert: U('photo-1500534314209-a25ddb2bd429'),
  desertDunes: U('photo-1509316785289-025f5b846b35'),
  nature: U('photo-1469474968028-56623f02e42e'),
  deer: U('photo-1472396961693-142e6e269027'),
  flowers: U('photo-1490750967868-88aa4486c946'),
  plant: U('photo-1497250681960-ef046c08a56e'),
  plant2: U('photo-1501004318641-b39e6451bec6'),
  plants: U('photo-1463320726281-696a485928c7'),
  travel: U('photo-1533105079780-92b9be482077'),
  travel2: U('photo-1488646953014-85cb44e25828'),
  travel3: U('photo-1469854523086-cc02fe5d8800'),
  paris: U('photo-1502602898657-3e91760cbb34'),
  paris2: U('photo-1499856871958-5b9627545d1a'),
  london: U('photo-1533929736458-ca588d08c8be'),
  london2: U('photo-1513635269975-59663e0ac1ad'),
  venice: U('photo-1523906834658-6e24ef2386f9'),
  italy: U('photo-1516483638261-f4dbaf036963'),

  /* City / technology */
  city: U('photo-1477959858617-67f85cf4f1df'),
  city2: U('photo-1449824913935-59a10b8d2000'),
  city3: U('photo-1480714378408-67cf0d13bc1b'),
  city4: U('photo-1519501025264-65ba15a82390'),
  city5: U('photo-1514565131-fce0801e5785'),
  city6: U('photo-1486325212027-8081e485255e'),
  circuit: U('photo-1518770660439-4636190af475'),
  cyber: U('photo-1550751827-4bd374c3f58b'),
  matrix: U('photo-1526374965328-7f61d4dc18c5'),
  laptop: U('photo-1531297484001-80022131f5a1'),
  laptop2: U('photo-1496181133206-80ce9b88a853'),
  laptop3: U('photo-1488590528505-98d2b5aba04b'),
  macbook: U('photo-1517336714731-489689fd1ca8'),
  phone: U('photo-1512499617640-c74ae3a79d37'),
  phone2: U('photo-1511707171634-5f897ff02aa9'),
  retroTech: U('photo-1550745165-9bc0b252726f'),
  server: U('photo-1558494949-ef010cbdcc31'),
  analytics: U('photo-1551288049-bebda4e38f71'),
  analytics2: U('photo-1460925895917-afdab827c52f'),
  team: U('photo-1521737711867-e3b97375f902'),
  team2: U('photo-1522071820081-009f0129c71c'),
  team3: U('photo-1522202176988-66273c2fd55f'),

  /* Fitness */
  gym: U('photo-1534438327276-14e5300c3a48'),
  workout: U('photo-1571019613454-1cb2f99b2d8b'),
  fitness: U('photo-1518611012118-696072aa579a'),
  fitness2: U('photo-1517838277536-f5f99be501cd'),
  gym2: U('photo-1571902943202-507ec2618e8f'),
  gym3: U('photo-1540497077202-7c8a3999166f'),
  yoga: U('photo-1506126613408-eca07ce68773'),

  /* Art / books / paper */
  gallery: U('photo-1541961017774-22349e4a1262'),
  gallery2: U('photo-1531058020387-3be344556be6'),
  art: U('photo-1579783902614-a3fb3927b6a5'),
  art2: U('photo-1547891654-e66ed7ebb968'),
  art3: U('photo-1456086272160-b28b0645b729'),
  art4: U('photo-1500462918059-b1a0cb512f1d'),
  artSupplies: U('photo-1513364776144-60967b0f800f'),
  book: U('photo-1544947950-fa07a98d237f'),
  books: U('photo-1512820790803-83ca734da794'),
  books2: U('photo-1524995997946-a1c2e315a42f'),
  books3: U('photo-1519682337058-a94d519337bc'),
  library: U('photo-1495446815901-a7297e633e8d'),
  library2: U('photo-1481627834876-b7833e8f5570'),
  library3: U('photo-1507842217343-583bb7270b66'),
  notebook: U('photo-1517842645767-c639042777db'),
  notebook2: U('photo-1455390582262-044cdead277a'),
  paper: U('photo-1517971129774-8a2b38fa128e'),
  planner: U('photo-1506784983877-45594efa4cbe'),
  planner2: U('photo-1484480974693-6ca0a78fb36b'),
  craft: U('photo-1452860606245-08befc0ff44b'),

  /* Events / music */
  concert: U('photo-1470229722913-7c0e2dbbafd3'),
  concert2: U('photo-1501281668745-f7f57925c3b4'),
  concert3: U('photo-1524368535928-5b5e00ddc76b'),
  concertCrowd: U('photo-1514525253161-7a46d19cd819'),
  crowd: U('photo-1540039155733-5bb30b53aa14'),
  party: U('photo-1492684223066-81342ee5ff30'),
  event: U('photo-1533174072545-7a4b6ad7a6c3'),
  music: U('photo-1506157786151-b8491531f063'),
  music2: U('photo-1511671782779-c97d3d27a1d4'),
  music3: U('photo-1493225457124-a3eb161ffa5f'),
  studio: U('photo-1516280440614-37939bbacd81'),
  studio2: U('photo-1598488035139-bdbb2231ce04'),
  audio: U('photo-1520523839897-bd0b52f945a0'),
  dj: U('photo-1470225620780-dba8ba36b745'),
  mic: U('photo-1478737270239-2f02b77fc618'),
  mic2: U('photo-1590602847861-f357a9332bbc'),
  mic3: U('photo-1593697821252-0c9137d9fc45'),
  podcast: U('photo-1589903308904-1010c2294adc'),

  /* Automotive */
  car: U('photo-1503376780353-7e6692767b70'),
  car2: U('photo-1492144534655-ae79c964c9d7'),
  car3: U('photo-1502877338535-766e1452684a'),
  car4: U('photo-1494905998402-395d579af36f'),
  car5: U('photo-1553440569-bcc63803a83d'),
  car6: U('photo-1511919884226-fd3cad34687c'),

  /* Abstract / texture */
  abstract: U('photo-1553356084-58ef4a67b2a7'),
  abstract2: U('photo-1557672172-298e090bd0f1'),
  abstract3d: U('photo-1618005182384-a83a8bd57fbe'),
  abstract3d2: U('photo-1618005198919-d3d4b5a92ead'),
  abstract3d3: U('photo-1620641788421-7a1c342ea42e'),
  abstract3d4: U('photo-1634017839464-5c339ebe3cb4'),
  gradient: U('photo-1557682250-33bd709cbe85'),
  gradient2: U('photo-1557682224-5b8590cd9ec5'),
  gradient3: U('photo-1557682260-96773eb01377'),
  gradient4: U('photo-1558591710-4b4a1ae0f04d'),
  gradient5: U('photo-1550859492-d5da9d8e45f3'),
  paint: U('photo-1541701494587-cb58502866ab'),
  paint2: U('photo-1550684376-efcbd6e3f031'),
} as const;
