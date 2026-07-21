import { useEffect, useState } from "react";
import { supabase } from "./api-client";
import {Navigate} from "react-router-dom";
import React from "react";

export const ProtectedRoutes = async({children}:any) => {
    const [session,setSession] = useState(undefined);

    useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      setSession(data.session);
    });
    },[]);

    if(session === undefined) return <p>Loading...</p>
    return session ? children : <Navigate to={"/loginPage"}/> 
};