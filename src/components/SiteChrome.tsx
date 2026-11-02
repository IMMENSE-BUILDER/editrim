import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VellumIcon } from './VellumIcon';
import { Logo } from './Brand';

export function SiteHeader({ variant = 'default' }: { variant?: 'default' | 'plain' }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`site-header ${variant === 'plain' ? 'plain' : ''}`}>
      <div className="site-header-inner">
        <Link to="/" className="site-brand" aria-label="Vellum home">
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
          <Link to="/dashboard" className="site-login">Your designs</Link>
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            Start designing
            <VellumIcon name="arrowUpRight" size={14} />
          </Link>
        </div>
        <button className="site-menu-btn" onClick={() => setOpen(v => !v)} aria-label="Menu">
          {open ? <VellumIcon name="close" size={20} /> : <VellumIcon name="menu" size={20} />}
        </button>
      </div>
      {open && (
        <div className="site-mobile-nav">
          <Link to="/templates" onClick={() => setOpen(false)}>Templates</Link>
          <Link to="/#ai" onClick={() => setOpen(false)}>AI Studio</Link>
          <Link to="/#features" onClick={() => setOpen(false)}>Features</Link>
          <Link to="/#how" onClick={() => setOpen(false)}>How it works</Link>
          <Link to="/#pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link to="/dashboard" onClick={() => setOpen(false)}>Your designs</Link>
          <Link to="/dashboard" className="btn btn-primary" onClick={() => setOpen(false)}>Start designing</Link>
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
          <Link to="/dashboard" className="btn btn-lime btn-sm footer-cta">
            Start designing
            <VellumIcon name="arrowUpRight" size={14} />
          </Link>
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
            <a href="https://github.com/IMMENSE-BUILDER/vellum" target="_blank" rel="noreferrer">GitHub</a>
            <Link to="/#pricing">Pricing</Link>
            <Link to="/view">Shared designs</Link>
            <Link to="/#faq">FAQ</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Vellum. Built for the web.</span>
        <span className="footer-note">No account. No watermark. No nonsense.</span>
      </div>
    </footer>
  );
}
