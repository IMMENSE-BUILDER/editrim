import type { Background, Design, El, Page } from './types';
import { createDesign, getBrand, saveDesign } from './storage';
import { createImage, createShape, createText } from '../editor/factory';
import { TEMPLATE_IMAGES } from './templates';

function finish(design: Design, page: Page): Design {
  const next = { ...design, pages: [page] };
  saveDesign(next);
  return next;
}

function start(title: string, width: number, height: number, category: string, background: Background) {
  const design = createDesign({ title, width, height, category });
  const page = design.pages[0];
  page.name = title;
  page.background = background;
  page.elements = [];
  return { design, page, size: design.size, brand: getBrand() };
}

export function createDocDesign(): Design {
  const { design, page, size, brand } = start('Untitled doc', 1240, 1754, 'Doc', { kind: 'solid', color: '#FCFBF7' });
  const label = createText('caption', page, size, brand);
  label.text = 'VELLUM DOCS  /  DRAFT';
  label.x = 96;
  label.y = 92;
  label.w = 600;
  label.h = 28;
  label.fontSize = 14;
  label.letterSpacing = 3;
  label.color = brand.colors[0] ?? '#2440F0';

  const title = createText('heading', page, size, brand);
  title.text = 'A clearer way to start.';
  title.x = 92;
  title.y = 150;
  title.w = 1040;
  title.h = 180;
  title.fontFamily = 'Instrument Serif';
  title.fontSize = 102;
  title.fontWeight = 400;
  title.lineHeight = 1.02;
  title.letterSpacing = -2;
  title.color = '#14130F';

  const rule = createShape('line', page, size, brand);
  rule.x = 96;
  rule.y = 366;
  rule.w = 1044;
  rule.h = 2;
  rule.stroke = 'rgba(20,19,15,.22)';
  rule.strokeWidth = 1;

  const lead = createText('body', page, size, brand);
  lead.text = 'A document is a place to think in public. Start with the idea, give it room, and let the details arrive in their own time.';
  lead.x = 96;
  lead.y = 416;
  lead.w = 960;
  lead.h = 160;
  lead.fontFamily = 'Instrument Serif';
  lead.fontSize = 34;
  lead.lineHeight = 1.35;
  lead.color = '#3A372F';

  const secOne = createText('caption', page, size, brand);
  secOne.text = '01  —  THE IDEA';
  secOne.x = 96;
  secOne.y = 650;
  secOne.w = 500;
  secOne.fontSize = 13;
  secOne.letterSpacing = 2.6;
  secOne.color = brand.colors[0] ?? '#2440F0';

  const h2 = createText('heading', page, size, brand);
  h2.text = 'Keep the first page honest.';
  h2.x = 96;
  h2.y = 692;
  h2.w = 900;
  h2.h = 80;
  h2.fontFamily = 'Bricolage Grotesque';
  h2.fontSize = 48;
  h2.lineHeight = 1.05;
  h2.letterSpacing = -1.5;

  const body = createText('body', page, size, brand);
  body.text = 'Write the thing you actually mean. Short sentences are allowed. So are empty spaces.\n\nThe rest of the document can hold the evidence: context, decisions, open questions, and the next small step.';
  body.x = 96;
  body.y = 792;
  body.w = 940;
  body.h = 220;
  body.fontSize = 23;
  body.lineHeight = 1.65;
  body.color = '#4F4B42';

  const secTwo = createText('caption', page, size, brand);
  secTwo.text = '02  —  THE DETAILS';
  secTwo.x = 96;
  secTwo.y = 1100;
  secTwo.w = 500;
  secTwo.fontSize = 13;
  secTwo.letterSpacing = 2.6;
  secTwo.color = brand.colors[0] ?? '#2440F0';

  const body2 = createText('body', page, size, brand);
  body2.text = 'A good page does one job. A good document gives the reader somewhere to land, then somewhere to go next.';
  body2.x = 96;
  body2.y = 1144;
  body2.w = 940;
  body2.h = 130;
  body2.fontSize = 23;
  body2.lineHeight = 1.65;
  body2.color = '#4F4B42';

  const footer = createText('caption', page, size, brand);
  footer.text = 'VELLUM DOCS  ·  PAGE 01';
  footer.x = 96;
  footer.y = 1640;
  footer.w = 600;
  footer.fontSize = 11;
  footer.letterSpacing = 2.4;
  footer.color = '#8A8477';

  page.elements = [label, title, rule, lead, secOne, h2, body, secTwo, body2, footer];
  return finish(design, page);
}

export function createWhiteboardDesign(): Design {
  const { design, page, size, brand } = start('Untitled whiteboard', 2400, 1600, 'Whiteboard', { kind: 'solid', color: '#F3F0E8' });

  const title = createText('heading', page, size, brand);
  title.text = 'A room for the messy part.';
  title.x = 120;
  title.y = 90;
  title.w = 1400;
  title.h = 80;
  title.fontFamily = 'Bricolage Grotesque';
  title.fontSize = 56;
  title.lineHeight = 1;
  title.letterSpacing = -2;
  title.color = '#14130F';

  const sub = createText('body', page, size, brand);
  sub.text = 'Move the notes around. Add what is missing. Nothing has to be finished yet.';
  sub.x = 124;
  sub.y = 180;
  sub.w = 960;
  sub.h = 40;
  sub.fontSize = 19;
  sub.color = '#6B675D';

  const colors = ['#D8F55A', '#FFB39F', '#C9C2FF', '#B8D9F7', '#F5D786', '#B7E1CB'];
  const notes = [
    ['NOW', 'What is the smallest thing we can ship this week?'],
    ['NEXT', 'Where does the current flow make people stop?'],
    ['LATER', 'What becomes possible if the first version works?'],
    ['RISK', 'We are assuming people want another dashboard.'],
    ['SIGNAL', 'Watch for the second visit, not the first click.'],
    ['OWNER', 'Who is close enough to the problem to decide?'],
  ];
  const positions = [
    [150, 340], [770, 340], [1390, 340],
    [150, 800], [770, 800], [1390, 800],
  ];
  const elements: El[] = [title, sub];
  notes.forEach(([label, text], i) => {
    const [x, y] = positions[i];
    const note = createShape('rect', page, size, brand);
    note.x = x;
    note.y = y;
    note.w = 440;
    note.h = 310;
    note.radius = 10;
    note.fill = { kind: 'solid', color: colors[i] };
    note.stroke = 'rgba(20,19,15,.08)';
    note.strokeWidth = 1;
    note.rotation = [-2, 1.4, -1, 2, -1.6, 1][i];
    elements.push(note);

    const labelEl = createText('caption', page, size, brand);
    labelEl.text = label;
    labelEl.x = x + 28;
    labelEl.y = y + 26;
    labelEl.w = 300;
    labelEl.h = 24;
    labelEl.fontSize = 12;
    labelEl.letterSpacing = 2.4;
    labelEl.color = 'rgba(20,19,15,.6)';
    elements.push(labelEl);

    const noteText = createText('body', page, size, brand);
    noteText.text = text;
    noteText.x = x + 28;
    noteText.y = y + 66;
    noteText.w = 380;
    noteText.h = 210;
    noteText.fontSize = 27;
    noteText.lineHeight = 1.35;
    noteText.color = '#14130F';
    elements.push(noteText);
  });

  const footer = createText('caption', page, size, brand);
  footer.text = 'VELLUM WHITEBOARD  /  ONE BOARD, NO WRONG ANSWERS';
  footer.x = 120;
  footer.y = 1480;
  footer.w = 900;
  footer.fontSize = 11;
  footer.letterSpacing = 2.4;
  footer.color = '#8A8477';
  elements.push(footer);

  page.elements = elements;
  return finish(design, page);
}

export function createWebsiteDesign(): Design {
  const { design, page, size, brand } = start('Untitled website page', 1440, 900, 'Website', { kind: 'solid', color: '#F7F2E6' });

  const mark = createText('caption', page, size, brand);
  mark.text = 'NORTH & CO.';
  mark.x = 72;
  mark.y = 46;
  mark.w = 400;
  mark.h = 26;
  mark.fontSize = 13;
  mark.letterSpacing = 3.2;
  mark.color = '#14130F';

  const nav = createText('caption', page, size, brand);
  nav.text = 'WORK        STUDIO        JOURNAL        CONTACT';
  nav.x = 720;
  nav.y = 46;
  nav.w = 650;
  nav.h = 26;
  nav.fontSize = 11;
  nav.letterSpacing = 2;
  nav.align = 'right';
  nav.color = '#4F4B42';

  const hero = createText('heading', page, size, brand);
  hero.text = 'A quieter kind\nof studio.';
  hero.x = 66;
  hero.y = 196;
  hero.w = 780;
  hero.h = 300;
  hero.fontFamily = 'Instrument Serif';
  hero.fontSize = 126;
  hero.fontWeight = 400;
  hero.lineHeight = 0.88;
  hero.letterSpacing = -3;
  hero.color = '#14130F';

  const body = createText('body', page, size, brand);
  body.text = 'We make spaces, objects and identities for people who notice the small things. Slow work, made properly.';
  body.x = 72;
  body.y = 560;
  body.w = 500;
  body.h = 100;
  body.fontSize = 21;
  body.lineHeight = 1.55;
  body.color = '#4F4B42';

  const cta = createShape('rect', page, size, brand);
  cta.x = 72;
  cta.y = 692;
  cta.w = 220;
  cta.h = 54;
  cta.radius = 27;
  cta.fill = { kind: 'solid', color: brand.colors[0] ?? '#2440F0' };
  cta.stroke = 'transparent';
  cta.strokeWidth = 0;

  const ctaText = createText('caption', page, size, brand);
  ctaText.text = 'START A PROJECT  →';
  ctaText.x = 72;
  ctaText.y = 709;
  ctaText.w = 220;
  ctaText.h = 24;
  ctaText.fontSize = 10;
  ctaText.letterSpacing = 1.4;
  ctaText.align = 'center';
  ctaText.color = '#FFFFFF';

  const image = createImage(TEMPLATE_IMAGES.arch, page, size, 0.82);
  image.x = 920;
  image.y = 80;
  image.w = 456;
  image.h = 700;
  image.radius = 8;

  const footRule = createShape('line', page, size, brand);
  footRule.x = 72;
  footRule.y = 826;
  footRule.w = 1296;
  footRule.stroke = 'rgba(20,19,15,.24)';
  footRule.strokeWidth = 1;

  const foot = createText('caption', page, size, brand);
  foot.text = 'LONDON  /  SOMERSET  /  EVERYWHERE';
  foot.x = 72;
  foot.y = 846;
  foot.w = 600;
  foot.fontSize = 10;
  foot.letterSpacing = 2.2;
  foot.color = '#8A8477';

  page.elements = [mark, nav, hero, body, cta, ctaText, image, footRule, foot];
  return finish(design, page);
}

export function createSheetDesign(): Design {
  const { design, page, size, brand } = start('Untitled sheet layout', 1600, 1000, 'Sheet', { kind: 'solid', color: '#FFFFFF' });

  const title = createText('heading', page, size, brand);
  title.text = 'Q4 content plan';
  title.x = 80;
  title.y = 64;
  title.w = 800;
  title.h = 60;
  title.fontFamily = 'Bricolage Grotesque';
  title.fontSize = 42;
  title.letterSpacing = -1.4;
  title.color = '#14130F';

  const meta = createText('caption', page, size, brand);
  meta.text = 'OWNER  ·  ADA MENSAH        STATUS  ·  IN PROGRESS';
  meta.x = 82;
  meta.y = 126;
  meta.w = 800;
  meta.h = 24;
  meta.fontSize = 10;
  meta.letterSpacing = 2;
  meta.color = '#6B675D';

  const rows = [
    ['CHANNEL', 'FORMAT', 'THE IDEA', 'OWNER', 'STATUS'],
    ['Instagram', 'Carousel', 'The quiet ritual of opening', 'Ada', 'In review'],
    ['TikTok', 'Video', 'One minute, one pour', 'Mina', 'Draft'],
    ['Newsletter', 'Email', 'A slower kind of launch', 'Jon', 'Approved'],
    ['LinkedIn', 'Post', 'What a good brief feels like', 'Ada', 'Draft'],
    ['Print', 'Poster', 'The long way to the cup', 'Mina', 'Approved'],
  ];
  const elements: El[] = [title, meta];
  const startX = 80;
  const startY = 190;
  const colW = [220, 200, 560, 220, 220];
  rows.forEach((row, r) => {
    let x = startX;
    row.forEach((cell, c) => {
      const isHeader = r === 0;
      const cellText = createText('body', page, size, brand);
      cellText.text = cell;
      cellText.x = x + 14;
      cellText.y = startY + r * 58 + 18;
      cellText.w = colW[c] - 28;
      cellText.h = 34;
      cellText.fontSize = 16;
      cellText.fontWeight = isHeader ? 700 : 400;
      cellText.color = isHeader ? '#14130F' : '#3A372F';
      cellText.uppercase = isHeader;
      if (isHeader) cellText.letterSpacing = 1.4;
      elements.push(cellText);
      x += colW[c];
    });
    const line = createShape('line', page, size, brand);
    line.x = startX;
    line.y = startY + r * 58;
    line.w = colW.reduce((a, b) => a + b, 0);
    line.h = 1;
    line.stroke = r === 0 ? 'rgba(20,19,15,.4)' : 'rgba(20,19,15,.14)';
    line.strokeWidth = 1;
    elements.push(line);
  });

  const footer = createText('caption', page, size, brand);
  footer.text = 'STATIC SHEET LAYOUT  ·  VELLUM';
  footer.x = 80;
  footer.y = 930;
  footer.w = 800;
  footer.fontSize = 10;
  footer.letterSpacing = 2;
  footer.color = '#8A8477';
  elements.push(footer);

  page.elements = elements;
  return finish(design, page);
}

export function createStoryboardDesign(): Design {
  const { design, page, size, brand } = start('Untitled storyboard', 1080, 1920, 'Video', { kind: 'solid', color: '#14130F' });

  const label = createText('caption', page, size, brand);
  label.text = 'SHOT LIST  /  BRUMA  /  30 SEC';
  label.x = 72;
  label.y = 72;
  label.w = 800;
  label.fontSize = 13;
  label.letterSpacing = 3;
  label.color = '#D8F55A';

  const title = createText('heading', page, size, brand);
  title.text = 'Slow morning,\nin three shots.';
  title.x = 68;
  title.y = 130;
  title.w = 900;
  title.h = 220;
  title.fontFamily = 'Instrument Serif';
  title.fontSize = 84;
  title.lineHeight = 0.95;
  title.letterSpacing = -2;
  title.color = '#F4F1EA';

  const elements: El[] = [label, title];
  const shots = [
    ['01', '6s', 'Hands open the café. Steam. The first pour.'],
    ['02', '10s', 'A cup lands on the counter. The regulars arrive.'],
    ['03', '8s', 'Wide shot. The room settles. End on the wordmark.'],
  ];
  shots.forEach(([num, time, text], i) => {
    const y = 470 + i * 400;
    const frame = createShape('rect', page, size, brand);
    frame.x = 72;
    frame.y = y;
    frame.w = 936;
    frame.h = 330;
    frame.fill = { kind: 'solid', color: i === 1 ? '#2440F0' : '#211E18' };
    frame.stroke = '#3B372E';
    frame.strokeWidth = 1;
    frame.radius = 10;
    elements.push(frame);

    const n = createText('heading', page, size, brand);
    n.text = num;
    n.x = 100;
    n.y = y + 34;
    n.w = 120;
    n.h = 50;
    n.fontFamily = 'Bebas Neue';
    n.fontSize = 46;
    n.color = '#D8F55A';
    elements.push(n);

    const t = createText('caption', page, size, brand);
    t.text = time;
    t.x = 880;
    t.y = y + 44;
    t.w = 90;
    t.h = 24;
    t.fontSize = 12;
    t.letterSpacing = 2;
    t.align = 'right';
    t.color = 'rgba(244,241,234,.6)';
    elements.push(t);

    const d = createText('body', page, size, brand);
    d.text = text;
    d.x = 100;
    d.y = y + 126;
    d.w = 760;
    d.h = 130;
    d.fontFamily = 'Instrument Serif';
    d.fontSize = 36;
    d.lineHeight = 1.2;
    d.color = '#F4F1EA';
    elements.push(d);
  });

  const footer = createText('caption', page, size, brand);
  footer.text = 'STORYBOARD  ·  NO PLAYBACK  ·  SHOOT IT YOUR WAY';
  footer.x = 72;
  footer.y = 1840;
  footer.w = 900;
  footer.fontSize = 10;
  footer.letterSpacing = 2;
  footer.color = 'rgba(244,241,234,.4)';
  elements.push(footer);

  page.elements = elements;
  return finish(design, page);
}
