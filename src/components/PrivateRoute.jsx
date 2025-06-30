import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import LoadingPage from "./Loader";

const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const { auth, loading } = useAuth();
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!auth) {
        setRedirect("/login");
      } else if (
        allowedRoles.length > 0 && 
        !(auth.user && allowedRoles.includes(auth.user.role))
      ) {
        // If specific roles are required and user doesn't have permission
        setRedirect(auth.restaurant ? "/restaurant/dashboard" : "/user");
      } else if (auth.user && auth.user.role === "superadmin" && (window.location.pathname.startsWith("/restaurant") || window.location.pathname.startsWith("/user"))) {
        setRedirect("/superadmin/dashboard");
      } else if (auth.user && window.location.pathname.startsWith("/restaurant") && !window.location.pathname.includes("/restaurant/signup")) {
        setRedirect("/user");
      } else if (auth.restaurant && window.location.pathname.startsWith("/user")) {
        setRedirect("/restaurant/dashboard");
      }
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
