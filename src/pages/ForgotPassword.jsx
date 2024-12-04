import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RingLoader } from "react-spinners";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = [];

    if (step === 1 && !email.trim()) {
      newErrors.push("Email is required.");
    } else if (step === 2) {
      if (!resetCode.trim()) {
        newErrors.push("Reset code is required.");
      }
      if (!newPassword.trim()) {
        newErrors.push("New password is required.");
      }
      if (newPassword !== confirmPassword) {
        newErrors.push("Passwords do not match.");
      }
    }

    return newErrors;
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://mongobyte.onrender.com/api/v1/auth/forgot-password",
        { email }
      );

      if (response.status === 200) {
        setStep(2);
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://mongobyte.onrender.com/api/v1/auth/reset-password",
        {
          email,
          resetCode,
          newPassword,
        }
      );

      if (response.status === 200) {
        navigate("/login");
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
    <div className="relative min-h-screen bg-black">
      <div className="absolute inset-0">
        <img
          src="/Images/burger.jpg"
          alt="Burger Background"
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          className="z-0"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-accentwhite">
          <RingLoader
            color="#ff860d" 
            size={100}
            speedMultiplier={1.5}
          />
        </div>
      )}{" "}
      <div
        className={`relative z-10 flex items-center justify-center min-h-screen ${
          isLoading ? "hidden" : ""
        }`}
      >
        <form
          onSubmit={step === 1 ? handleRequestResetCode : handleResetPassword}
          className="bg-white bg-opacity-10 backdrop-blur-xs p-8 rounded-lg shadow-lg w-full max-w-md sm:w-84"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            {step === 1 ? "Request Reset Code" : "Reset Password"}
          </h2>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-600 text-white rounded-lg">
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="mb-2">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 1 ? (
            <div className="mb-4">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border text-black border-gray-300 rounded mt-1"
                placeholder="Enter your email address"
                required
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  id="resetCode"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full p-2 border text-black border-gray-300 rounded mt-1"
                  placeholder="Enter reset code"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border text-black border-gray-300 rounded mt-1"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border text-black border-gray-300 rounded mt-1"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            {step === 1 ? "Request Reset Code" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
