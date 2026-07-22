import { useNavigate } from "react-router-dom";
import { api } from "../servicies/api-client";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useSignUpHook = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // GOOGLE LOGIN
  const loginWithOAuth = async () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  // SIGNUP
  const signUp = async (
    email: string,
    password: string,
    captchaToken: string | boolean
  ) => {
    if (!captchaToken || typeof captchaToken !== "string") {
      toast.error("Please complete captcha");
      return false;
    }
    try {
      const name = email.split("@")[0];
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        captchaToken,
      });

      if (res.data.success) {
        toast.success(res.data.message || "OTP sent successfully.");
        return { success: true, requireOtp: true };
      }
      return { success: false };
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Signup failed");
      return { success: false };
    }
  };

  const verifySignupOtp = async (email: string, otp: string) => {
    if (!otp) {
      toast.error("OTP is required to complete verification");
      return false;
    }
    try {
      const verifyRes = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      if (verifyRes.data.success) {
        toast.success("Email verified successfully. You can now log in.");
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "OTP verification failed");
      return false;
    }
  };

  const resendSignupOtp = async (email: string) => {
    try {
      const res = await api.post("/auth/resend-otp", { email });
      if (res.data.success) {
        toast.success("OTP resent successfully. Check your email.");
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to resend OTP");
      return false;
    }
  };

  // SIGNIN
  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        await queryClient.invalidateQueries({
          queryKey: ["user"],
        });
        navigate("/app");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    }
  };

  // LOGOUT
  const logout = async (targetPath?: string) => {
    const redirectTo = typeof targetPath === "string" ? targetPath : "/";
    try {
      await api.get("/auth/logout");
      queryClient.removeQueries({
        queryKey: ["user"],
        exact: true
      });
      if (redirectTo) {
        navigate(redirectTo);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email: string) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.success) {
        sessionStorage.setItem("reset_email", email);
        return { success: true };
      }
      return { success: false, error: "Forgot password failed" };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  // UPDATE PASSWORD
  const updatePassword = async (password: string, otp: string) => {
    try {
      const email = sessionStorage.getItem("reset_email");
      if (!email) {
        toast.error("Email not found for password reset. Please try again.");
        return false;
      }
      if (!otp) {
        toast.error("OTP is required to reset password.");
        return false;
      }
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
      });
      if (res.data.success) {
        toast.success("Password reset successfully. You can now log in.");
        sessionStorage.removeItem("reset_email");
        navigate("/loginPage");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update password");
      return false;
    }
  };

  // GET SESSION
  const getSession = async () => { };

  // FETCH USER
  const { data: userData, isLoading, isFetching } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.success && res.data.user) {
          const profile = res.data.user;
          return {
            ...profile,
            avatar_url: profile.avatar?.url || "",
            isEmailVerified: profile.isEmailVerified,
            provider: profile.provider,
          };
        }
        return null;
      } catch (err) {
        console.error("Fetch user error:", err);
        return null;
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  // UPDATE PROFILE
  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, file }: { name: string; email: string; password: string; file: File | null; }) => {
      const formData = new FormData();
      formData.append("name", name);
      if (file) {
        formData.append("avatar", file);
      }
      const res = await api.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const resendPasswordResetOtp = async (email: string) => {
    try {
      const res = await api.post("/auth/resend-reset-otp", { email });
      if (res.data.success) {
        toast.success("Password reset OTP resent successfully.");
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to resend reset OTP");
      return false;
    }
  };

  const verifyPasswordResetOtp = async (email: string, otp: string) => {
    try {
      const res = await api.post("/auth/verify-reset-otp", { email, otp });
      if (res.data.success) {
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "OTP verification failed");
      return false;
    }
  };

  const provider = userData?.provider;
  return {
    loginWithOAuth,
    signUp,
    verifySignupOtp,
    resendSignupOtp,
    signIn,
    logout,
    forgotPassword,
    verifyPasswordResetOtp,
    resendPasswordResetOtp,
    updatePassword,
    getSession,
    userData,
    provider,
    isLoading,
    isFetching,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfileLoading: updateProfileMutation.isPending,
  };
};

export default useSignUpHook;