import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LoadingPage = () => {
  const [loadingText, setLoadingText] = useState("Preparing your meal");
  
  useEffect(() => {
    const messages = [
      "Preparing your meal",
      "Adding a sprinkle of flavor",
      "Stirring the pot",
      "Almost ready to serve",
      "Plating your delicious order"
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingText(messages[currentIndex]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#990000] to-black">
      <div className="z-10 flex flex-col items-center text-center p-8 rounded-xl bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="relative w-32 h-32 mb-5">
          {/* Logo animation */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path 
                d="M50,50 L85,15 A50,50 0 0,1 85,85 Z" 
                fill="#FFCC00"
              />
            </svg>
          </motion.div>
          <motion.div 
            className="absolute top-0 left-0 w-full h-full"
            animate={{ 
              rotate: [0, 120],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: 0.5,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path 
                d="M50,50 L15,15 A50,50 0 0,0 15,85 Z" 
                fill="#FFCC00"
              />
            </svg>
          </motion.div>
          <motion.div 
            className="absolute top-0 left-0 w-full h-full"
            animate={{ 
              rotate: [0, 240],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path 
                d="M50,50 L50,0 A50,50 0 0,0 0,50 Z" 
                fill="#FFCC00"
              />
            </svg>
          </motion.div>
          
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#990000] rounded-full"></div>
        </div>

        <motion.div 
          className="mt-2 mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-[#FFCC00]">Byte!</h1>
        </motion.div>

        <motion.p 
          className="mt-2 text-xl font-medium text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {loadingText}
        </motion.p>
        
        <motion.div 
          className="mt-6 flex space-x-2"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-3 h-3 bg-[#FFCC00] rounded-full"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: dot * 0.3,
                repeatType: "reverse" 
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingPage;
