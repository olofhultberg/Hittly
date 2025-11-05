type Props = { label: string; value: number | string; tone?: "purple"|"blue"|"green"|"amber" };
const tones = {
  purple: "bg-purple-100 text-purple-700",
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-green-100 text-green-700",
  amber:  "bg-amber-100 text-amber-700",
};
export function StatCard({ label, value, tone = "blue" }: Props) {
  return (
    <div className={`card p-5 ${tones[tone]}`}>
      <div className="text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-sm opacity-80">{label}</div>
    </div>
  );
}