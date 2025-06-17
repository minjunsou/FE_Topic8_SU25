import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import 'antd/dist/reset.css' // Import Ant Design CSS
import './index.css'
import './App.css' // Import CSS chung của ứng dụng

// Thêm Google Fonts
const googleFontsLink = document.createElement('link');
googleFontsLink.rel = 'stylesheet';
googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
document.head.appendChild(googleFontsLink);

// Xử lý lỗi foregroundCache và các lỗi không bắt được khác
window.addEventListener('error', (event) => {
  if (event.message.includes('Extension context invalidated') || 
      event.message.includes('foregroundCache')) {
    console.warn('Bỏ qua lỗi Extension context:', event.message);
    event.preventDefault();
  }
});

// Xử lý lỗi Promise không bắt được
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && 
      (event.reason.message?.includes('Extension context invalidated') || 
       event.reason.message?.includes('foregroundCache'))) {
    console.warn('Bỏ qua lỗi Promise Extension context:', event.reason.message);
    event.preventDefault();
  }
});

// Cấu hình debug
if (import.meta.env.DEV) {
  console.log('Running in development mode');
  window.debugMode = true;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // Tạm thời bỏ StrictMode để giảm thiểu lỗi
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
)
