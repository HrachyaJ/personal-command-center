import { useNavigate } from "react-router";
import { signOut } from "../lib/auth-client";
import { toast } from "sonner";

export function useAuthActions() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/sign-in");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return { handleLogout };
}
