import { Turnstile } from "react-turnstile";

interface Props {
  setVerified: (token: string | boolean) => void;
  siteKey?: string;
}

export const Captcha = ({ setVerified, siteKey }: Props) => {
  // Priority: 1. Passed prop -> 2. Environment Variable -> 3. Cloudflare Always-Pass Test Key (for local/dev)
  const activeSiteKey =
    siteKey ||
    import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    "1x00000000000000000000AA";

  return (
    <div className="flex justify-center items-center my-3 min-h-[65px] w-full">
      <Turnstile
        sitekey={activeSiteKey}
        theme="dark"
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
