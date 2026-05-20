import { useState } from "react";
import { Section } from "./SettingsSection";
import { Row } from "./SettingsRow";
import { Switch } from "../../../ui/switch";
import { Separator } from "../../../ui/separator";
import { useNavigate } from "react-router";
import { signOut } from "../../../../lib/auth-client";
import { API_BASE } from "../../../../lib/utils";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
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
} from "../../../ui/alert-dialog";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";

export function PrivacyTab() {
  const [twoFa, setTwoFa] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "Failed to delete account";
        if (msg.toLowerCase().includes("password"))
          toast.error("Incorrect password");
        else toast.error(msg);
        return;
      }
      toast.success("Account deleted");
      await signOut();
      navigate("/sign-in");
    } finally {
      setDeletingAccount(false);
      setDeletePassword("");
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Security">
        <Row
          label="Two-factor authentication"
          description="Add an extra layer of security to your account"
        >
          <Switch
            checked={twoFa}
            onCheckedChange={(val) => {
              setTwoFa(val);
              toast.info(
                val
                  ? "2FA coming soon — this feature is under development."
                  : "2FA disabled.",
              );
            }}
          />
        </Row>
        <Row
          label="Active sessions"
          description="Manage where you're logged in"
        >
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer text-xs h-8 gap-1.5"
            onClick={() => toast.info("Session management coming soon.")}
          >
            Manage
            <ChevronRight size={12} />
          </Button>
        </Row>
      </Section>

      <Separator />

      <Section title="Data">
        <Row
          label="Export your data"
          description="Download a copy of all your tasks, goals, and habits"
        >
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer text-xs h-8"
            onClick={() => toast.info("Data export coming soon.")}
          >
            <Globe size={13} className="mr-1.5" />
            Export
          </Button>
        </Row>
      </Section>

      <Separator />

      <Section title="Danger zone">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <Row label="Sign out everywhere" description="Log out of all devices">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut size={13} className="mr-1.5" />
              Sign out
            </Button>
          </Row>
          <Separator className="bg-destructive/20" />
          <Row
            label="Delete account"
            description="Permanently remove your data"
          >
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={13} className="mr-1.5" />
              Delete
            </Button>
          </Row>
        </div>
      </Section>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of FocusFlow?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign back in to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLogout}
            >
              Log out
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
              Delete account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data
              — tasks, goals, habits, and settings. This action{" "}
              <strong>cannot</strong> be undone.
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
            {/* Hidden username so browsers correctly associate this as a credential field */}
            <input
              type="text"
              autoComplete="username"
              className="sr-only"
              readOnly
              tabIndex={-1}
            />
            <Label htmlFor="delete-confirm-pw" className="text-xs mb-1.5 block">
              Confirm your password to continue
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
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              type="submit"
              form="delete-account-form"
              disabled={!deletePassword || deletingAccount}
            >
              {deletingAccount ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
