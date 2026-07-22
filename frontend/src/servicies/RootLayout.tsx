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
      logout();
      navigate("/loginPage");
      toast.error("Please verify your email first");
      return;
    }

    // logged in + verified
    if (userData && isAuthPage) {
      navigate("/app");
    }
  }, [location.pathname, userData, isLoading]);

  useEffect(() => {
    const callExpire = async () => {
      try {
        await api.get("/cron/check-pending");
      } catch (err) {
        console.error("Cron failed", err);
      }
    };
    callExpire();
    const interval = setInterval(callExpire, 60000);
    return () => clearInterval(interval);
  }, []);

  return <Outlet />;
}