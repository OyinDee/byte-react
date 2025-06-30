import React, { useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import LoadingPage from "../components/Loader";


const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const navigate = useNavigate();

  const verifyPayment = useCallback(async () => {
    if (reference) {
      try {
        await axios.get(
          `https://mongobyte.vercel.app/api/v1/pay/callback?reference=${reference}`
        );
        navigate("/user/profile");
      } catch (error) {
        // Handle error silently
      }
    }
  }, [reference, navigate]);

  useEffect(() => {
    if (reference) {
      verifyPayment();
    }
  }, [reference, verifyPayment]);

  return (
    <LoadingPage />
  );
};

export default CallbackPage;
