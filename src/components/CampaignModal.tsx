import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassButton } from '@/components/liquid-glass';
import { Switch } from '@/components/liquid-glass/controls/Switch';
import { EditrimIcon } from './EditrimIcon';
import { Modal } from './Modal';
import { PagePreview } from './PagePreview';
import { useToast } from './Toast';
import { generateCampaignVariants } from '../lib/campaign';
import { exportDesign } from '../lib/export';
import { RESIZE_TARGETS, type ResizeTarget } from '../lib/resize';
import { getBrand } from '../lib/storage';
import type { Design } from '../lib/types';

export function CampaignModal({
  open,
  onClose,
  sourceDesign,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  sourceDesign: Design;
  onCreated?: (designs: Design[]) => void;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>(['Instagram post', 'Story', 'LinkedIn', 'X']);
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [cta, setCta] = useState('');
  const [applyBrand, setApplyBrand] = useState(false);
  const [generated, setGenerated] = useState<Design[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) {
      setGenerated([]);
      setDownloading(false);
    }
  }, [open]);

  const toggleTarget = (name: string) => {
    setSelected(prev => (prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]));
  };

  const selectSocialPack = () => {
    setSelected(['Instagram post', 'Story', 'LinkedIn', 'X']);
  };

  const runBatch = () => {
    const targets: ResizeTarget[] = RESIZE_TARGETS.filter(t => selected.includes(t.name));
    if (!targets.length) {
      toast('Select at least one output size', 'error');
      return;
    }
    const { variants } = generateCampaignVariants(
      sourceDesign,
      targets,
      { headline, subheadline, cta, applyBrand },
      getBrand(),
    );
    setGenerated(variants);
    onCreated?.(variants);
    toast(`Generated ${variants.length} local campaign ${variants.length === 1 ? 'variant' : 'variants'}`);
  };

  const downloadAllPngs = async () => {
    if (!generated.length || downloading) return;
    setDownloading(true);
    try {
      for (const variant of generated) {
        await exportDesign(variant, 0, { format: 'png', scale: 2, pages: 'current', transparent: false });
      }
      toast(`Downloaded ${generated.length} campaign PNGs`);
    } catch {
      toast('Some campaign exports failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate campaign batch"
      subtitle="Create multi-size resized variants locally in your browser with optional copy & brand overrides."
      width={720}
      footer={
        <>
          <GlassButton material="clear" size="sm" onClick={onClose}>Close</GlassButton>
          {generated.length > 0 && (
            <GlassButton
              material="clear"
              size="sm"
              onClick={() => void downloadAllPngs()}
              disabled={downloading}
              icon={<EditrimIcon name="download" size={14} />}
              iconPosition="start"
            >
              {downloading ? 'Exporting…' : `Download all PNGs (${generated.length})`}
            </GlassButton>
          )}
          <GlassButton
            material="tinted"
            size="sm"
            className="bg-[#2440F0] text-white"
            onClick={runBatch}
            icon={<EditrimIcon name="magic" size={14} />}
            iconPosition="start"
          >
            {generated.length ? 'Regenerate batch' : `Generate (${selected.length})`}
          </GlassButton>
        </>
      }
    >
      <div className="campaign-modal-body">
        <div className="campaign-section-head">
          <span className="field-label">Target sizes</span>
          <button type="button" className="cdm-text-link" onClick={selectSocialPack}>
            Social pack (IG + Story + LinkedIn + X)
          </button>
        </div>
        <div className="campaign-size-grid">
          {RESIZE_TARGETS.map(t => {
            const on = selected.includes(t.name);
            return (
              <button
                key={t.name}
                type="button"
                className={`campaign-size-chip ${on ? 'is-active' : ''}`}
                onClick={() => toggleTarget(t.name)}
              >
                <strong>{t.name}</strong>
                <small>{t.width}×{t.height}</small>
              </button>
            );
          })}
        </div>

        <div className="campaign-copy-grid">
          <label className="field">
            <span className="field-label">Headline override (optional)</span>
            <input className="input" placeholder="Leave blank to keep existing" value={headline} onChange={e => setHeadline(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Subheadline override (optional)</span>
            <input className="input" placeholder="Supporting message" value={subheadline} onChange={e => setSubheadline(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">CTA override (optional)</span>
            <input className="input" placeholder="Shop now · Learn more" value={cta} onChange={e => setCta(e.target.value)} />
          </label>
        </div>

        <div className="campaign-brand-toggle">
          <span>Apply Brand Kit colours &amp; fonts</span>
          <Switch size="sm" color="#2440F0" checked={applyBrand} onChange={setApplyBrand} label="" />
        </div>

        {generated.length > 0 && (
          <div className="campaign-results">
            <div className="campaign-section-head">
              <span className="field-label">Generated variants</span>
            </div>
            <div className="campaign-result-grid">
              {generated.map(variant => (
                <button
                  key={variant.id}
                  type="button"
                  className="campaign-result-card"
                  onClick={() => { onClose(); navigate(`/editor/${variant.id}`); }}
                >
                  <div className="campaign-result-thumb">
                    <PagePreview page={variant.pages[0]} size={variant.size} />
                  </div>
                  <div className="campaign-result-meta">
                    <strong>{variant.size.name}</strong>
                    <small>{variant.size.width} × {variant.size.height}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
