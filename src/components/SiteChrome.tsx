import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassButton } from '@/components/liquid-glass';
import { EditrimIcon } from './EditrimIcon';
import { Logo } from './Brand';

export function SiteHeader({ variant = 'default' }: { variant?: 'default' | 'plain' }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`site-header ${variant === 'plain' ? 'plain' : ''}`}>
      <div className="site-header-inner">
        <Link to="/" className="site-brand" aria-label="Editrim home">
          <Logo size={32} />
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link to="/templates">Templates</Link>
          <Link to="/#ai">AI Studio</Link>
          <Link to="/#features">Features</Link>
          <Link to="/#how">How it works</Link>
          <Link to="/#pricing">Pricing</Link>
        </nav>
        <div className="site-actions">
          <GlassButton asChild material="clear" size="sm">
            <Link to="/dashboard" className="site-login">Your designs</Link>
          </GlassButton>
          <GlassButton
            asChild
            material="tinted"
            size="sm"
            className="bg-[#2440F0] text-white dark:bg-[#5B7CFF] dark:text-white"
            icon={<EditrimIcon name="arrowUpRight" size={14} />}
          >
            <Link to="/dashboard">Start designing</Link>
          </GlassButton>
        </div>
        <div className="site-menu-wrap">
          <GlassButton
            material="clear"
            size="sm"
            className="site-menu-btn w-9 !px-0"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <EditrimIcon name="close" size={20} /> : <EditrimIcon name="menu" size={20} />}
          </GlassButton>
        </div>
      </div>
      {open && (
        <div className="site-mobile-nav">
          <Link to="/templates" onClick={() => setOpen(false)}>Templates</Link>
          <Link to="/#ai" onClick={() => setOpen(false)}>AI Studio</Link>
          <Link to="/#features" onClick={() => setOpen(false)}>Features</Link>
          <Link to="/#how" onClick={() => setOpen(false)}>How it works</Link>
          <Link to="/#pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link to="/dashboard" onClick={() => setOpen(false)}>Your designs</Link>
          <GlassButton
            asChild
            material="tinted"
            size="md"
            className="bg-[#2440F0] text-white"
          >
            <Link to="/dashboard" onClick={() => setOpen(false)}>Start designing</Link>
          </GlassButton>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Logo size={36} />
          <p>A complete design studio in your browser.<br />Free, fast, and yours to keep.</p>
          <GlassButton
            asChild
            material="tinted"
            size="md"
            className="bg-[#D8F55A] text-[#14130F] footer-cta"
            icon={<EditrimIcon name="arrowUpRight" size={14} />}
          >
            <Link to="/dashboard">Start designing</Link>
          </GlassButton>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Product</h4>
            <Link to="/dashboard">Your designs</Link>
            <Link to="/templates">Templates</Link>
            <Link to="/editor/new">Editor</Link>
            <Link to="/#features">Features</Link>
          </div>
          <div>
            <h4>Make</h4>
            <Link to="/templates?category=Instagram">Instagram posts</Link>
            <Link to="/templates?category=Story">Stories</Link>
            <Link to="/templates?category=Presentation">Presentations</Link>
            <Link to="/templates?category=Resume">Resumes</Link>
          </div>
          <div>
            <h4>For</h4>
            <Link to="/templates?category=Poster">Posters</Link>
            <Link to="/templates?category=Menu">Menus</Link>
            <Link to="/templates?category=Invitation">Invitations</Link>
            <Link to="/templates?category=Logo">Brand marks</Link>
          </div>
          <div>
            <h4>Project</h4>
            <a href="https://github.com/IMMENSE-BUILDER/editrim" target="_blank" rel="noreferrer">GitHub</a>
            <Link to="/#pricing">Pricing</Link>
            <Link to="/view">Shared designs</Link>
            <Link to="/#faq">FAQ</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Editrim. Built for the web.</span>
        <span className="footer-note">No account. No watermark. No nonsense.</span>
      </div>
    </footer>
  );
}
