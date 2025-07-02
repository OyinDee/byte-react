import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  InformationCircleIcon,
  TruckIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const RestaurantFeeRequest = ({ order, onOrderUpdate, onClose }) => {
  const [additionalFee, setAdditionalFee] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Debug logging
  console.log('Order data in RestaurantFeeRequest:', order);
  console.log('Order fee:', order.fee);
  console.log('Order totalPrice:', order.totalPrice);
  console.log('Order foodAmount:', order.foodAmount);

  const standardFee = 600; // Standard delivery fee
  // Use user's budgeted fee as the maximum without approval
  // Handle undefined/null values with proper fallbacks
  const userBudgetedFee = Number(order.fee) || 600; // Fee budgeted by user for delivery
  const orderTotalPrice = Number(order.totalPrice) || 0;
  const orderFoodAmount = Number(order.foodAmount) || 0;

  const handleConfirmOrder = async () => {
    setLoading(true);
    
    const requestData = {};
    
    if (additionalFee && parseFloat(additionalFee) > 0) {
      requestData.additionalFee = parseFloat(additionalFee);
    }
    
    if (requestDescription.trim()) {
      requestData.requestDescription = requestDescription.trim();
    }

    // Early return for fees exceeding the permitted limit
    const feeValue = parseFloat(additionalFee) || 0;
    if (feeValue > userBudgetedFee) {
      toast.info('Fee request sent to customer for approval!');
      
      // Update order status and save requested fee amount
      onOrderUpdate({ 
        ...order, 
        status: 'Fee Requested',
        requestedFee: feeValue,
        requestDescription: requestDescription.trim() || null
      });
      
      onClose();
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://mongobyte.vercel.app/api/v1/orders/${order.customId}/confirm`, 
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Order confirmed successfully!');
        onOrderUpdate({ ...order, status: 'Confirmed' });
        onClose();
      }
    } catch (error) {
        console.log(error);
      if (error.response?.status === 400) {
        if (error.response.data.message.includes('Insufficient balance')) {
          toast.error('Order cancelled due to insufficient customer balance.');
          onOrderUpdate({ ...order, status: 'Canceled' });
          onClose();
        } else {
          toast.error(error.response.data.message || 'Error confirming order');
        }
      } else {
        toast.error('Error confirming order: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    setDeliveryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `https://mongobyte.vercel.app/api/v1/orders/deliver/${order.customId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Order marked as delivered!');
        onOrderUpdate({ ...order, status: 'Delivered' });
        onClose();
      }
    } catch (error) {
      console.log(error);
      toast.error('Error marking order as delivered: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeliveryLoading(false);
    }
  };

  const getFeeStatusMessage = () => {
    const fee = parseFloat(additionalFee) || 0;
    if (fee === 0) return 'No additional fee';
    return `Additional fee: ₦${fee.toFixed(2)}`;
  };

  const getFeeStatusClass = () => {
    const fee = parseFloat(additionalFee) || 0;
    if (fee === 0) return 'text-gray-500';
    return 'text-blue-600';
  };

  return (
    <div className="fee-request-form bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Confirm Order: #{order.customId?.slice(-6)}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800`}>
          {order.status}
        </span>
      </div>
      
      <div className="order-summary grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Customer:</strong> {order.user?.username || 'Customer'}</p>
          <p><strong>Location:</strong> {order.location}</p>
          <p><strong>Phone:</strong> {order.phoneNumber}</p>
          {order.recipient && (
            <p className="text-purple-600"><strong>Gift Order:</strong> For {order.recipient.name}</p>
          )}
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-blue-900">Food Amount:</span>
            <span className="font-bold text-blue-900">₦{(orderFoodAmount || (orderTotalPrice - userBudgetedFee)).toFixed(2)}</span>
          </div>
          <div className="text-sm text-blue-600">
            This is the amount you earn from food sales.
          </div>
        </div>
      </div>



      <div className="fee-section mb-6">
        <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
          <TruckIcon className="h-5 w-5 text-gray-600" />
          Additional Delivery Fee (Optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">₦</span>
          </div>
          <input
            type="number"
            value={additionalFee}
            onChange={(e) => setAdditionalFee(e.target.value)}
            placeholder="Enter additional fee if needed"
            min="0"
            step="50"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
          />
        </div>
        <small className={`fee-status block mt-1 ${getFeeStatusClass()}`}>
          {getFeeStatusMessage()}
        </small>
      </div>

      <div className="description-section mb-6">
        <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-gray-600" />
          Reason for Additional Fee (if applicable)
        </label>
        <textarea
          value={requestDescription}
          onChange={(e) => setRequestDescription(e.target.value)}
          placeholder="e.g., Extra distance, special handling requirements, etc."
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
        />
      </div>

      <div className="fee-breakdown bg-gray-50 p-4 rounded-lg mb-6">
        <h5 className="font-semibold text-gray-900 mb-3">Fee Breakdown</h5>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Food Amount:</span>
            <span className="font-medium">₦{(orderFoodAmount || (orderTotalPrice - userBudgetedFee)).toFixed(2)}</span>
          </div>
          {additionalFee && parseFloat(additionalFee) > 0 && (
            <div className="flex justify-between items-center text-blue-600">
              <span>Your Delivery Fee:</span>
              <span className="font-medium">₦{parseFloat(additionalFee).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-300 text-lg font-bold">
            <span className="text-gray-800">Total Value with Your Fee:</span>
            <span className="text-blue-900">₦{(
              (orderFoodAmount || (orderTotalPrice - userBudgetedFee)) + 
              ((additionalFee && parseFloat(additionalFee)) || 0)
            ).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        {order.status === 'Confirmed' && (
          <button
            onClick={handleMarkAsDelivered}
            disabled={deliveryLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {deliveryLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Mark as Delivered
              </>
            )}
          </button>
        )}
        {order.status === 'Pending' && (
          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <BanknotesIcon className="h-5 w-5" />
                Confirm Order
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default RestaurantFeeRequest;
