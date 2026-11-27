import type { El, Page } from '../types';
import { buildChartPrims } from './chart';
import { buildConnectorPrims } from './connector';
import { buildCurvedTextPrims } from './curvedText';
import { buildDrawingPrims } from './drawing';
import { buildGridPrims } from './grid';
import { buildMockupPrims } from './mockup';
import type { Prim } from './prims';
import { buildQrPrims } from './qr';
import { buildTablePrims } from './table';

export type { Prim } from './prims';
export { primsToSvg, drawPrims, primFonts, primImages } from './prims';
export { evaluateTable } from './formula';
export { syncConnectors } from './connector';

export function buildPrims(el: El, page?: Page): Prim[] | null {
  switch (el.type) {
    case 'chart':
      return buildChartPrims(el, page);
    case 'table':
      return buildTablePrims(el);
    case 'qr':
      return buildQrPrims(el);
    case 'drawing':
      return buildDrawingPrims(el);
    case 'grid':
      return buildGridPrims(el);
    case 'mockup':
      return buildMockupPrims(el);
    case 'connector':
      return buildConnectorPrims(el);
    case 'text':
      if (el.curve && Math.abs(el.curve) >= 1) {
        return buildCurvedTextPrims(el);
      }
      return null;
    default:
      return null;
  }
}
