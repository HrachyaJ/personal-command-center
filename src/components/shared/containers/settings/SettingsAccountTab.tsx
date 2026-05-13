import { useState } from "react";
import { useUserStore } from "../../../../stores/useUserStore";
import { API_BASE } from "../../../../lib/utils";
import { toast } from "sonner";
import { Section } from "./SettingsSection";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Check, Lock } from "lucide-react";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";

export function AccountTab() {
  const { user, update: updateUser } = useUserStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSave() {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        toast.error("Failed to update profile");
        return;
      }
      updateUser({ name, email });
      toast.success("Profile updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange() {
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "Failed to update password";
        if (msg.toLowerCase().includes("short"))
          toast.error("Password must be at least 8 characters");
        else if (msg.toLowerCase().includes("invalid"))
          toast.error("Current password is incorrect");
        else toast.error(msg);
        return;
      }
      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <Section title="Profile">
        <div className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs mb-1.5 block">
              Display name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs mb-1.5 block">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={savingProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {savingProfile ? (
              "Saving..."
            ) : saved ? (
              <>
                <Check size={14} className="mr-1.5" /> Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </Section>

      <Separator />

      <Section title="Password">
        <div className="space-y-3">
          <div>
            <Label htmlFor="current-pw" className="text-xs mb-1.5 block">
              Current password
            </Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="new-pw" className="text-xs mb-1.5 block">
              New password
            </Label>
            <Input
              id="new-pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            className="cursor-pointer"
            size="sm"
            variant="outline"
            onClick={handlePasswordChange}
            disabled={savingPassword}
          >
            <Lock size={14} className="mr-1.5" />
            {savingPassword ? "Updating..." : "Update password"}
          </Button>
        </div>
      </Section>
    </div>
  );
}
