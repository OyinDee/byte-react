import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { RingLoader } from "react-spinners";


const CallbackPage = () => {
  const [paymentStatus, setPaymentStatus] = useState("Not Checked");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const navigate = useNavigate();

  const verifyPayment = useCallback(async () => {
    if (reference) {
      try {
        const response = await axios.get(
          `https://mongobyte.vercel.app/api/v1/pay/callback?reference=${reference}`
        );
        setPaymentStatus(response.data.status);
        navigate("/user/profile");
      } catch (error) {
        setPaymentStatus("Error");
      } finally {
        setLoading(false);
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
      <div className="flex flex-col items-center text-center z-10">
        <RingLoader
          color="#FFD700" // cheese color for the loader
          size={100}
          speedMultiplier={1.5}
        />
        </div>
    </div>
  );
};

export default CallbackPage;
