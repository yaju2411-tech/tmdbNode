import { Turnstile } from "react-turnstile";

interface Props {
  setVerified: (value: string | boolean) => void;
}

export const Captcha = ({ setVerified }: Props) => {
  return (
    <div className="flex justify-center">
      <Turnstile
        sitekey={
          import.meta.env.VITE_TURNSTILE_SITE_KEY
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
