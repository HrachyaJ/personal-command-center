// src/hooks/useAuthActions.ts
import { useNavigate } from "react-router";
import { signOut } from "../lib/auth-client";

export function useAuthActions() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return { handleLogout };
}
