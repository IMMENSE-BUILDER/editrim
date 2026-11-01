import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  className?: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const frame = requestAnimationFrame(() => {
      const modal = modalRef.current;
      if (!modal || modal.contains(document.activeElement)) return;
      const target =
        modal.querySelector<HTMLElement>('input:not([disabled]):not([data-autofocus="false"]), textarea:not([disabled]), select:not([disabled])') ??
        modal.querySelector<HTMLElement>('[role="tab"]:not([disabled]), .size-card:not([disabled])') ??
        modal.querySelector<HTMLElement>('.modal-footer .btn-cobalt, .modal-footer .btn-primary') ??
        modal.querySelector<HTMLElement>('.modal-footer .btn-ghost') ??
        modal.querySelector<HTMLElement>('button:not([disabled])');
      target?.focus();
    });

    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onPointerDown={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={modalRef}
        className={`modal ${className}`}
        style={width ? { width: `min(${width}px, 100%)` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {(title || subtitle) && (
          <div className="modal-header">
            <div>
              {title && <div className="modal-title">{title}</div>}
              {subtitle && <div className="modal-sub">{subtitle}</div>}
            </div>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
