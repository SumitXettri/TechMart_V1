export function StatsCard({
  label,
  value,
  accent,
  trend,
}: {
  label: string;
  value: number;
  accent?: "default" | "green" | "amber" | "blue" | "purple";
  trend?: string;
}) {
  const accentClass =
    {
      default: "text-gray-900",
      green: "text-emerald-600",
      amber: "text-amber-600",
      blue: "text-brand-600",
      purple: "text-purple-600",
    }[accent ?? "default"] ?? "text-gray-900";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {trend ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {trend}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-4 text-3xl font-semibold tracking-tight ${accentClass}`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}
