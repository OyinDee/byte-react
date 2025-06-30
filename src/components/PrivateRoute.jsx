import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import LoadingPage from "./Loader";

const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const { auth, loading } = useAuth();
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (loading) return;
    const path = window.location.pathname;
    if (!auth) {
      if (path !== "/login") setRedirect("/login");
      return;
    }


    // Superadmin logic (only user.superAdmin)
    if (auth.user && auth.user.superAdmin) {
      if (!path.startsWith("/superadmin")) {
        setRedirect("/superadmin/dashboard");
      }
      return;
    }

    // Role-based access (treat allowedRoles=["superadmin"] as user.superAdmin)
    if (allowedRoles.length > 0) {
      if (allowedRoles.includes("superadmin")) {
        if (!(auth.user && auth.user.superAdmin)) {
          setRedirect(auth.restaurant ? "/restaurant/dashboard" : "/user");
          return;
        }
      } else if (!(auth.user && allowedRoles.includes(auth.user.role))) {
        setRedirect(auth.restaurant ? "/restaurant/dashboard" : "/user");
        return;
      }
    }

    // Restaurant logic
    if (auth.user && path.startsWith("/restaurant") && !path.includes("/restaurant/signup")) {
      setRedirect("/user");
      return;
    }
    if (auth.restaurant && path.startsWith("/user")) {
      setRedirect("/restaurant/dashboard");
      return;
    }
  }, [loading, auth, allowedRoles]);

  if (loading) {
    return <LoadingPage />;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return element;
};

export default PrivateRoute;
