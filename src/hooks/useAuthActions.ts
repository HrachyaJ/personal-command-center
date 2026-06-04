import { useNavigate } from "react-router";
import { signOut } from "../lib/auth-client";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "sonner";

export function useAuthActions() {
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);

  const handleLogout = async () => {
    try {
      await signOut();
      clearUser(); // also removes token + remembered user from localStorage
      navigate("/sign-in");
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return { handleLogout };
}
