import React, { useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { RingLoader } from "react-spinners";


const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const navigate = useNavigate();

  const verifyPayment = useCallback(async () => {
    if (reference) {
      try {
        await axios.get(
          `https://mongobyte.onrender.com/api/v1/pay/callback?reference=${reference}`
        );
        navigate("/user/profile");
      } catch (error) {
        // Handle error silently
        console.error("Payment verification error:", error);
      }
    }
  }, [reference, navigate]);

  useEffect(() => {
    if (reference) {
      verifyPayment();
    }
  }, [reference, verifyPayment]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="z-10 flex flex-col items-center text-center">
        <RingLoader
          color="#ff860d" 
          size={100}
          speedMultiplier={1.5}
        />
        </div>
    </div>
  );
};

export default CallbackPage;
