import { useEffect, useState } from "react";
import { api } from "../servicies/api-client";

export const useRole = () => {
    const [role, setRole] = useState<string|null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getRole = async () => {
            try {
                const res = await api.get("/auth/me");
                setRole(res.data.user?.role || "user");
            } catch (err) {
                console.error("Failed to fetch user role:", err);
                setRole("user");
            } finally {
                setLoading(false);
            }
        };
        getRole();
    }, []);
    return { role, loading };
};