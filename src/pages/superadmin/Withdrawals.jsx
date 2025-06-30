import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  BanknotesIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  UserIcon,
  CalendarIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import LoadingPage from "../../components/Loader";
import { toast } from "react-toastify";

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://mongobyte.vercel.app/api/v1/withdrawals",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data)
      setWithdrawals(response.data);
      
      // Calculate stats
      const stats = {
        total: response.data.length,
        pending: response.data.filter(w => w.status === "pending").length,
        approved: response.data.filter(w => w.status === "approved").length,
        rejected: response.data.filter(w => w.status === "rejected").length,
        totalAmount: response.data.reduce((sum, w) => sum + w.amount, 0)
      };
      
      setStats(stats);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Failed to load withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (withdrawalId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://mongobyte.vercel.app/api/v1/withdrawals/${withdrawalId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update local state
      setWithdrawals(withdrawals.map(withdrawal => 
        withdrawal._id === withdrawalId ? {...withdrawal, status} : withdrawal
      ));
      
      // Update stats
      const updatedStats = { ...stats };
      
      // Decrease count for old status
      if (selectedWithdrawal.status === "pending") updatedStats.pending--;
      else if (selectedWithdrawal.status === "approved") updatedStats.approved--;
      else if (selectedWithdrawal.status === "rejected") updatedStats.rejected--;
      
      // Increase count for new status
      if (status === "pending") updatedStats.pending++;
      else if (status === "approved") updatedStats.approved++;
      else if (status === "rejected") updatedStats.rejected++;
      
      setStats(updatedStats);
      
      setIsModalOpen(false);
      toast.success(`Withdrawal request ${status}`);
    } catch (error) {
      console.error("Error updating withdrawal status:", error);
      toast.error("Failed to update withdrawal status");
    }
  };

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <InformationCircleIcon className="w-4 h-4" />;
      case "approved":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "rejected":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const filteredWithdrawals = withdrawals
    .filter(withdrawal => {
      if (filter === "all") return true;
      return withdrawal.status === filter;
    })
    .filter(withdrawal => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        withdrawal._id.toLowerCase().includes(searchLower) ||
        withdrawal.restaurantName?.toLowerCase().includes(searchLower) ||
        withdrawal.restaurantEmail?.toLowerCase().includes(searchLower) ||
        (withdrawal.accountNumber && withdrawal.accountNumber.includes(searchTerm)) ||
        (withdrawal.bankName && withdrawal.bankName.toLowerCase().includes(searchLower)) ||
        (withdrawal.accountHolder && withdrawal.accountHolder.toLowerCase().includes(searchLower))
      );
    });

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-12 md:pb-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage restaurant withdrawal requests
            </p>
          </div>
          
          <button 
            onClick={fetchWithdrawals} 
            className="mt-4 md:mt-0 flex items-center gap-2 bg-cheese hover:bg-yellow-500 text-crust py-2 px-4 rounded-lg transition-colors shadow-md"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-cheese"
          >
            <div className="font-medium text-gray-500 text-sm">Total Requests</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-400"
          >
            <div className="font-medium text-gray-500 text-sm">Pending</div>
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-400"
          >
            <div className="font-medium text-gray-500 text-sm">Approved</div>
            <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-400"
          >
            <div className="font-medium text-gray-500 text-sm">Rejected</div>
            <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-pepperoni"
          >
            <div className="font-medium text-gray-500 text-sm">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900">₦{stats.totalAmount.toLocaleString()}</div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <span className="text-gray-700">Filter:</span>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "all"
                  ? "bg-cheese text-black font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "pending"
                  ? "bg-yellow-400 text-black font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "approved"
                  ? "bg-green-400 text-white font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "rejected"
                  ? "bg-red-400 text-white font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Rejected
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search withdrawals..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cheese focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Withdrawals List */}
        {filteredWithdrawals.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <BanknotesIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No withdrawal requests found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? "Try different search terms" : "No withdrawal requests match the selected filter"}
            </p>
          </div>
        ) : (
          <>
            {/* Table for md+ screens */}
            <div className="hidden md:block overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Restaurant</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                            <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{withdrawal.restaurantName || "Unknown Restaurant"}</div>
                            <div className="text-gray-500">{withdrawal.restaurantEmail || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="font-medium text-gray-900">₦{withdrawal.amount?.toLocaleString()}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(withdrawal.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs border inline-flex items-center gap-1 ${getStatusBadgeClass(withdrawal.status)}`}>
                          {getStatusIcon(withdrawal.status)}
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetails(withdrawal)}
                          className="text-cheese hover:text-yellow-600 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Card list for mobile screens */}
            <div className="md:hidden space-y-4">
              {filteredWithdrawals.map((withdrawal) => (
                <div key={withdrawal._id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                      <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{withdrawal.restaurantName || "Unknown Restaurant"}</div>
                      <div className="text-gray-500 text-xs">{withdrawal.restaurantEmail || "No email"}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium">₦{withdrawal.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date:</span>
                    <span>{format(new Date(withdrawal.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border inline-flex items-center gap-1 ${getStatusBadgeClass(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(withdrawal)}
                    className="mt-2 w-full bg-cheese text-crust py-2 rounded-lg font-medium shadow hover:bg-yellow-500 transition"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Withdrawal Details Modal */}
      {isModalOpen && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 bg-cheese rounded-t-xl">
              <h3 className="text-xl font-bold text-crust flex items-center gap-2">
                <BanknotesIcon className="w-6 h-6" />
                Withdrawal Request Details
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Request ID:</span>
                  <span className="font-medium">{selectedWithdrawal._id}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Restaurant:</span>
                  <span className="font-medium">{selectedWithdrawal.restaurantName || "Unknown"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount:</span>
                  <span className="font-medium">₦{selectedWithdrawal.amount?.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Date Requested:</span>
                  <span className="font-medium">{format(new Date(selectedWithdrawal.createdAt), "MMM d, yyyy HH:mm")}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Updated:</span>
                  <span className="font-medium">{format(new Date(selectedWithdrawal.updatedAt), "MMM d, yyyy HH:mm")}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs border inline-flex items-center gap-1 ${getStatusBadgeClass(selectedWithdrawal.status)}`}>
                    {getStatusIcon(selectedWithdrawal.status)}
                    {selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bank Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Bank:</span>
                    <span className="font-medium">{selectedWithdrawal.bankName || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Account Number:</span>
                    <span className="font-medium">{selectedWithdrawal.accountNumber || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Account Holder:</span>
                    <span className="font-medium">{selectedWithdrawal.accountHolder || "Not provided"}</span>
                  </div>
                </div>
              </div>
              
              {selectedWithdrawal.status === "pending" && (
                <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
                  <button
                    onClick={() => updateWithdrawalStatus(selectedWithdrawal._id, "rejected")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors w-full sm:w-auto"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateWithdrawalStatus(selectedWithdrawal._id, "approved")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors w-full sm:w-auto"
                  >
                    Approve
                  </button>
                </div>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
