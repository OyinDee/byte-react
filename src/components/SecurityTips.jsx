import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaLock, 
  FaEye, 
  FaUserSecret, 
  FaWifi,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const SecurityTips = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');

  const securityTips = {
    general: [
      {
        icon: <FaLock className="text-blue-500" />,
        title: "Use Strong Passwords",
        description: "Create unique passwords with a mix of letters, numbers, and symbols. Avoid using personal information.",
        level: "Essential"
      },
      {
        icon: <FaEye className="text-green-500" />,
        title: "Monitor Your Account",
        description: "Regularly check your order history and account balance for any unauthorized activities.",
        level: "Important"
      },
      {
        icon: <FaWifi className="text-yellow-500" />,
        title: "Secure Networks Only",
        description: "Avoid logging in or making payments on public Wi-Fi. Use your mobile data or a VPN instead.",
        level: "Critical"
      },
      {
        icon: <FaUserSecret className="text-purple-500" />,
        title: "Keep Personal Info Private",
        description: "Don't share your login credentials or payment information with anyone, including friends.",
        level: "Essential"
      }
    ],
    payment: [
      {
        icon: <FaShieldAlt className="text-green-600" />,
        title: "Verify Payment Details",
        description: "Always double-check payment amounts and recipient details before confirming transactions.",
        level: "Critical"
      },
      {
        icon: <FaExclamationTriangle className="text-red-500" />,
        title: "Report Suspicious Charges",
        description: "Contact support immediately if you notice any unauthorized charges on your account.",
        level: "Essential"
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        title: "Use Secure Payment Methods",
        description: "Prefer secure payment gateways and avoid sharing card details through messages or calls.",
        level: "Important"
      }
    ],
    account: [
      {
        icon: <FaLock className="text-red-600" />,
        title: "Enable Two-Factor Authentication",
        description: "Add an extra layer of security to your account with 2FA when available.",
        level: "Essential"
      },
      {
        icon: <FaEye className="text-orange-500" />,
        title: "Review Login Activity",
        description: "Check for suspicious login attempts and log out from all devices if needed.",
        level: "Important"
      },
      {
        icon: <FaUserSecret className="text-teal-500" />,
        title: "Update Profile Carefully",
        description: "Only update your profile information when necessary and verify changes immediately.",
        level: "Important"
      }
    ]
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Essential': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Important': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-crust to-gray-800 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
              >
                <FaTimes />
              </button>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-3xl text-cheese" />
                <div>
                  <h2 className="text-2xl font-bold">Security & Safety Tips</h2>
                  <p className="text-white/80 text-sm">Keep your account safe with these recommendations</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                {Object.keys(securityTips).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-cheese text-crust bg-orange-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab} Security
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {securityTips[activeTab].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-cheese/20 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-2xl">
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold text-crust">{tip.title}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getLevelColor(tip.level)}`}>
                            {tip.level}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaShieldAlt className="text-green-500" />
                  <span className="text-sm">Your security is our priority</span>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-6 py-3 bg-cheese text-crust font-semibold rounded-xl hover:bg-yellow-400 transition-colors"
                  >
                    Got It!
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SecurityTips;
