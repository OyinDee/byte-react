import React from "react";
import { RingLoader } from "react-spinners";

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center text-center z-10">
        <RingLoader
          color="#FFD700" // cheese color for the loader
          size={100}
          speedMultiplier={1.5}
        />

        <p className="text-gray-300 mt-2">
          Please wait a moment while we prepare your meal.
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
