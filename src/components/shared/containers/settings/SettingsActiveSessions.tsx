import { useEffect, useState } from "react";
import { API_BASE } from "../../../../lib/utils";
import { toast } from "sonner";
import { Monitor, Smartphone, Trash2, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../ui/sheet";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";

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
  if (!userAgent) return { label: "Unknown device", mobile: false };
  const ua = userAgent.toLowerCase();
  const mobile = /mobile|android|iphone|ipad/.test(ua);
  if (ua.includes("chrome")) return { label: "Chrome", mobile };
  if (ua.includes("firefox")) return { label: "Firefox", mobile };
  if (ua.includes("safari")) return { label: "Safari", mobile };
  if (ua.includes("edg")) return { label: "Edge", mobile };
  return { label: "Unknown browser", mobile };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionsSheet({ open, onOpenChange }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_BASE}/api/user/sessions`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: Session[]) =>
        setSessions(
          data.sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0)),
        ),
      )

      .catch(() => toast.error("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, [open]);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      const res = await fetch(`${API_BASE}/api/user/sessions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Failed to revoke session");
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
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
          <SheetTitle>Active Sessions</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No active sessions found.
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
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.ipAddress ?? "Unknown IP"} · Signed in{" "}
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
