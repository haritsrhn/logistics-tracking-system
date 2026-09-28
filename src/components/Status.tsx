import { PROGRESS_LABEL, PROGRESS_ORDER } from '../lib/constants';
import type { Progress } from '../lib/types';

export function StatusDot({ status }: { status: Progress }) {
  return <span className="status-dot" data-status={status} aria-hidden="true" />;
}

export function StatusLabel({ status }: { status: Progress }) {
  return (
    <span className="status-label">
      <StatusDot status={status} />
      {PROGRESS_LABEL[status]}
    </span>
  );
}

interface ControlProps {
  value: Progress;
  onChange: (next: Progress) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function StatusSegmented({ value, onChange, disabled, label = 'Progress' }: ControlProps) {
  return (
    <div className="status-segmented" role="group" aria-label={label}>
      {PROGRESS_ORDER.map((p) => (
        <button
          key={p}
          type="button"
          data-status={p}
          aria-pressed={value === p}
          disabled={disabled}
          onClick={() => onChange(p)}
        >
          {PROGRESS_LABEL[p]}
        </button>
      ))}
    </div>
  );
}

export function StatusSelect({ value, onChange, disabled, label = 'Progress', id }: ControlProps) {
  return (
    <select
      id={id}
      className="select"
      aria-label={id ? undefined : label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as Progress)}
    >
      {PROGRESS_ORDER.map((p) => (
        <option key={p} value={p}>
          {PROGRESS_LABEL[p]}
        </option>
      ))}
    </select>
  );
}
