import { useEffect, useState } from "react";
import { api } from "./api-client";
import { Navigate } from "react-router-dom";
import React from "react";

export const ProtectedRoutes = ({children}:any) => {
    const [user, setUser] = useState<any>(undefined);

    useEffect(() => {
        api.get("/auth/me")
            .then(({ data }) => {
                setUser(data.user || null);
            })
            .catch(() => {
                setUser(null);
            });
    }, []);

    if (user === undefined) return <p>Loading...</p>;
    return user ? children : <Navigate to={"/loginPage"} />;
};