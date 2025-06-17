import axios from 'axios';

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  // Sử dụng URL tương đối để Vite proxy có thể xử lý
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho request
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ sessionStorage
    const token = sessionStorage.getItem('accessToken');
    
    // Nếu có token, thêm vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi là 401 (Unauthorized) và chưa thử refresh token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Lấy refresh token từ sessionStorage
        const refreshToken = sessionStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Nếu không có refresh token, chuyển hướng đến trang đăng nhập
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Gọi API refresh token
        const response = await axios.post('/api/v1/auth/refresh-token', {
          refreshToken
        });
        
        if (response.data.data?.access_token) {
          // Lưu token mới vào sessionStorage
          sessionStorage.setItem('accessToken', response.data.data.access_token);
          
          // Cập nhật token trong header của request ban đầu
          originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;
          
          // Thực hiện lại request ban đầu với token mới
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token thất bại, xóa token và chuyển hướng đến trang đăng nhập
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 