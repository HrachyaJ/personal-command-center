import { useThemeStore } from "../../../stores/useThemeStore";
import { ThemePicker, type Theme } from "./SettingsThemePicker";
import { Section } from "./SettingsSection";
import { Separator } from "../../ui/separator";
import { Row } from "./SettingsRow";
import { Switch } from "../../ui/switch";
import { useDensityStore } from "../../../stores/useDensityStore";

export type Tab = "appearance" | "account" | "notifications" | "privacy";

export function AppearanceTab() {
  const { theme, setTheme } = useThemeStore();
  const { density, setDensity } = useDensityStore();

  function handleThemeChange(v: Theme) {
    setTheme(v);
  }

  return (
    <div className="space-y-6">
      <Section title="Theme">
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Color mode</p>
          <ThemePicker value={theme} onChange={handleThemeChange} />
        </div>
      </Section>

      <Separator />

      <Section title="Layout">
        <Row
          label="Compact density"
          description="Reduce spacing for more content on screen"
        >
          <Switch
            checked={density === "compact"}
            onCheckedChange={(v) => setDensity(v ? "compact" : "comfortable")}
          />
        </Row>
      </Section>
    </div>
  );
}
