import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fraudProtection } from '../utils/fraudProtection';

const SecurityContext = createContext();

export function SecurityProvider({ children }) {
  const [riskScore, setRiskScore] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);

  const addSecurityAlert = useCallback((type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: Date.now()
    };
    
    setSecurityAlerts(prev => [...prev, alert]);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      setSecurityAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 10000);
  }, []);

  const removeSecurityAlert = useCallback((id) => {
    setSecurityAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  useEffect(() => {
    // Initialize fraud protection
    fraudProtection.initializeEventTracking();
    
    // Check risk score periodically
    const checkSecurity = () => {
      const risk = fraudProtection.getFraudRiskScore();
      setRiskScore(risk.score);
      
      // Block if high risk
      if (risk.level === 'HIGH') {
        setIsBlocked(true);
        addSecurityAlert('high-risk', 'High risk activity detected. Some features may be limited.');
      }
    };

    checkSecurity();
    const interval = setInterval(checkSecurity, 60000); // Check every minute

    // Cleanup old data daily
    const cleanupInterval = setInterval(() => {
      fraudProtection.cleanup();
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [addSecurityAlert]);

  const recordSuspiciousActivity = (type, details) => {
    return fraudProtection.recordSuspiciousActivity(type, details);
  };

  const validateTransaction = (amount, userBalance, orderHistory) => {
    return fraudProtection.validateTransactionAmount(amount, userBalance, orderHistory);
  };

  const validateImageUpload = (file) => {
    return fraudProtection.validateImageUpload(file);
  };

  const monitorProfileChanges = (oldProfile, newProfile) => {
    return fraudProtection.monitorProfileChanges(oldProfile, newProfile);
  };

  const checkRapidActions = (actionType) => {
    return fraudProtection.detectRapidActions(actionType);
  };

  const value = {
    riskScore,
    isBlocked,
    securityAlerts,
    addSecurityAlert,
    removeSecurityAlert,
    recordSuspiciousActivity,
    validateTransaction,
    validateImageUpload,
    monitorProfileChanges,
    checkRapidActions
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
