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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
