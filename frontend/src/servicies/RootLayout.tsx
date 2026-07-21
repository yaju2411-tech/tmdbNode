import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./api-client";

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const path = location.pathname;
      const isAuthPage =
        path === "/loginPage" ||
        path === "/loginUpPage";
      // no session
      if (!session && !isAuthPage) {
        navigate("/");
        return;
      }
      // verified check
      const verified =
        !!session?.user?.email_confirmed_at;
      // if not verified
      if (session && !verified) {
        await supabase.auth.signOut();
        navigate("/loginPage");
        alert(
          "Please verify your email first"
        );
        return;
      }
      // logged in + verified
      if (session && isAuthPage) {
        navigate("/app");
      }
    };
    checkSession();
    const { data: listener } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const path = location.pathname;
          const isAuthPage =
            path === "/loginPage" ||
            path === "/signUpPage";
          // logout
          if (!session && !isAuthPage) {
            navigate("/");
            return;
          }
          // verify check
          const verified =
            !!session?.user?.email_confirmed_at;
          if (session && !verified) {
            await supabase.auth.signOut();
            navigate("/loginPage");
            alert(
              "Verify your email first"
            );
            return;
          }
          // verified login
          if (session && isAuthPage) {
            navigate("/app");
          }
        }
      );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [location.pathname]);

  useEffect(() => {
    const callExpire = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(
        "https://jjrrlixvqkfypmfomcfl.supabase.co/functions/v1/expire-pending",
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );
    };
    callExpire();
    const interval = setInterval(callExpire, 60000);
    return () => clearInterval(interval);
  }, []);

  return <Outlet />;
}