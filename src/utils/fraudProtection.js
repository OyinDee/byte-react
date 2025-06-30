import axios from 'axios';

// Mock localStorage for Node.js environment
const mockLocalStorage = {
  storage: {},
  getItem(key) {
    return this.storage[key] || null;
  },
  setItem(key, value) {
    this.storage[key] = value;
  },
  removeItem(key) {
    delete this.storage[key];
  }
};

// Use real localStorage in browser, mock in Node.js
const storage = typeof localStorage !== 'undefined' ? localStorage : mockLocalStorage;

// Device fingerprinting and session tracking
export class FraudProtection {
  constructor() {
    this.deviceFingerprint = this.generateDeviceFingerprint();
    this.sessionId = this.generateSessionId();
    this.loginAttempts = this.getLoginAttempts();
    this.suspiciousActivities = this.getSuspiciousActivities();
  }

  // Generate unique device fingerprint
  generateDeviceFingerprint() {
    // Check if running in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Node.js environment - return mock fingerprint
      return btoa(JSON.stringify({
        platform: 'nodejs',
        userAgent: 'Node.js Test Environment',
        language: 'en-US',
        screenResolution: '1920x1080',
        colorDepth: 24,
        timezone: 'UTC',
        timestamp: Date.now(),
        nodeVersion: process.version || 'unknown'
      }));
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: navigator.deviceMemory || 'unknown',
      connection: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      timestamp: Date.now()
    };

    return btoa(JSON.stringify(fingerprint));
  }

  // Generate session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track login attempts
  getLoginAttempts() {
    const attempts = storage.getItem('loginAttempts');
    return attempts ? JSON.parse(attempts) : [];
  }

  recordLoginAttempt(success, email = null) {
    const attempt = {
      timestamp: Date.now(),
      success,
      email,
      deviceFingerprint: this.deviceFingerprint,
      ip: null, // Will be filled by backend
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js'
    };

    this.loginAttempts.push(attempt);
    
    // Keep only last 50 attempts
    if (this.loginAttempts.length > 50) {
      this.loginAttempts = this.loginAttempts.slice(-50);
    }

    storage.setItem('loginAttempts', JSON.stringify(this.loginAttempts));
    return attempt;
  }

  // Check for suspicious login patterns
  isSuspiciousLogin(email) {
    const now = Date.now();
    const recentAttempts = this.loginAttempts.filter(
      attempt => now - attempt.timestamp < 15 * 60 * 1000 // Last 15 minutes
    );

    const failedAttempts = recentAttempts.filter(
      attempt => !attempt.success && attempt.email === email
    ).length;

    return failedAttempts >= 5; // Suspicious if 5+ failed attempts in 15 minutes
  }

  // Track suspicious activities
  getSuspiciousActivities() {
    const activities = storage.getItem('suspiciousActivities');
    return activities ? JSON.parse(activities) : [];
  }

  recordSuspiciousActivity(type, details) {
    const activity = {
      type,
      details,
      timestamp: Date.now(),
      deviceFingerprint: this.deviceFingerprint,
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      url: typeof window !== 'undefined' ? window.location.href : 'nodejs://test-environment'
    };

    this.suspiciousActivities.push(activity);
    
    // Keep only last 100 activities
    if (this.suspiciousActivities.length > 100) {
      this.suspiciousActivities = this.suspiciousActivities.slice(-100);
    }

    storage.setItem('suspiciousActivities', JSON.stringify(this.suspiciousActivities));
    
    // Send to backend for analysis
    this.reportSuspiciousActivity(activity);
    
    return activity;
  }

  // Report to backend
  async reportSuspiciousActivity(activity) {
    try {
      const token = storage.getItem('token');
      if (token) {
        await axios.post(
          'https://mongobyte.onrender.com/api/v1/security/report-suspicious-activity',
          {
            ...activity,
            deviceFingerprint: this.deviceFingerprint
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    } catch (error) {
      console.warn('Failed to report suspicious activity:', error);
    }
  }

  // Validate transaction amounts
  validateTransactionAmount(amount, userBalance, orderHistory = []) {
    const numAmount = parseFloat(amount);
    
    // Check for unrealistic amounts
    if (numAmount <= 0 || numAmount > 100000) {
      this.recordSuspiciousActivity('INVALID_AMOUNT', { amount, userBalance });
      return { valid: false, reason: 'Invalid transaction amount' };
    }

    // Check if amount is significantly higher than user's typical orders
    if (orderHistory.length > 0) {
      const recentOrders = orderHistory.slice(-10);
      const avgOrderAmount = recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / recentOrders.length;
      
      if (numAmount > avgOrderAmount * 5) {
        this.recordSuspiciousActivity('UNUSUAL_AMOUNT', { 
          amount: numAmount, 
          avgAmount: avgOrderAmount,
          userBalance 
        });
      }
    }

    return { valid: true };
  }

  // Detect rapid successive actions - REMOVED for better UX
  detectRapidActions(actionType, threshold = 5, timeWindow = 60000) {
    // Always return false to disable rapid action detection
    return false;
    
    /* Original implementation disabled
    const storageKey = `rapidActions_${actionType}`;
    const actions = JSON.parse(storage.getItem(storageKey) || '[]');
    const now = Date.now();
    
    // Filter recent actions within time window
    const recentActions = actions.filter(timestamp => now - timestamp < timeWindow);
    
    if (recentActions.length >= threshold) {
      this.recordSuspiciousActivity('RAPID_ACTIONS', {
        actionType,
        count: recentActions.length,
        timeWindow,
        threshold
      });
      return true;
    }

    // Record current action
    recentActions.push(now);
    storage.setItem(storageKey, JSON.stringify(recentActions));
    
    return false;
    */
  }

  // Monitor profile changes
  monitorProfileChanges(oldProfile, newProfile) {
    const changes = {};
    const sensitiveFields = ['email', 'phoneNumber', 'university', 'location'];
    
    for (const field of sensitiveFields) {
      if (oldProfile[field] !== newProfile[field]) {
        changes[field] = {
          old: oldProfile[field],
          new: newProfile[field]
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      this.recordSuspiciousActivity('PROFILE_CHANGES', {
        changes,
        timestamp: Date.now()
      });
    }

    // Check for multiple rapid profile changes
    if (this.detectRapidActions('profile_update', 3, 300000)) { // 3 updates in 5 minutes
      return { suspicious: true, reason: 'Too many profile updates in short time' };
    }

    return { suspicious: false };
  }

  // Validate image uploads
  validateImageUpload(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      this.recordSuspiciousActivity('LARGE_IMAGE_UPLOAD', { size: file.size, maxSize });
      return { valid: false, reason: 'Image file too large' };
    }

    if (!allowedTypes.includes(file.type)) {
      this.recordSuspiciousActivity('INVALID_IMAGE_TYPE', { type: file.type });
      return { valid: false, reason: 'Invalid image type' };
    }

    return { valid: true };
  }

  // Check for automated behavior
  detectAutomatedBehavior() {
    // Skip in Node.js environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }

    const mouseEvents = parseInt(storage.getItem('mouseEvents') || '0');
    const keyboardEvents = parseInt(storage.getItem('keyboardEvents') || '0');
    const touchEvents = parseInt(storage.getItem('touchEvents') || '0');
    
    const totalEvents = mouseEvents + keyboardEvents + touchEvents;
    const sessionDuration = Date.now() - parseInt(storage.getItem('sessionStart') || Date.now());
    
    // If very few human interactions for a long session
    if (sessionDuration > 300000 && totalEvents < 10) { // 5 minutes with < 10 events
      this.recordSuspiciousActivity('AUTOMATED_BEHAVIOR', {
        sessionDuration,
        totalEvents,
        mouseEvents,
        keyboardEvents,
        touchEvents
      });
      return true;
    }

    return false;
  }

  // Initialize event tracking
  initializeEventTracking() {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.log('Event tracking skipped - not in browser environment');
      return;
    }

    if (!storage.getItem('sessionStart')) {
      storage.setItem('sessionStart', Date.now().toString());
    }

    // Track mouse events
    document.addEventListener('mousemove', () => {
      const count = parseInt(storage.getItem('mouseEvents') || '0') + 1;
      storage.setItem('mouseEvents', count.toString());
    });

    // Track keyboard events
    document.addEventListener('keypress', () => {
      const count = parseInt(storage.getItem('keyboardEvents') || '0') + 1;
      storage.setItem('keyboardEvents', count.toString());
    });

    // Track touch events
    document.addEventListener('touchstart', () => {
      const count = parseInt(storage.getItem('touchEvents') || '0') + 1;
      storage.setItem('touchEvents', count.toString());
    });
  }

  // Get fraud risk score
  getFraudRiskScore() {
    let riskScore = 0;
    const factors = [];

    // Check for suspicious activities in last hour
    const recentSuspicious = this.suspiciousActivities.filter(
      activity => Date.now() - activity.timestamp < 3600000
    );
    
    if (recentSuspicious.length > 0) {
      riskScore += recentSuspicious.length * 10;
      factors.push(`${recentSuspicious.length} suspicious activities`);
    }

    // Check failed login attempts
    const recentFailedLogins = this.loginAttempts.filter(
      attempt => !attempt.success && Date.now() - attempt.timestamp < 3600000
    );
    
    if (recentFailedLogins.length > 2) {
      riskScore += recentFailedLogins.length * 5;
      factors.push(`${recentFailedLogins.length} failed logins`);
    }

    // Check for automated behavior
    if (this.detectAutomatedBehavior()) {
      riskScore += 25;
      factors.push('Automated behavior detected');
    }

    return {
      score: Math.min(riskScore, 100), // Cap at 100
      level: riskScore < 20 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : 'HIGH',
      factors
    };
  }

  // Clean up old data
  cleanup() {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Clean login attempts
    this.loginAttempts = this.loginAttempts.filter(
      attempt => attempt.timestamp > oneWeekAgo
    );
    storage.setItem('loginAttempts', JSON.stringify(this.loginAttempts));

    // Clean suspicious activities
    this.suspiciousActivities = this.suspiciousActivities.filter(
      activity => activity.timestamp > oneWeekAgo
    );
    storage.setItem('suspiciousActivities', JSON.stringify(this.suspiciousActivities));
  }
}

// Global fraud protection instance
export const fraudProtection = new FraudProtection();
