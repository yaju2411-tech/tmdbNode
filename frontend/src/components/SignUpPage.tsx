import { Navigate } from "react-router-dom";
import React from "react";

export default function SignUpPage() {
  return <Navigate to="/loginPage" replace state={{ isSignUp: true }} />;
}
