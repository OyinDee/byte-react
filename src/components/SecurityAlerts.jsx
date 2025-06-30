import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaExclamationTriangle, 
  FaTimes, 
  FaInfoCircle,
  FaBan 
} from 'react-icons/fa';
import { useSecurity } from '../context/securityContext';

const SecurityAlerts = () => {
  const { securityAlerts, removeSecurityAlert } = useSecurity();

  const getAlertIcon = (type) => {
    switch (type) {
      case 'high-risk':
        return <FaBan className="text-red-500" />;
      case 'suspicious':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'blocked':
        return <FaShieldAlt className="text-red-600" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'high-risk':
      case 'blocked':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'suspicious':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {securityAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-lg">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeSecurityAlert(alert.id)}
                className="flex-shrink-0 text-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SecurityAlerts;
