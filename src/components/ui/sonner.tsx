import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useThemeStore } from "../../stores/useThemeStore";

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useThemeStore();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--popover-foreground)",
          "--success-bg": "var(--popover)",
          "--success-border": "var(--border)",
          "--success-text": "var(--popover-foreground)",
          "--error-bg": "var(--popover)",
          "--error-border": "var(--border)",
          "--error-text": "var(--popover-foreground)",
          "--warning-bg": "var(--popover)",
          "--warning-border": "var(--border)",
          "--warning-text": "var(--popover-foreground)",
          "--info-bg": "var(--popover)",
          "--info-border": "var(--border)",
          "--info-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
