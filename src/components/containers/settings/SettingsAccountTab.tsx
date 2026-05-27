import { useState, useRef, useCallback, useEffect } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import { API_BASE, authFetch } from "../../../lib/utils";
import { toast } from "sonner";
import { Section } from "./SettingsSection";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Check, Lock, Upload, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { getInitials, resolveAvatarUrl } from "../../../lib/avatar";

export function AccountTab() {
  const { user, update: updateUser } = useUserStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    resolveAvatarUrl(user?.image),
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setAvatarPreview(resolveAvatarUrl(user.image));
    }
  }, [user]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleRemoveAvatar = async () => {
    if (avatarFile) {
      setAvatarPreview(resolveAvatarUrl(user?.image));
      setAvatarFile(null);
      return;
    }
    try {
      const res = await authFetch(`${API_BASE}/api/user/avatar`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to remove avatar");
        return;
      }
      updateUser({ image: null });
      setAvatarPreview(null);
      toast.success("Avatar removed");
    } catch {
      toast.error("Failed to remove avatar");
    }
  };

  async function uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);
    // Note: don't set Content-Type header for FormData — browser sets it with boundary
    const res = await authFetch(`${API_BASE}/api/user/avatar`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to upload avatar");
    }
    const data = await res.json();
    if (!data.image) throw new Error("Server did not return an image URL");
    return data.image as string;
  }

  async function handleSave() {
    setSavingProfile(true);
    try {
      let newImagePath: string | undefined;

      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          newImagePath = await uploadAvatar(avatarFile);
          setAvatarPreview(resolveAvatarUrl(newImagePath));
          setAvatarFile(null);
        } catch (err: unknown) {
          toast.error(
            err instanceof Error ? err.message : "Failed to upload avatar",
          );
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const res = await authFetch(`${API_BASE}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        toast.error("Failed to update profile");
        return;
      }

      updateUser({
        name,
        email,
        ...(newImagePath ? { image: newImagePath } : {}),
      });
      toast.success("Profile updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange() {
    if (!currentPw || !newPw) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authFetch(`${API_BASE}/api/user/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg: string = data.error ?? "Failed to update password";
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

  const initials = getInitials(name, email);
  const hasUnsavedAvatar = !!avatarFile;

  return (
    <div className="space-y-6">
      <Section title="Profile">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage
                  src={avatarPreview ?? undefined}
                  alt="Avatar preview"
                />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Remove avatar"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer text-xs h-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Upload size={13} className="mr-1.5" />
                {avatarPreview ? "Change photo" : "Upload photo"}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF · max 5 MB
              </p>
              {hasUnsavedAvatar && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Unsaved — click "Save changes" to apply
                </p>
              )}
            </div>
          </div>

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
            disabled={savingProfile || uploadingAvatar}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {savingProfile ? (
              uploadingAvatar ? (
                "Uploading avatar..."
              ) : (
                "Saving..."
              )
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordChange();
          }}
          className="space-y-3"
        >
          <input
            type="text"
            autoComplete="username"
            value={email}
            readOnly
            className="sr-only"
            tabIndex={-1}
          />
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
              autoComplete="current-password"
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
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            className="cursor-pointer"
            size="sm"
            variant="outline"
            disabled={savingPassword}
          >
            <Lock size={14} className="mr-1.5" />
            {savingPassword ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Section>
    </div>
  );
}
