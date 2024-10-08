import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Loader";
import 'react-toastify/dist/ReactToastify.css';

const FundPage = () => {
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [tab, setTab] = useState("fund");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const NAIRA_TO_BYTES_RATE = 1;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            "https://mongobyte.onrender.com/api/v1/users/getProfile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data.user);
        } catch (error) {
          toast.error("Failed to load user data. Please try again later.");
        }
      } else {
        toast.error("No user token found. Please log in.");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleAmountChange = (e) => {
    const inputAmount = parseFloat(e.target.value);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      setAmount("");
      setFee(0);
      setTotal(0);
      setBytes(0);
    } else {
      const calculatedFee = inputAmount * 0.05;
      const calculatedTotal = inputAmount + calculatedFee;
      const calculatedBytes = inputAmount * NAIRA_TO_BYTES_RATE;
      setAmount(inputAmount);
      setFee(calculatedFee);
      setTotal(calculatedTotal);
      setBytes(calculatedBytes);
    }
  };

  const handleContinue = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://mongobyte.onrender.com/api/v1/pay/pay",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: total }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || "An error occurred");
      }
    } catch (error) {
      toast.error("Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }

    if (!recipientUsername || !transferAmount || transferAmount <= 0) {
      toast.error("Please provide valid recipient username and transfer amount.");
      return;
    }

    setTransferLoading(true);

    try {
      const response = await axios.post(
        "https://mongobyte.onrender.com/api/v1/users/transfer",
        {
          recipientUsername,
          amount: transferAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Transfer Successful: ${response.data.message}`);
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Transfer failed";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setTransferLoading(false);
    }
  };

  if (!user) {
    return <Loading />;
  }

  return (
    <main className="flex items-center justify-center min-h-screen text-black bg-white">
      <div className="w-full max-w-md p-8 mx-5 bg-gray-100 rounded-lg shadow-md">
        <ToastContainer position="top-right" reverseOrder={false} />
        <div className="mb-6 text-center">
          <p className="text-xl font-semibold">
            Balance: <span className="text-black">₦{user.byteBalance}</span>
          </p>
        </div>

        <div className="flex mb-4">
          <button
            onClick={() => setTab("fund")}
            className={`flex-1 py-2 font-semibold ${
              tab === "fund" ? "bg-black text-white" : "bg-gray-100 text-black"
            } rounded-l-md border border-gray-300`}
          >
            Fund
          </button>
          <button
            onClick={() => setTab("transfer")}
            className={`flex-1 py-2 font-semibold ${
              tab === "transfer" ? "bg-black text-white" : "bg-gray-100 text-black"
            } rounded-r-md border border-gray-300`}
          >
            Transfer
          </button>
        </div>

        {tab === "fund" ? (
          <div>
            <h1 className="text-2xl font-semibold text-center text-black">Fund Your Account</h1>
            <form className="mt-6 space-y-4">
              <div>
                <label htmlFor="fundAmount" className="block text-lg font-medium">
                  Enter Amount to Fund
                </label>
                <input
                  type="number"
                  id="fundAmount"
                  onChange={handleAmountChange}
                  value={amount === "" ? "" : amount}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                  placeholder="Enter amount"
                />
              </div>

              {amount !== "" && (
                <div className="mt-4">
                  <p className="text-lg font-medium">
                    <span className="text-gray-600">Funding Amount:</span> ₦{amount.toFixed(2)}
                  </p>
                  <p className="text-lg font-medium">
                    <span className="text-gray-600">Fee (5%):</span> ₦{fee.toFixed(2)}
                  </p>
                  <p className="text-lg font-semibold text-black">
                    <span className="text-gray-500">Total Amount:</span> ₦{total.toFixed(2)}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleContinue}
                className="w-full px-4 py-2 font-semibold text-white transition duration-200 bg-black rounded-md hover:bg-gray-800"
                disabled={amount === "" || total <= 0 || loading}
              >
                {loading ? "Processing..." : "Continue"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold text-center text-black">Transfer Bytes</h1>
            <form className="mt-6 space-y-4">
              <div>
                <label htmlFor="transferAmount" className="block text-lg font-medium">
                  Enter Amount to Transfer
                </label>
                <input
                  type="number"
                  id="transferAmount"
                  value={transferAmount === "" ? "" : transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label htmlFor="recipientUsername" className="block text-lg font-medium">
                  Recipient Username
                </label>
                <input
                  type="text"
                  id="recipientUsername"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                  placeholder="Recipient username"
                />
              </div>

              <button
                type="button"
                onClick={handleTransfer}
                className="w-full px-4 py-2 font-semibold text-white transition duration-200 bg-black rounded-md hover:bg-gray-800"
                disabled={!recipientUsername || !transferAmount || transferAmount <= 0 || transferLoading}
              >
                {transferLoading ? "Transferring..." : "Transfer"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
};

export default FundPage;
