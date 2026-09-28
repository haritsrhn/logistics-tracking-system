import type { ReactNode } from 'react';

export interface SummaryEntry {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
}

export function SummaryStrip({ entries }: { entries: SummaryEntry[] }) {
  return (
    <dl className="summary-strip">
      {entries.map((e, i) => (
        <div className="summary-item" key={i}>
          <dt className="summary-label">{e.label}</dt>
          <dd className="summary-value" style={{ margin: 0 }}>
            {e.value}
          </dd>
          {e.note && <dd className="summary-note" style={{ margin: 0 }}>{e.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
