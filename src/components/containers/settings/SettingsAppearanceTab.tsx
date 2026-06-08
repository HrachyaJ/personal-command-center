import { useThemeStore } from "../../../stores/useThemeStore";
import { ThemePicker, type Theme } from "./SettingsThemePicker";
import { Section } from "./SettingsSection";
import { Separator } from "../../ui/separator";
import { Row } from "./SettingsRow";
import { Switch } from "../../ui/switch";
import { useDensityStore } from "../../../stores/useDensityStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useTranslation } from "../../../hooks/useTranslation";
import type { Locale } from "../../../lib/i18n";
import { LOCALES } from "../../../lib/i18n";

export type Tab = "appearance" | "account" | "notifications" | "privacy";

export function AppearanceTab() {
  const { theme, setTheme } = useThemeStore();
  const { density, setDensity } = useDensityStore();
  const { locale, setLocale, t } = useTranslation();

  function handleThemeChange(v: Theme) {
    setTheme(v);
  }

  return (
    <div className="space-y-6">
      <Section title={t("settings.themeTitle")}>
        <div>
          <p className="text-sm font-medium text-foreground mb-3">
            {t("settings.colorMode")}
          </p>
          <ThemePicker value={theme} onChange={handleThemeChange} />
        </div>
      </Section>

      <Separator />

      <Section title={t("settings.layoutTitle")}>
        <Row
          label={t("settings.compactDensity")}
          description={t("settings.compactDensityDescription")}
        >
          <Switch
            checked={density === "compact"}
            onCheckedChange={(v) => setDensity(v ? "compact" : "comfortable")}
          />
        </Row>
      </Section>

      <Separator />

      <Section title={t("settings.languageTitle")}>
        <Row
          label={t("settings.languageLabel")}
          description={t("settings.languageDescription")}
        >
          <Select
            value={locale}
            onValueChange={(value) => setLocale(value as Locale)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`language.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </Section>
    </div>
  );
}
