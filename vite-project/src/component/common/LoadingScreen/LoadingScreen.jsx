import React from 'react';
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <motion.div 
      className="loading-screen-minimal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="loading-content-minimal">
        <ClipLoader color="#0078FF" size={30} />
        <span className="loading-text-minimal">Loading</span>
      </div>
    </motion.div>
  );
};

export default LoadingScreen; 