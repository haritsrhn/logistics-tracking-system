import { KATEGORI } from '../lib/constants';
import type { StatusCount } from '../lib/rules';

export function HeatCell({
  count,
  kategori,
  selected,
  onSelect,
}: {
  count: StatusCount;
  kategori: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const tooltip = `${KATEGORI[kategori]}: ${count.selesai} selesai, ${count.proses} dalam proses, ${count.belum} belum selesai`;
  const pct = (n: number) => (count.total ? `${(n / count.total) * 100}%` : '0');
  return (
    <button type="button" className="heat-cell" aria-pressed={selected} title={tooltip} aria-label={tooltip} onClick={onSelect}>
      {count.total === 0 ? (
        <span className="is-zero">0</span>
      ) : (
        <>
          <span>
            {count.selesai}/{count.total}
          </span>
          <span className="heat-bar" aria-hidden="true">
            <span data-status="selesai" style={{ width: pct(count.selesai) }} />
            <span data-status="proses" style={{ width: pct(count.proses) }} />
            <span data-status="belum" style={{ width: pct(count.belum) }} />
          </span>
        </>
      )}
    </button>
  );
}
