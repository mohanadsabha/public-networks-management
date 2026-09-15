interface ChartLegendItem {
  label: string;
  color: string;
  type?: "line" | "square";
}

function LegendSwatch({ type, color }: { type?: "line" | "square"; color: string }) {
  if (type === "line") {
    return (
      <svg width={16} height={10} viewBox="0 0 16 10" aria-hidden className="shrink-0">
        <line x1={0} y1={5} x2={16} y2={5} stroke={color} strokeWidth={2} />
        <circle cx={8} cy={5} r={3} fill={color} stroke={color} />
      </svg>
    );
  }

  return (
    <span
      aria-hidden
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
}

export function ChartLegendRow({ items }: { items: ChartLegendItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {items.map((item) => (
        <li
          key={item.label}
          className="inline-flex max-w-full items-center gap-2.5"
        >
          <LegendSwatch type={item.type} color={item.color} />
          <span className="text-xs leading-none text-muted-foreground">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export type { ChartLegendItem };
