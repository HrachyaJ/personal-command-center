import { useEffect, useState } from "react";
import { API_BASE, authFetch } from "../../../lib/utils";
import { toast } from "sonner";
import { Monitor, Smartphone, Trash2, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { useTranslation } from "../../../hooks/useTranslation";

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

function parseDevice(userAgent: string | null): {
  label: string;
  mobile: boolean;
} {
  const { t } = useTranslation();

  if (!userAgent)
    return { label: t("settings.sessions.unknownDevice"), mobile: false };
  const ua = userAgent.toLowerCase();
  const mobile = /mobile|android|iphone|ipad/.test(ua);
  if (ua.includes("chrome")) return { label: "Chrome", mobile };
  if (ua.includes("firefox")) return { label: "Firefox", mobile };
  if (ua.includes("safari")) return { label: "Safari", mobile };
  if (ua.includes("edg")) return { label: "Edge", mobile };
  return { label: t("settings.sessions.unknownBrowser"), mobile };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionsSheet({ open, onOpenChange }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    authFetch(`${API_BASE}/api/user/sessions`)
      .then((r) => r.json())
      .then((data: Session[]) =>
        setSessions(
          data.sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0)),
        ),
      )
      .catch(() => toast.error(t("settings.sessions.loadError")))
      .finally(() => setLoading(false));
  }, [open]);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      const res = await authFetch(`${API_BASE}/api/user/sessions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error(t("settings.sessions.revokeError"));
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success(t("settings.sessions.revoked"));
    } catch {
      toast.error(t("settings.sessions.revokeError"));
    } finally {
      setRevoking(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-100 sm:max-w-none overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{t("settings.sessions.title")}</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("settings.sessions.empty")}
          </p>
        ) : (
          <ul className="space-y-3 pr-1">
            {sessions.map((s) => {
              const { label, mobile } = parseDevice(s.userAgent);
              const Icon = mobile ? Smartphone : Monitor;
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 m-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{label}</p>
                        {s.isCurrent && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 shrink-0"
                          >
                            {t("settings.sessions.current")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.ipAddress ?? t("settings.sessions.unknownIp")} ·
                        {t("settings.sessions.signedIn")}{" "}
                        {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                      disabled={revoking === s.id}
                      onClick={() => handleRevoke(s.id)}
                      aria-label="Revoke session"
                    >
                      {revoking === s.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
