import axios from 'axios';
import { fraudProtection } from './fraudProtection';

// Create secure axios instance
const secureAPI = axios.create({
  baseURL: 'https://mongobyte.onrender.com/api/v1',
  timeout: 30000, // 30 second timeout
});

// Request interceptor for fraud protection
secureAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Add device fingerprint and session info
      config.headers['X-Device-Fingerprint'] = fraudProtection.deviceFingerprint;
      config.headers['X-Session-ID'] = fraudProtection.sessionId;
      config.headers['X-Timestamp'] = Date.now();
      
      // Add request hash for integrity
      const requestData = JSON.stringify({
        url: config.url,
        method: config.method,
        data: config.data,
        timestamp: Date.now()
      });
      config.headers['X-Request-Hash'] = btoa(requestData);
    }

    return config;
  },
  (error) => {
    fraudProtection.recordSuspiciousActivity('REQUEST_ERROR', {
      error: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Response interceptor for fraud detection
secureAPI.interceptors.response.use(
  (response) => {
    // Check for suspicious response patterns
    if (response.status === 200 && response.data) {
      // Monitor for unusual response times
      const responseTime = Date.now() - parseInt(response.config.headers['X-Timestamp'] || 0);
      if (responseTime > 10000) { // > 10 seconds
        fraudProtection.recordSuspiciousActivity('SLOW_RESPONSE', {
          url: response.config.url,
          responseTime
        });
      }
    }

    return response;
  },
  (error) => {
    const { response, config } = error;
    
    // Track failed requests
    if (response) {
      const suspiciousStatuses = [401, 403, 429, 500, 502, 503];
      if (suspiciousStatuses.includes(response.status)) {
        fraudProtection.recordSuspiciousActivity('API_ERROR', {
          status: response.status,
          url: config.url,
          method: config.method,
          message: response.data?.message || 'Unknown error'
        });
      }

      // Handle rate limiting
      if (response.status === 429) {
        fraudProtection.recordSuspiciousActivity('RATE_LIMITED', {
          url: config.url,
          retryAfter: response.headers['retry-after']
        });
      }
    } else {
      // Network error
      fraudProtection.recordSuspiciousActivity('NETWORK_ERROR', {
        url: config.url,
        message: error.message
      });
    }

    return Promise.reject(error);
  }
);

// Secure API methods with fraud protection
export const secureAPIService = {
  // Secure profile update
  async updateProfile(profileData, currentUser) {
    // Validate profile changes
    const changeValidation = fraudProtection.monitorProfileChanges(currentUser, profileData);
    if (changeValidation.suspicious) {
      throw new Error(changeValidation.reason);
    }

    // Check for rapid updates
    if (fraudProtection.detectRapidActions('profile_update', 3, 300000)) {
      throw new Error('Too many profile updates. Please wait before trying again.');
    }

    // Validate image if present
    if (profileData.imageUrl && profileData.imageUrl.startsWith('data:')) {
      // Convert base64 to blob for validation
      const response = await fetch(profileData.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'profile.jpg', { type: blob.type });
      
      const imageValidation = fraudProtection.validateImageUpload(file);
      if (!imageValidation.valid) {
        throw new Error(imageValidation.reason);
      }
    }

    return secureAPI.put('/users/updateProfile', profileData);
  },

  // Secure image upload
  async uploadImage(imageData) {
    // Validate image data
    if (!imageData.startsWith('data:image/')) {
      fraudProtection.recordSuspiciousActivity('INVALID_IMAGE_DATA', {
        dataType: imageData.substring(0, 50)
      });
      throw new Error('Invalid image data format');
    }

    // Check image size (rough estimate from base64)
    const sizeInBytes = (imageData.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) { // 5MB
      fraudProtection.recordSuspiciousActivity('LARGE_IMAGE_UPLOAD', {
        estimatedSize: sizeInBytes
      });
      throw new Error('Image file too large');
    }

    return secureAPI.post('/users/upload', { image: imageData });
  },

  // Secure profile fetch
  async getProfile() {
    return secureAPI.get('/users/getProfile');
  },

  // Secure transaction validation
  async validateTransaction(amount, type = 'order') {
    const numAmount = parseFloat(amount);
    
    // Basic amount validation
    if (isNaN(numAmount) || numAmount <= 0) {
      fraudProtection.recordSuspiciousActivity('INVALID_TRANSACTION_AMOUNT', {
        amount,
        type
      });
      throw new Error('Invalid transaction amount');
    }

    // Check for suspicious amounts
    if (numAmount > 50000) { // > ₦50,000
      fraudProtection.recordSuspiciousActivity('LARGE_TRANSACTION', {
        amount: numAmount,
        type
      });
    }

    return { valid: true, amount: numAmount };
  },

  // Secure login tracking
  async trackLogin(email, success) {
    const attempt = fraudProtection.recordLoginAttempt(success, email);
    
    if (!success && fraudProtection.isSuspiciousLogin(email)) {
      fraudProtection.recordSuspiciousActivity('BRUTE_FORCE_ATTEMPT', {
        email,
        attempts: fraudProtection.loginAttempts.filter(a => a.email === email && !a.success).length
      });
      throw new Error('Too many failed login attempts. Account temporarily locked.');
    }

    return attempt;
  },

  // Generic secure request
  async makeSecureRequest(method, url, data = null) {
    // Add request validation
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!allowedMethods.includes(method.toUpperCase())) {
      fraudProtection.recordSuspiciousActivity('INVALID_HTTP_METHOD', {
        method,
        url
      });
      throw new Error('Invalid HTTP method');
    }

    // Check for suspicious URLs
    if (url.includes('..') || url.includes('<') || url.includes('>')) {
      fraudProtection.recordSuspiciousActivity('SUSPICIOUS_URL', {
        url
      });
      throw new Error('Invalid URL format');
    }

    const config = {
      method: method.toUpperCase(),
      url,
    };

    if (data) {
      config.data = data;
    }

    return secureAPI(config);
  }
};

export default secureAPI;
