import React, { useState, useEffect } from "react";
import useSignUpHook from "../../hooks/useSignUpHook";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../hooks/useTheme";

export const ResetPasswordConform = () => {
    const backGround = "https://t3.ftcdn.net/jpg/03/60/06/66/360_F_360066662_HP5c8JZZ2LnTkwrYR7You9P2kmE1dz4k.jpg";
    const { updatePassword, verifyPasswordResetOtp, resendPasswordResetOtp } = useSignUpHook();
    const [show, setShow] = useState(false);
    const [password, setPassword] = useState("");
    const [otpValue, setOtpValue] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isDark, toggleTheme } = useTheme();

    const urlEmail = searchParams.get("email");
    const urlOtp = searchParams.get("otp");

    const email = urlEmail || sessionStorage.getItem("reset_email");

    useEffect(() => {
        if (urlEmail) {
            sessionStorage.setItem("reset_email", urlEmail);
        }
        if (urlOtp) {
            setOtpValue(urlOtp);
            sessionStorage.setItem("reset_otp", urlOtp);
        }
        if (urlEmail && urlOtp && !isOtpVerified) {
            verifyPasswordResetOtp(urlEmail, urlOtp).then((success) => {
                if (success) {
                    setIsOtpVerified(true);
                    toast.success("Identity verified from email link!");
                }
            });
        }
    }, [urlEmail, urlOtp]);

    const handleVerifyOtp = async () => {
        if (!email) {
            toast.error("Email not found. Please restart the password reset process.");
            navigate("/reset-password");
            return;
        }
        if (!otpValue) {
            toast.error("Please enter the OTP");
            return;
        }
        const success = await verifyPasswordResetOtp(email, otpValue);
        if (success) {
            setIsOtpVerified(true);
            sessionStorage.setItem("reset_otp", otpValue);
            toast.success("OTP Verified Successfully");
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            toast.error("Email not found. Please restart the password reset process.");
            navigate("/reset-password");
            return;
        }
        await resendPasswordResetOtp(email);
    };

    const handlePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = sessionStorage.getItem("reset_otp");
        if (!otp || !isOtpVerified) {
            toast.error("Please verify OTP first");
            return;
        }
        const success = await updatePassword(password, otp);
        if (success) {
            sessionStorage.removeItem("reset_otp");
            sessionStorage.removeItem("reset_email");
            navigate("/loginPage");
        }
    };

    return (
        <div className="overflow-x-hidden w-full min-h-screen flex text-gray-900 dark:text-white bg-white dark:bg-zinc-950 font-sans relative items-center justify-center transition-colors">
            {/* Theme Toggle Floating Button */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-50 p-3 rounded-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-500 shadow-md transition-all"
                title="Toggle Light / Dark Mode"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={backGround} alt="Cinematic Background" className="w-full h-full object-cover opacity-20 dark:opacity-20 opacity-10 object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40 dark:from-zinc-950 dark:via-zinc-950/80 dark:to-zinc-950/40" />
            </div>

            <div className="w-full max-w-md p-8 sm:p-12 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-xl shadow-2xl z-10 relative">
                <div className="text-center sm:text-left mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Change Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Verify your OTP and create a new password.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* OTP Section */}
                    <div className="space-y-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900/30">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">OTP Code</label>
                            <input 
                                type="text"
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value)}
                                disabled={isOtpVerified}
                                placeholder="Enter OTP"
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900/50 backdrop-blur border border-gray-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-colors text-gray-900 dark:text-white disabled:opacity-50"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={isOtpVerified || !otpValue}
                                className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-md transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isOtpVerified ? "Verified ✓" : "Verify OTP"}
                            </button>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isOtpVerified}
                                className="px-4 py-2 bg-transparent border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white font-medium rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Resend
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handlePassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <div className="relative">
                                <input 
                                    type={show ? "text" : "password"} 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={!isOtpVerified}
                                    className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-zinc-900/50 backdrop-blur border border-gray-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-colors text-gray-900 dark:text-white disabled:opacity-50"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShow(!show)} 
                                    disabled={!isOtpVerified}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                                >
                                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!isOtpVerified || !password}
                            className="w-full py-2.5 bg-[#E50914] hover:bg-red-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Password
                        </button>
                        
                        <Link to="/loginPage" className="w-full flex items-center justify-center text-sm py-2.5 mt-2 bg-transparent border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-900 dark:text-white font-semibold rounded-md transition-colors">
                            Cancel
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
};
