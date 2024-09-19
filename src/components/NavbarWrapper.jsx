import React from "react";
import RestaurantNavbar from "./RestaurantNavbar";
import UserNavbar from "./UserNavbar";
import PublicNavbar from "./PublicNavbar";
import { useAuth } from "../context/authContext";
import { useLocation } from "react-router-dom";

const NavbarWrapper = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const renderNavbar = () => {
    if (
      pathname.startsWith("/restaurant") &&
      pathname !== "/restaurant/login"
    ) {
      return <RestaurantNavbar />;
    } else if (pathname.startsWith("/user")) {
      return <UserNavbar />;
    } else {
      return <PublicNavbar />;
    }
  };

  return <>{renderNavbar()}</>;
};

export default NavbarWrapper;
