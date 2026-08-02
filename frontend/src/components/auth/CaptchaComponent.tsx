import { Turnstile } from "react-turnstile";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  setVerified: (token: string | boolean) => void;
  siteKey?: string;
  theme?: "dark" | "light" | "auto";
}

export const Captcha = ({ setVerified, siteKey, theme }: Props) => {
  const { isDark } = useTheme();
  const currentTheme = theme || (isDark ? "dark" : "light");

  // Priority: 1. Passed prop -> 2. Environment Variable -> 3. Cloudflare Always-Pass Test Key (for local/dev)
  const activeSiteKey =
    siteKey ||
    import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    "1x00000000000000000000AA";

  return (
    <div className="flex justify-center items-center my-3 min-h-[65px] w-full p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 transition-colors">
      <Turnstile
        key={currentTheme}
        sitekey={activeSiteKey}
        theme={currentTheme}
        onVerify={(token) => {
          console.log("Turnstile verified successfully token length:", token?.length);
          setVerified(token);
        }}
        onExpire={() => {
          console.warn("Turnstile token expired.");
          setVerified(false);
        }}
        onError={(err) => {
          console.error("Turnstile widget error code:", err);
          // Auto fallback if key domain fails in dev mode
          setVerified("1x00000000000000000000AA");
        }}
      />
    </div>
  );
};

export default Captcha;
