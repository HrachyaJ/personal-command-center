import { useState, useRef, useCallback } from "react";
import { useUserStore } from "../../../../stores/useUserStore";
import { API_BASE } from "../../../../lib/utils";
import { toast } from "sonner";
import { Section } from "./SettingsSection";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Check, Lock, Upload, X } from "lucide-react";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";

function getInitials(name?: string, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

/** Stored paths like "/avatars/id.jpg" need the API origin prepended. */
function resolveAvatarUrl(image?: string | null): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
}

export function AccountTab() {
  const { user, update: updateUser } = useUserStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // avatarPreview holds a blob URL (local pick) or a resolved http URL (persisted)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    resolveAvatarUrl(user?.image),
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveAvatar = async () => {
    if (avatarFile) {
      // Just a local preview — revert to the saved avatar (or nothing)
      setAvatarPreview(resolveAvatarUrl(user?.image));
      setAvatarFile(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: "DELETE",
        credentials: "include",
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
    const res = await fetch(`${API_BASE}/api/user/avatar`, {
      method: "POST",
      credentials: "include",
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
          // Show the resolved URL immediately so the preview updates
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
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div
                className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-colors ${
                  isDragging ? "border-blue-500 border-dashed" : "border-border"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarPreview(null)}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-sm select-none">
                    {initials}
                  </div>
                )}
              </div>

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
