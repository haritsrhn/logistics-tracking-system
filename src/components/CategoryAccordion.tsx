import { useId, type ReactNode } from 'react';
import { KATEGORI } from '../lib/constants';

/** Accordion 11 kategori, satu terbuka dalam satu waktu. */
export function CategoryAccordion({
  open,
  onToggle,
  counts,
  renderBody,
}: {
  open: number | null;
  onToggle: (k: number | null) => void;
  counts: number[];
  renderBody: (k: number) => ReactNode;
}) {
  const baseId = useId();
  return (
    <div className="accordion">
      {KATEGORI.map((nama, k) => {
        const isOpen = open === k;
        const bodyId = `${baseId}-body-${k}`;
        return (
          <section className="accordion-section" key={k} data-open={isOpen}>
            <h2 style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
              <button
                type="button"
                className="accordion-header"
                aria-expanded={isOpen}
                aria-controls={bodyId}
                onClick={() => onToggle(isOpen ? null : k)}
              >
                <span className="accordion-no">{k + 1}</span>
                <span className="accordion-name">{nama}</span>
                <span className="accordion-count">{counts[k] ? `${counts[k]} barang` : 'Kosong'}</span>
                <span className="accordion-sign" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h2>
            {isOpen && (
              <div className="accordion-body" id={bodyId}>
                {renderBody(k)}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
