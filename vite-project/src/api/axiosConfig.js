import axios from 'axios';

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000, // Tăng timeout từ 10s lên 30s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm retry request
const retryRequest = async (config, retryCount = 0, maxRetries = 3) => {
  try {
    return await axiosInstance(config);
  } catch (error) {
    if (error.code === 'ECONNABORTED' && retryCount < maxRetries) {
      console.log(`Request timeout, retrying... (${retryCount + 1}/${maxRetries})`);
      // Tăng timeout cho lần retry
      const retryConfig = {
        ...config,
        timeout: config.timeout * (retryCount + 2) // Tăng timeout theo số lần retry
      };
      return retryRequest(retryConfig, retryCount + 1, maxRetries);
    }
    throw error;
  }
};

// Interceptor cho request
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    
    // Debug request
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    if (config.params) {
      console.log('Request params:', config.params);
    }
    if (config.data) {
      console.log('Request data:', config.data);
    }
    
    // Đảm bảo URL bắt đầu bằng /
    if (config.url && !config.url.startsWith('/')) {
      config.url = `/${config.url}`;
      console.log('Corrected URL path to:', config.url);
    }
    
    // Nếu có token, thêm vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Using authorization token:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.log('No authorization token found');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor cho response
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', error);
    
    // Xử lý lỗi timeout
    if (error.code === 'ECONNABORTED') {
      console.error('REQUEST TIMEOUT: Server không phản hồi trong thời gian quy định');
      console.error('Vui lòng kiểm tra:');
      console.error('1. Server backend có đang chạy không?');
      console.error('2. URL API có đúng không?');
      console.error('3. Network connection có ổn định không?');
      
      // Thử retry nếu chưa vượt quá số lần thử
      if (error.config && !error.config._retry) {
        error.config._retry = true;
        console.log('Attempting to retry request...');
        return retryRequest(error.config);
      }
    }
    
    // Chi tiết hóa các lỗi CORS
    if (error.message && error.message.includes('Network Error')) {
      console.error('NETWORK ERROR: Có thể là lỗi CORS hoặc server không phản hồi');
      console.error('Origin hiện tại:', window.location.origin);
      console.error('URL gọi API:', error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL');
      console.error('Vui lòng kiểm tra CORS policy trên server hoặc đảm bảo server đang chạy');
    }
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request (không nhận được response):', error.request);
      console.error('Request URL:', error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL');
      console.error('Request method:', error.config ? error.config.method : 'Unknown method');
    } else {
      console.error('Error message:', error.message);
    }
    
    const originalRequest = error.config;
    
    // Nếu lỗi là 401 (Unauthorized) và chưa thử refresh token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Lấy refresh token từ localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Nếu không có refresh token, chuyển hướng đến trang đăng nhập
          console.log('No refresh token found, redirecting to login');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        console.log('Attempting to refresh token');
        
        // Gọi API refresh token
        const response = await axios.post('/api/v1/auth/refresh-token', {
          refreshToken
        });
        
        if (response.data.data?.access_token) {
          // Lưu token mới vào localStorage
          localStorage.setItem('accessToken', response.data.data.access_token);
          console.log('Token refreshed successfully');
          
          // Cập nhật token trong header của request ban đầu
          originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;
          
          // Thực hiện lại request ban đầu với token mới
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token thất bại, xóa token và chuyển hướng đến trang đăng nhập
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 