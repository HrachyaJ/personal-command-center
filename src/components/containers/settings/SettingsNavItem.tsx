export function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors text-left cursor-pointer shrink-0 whitespace-nowrap sm:whitespace-normal sm:w-full
        ${
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
