import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import LoadingScreen from '../LoadingScreen';
import './PageTransition.css';
import 'nprogress/nprogress.css';

// Cấu hình NProgress
NProgress.configure({ 
  showSpinner: false,
  easing: 'ease',
  speed: 300,
  minimum: 0.1
});

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Bắt đầu hiệu ứng loading
    setIsLoading(true);
    NProgress.start();
    
    // Giả lập thời gian tải trang (thực tế có thể phụ thuộc vào API hoặc dữ liệu)
    const timer = setTimeout(() => {
      setIsLoading(false);
      NProgress.done();
    }, 500); // Giảm thời gian loading xuống 500ms
    
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);
  
  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="page-content"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PageTransition; 