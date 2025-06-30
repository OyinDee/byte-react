import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaExclamationTriangle, 
  FaEye, 
  FaBan, 
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaFingerprint,
  FaChartLine,
  FaFilter
} from 'react-icons/fa';
import { fraudProtection } from '../utils/fraudProtection';

const FraudDashboard = () => {
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [riskAnalytics, setRiskAnalytics] = useState({});
  const [filters, setFilters] = useState({
    timeRange: '24h',
    riskLevel: 'all',
    activityType: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFraudData();
  }, [filters]);

  const loadFraudData = () => {
    try {
      // Load suspicious activities from localStorage
      const activities = JSON.parse(localStorage.getItem('suspiciousActivities') || '[]');
      const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
      
      // Filter by time range
      const now = Date.now();
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      
      const filteredActivities = activities.filter(activity => {
        const timeDiff = now - activity.timestamp;
        return timeDiff <= timeRanges[filters.timeRange];
      });

      // Filter by risk level and activity type
      const finalFiltered = filteredActivities.filter(activity => {
        if (filters.activityType !== 'all' && activity.type !== filters.activityType) {
          return false;
        }
        return true;
      });

      setSuspiciousActivities(finalFiltered);

      // Calculate analytics
      const analytics = calculateRiskAnalytics(finalFiltered, loginAttempts);
      setRiskAnalytics(analytics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading fraud data:', error);
      setLoading(false);
    }
  };

  const calculateRiskAnalytics = (activities, loginAttempts) => {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    // Group activities by type
    const activityTypes = {};
    activities.forEach(activity => {
      activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
    });

    // Calculate failed login rate
    const recentLogins = loginAttempts.filter(attempt => attempt.timestamp > last24h);
    const failedLogins = recentLogins.filter(attempt => !attempt.success);
    const failedLoginRate = recentLogins.length > 0 ? (failedLogins.length / recentLogins.length) * 100 : 0;

    // Calculate risk trend
    const last48h = now - 48 * 60 * 60 * 1000;
    const activitiesLast24h = activities.filter(a => a.timestamp > last24h);
    const activitiesPrevious24h = activities.filter(a => a.timestamp > last48h && a.timestamp <= last24h);
    const riskTrend = activitiesLast24h.length - activitiesPrevious24h.length;

    // Most common suspicious activities
    const topActivities = Object.entries(activityTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalActivities: activities.length,
      activityTypes,
      failedLoginRate: Math.round(failedLoginRate),
      riskTrend,
      topActivities,
      recentLoginAttempts: recentLogins.length,
      uniqueDevices: new Set(activities.map(a => a.deviceFingerprint)).size
    };
  };

  const getActivityIcon = (type) => {
    const icons = {
      'INVALID_AMOUNT': '💰',
      'RAPID_ACTIONS': '⚡',
      'AUTOMATED_BEHAVIOR': '🤖',
      'SUSPICIOUS_URL': '🔗',
      'LARGE_IMAGE_UPLOAD': '📷',
      'PROFILE_CHANGES': '👤',
      'BRUTE_FORCE_ATTEMPT': '🔒',
      'RATE_LIMITED': '🚫'
    };
    return icons[type] || '⚠️';
  };

  const formatActivityType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getRiskLevelColor = (count) => {
    if (count < 5) return 'text-green-600 bg-green-50';
    if (count < 15) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cheese"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-crust flex items-center gap-3">
              <FaShieldAlt className="text-cheese" />
              Fraud Detection Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Monitor and analyze suspicious activities</p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cheese"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            <select
              value={filters.activityType}
              onChange={(e) => setFilters({...filters, activityType: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cheese"
            >
              <option value="all">All Activities</option>
              <option value="INVALID_AMOUNT">Invalid Amounts</option>
              <option value="RAPID_ACTIONS">Rapid Actions</option>
              <option value="AUTOMATED_BEHAVIOR">Automated Behavior</option>
              <option value="PROFILE_CHANGES">Profile Changes</option>
            </select>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Suspicious Activities</p>
                <p className="text-3xl font-bold text-red-600">{riskAnalytics.totalActivities}</p>
              </div>
              <FaExclamationTriangle className="text-2xl text-red-500" />
            </div>
            <div className="mt-2">
              <span className={`text-sm px-2 py-1 rounded-full ${
                riskAnalytics.riskTrend > 0 ? 'bg-red-100 text-red-600' : 
                riskAnalytics.riskTrend < 0 ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-600'
              }`}>
                {riskAnalytics.riskTrend > 0 ? '↗️' : riskAnalytics.riskTrend < 0 ? '↙️' : '→'} 
                {Math.abs(riskAnalytics.riskTrend)} vs previous period
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Failed Login Rate</p>
                <p className="text-3xl font-bold text-yellow-600">{riskAnalytics.failedLoginRate}%</p>
              </div>
              <FaBan className="text-2xl text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {riskAnalytics.recentLoginAttempts} total attempts
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Unique Devices</p>
                <p className="text-3xl font-bold text-blue-600">{riskAnalytics.uniqueDevices}</p>
              </div>
              <FaFingerprint className="text-2xl text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Device fingerprints tracked</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Risk Score</p>
                <p className="text-3xl font-bold text-green-600">{fraudProtection.getFraudRiskScore().score}</p>
              </div>
              <FaChartLine className="text-2xl text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {fraudProtection.getFraudRiskScore().level} risk level
            </p>
          </motion.div>
        </div>

        {/* Top Activity Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-crust mb-4 flex items-center gap-2">
              <FaChartLine className="text-cheese" />
              Top Suspicious Activities
            </h3>
            <div className="space-y-3">
              {riskAnalytics.topActivities?.map(([type, count], index) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getActivityIcon(type)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{formatActivityType(type)}</p>
                      <p className="text-sm text-gray-500">#{index + 1} most common</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskLevelColor(count)}`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-crust mb-4 flex items-center gap-2">
              <FaClock className="text-cheese" />
              Recent Activity Timeline
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {suspiciousActivities.slice(0, 10).map((activity, index) => (
                <div key={activity.timestamp + index} className="border-l-4 border-yellow-400 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {getActivityIcon(activity.type)} {formatActivityType(activity.type)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(activity.details).substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed Activities Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-crust flex items-center gap-2">
              <FaEye className="text-cheese" />
              Detailed Activity Log
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suspiciousActivities.map((activity, index) => (
                  <tr key={activity.timestamp + index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <span>{getActivityIcon(activity.type)}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatActivityType(activity.type)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {activity.details ? JSON.stringify(activity.details) : 'No details'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.deviceFingerprint ? 
                        activity.deviceFingerprint.substring(0, 12) + '...' : 
                        'Unknown'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.type.includes('BRUTE_FORCE') || activity.type.includes('INVALID') ?
                        'bg-red-100 text-red-800' :
                        activity.type.includes('RAPID') || activity.type.includes('AUTOMATED') ?
                        'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.type.includes('BRUTE_FORCE') || activity.type.includes('INVALID') ? 'HIGH' :
                         activity.type.includes('RAPID') || activity.type.includes('AUTOMATED') ? 'MEDIUM' : 'LOW'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FraudDashboard;
