import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingPage = () => {
  const [loadingText, setLoadingText] = useState("Preparing your meal");
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const messages = [
      "Preparing your meal",
      "Adding a sprinkle of flavor", 
      "Stirring the pot",
      "Almost ready to serve",
      "Plating your delicious order",
      "Getting everything perfect for you"
    ];
    
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingText(messages[currentIndex]);
    }, 1800);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0; // Reset for continuous animation
        return prev + Math.random() * 15;
      });
    }, 300);
    
    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-crust via-crust/95 to-pepperoni overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-cheese rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-16 w-20 h-20 border border-cheese/50 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border border-cheese/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-16 right-1/3 w-16 h-16 border border-cheese/40 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl max-w-md mx-4"
      >
        {/* Logo Container */}
        <motion.div 
          className="relative mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
        >
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 w-32 h-32 border-4 border-cheese/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner rotating ring */}
          <motion.div
            className="absolute inset-2 w-28 h-28 border-2 border-cheese/50 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo */}
          <motion.div
            className="relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-xl border-4 border-cheese"
            whileHover={{ scale: 1.05 }}
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(255, 204, 0, 0.5)",
                "0 0 40px rgba(255, 204, 0, 0.8)",
                "0 0 20px rgba(255, 204, 0, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <img 
              src="/Images/Logo 8.jpg" 
              alt="Byte Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback if logo fails to load */}
            <div className="hidden w-full h-full bg-gradient-to-br from-cheese to-pepperoni items-center justify-center">
              <span className="text-4xl font-bold text-white">B!</span>
            </div>
          </motion.div>

          {/* Floating particles around logo */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-cheese rounded-full"
              style={{
                top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 60}px`,
                left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 60}px`,
              }}
              animate={{
                scale: [0.5, 1.2, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-white mb-2 font-secondary">
            Byte<span className="text-cheese">!</span>
          </h1>
          <p className="text-cheese/80 text-lg font-sans">Campus Food Delivery</p>
        </motion.div>

        {/* Loading Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-medium text-white/90 mb-8 min-h-[28px] font-sans"
          >
            {loadingText}
          </motion.p>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mb-6">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-cheese to-pepperoni rounded-full shadow-lg"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <motion.p 
            className="text-center text-cheese/70 text-sm mt-2 font-sans"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {Math.min(Math.round(progress), 100)}% Complete
          </motion.p>
        </div>

        {/* Loading Dots */}
        <motion.div 
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-4 h-4 bg-cheese rounded-full shadow-lg"
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.4, 1, 0.4] 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: dot * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Subtle bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-white/60 text-sm mt-6 font-sans"
        >
          Delivering happiness to your doorstep
        </motion.p>
      </motion.div>

      {/* Ambient lighting effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-cheese/5 via-transparent to-transparent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default LoadingPage;
