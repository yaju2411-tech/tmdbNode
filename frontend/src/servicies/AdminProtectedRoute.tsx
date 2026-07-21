import { Navigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import React from "react";

export const AdminProtectedRoute = ({children}:any) => {
    const {role,loading} = useRole();
    if(loading) return <p>Loading...</p>
    
    if(role !== "admin"){
        return (<>
            <Navigate to={"/app"} replace/>
        </>);
    }
    return children;
};