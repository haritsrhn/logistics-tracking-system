export interface Chip<V extends string> {
  value: V;
  label: string;
  count: number;
}

export function FilterChips<V extends string>({
  chips,
  value,
  onChange,
  label,
}: {
  chips: Chip<V>[];
  value: V;
  onChange: (v: V) => void;
  label: string;
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {chips.map((c) => (
        <button key={c.value} type="button" className="chip" aria-pressed={value === c.value} onClick={() => onChange(c.value)}>
          {c.label} {c.count}
        </button>
      ))}
    </div>
  );
}
