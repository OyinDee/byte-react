import React from "react";
import { FaUtensils } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="text-center">
        <FaUtensils className="text-6xl mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">Oops!</h1>
        <p className="text-xl mb-6">
          It looks like the page you’re looking for is missing.
        </p>
        <p className="text-sm mb-8">
          Try going back to our{" "}
          <a href="/" className="text-yellow-400 hover:underline">
            homepage
          </a>{" "}
          or use the navigation menu to find what you’re looking for.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-yellow-400 text-black px-6 py-3 rounded hover:bg-yellow-500 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
