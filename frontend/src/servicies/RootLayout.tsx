import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useSignUpHook from "../hooks/useSignUpHook";
import { api } from "./api-client";
import { toast } from "sonner";

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, isLoading, logout } = useSignUpHook();

  useEffect(() => {
    if (isLoading) return;

    const path = location.pathname;
    const isAuthPage =
      path === "/loginPage" ||
      path === "/signUpPage";

    const isPublicPage = path === "/" || path === "/help" || path.startsWith("/receipt");

    // no session
    if (!userData && !isAuthPage && !isPublicPage) {
      navigate("/");
      return;
    }

    // if logged in but not verified
    if (userData && !userData.isEmailVerified && userData.provider !== 'google') {
      const handleUnverified = async () => {
        await logout("/loginPage");
        toast.error("Please verify your email first");
      };
      handleUnverified();
      return;
    }

    // logged in + verified
    if (userData && isAuthPage) {
      navigate("/app");
    }
  }, [location.pathname, userData, isLoading]);

  return <Outlet />;
}