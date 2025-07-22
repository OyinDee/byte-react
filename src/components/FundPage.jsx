import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import LoadingPage from "./Loader";
import { 
  FaWallet, 
  FaExchangeAlt, 
  FaUser, 
  FaMoneyBillWave, 
  FaCalculator,
  FaCreditCard,
  FaPaperPlane
} from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';

const FundPage = () => {
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [tab, setTab] = useState("fund");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            "https://mongobyte.vercel.app/api/v1/users/getProfile",
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
    } else {
      const calculatedFee = inputAmount * 0.10;
      const calculatedTotal = inputAmount + calculatedFee;
      setAmount(inputAmount);
      setFee(calculatedFee);
      setTotal(calculatedTotal);
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
        "https://mongobyte.vercel.app/api/v1/pay/pay",
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
        "https://mongobyte.vercel.app/api/v1/users/transfer",
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
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 pt-16 md:pt-24 pb-24 md:pb-6">
      <ToastContainer />
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-crust mb-2 font-secondary">
            Byte Wallet
          </h1>
          <p className="text-gray-600 font-sans">Manage your funds and transfers</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-crust to-crust/90 text-white rounded-3xl p-8 mb-8 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cheese/80 text-sm font-sans mb-2">Current Balance</p>
              <p className="text-3xl md:text-4xl font-bold">₦{user.byteBalance}</p>
            </div>
            <div className="bg-cheese/20 p-4 rounded-full">
              <FaWallet className="text-3xl text-cheese" />
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="flex border-b border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab("fund")}
              className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                tab === "fund" 
                  ? "bg-pepperoni text-white shadow-lg" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaCreditCard />
              Fund Account
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab("transfer")}
              className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                tab === "transfer" 
                  ? "bg-pepperoni text-white shadow-lg" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaExchangeAlt />
              Transfer Bytes
            </motion.button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {tab === "fund" ? (
                <motion.div
                  key="fund"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-crust mb-2">Fund Your Account</h2>
                    <p className="text-gray-600 font-sans">Add money to your Byte wallet</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-crust mb-3">
                        <FaMoneyBillWave className="text-green-600" />
                        Enter Amount to Fund
                      </label>
                      <input
                        type="number"
                        onChange={handleAmountChange}
                        value={amount === "" ? "" : amount}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent text-lg font-semibold"
                        placeholder="Enter amount in ₦"
                      />
                    </div>

                    {amount !== "" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <FaCalculator className="text-blue-600" />
                          <h3 className="font-semibold text-crust">Payment Breakdown</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-sans">Funding Amount:</span>
                            <span className="font-bold text-crust">₦{amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-sans">Processing Fee (10%):</span>
                            <span className="font-bold text-orange-600">₦{fee.toFixed(2)}</span>
                          </div>
                          <hr className="border-gray-300" />
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-crust">Total Amount:</span>
                            <span className="text-xl font-bold text-pepperoni">₦{total.toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      disabled={amount === "" || total <= 0 || loading}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                        amount === "" || total <= 0 || loading
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-pepperoni to-red-600 hover:from-red-600 hover:to-pepperoni text-white shadow-xl hover:shadow-2xl"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <FaCreditCard />
                          Continue to Payment
                        </div>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="transfer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-crust mb-2">Transfer Bytes</h2>
                    <p className="text-gray-600 font-sans">Send money to another user</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-crust mb-3">
                        <FaMoneyBillWave className="text-green-600" />
                        Transfer Amount
                      </label>
                      <input
                        type="number"
                        value={transferAmount === "" ? "" : transferAmount}
                        onChange={(e) => setTransferAmount(Number(e.target.value))}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent text-lg font-semibold"
                        placeholder="Enter amount to transfer"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-crust mb-3">
                        <FaUser className="text-blue-600" />
                        Recipient Username
                      </label>
                      <input
                        type="text"
                        value={recipientUsername}
                        onChange={(e) => setRecipientUsername(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent text-lg"
                        placeholder="Enter recipient's username"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTransfer}
                      disabled={!recipientUsername || !transferAmount || transferAmount <= 0 || transferLoading}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                        !recipientUsername || !transferAmount || transferAmount <= 0 || transferLoading
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl"
                      }`}
                    >
                      {transferLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          Processing Transfer...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <FaPaperPlane />
                          Send Transfer
                        </div>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FundPage;
