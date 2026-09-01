export function StatsCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "default" | "green" | "amber" | "blue" | "purple";
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accentClass}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
