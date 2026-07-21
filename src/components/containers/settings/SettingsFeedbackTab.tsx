import { useState } from "react";
import { Section } from "./SettingsSection";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { toast } from "sonner";
import { Bug, Lightbulb, MessageCircle, Send, Check } from "lucide-react";
import { API_BASE, authFetch } from "../../../lib/utils";
import { useTranslation } from "../../../hooks/useTranslation";
import { useUserStore } from "../../../stores/useUserStore";

type FeedbackType = "bug" | "feature" | "general";

const MAX_LENGTH = 2000;

const TYPE_OPTIONS: { value: FeedbackType; icon: React.ElementType }[] = [
  { value: "bug", icon: Bug },
  { value: "feature", icon: Lightbulb },
  { value: "general", icon: MessageCircle },
];

export function FeedbackTab() {
  const { t } = useTranslation();
  const { user } = useUserStore();

  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const trimmed = message.trim();
  const remaining = MAX_LENGTH - message.length;
  const canSubmit = trimmed.length > 0 && remaining >= 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: trimmed,
          // Helpful for triage server-side; harmless if the endpoint ignores it.
          context: {
            path: window.location.pathname,
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? t("settings.feedback.submitError"));
        return;
      }

      toast.success(t("settings.feedback.submitSuccess"));
      setMessage("");
      setType("general");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    } catch {
      toast.error(t("settings.feedback.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Section title={t("settings.feedback.section")}>
        <p className="text-sm text-muted-foreground -mt-1">
          {t("settings.feedback.intro")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="feedback-type" className="text-xs mb-1.5 block">
              {t("settings.feedback.typeLabel")}
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as FeedbackType)}
            >
              <SelectTrigger id="feedback-type" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map(({ value, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Icon size={14} />
                      {t(`settings.feedback.type.${value}`)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="feedback-message" className="text-xs">
                {t("settings.feedback.messageLabel")}
              </Label>
              <span
                className={`text-[11px] ${
                  remaining < 0 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {remaining < 0
                  ? t("settings.feedback.overLimit", {
                      count: Math.abs(remaining),
                    })
                  : `${message.length}/${MAX_LENGTH}`}
              </span>
            </div>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("settings.feedback.messagePlaceholder")}
              className="min-h-32 resize-none"
            />
          </div>

          {user?.email && (
            <p className="text-xs text-muted-foreground">
              {t("settings.feedback.replyHint", { email: user.email })}
            </p>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? (
              t("settings.feedback.sending")
            ) : submitted ? (
              <>
                <Check size={14} className="mr-1.5" />
                {t("settings.feedback.sent")}
              </>
            ) : (
              <>
                <Send size={14} className="mr-1.5" />
                {t("settings.feedback.sendButton")}
              </>
            )}
          </Button>
        </form>
      </Section>

      <Separator />

      <Section title={t("settings.feedback.otherWaysSection")}>
        <p className="text-sm text-muted-foreground">
          {t("settings.feedback.otherWaysDesc")}
        </p>
      </Section>
    </div>
  );
}
