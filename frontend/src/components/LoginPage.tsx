import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useSignUpHook from "../hooks/useSignUpHook";
import { motion, AnimatePresence } from "framer-motion";
import { Captcha } from "./CaptchaComponent";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { useTheme } from "../hooks/useTheme";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [verified, setVerified] = useState<string | boolean>(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const { isDark, toggleTheme } = useTheme();
  const {
    loginWithOAuth,
    signIn,
    signUp,
    verifySignupOtp,
    resendSignupOtp,
  } = useSignUpHook();

  const cinematicBg = "https://t3.ftcdn.net/jpg/03/60/06/66/360_F_360066662_HP5c8JZZ2LnTkwrYR7You9P2kmE1dz4k.jpg";

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // RESET CAPTCHA WHEN MODE CHANGES
  useEffect(() => {
    setVerified(false);
  }, [isLogin]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!isLogin && !verified) {
      alert("Please complete captcha");
      return;
    }

    // LOGIN
    if (isLogin) {
      await signIn(email, password);
    }

    // SIGNUP
    else {
      const result = await signUp(email, password, verified);
      if (result && result.requireOtp) {
        setShowOtpDialog(true);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const success = await verifySignupOtp(email, otpValue);
    if (success) {
      setToastMsg("Signup successful. You can now login.");
      setShowOtpDialog(false);
      setIsLogin(true);
      setEmail("");
      setPassword("");
      setOtpValue("");
    }
  };

  const variants = {
    initial: {
      opacity: 0,
      x: 20,
    },

    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },

    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div
      className={`overflow-x-hidden w-full min-h-screen flex text-gray-900 dark:text-white bg-white dark:bg-zinc-950 font-sans relative flex-col-reverse lg:flex-row transition-colors ${isLogin
        ? "lg:flex-row"
        : "lg:flex-row-reverse"
        }`}
    >
      {/* Theme Toggle Floating Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-500 shadow-md transition-all"
        title="Toggle Light / Dark Mode"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* TOAST */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            className="absolute top-6 left-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl font-semibold"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT IMAGE */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="hidden lg:block w-1/2 relative overflow-hidden"
      >
        <img
          src={cinematicBg}
          alt="bg"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* RIGHT FORM */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-[420px] space-y-7">

          {/* TITLE */}
          <div>
            <h2 className="text-3xl font-bold">
              {isLogin
                ? "Welcome Back"
                : "Create Account"}
            </h2>

            <p className="text-zinc-400 mt-2">
              {isLogin
                ? "Login to continue"
                : "Signup to get started"}
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  isLogin
                    ? "login"
                    : "signup"
                }
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-5"
              >
                {/* EMAIL */}
                <div>
                  <label className="text-sm text-gray-700 dark:text-zinc-300 font-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="m@example.com"
                    className="w-full mt-2 px-4 py-3 rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:border-red-600 transition-all"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-zinc-300 font-semibold">
                      Password
                    </label>

                    {isLogin && (
                      <Link
                        to="/reset-password"
                        className="text-xs text-red-600 dark:text-red-500 hover:underline font-semibold"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>

                  <div className="relative mt-2">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:border-red-600 transition-all"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin &&
                  <Captcha setVerified={setVerified} />}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={!isLogin && !verified}
                  className={`w-full py-3 rounded-md font-semibold text-white transition-all ${isLogin || verified
                    ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-950/20"
                    : "bg-gray-300 dark:bg-zinc-800 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {isLogin
                    ? "Sign In"
                    : "Sign Up"}
                </button>
              </motion.div>
            </AnimatePresence>
          </form>

          {/* DIVIDER */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-zinc-800" />
            </div>

            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-950 px-3 text-gray-500 dark:text-zinc-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* GOOGLE */}
          <button
            type="button"
            onClick={() => {
              if (!isLogin && !verified) {
                toast.error("Complete captcha first");
                return;
              }
              loginWithOAuth();
            }}
            disabled={!isLogin && !verified}
            className={`w-full py-3 rounded-md border text-gray-900 dark:text-white transition-all ${isLogin || verified
              ? "bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border-gray-300 dark:border-zinc-700"
              : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 cursor-not-allowed text-gray-400"
              }`}
          >
            Continue with Google
          </button>

          {/* SWITCH */}
          <p className="text-center text-sm text-zinc-400">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              onClick={() =>
                setIsLogin(!isLogin)
              }
              className="ml-2 text-white font-medium hover:underline"
            >
              {isLogin
                ? "Sign Up"
                : "Sign In"}
            </button>
          </p>
        </div>
      </motion.div>

      {/* OTP DIALOG */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-950 text-white border border-zinc-800">
          <DialogHeader>
            <DialogTitle>Email Verification</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please enter the OTP verification code sent to your email.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-red-600"
            />
          </div>
          <DialogFooter className="sm:justify-between items-center w-full">
            <Button
              type="button"
              variant="link"
              onClick={() => resendSignupOtp(email)}
              className="text-zinc-400 hover:text-white px-0"
            >
              Resend OTP
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOtpDialog(false)}
                className="bg-transparent border-zinc-800 text-white hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleVerifyOtp} className="bg-red-600 hover:bg-red-700 text-white">
                Verify
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}