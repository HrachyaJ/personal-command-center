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
import { useTranslation } from "../../../hooks/useTranslation";

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

  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setAvatarPreview(resolveAvatarUrl(user.image));
    }
  }, [user]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.account.avatarTypeError"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.account.avatarSizeError"));
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
        toast.error(t("settings.account.avatarRemoveError"));
        return;
      }
      updateUser({ image: null });
      setAvatarPreview(null);
      toast.success(t("settings.account.avatarRemoved"));
    } catch {
      toast.error(t("settings.account.avatarRemoveError"));
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
            err instanceof Error
              ? err.message
              : toast.error(t("settings.account.avatarUploadError")),
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
        toast.error(t("settings.account.profileUpdateError"));
        return;
      }

      updateUser({
        name,
        email,
        ...(newImagePath ? { image: newImagePath } : {}),
      });
      toast.success(t("settings.account.profileUpdated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange() {
    if (!currentPw || !newPw) {
      toast.error(t("settings.account.passwordFieldsRequired"));
      return;
    }
    if (newPw.length < 8) {
      toast.error(t("settings.account.passwordTooShort"));
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
          toast.error(t("settings.account.passwordTooShort"));
        else if (msg.toLowerCase().includes("invalid"))
          toast.error(t("settings.account.passwordIncorrect"));
        else toast.error(t("settings.account.passwordUpdateError"));
        return;
      }
      toast.success(t("settings.account.passwordUpdated"));
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
      <Section title={t("settings.account.profileSection")}>
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
                {avatarPreview
                  ? t("settings.account.changePhoto")
                  : t("settings.account.uploadPhoto")}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t("settings.account.avatarHint")}
              </p>
              {hasUnsavedAvatar && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {t("settings.account.unsavedAvatar")}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="name" className="text-xs mb-1.5 block">
              {t("settings.account.displayName")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("settings.account.namePlaceholder")}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-xs mb-1.5 block">
              {t("settings.account.emailLabel")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("settings.account.emailPlaceholder")}
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
                t("settings.account.uploadingAvatar")
              ) : (
                t("settings.account.saving")
              )
            ) : saved ? (
              <>
                <Check size={14} className="mr-1.5" />{" "}
                {t("settings.account.saved")}
              </>
            ) : (
              t("settings.account.saveChanges")
            )}
          </Button>
        </div>
      </Section>

      <Separator />

      <Section title={t("settings.account.passwordSection")}>
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
              {t("settings.account.currentPassword")}
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
              {t("settings.account.newPassword")}
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
            {savingPassword
              ? t("settings.account.updating")
              : t("settings.account.updatePassword")}
          </Button>
        </form>
      </Section>
    </div>
  );
}
