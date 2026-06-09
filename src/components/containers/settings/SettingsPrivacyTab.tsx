import { useState } from "react";
import { Section } from "./SettingsSection";
import { Row } from "./SettingsRow";
import { Switch } from "../../ui/switch";
import { Separator } from "../../ui/separator";
import { useNavigate } from "react-router";
import { signOut } from "../../../lib/auth-client";
import { API_BASE, authFetch } from "../../../lib/utils";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { ChevronRight, Globe, LogOut, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { useUserStore } from "../../../stores/useUserStore";
import { SessionsSheet } from "./SettingsActiveSessions";
import { translate } from "../../../lib/i18n";
import { useLocaleStore } from "../../../stores/useLocaleStore";

export function PrivacyTab() {
  const locale = useLocaleStore((s) => s.locale);
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);

  const [twoFa, setTwoFa] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);

  const handleLogout = async () => {
    await signOut();
    clearUser();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await authFetch(`${API_BASE}/api/user/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? t("settings.privacy.deleteAccountError");
        if (msg.toLowerCase().includes("password"))
          toast.error(t("settings.privacy.incorrectPassword"));
        else toast.error(msg);
        return;
      }
      toast.success(t("settings.privacy.accountDeleted"));
      await signOut();
      clearUser();
      navigate("/sign-in");
    } finally {
      setDeletingAccount(false);
      setDeletePassword("");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/user/export`);
      if (!res.ok) {
        toast.error(t("settings.privacy.exportError"));
        return;
      }
      const blob = new Blob([await res.arrayBuffer()], {
        type: "application/pdf",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "focusflow-export.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(t("settings.privacy.exportSuccess"));
    } catch {
      toast.error(t("settings.privacy.exportError"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Section title={t("settings.privacy.securitySection")}>
        <Row
          label={t("settings.privacy.twoFa")}
          description={t("settings.privacy.twoFaDesc")}
        >
          <Switch
            checked={twoFa}
            onCheckedChange={(val) => {
              setTwoFa(val);
              toast.info(
                val
                  ? t("settings.privacy.twoFaComingSoon")
                  : t("settings.privacy.twoFaDisabled"),
              );
            }}
          />
        </Row>
        <Row
          label={t("settings.privacy.activeSessions")}
          description={t("settings.privacy.activeSessionsDesc")}
        >
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer text-xs h-8 gap-1.5"
            onClick={() => setSessionsOpen(true)}
          >
            {t("settings.privacy.manageBtn")} <ChevronRight size={12} />
          </Button>
        </Row>
      </Section>

      <Separator />

      <Section title={t("settings.privacy.dataSection")}>
        <Row
          label={t("settings.privacy.exportData")}
          description={t("settings.privacy.exportDataDesc")}
        >
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer text-xs h-8"
            onClick={handleExport}
            disabled={exporting}
          >
            <Globe size={13} className="mr-1.5" />
            {exporting
              ? t("settings.privacy.exporting")
              : t("settings.privacy.exportBtn")}
          </Button>
        </Row>
      </Section>

      <Separator />

      <Section title={t("settings.privacy.dangerSection")}>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <Row
            label={t("settings.privacy.signOutEverywhere")}
            description={t("settings.privacy.signOutEverywhereDesc")}
          >
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut size={13} className="mr-1.5" />
              {t("settings.privacy.signOutBtn")}
            </Button>
          </Row>
          <Separator className="bg-destructive/20" />
          <Row
            label={t("settings.privacy.deleteAccount")}
            description={t("settings.privacy.deleteAccountDesc")}
          >
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={13} className="mr-1.5" />
              {t("settings.privacy.deleteBtn")}
            </Button>
          </Row>
        </div>
      </Section>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.privacy.logoutTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.privacy.logoutDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLogout}
            >
              {t("settings.privacy.logoutConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletePassword("");
        }}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {t("settings.privacy.deleteDialogTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.privacy.deleteDialogDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form
            id="delete-account-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (deletePassword) handleDeleteAccount();
            }}
            className="px-1 py-2"
          >
            <input
              type="text"
              autoComplete="username"
              className="sr-only"
              readOnly
              tabIndex={-1}
            />
            <Label htmlFor="delete-confirm-pw" className="text-xs mb-1.5 block">
              {t("settings.privacy.confirmPasswordLabel")}
            </Label>
            <Input
              id="delete-confirm-pw"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setDeletePassword("")}
            >
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              type="submit"
              form="delete-account-form"
              disabled={!deletePassword || deletingAccount}
            >
              {deletingAccount
                ? t("settings.privacy.deleting")
                : t("settings.privacy.deleteAccountConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SessionsSheet open={sessionsOpen} onOpenChange={setSessionsOpen} />
    </div>
  );
}
