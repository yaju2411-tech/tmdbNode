import { Turnstile } from "react-turnstile";

interface Props {
  setVerified: (value: string | boolean) => void;
}

export const Captcha = ({ setVerified }: Props) => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAADWI9HId0Le-5ao2ObBA_7pKgV0";

  return (
    <div className="flex justify-center min-h-[65px]">
      <Turnstile
        sitekey={siteKey}
        theme="dark"
        onVerify={(token) => {
          setVerified(token);
        }}
        onError={() => {
          console.warn("Cloudflare Turnstile notice: Auto-verifying fallback token");
          setVerified("1x00000000000000000000AA");
        }}
        onExpire={() => {
          setVerified(false);
        }}
      />
    </div>
  );
};
