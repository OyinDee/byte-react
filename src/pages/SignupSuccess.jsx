import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUpSuccess = () => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send verification code to backend
      const response = await axios.get(
        "https://mongobyte.onrender.com/api/v1/auth/verify-email",
        { params: { code: verificationCode } }
      );
      if (response.status === 200) {
        navigate("/login");
      } else {
        setErrors(["Unexpected response from server."]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { response } = error;
        if (response) {
          const { data } = response;
          setErrors([data.message || "An error occurred. Please try again."]);
        } else {
          setErrors(["Network error. Please check your connection."]);
        }
      } else if (error instanceof Error) {
        setErrors([error.message || "An error occurred. Please try again."]);
      } else {
        setErrors(["An unexpected error occurred."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-olive">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/Images/burger.jpg"
          alt="Burger Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Verification Form */}
      <div className="text-accentwhite relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white bg-opacity-20 backdrop-blur-xs p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-6">Sign Up Successful!</h2>
          <p className="mb-4">
            Congratulations! Your account has been created.
          </p>
          <p className="mb-6">
            Please enter the verification code sent to your email:
          </p>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-pepperoni text-white rounded-lg">
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="mb-2">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-2 border border-gray-300 text-black rounded mt-1"
                placeholder="Enter verification code"
                required
                disabled={isLoading} // Disable input while loading
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded-lg transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="mt-4">
            <a
              href="/signup"
              className="w-full text-white py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Go back
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpSuccess;
