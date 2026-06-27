interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
}

export function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col items-center justify-center active:scale-[0.98] transition-transform duration-150">
      <span className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">
        {label}
      </span>
    </div>
  );
}
