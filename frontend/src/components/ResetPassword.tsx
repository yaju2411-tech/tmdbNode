import React, { useState } from "react";
import useSignUpHook from "../hooks/useSignUpHook";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ResetPassword = () => {
    const backGround = "https://t3.ftcdn.net/jpg/03/60/06/66/360_F_360066662_HP5c8JZZ2LnTkwrYR7You9P2kmE1dz4k.jpg";
    const { forgotPassword } = useSignUpHook();
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await forgotPassword(email);
        if (res && res.success) {
            sessionStorage.setItem("reset_email", email);
            navigate("/reset-password-conform");
        } else {
            toast.error(res?.error || "Failed to send reset instructions");
        }
    };

    return (
        <div className="overflow-x-hidden w-full min-h-screen flex text-white bg-zinc-950 font-sans relative items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={backGround} alt="Cinematic Background" className="w-full h-full object-cover opacity-20 object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
            </div>

            <div className="w-full max-w-md p-8 sm:p-12 bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl z-10 relative">
                <div className="text-center sm:text-left mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Reset Password</h2>
                    <p className="text-sm text-gray-400">
                        Enter your email below and we'll send you instructions.
                    </p>
                </div>

                <form onSubmit={handleEmail} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-4 py-2.5 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-colors text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 bg-[#E50914] hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
                    >
                        Submit
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-8">
                    Remember your password?{" "}
                    <Link to="/loginPage" className="text-white hover:underline font-medium focus:outline-none">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
