import { Monitor, Moon, Sun } from "lucide-react";

export type Theme = "light" | "dark" | "system";

export function ThemePicker({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (v: Theme) => void;
}) {
  const options: { value: Theme; icon: React.ElementType; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer
              ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-border hover:text-foreground"
              }`}
          >
            <Icon size={16} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
