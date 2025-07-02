import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TruckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const UserFeeApproval = ({ order, onOrderUpdate, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchUserBalance();
  }, []);

  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const byteUser = JSON.parse(localStorage.getItem('byteUser'));
      
      if (token && byteUser?.username) {
        const response = await axios.get(
          `https://mongobyte.vercel.app/api/v1/users/balance/${byteUser.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleFeeResponse = async (action) => {
    setLoading(true);
    setDecision(action);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `https://mongobyte.vercel.app/api/v1/orders/${order.customId}/status`,
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (action === 'accept') {
        toast.success('Order confirmed! Your meal is being prepared.');
      } else {
        toast.info('Order cancelled successfully.');
      }
      
      onOrderUpdate(response.data.order);
      onClose();
      
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('Insufficient balance')) {
        toast.error('Order cancelled due to insufficient balance. Please top up your wallet.');
        onOrderUpdate({ ...order, status: 'Canceled' });
        onClose();
      } else {
        toast.error('Error processing request: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
      setDecision(null);
    }
  };

  const originalAmount = order.totalPrice - order.fee;
  const originalFee = 600; // Standard delivery fee
  const additionalFee = order.fee - originalFee;
  const canAfford = userBalance >= order.totalPrice;

  return (
    <div className="fee-approval-card bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Fee Approval Required</h3>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Fee Requested
        </span>
      </div>

      <div className="alert alert-warning bg-orange-50 border-l-4 border-orange-400 p-4 rounded mb-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 text-orange-500 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-orange-800">Additional Fee Requested</h4>
            <p className="text-orange-700">The restaurant has requested an additional delivery fee for your order.</p>
          </div>
        </div>
      </div>

      <div className="order-details mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">Order Details</h5>
            <p><strong>Order #:</strong> {order.customId}</p>
            <p><strong>Restaurant:</strong> {order.restaurant?.name || 'Restaurant'}</p>
            <p><strong>Status:</strong> Fee Approval Pending</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">Delivery Information</h5>
            <p><strong>Location:</strong> {order.location}</p>
            <p><strong>Phone:</strong> {order.phoneNumber}</p>
            {order.nearestLandmark && (
              <p><strong>Landmark:</strong> {order.nearestLandmark}</p>
            )}
          </div>
        </div>
      </div>

      {order.requestDescription && (
        <div className="restaurant-explanation bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h6 className="font-semibold text-blue-800 mb-1">Restaurant's Explanation:</h6>
              <p className="text-blue-700 italic">"{order.requestDescription}"</p>
            </div>
          </div>
        </div>
      )}

      <div className="fee-breakdown bg-gray-50 p-4 rounded-lg mb-6">
        <h5 className="font-semibold text-gray-900 mb-3">Fee Breakdown</h5>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Food Items:</span>
            <span className="font-medium">₦{originalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Standard Delivery Fee:</span>
            <span className="font-medium">₦{originalFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-orange-600 font-medium">
            <span>Additional Fee Requested:</span>
            <span>₦{additionalFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300 text-lg font-bold">
            <span className="text-gray-800">New Total:</span>
            <span className="text-blue-900">₦{order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="balance-info mb-6">
        <div className={`p-4 rounded-lg ${canAfford ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start">
            <BanknotesIcon className={`h-5 w-5 mr-2 flex-shrink-0 ${canAfford ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{canAfford ? 'Sufficient Balance' : 'Insufficient Balance'}</p>
                {canAfford ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-600" />
                )}
              </div>
              <p className="text-sm">Your wallet balance: <span className="font-medium">₦{userBalance.toFixed(2)}</span></p>
              {!canAfford && (
                <p className="text-sm text-red-600 mt-1">
                  You need ₦{(order.totalPrice - userBalance).toFixed(2)} more to approve this order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleFeeResponse('cancel')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
        >
          {loading && decision === 'cancel' ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              Cancelling...
            </>
          ) : (
            <>
              <XCircleIcon className="h-5 w-5" />
              Cancel Order
            </>
          )}
        </button>
        
        <button
          onClick={() => handleFeeResponse('accept')}
          disabled={loading || !canAfford}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          {loading && decision === 'accept' ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              Accept & Pay ₦{order.totalPrice.toFixed(2)}
            </>
          )}
        </button>
      </div>

      {!canAfford && (
        <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-blue-600" />
            <p className="text-blue-700 text-sm">
              You need to top up your wallet to approve this fee request.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFeeApproval;
