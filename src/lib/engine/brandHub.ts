import type { BrandKit } from '../types';

export type BrandAssetKind = 'logo' | 'font' | 'color';
export type BrandAssetRole = 'primary' | 'secondary' | 'accent' | 'neutral' | 'display' | 'body' | 'mark';

export type BrandAsset = {
  id: string;
  kind: BrandAssetKind;
  name: string;
  value: string;
  roles: BrandAssetRole[];
  scope: 'workspace' | 'design' | 'template';
  locked?: boolean;
};

export type BrandLock = {
  kind: BrandAssetKind;
  values: string[];
  scope: 'workspace' | 'design' | 'template';
  locked: boolean;
  reason?: string;
};

export type BrandPermissions = {
  canSwapLogo: boolean;
  canEditColors: boolean;
  canChangeFonts: boolean;
  canUploadImages: boolean;
  canEditVoice: boolean;
  allowedRoles: BrandAssetRole[];
};

export type BrandHub = {
  id: string;
  name: string;
  version: number;
  base: BrandKit;
  assets: BrandAsset[];
  locks: BrandLock[];
  permissions: BrandPermissions;
};

export type BrandChange = {
  kind: BrandAssetKind;
  values: string[];
  role?: BrandAssetRole;
};

export type BrandCheck = {
  allowed: boolean;
  violations: string[];
  allowedValues: string[];
};

export type BrandLayoutSlot = {
  id: string;
  role: BrandAssetRole;
  required: boolean;
  allowedValues: string[];
  locked: boolean;
};

export type BrandLayoutPolicy = {
  id: string;
  templateId: string;
  slots: BrandLayoutSlot[];
  allowLogoSwap: boolean;
  allowColorOverride: boolean;
  allowFontOverride: boolean;
};

export type BrandAssetBundle = {
  id: string;
  name: string;
  hubId: string;
  assets: BrandAsset[];
  layoutPolicies: BrandLayoutPolicy[];
};

export const DEFAULT_BRAND_HUB: BrandHub = {
  id: 'editrim-default',
  name: 'Editrim Studio',
  version: 1,
  base: {
    name: 'Editrim Studio',
    colors: ['#14130F', '#F4F1EA', '#2440F0', '#D8F55A'],
    fonts: ['Bricolage Grotesque', 'Inter'],
    voice: 'Clear, direct, a little editorial. No filler.',
  },
  assets: [
    { id: 'logo-mark', kind: 'logo', name: 'Editrim mark', value: '/favicon.svg', roles: ['mark', 'primary'], scope: 'workspace', locked: true },
    { id: 'font-display', kind: 'font', name: 'Display', value: 'Bricolage Grotesque', roles: ['display', 'primary'], scope: 'workspace', locked: true },
    { id: 'font-body', kind: 'font', name: 'Body', value: 'Inter', roles: ['body', 'secondary'], scope: 'workspace', locked: true },
    { id: 'color-ink', kind: 'color', name: 'Ink', value: '#14130F', roles: ['primary', 'neutral'], scope: 'workspace', locked: true },
    { id: 'color-paper', kind: 'color', name: 'Paper', value: '#F4F1EA', roles: ['secondary', 'neutral'], scope: 'workspace', locked: true },
    { id: 'color-cobalt', kind: 'color', name: 'Cobalt', value: '#2440F0', roles: ['accent'], scope: 'workspace', locked: false },
    { id: 'color-lime', kind: 'color', name: 'Lime', value: '#D8F55A', roles: ['accent'], scope: 'workspace', locked: false },
  ],
  locks: [
    { kind: 'font', values: ['Bricolage Grotesque', 'Inter'], scope: 'workspace', locked: true, reason: 'Brand typography stays consistent.' },
    { kind: 'color', values: ['#14130F', '#F4F1EA'], scope: 'workspace', locked: true, reason: 'Ink and paper are fixed surfaces.' },
    { kind: 'logo', values: ['/favicon.svg'], scope: 'workspace', locked: true, reason: 'Use the approved mark.' },
  ],
  permissions: {
    canSwapLogo: false,
    canEditColors: true,
    canChangeFonts: false,
    canUploadImages: true,
    canEditVoice: true,
    allowedRoles: ['primary', 'secondary', 'accent', 'neutral', 'display', 'body', 'mark'],
  },
};

export function createBrandHub(name: string, base: BrandKit, options: Partial<Pick<BrandHub, 'assets' | 'locks' | 'permissions'>> = {}): BrandHub {
  return {
    id: `brand-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    version: 1,
    base,
    assets: options.assets ?? [],
    locks: options.locks ?? [],
    permissions: options.permissions ?? {
      canSwapLogo: true,
      canEditColors: true,
      canChangeFonts: true,
      canUploadImages: true,
      canEditVoice: true,
      allowedRoles: ['primary', 'secondary', 'accent', 'neutral', 'display', 'body', 'mark'],
    },
  };
}

export function checkBrandChange(hub: BrandHub, change: BrandChange): BrandCheck {
  const violations: string[] = [];
  const locks = hub.locks.filter(lock => lock.locked && lock.kind === change.kind && lock.scope === 'workspace');
  const allowedValues = new Set<string>();
  locks.forEach(lock => lock.values.forEach(value => allowedValues.add(value)));
  if (change.kind === 'logo') {
    const locked = hub.locks.filter(lock => lock.locked && lock.kind === 'logo');
    locked.forEach(lock => change.values.forEach(value => {
      if (!lock.values.includes(value)) violations.push(`Logo "${value}" is locked to ${lock.values.join(', ')}`);
    }));
    if (!hub.permissions.canSwapLogo && locked.length === 0) violations.push('Logo swapping is disabled for this workspace');
  }
  if (change.kind === 'font') {
    const locked = hub.locks.filter(lock => lock.locked && lock.kind === 'font');
    locked.forEach(lock => change.values.forEach(value => {
      if (!lock.values.includes(value)) violations.push(`Font "${value}" is outside the locked brand set`);
    }));
    if (!hub.permissions.canChangeFonts && locked.length === 0) violations.push('Font changes are disabled for this workspace');
  }
  if (change.kind === 'color' && !hub.permissions.canEditColors) {
    locks.forEach(lock => change.values.forEach(value => {
      if (!lock.values.includes(value)) violations.push(`Color "${value}" is outside the locked brand palette`);
    }));
  }
  if (change.role && !hub.permissions.allowedRoles.includes(change.role)) {
    violations.push(`Role "${change.role}" is not permitted`);
  }
  return { allowed: violations.length === 0, violations, allowedValues: [...allowedValues] };
}

export function enforceBrandLayout(policy: BrandLayoutPolicy, incoming: Record<string, string>): BrandCheck {
  const violations: string[] = [];
  policy.slots.forEach(slot => {
    const value = incoming[slot.id];
    if (slot.required && value === undefined) {
      violations.push(`Required slot "${slot.id}" is empty`);
      return;
    }
    if (slot.locked && value !== undefined && !slot.allowedValues.includes(value)) {
      violations.push(`Slot "${slot.id}" must use ${slot.allowedValues.join(', ')}`);
    }
  });
  if (!policy.allowLogoSwap && 'logo' in incoming && !policy.slots.some(slot => slot.role === 'mark' && slot.allowedValues.includes(incoming.logo))) {
    violations.push('Logo swap is not allowed by this layout policy');
  }
  if (!policy.allowColorOverride && 'color' in incoming) violations.push('Color override is locked');
  if (!policy.allowFontOverride && 'font' in incoming) violations.push('Font override is locked');
  return { allowed: violations.length === 0, violations, allowedValues: policy.slots.flatMap(slot => slot.allowedValues) };
}

export const BRAND_ASSET_BUNDLE: BrandAssetBundle = {
  id: 'editrim-launch-bundle',
  name: 'Launch templates',
  hubId: DEFAULT_BRAND_HUB.id,
  assets: DEFAULT_BRAND_HUB.assets,
  layoutPolicies: [
    {
      id: 'social-cover-policy',
      templateId: 'cafe-opening',
      allowLogoSwap: false,
      allowColorOverride: false,
      allowFontOverride: false,
      slots: [
        { id: 'logo', role: 'mark', required: true, allowedValues: ['/favicon.svg'], locked: true },
        { id: 'headline', role: 'display', required: true, allowedValues: ['Bricolage Grotesque'], locked: true },
        { id: 'body', role: 'body', required: true, allowedValues: ['Inter'], locked: true },
        { id: 'accent', role: 'accent', required: false, allowedValues: ['#2440F0', '#D8F55A'], locked: false },
      ],
    },
  ],
};
