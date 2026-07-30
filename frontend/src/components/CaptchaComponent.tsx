import { Turnstile } from "react-turnstile";

interface Props {
  setVerified: (value: string | boolean) => void;
}

export const Captcha = ({ setVerified }: Props) => {
  return (
    <div className="flex justify-center">
      <Turnstile
        sitekey={
          import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAADWI9HId0Le-5ao2ObBA_7pKgV0"
        }
        theme="dark"
        onVerify={(token) => {
          setVerified(token);
        }}
        onExpire={() => {
          setVerified(false);
        }}
      />
    </div>
  );
};
