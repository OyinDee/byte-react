import React from "react";
import { RingLoader } from "react-spinners";

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="z-10 flex flex-col items-center text-center">
        <RingLoader
          color="#FFD700" 
          size={100}
          speedMultiplier={1.5}
        />

        <p className="mt-2 text-gray-300">
          Please wait a moment while we prepare your meal.
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
