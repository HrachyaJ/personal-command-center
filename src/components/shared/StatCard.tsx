interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
}

export function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-5 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
      <span className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">
        {label}
      </span>
    </div>
  );
}
