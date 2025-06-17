import axiosInstance from './axiosConfig';
import axios from 'axios';

const authApi = {
  /**
   * Đăng nhập vào hệ thống
   * @param {Object} loginData - Dữ liệu đăng nhập
   * @param {string} loginData.email - Email người dùng
   * @param {string} loginData.password - Mật khẩu người dùng
   * @returns {Promise} - Promise chứa kết quả đăng nhập
   */
  login: async (loginData) => {
    try {
      // Gọi API đăng nhập với URL tương đối để sử dụng proxy
      const response = await axios.post('/api/v1/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Raw login response:', response);
      
      // Kiểm tra nếu response có dữ liệu
      if (response && response.data) {
        // Trích xuất token từ response
        const accessToken = response.data.data?.access_token;
        const refreshToken = response.data.data?.refresh_token;
        const userData = response.data.data?.user || {};
        
        console.log('Extracted tokens:', { accessToken, refreshToken });
        console.log('User data from API:', userData);
        
        // Kiểm tra vai trò người dùng
        const userRole = userData.role || '';
        console.log('User role:', userRole);
        
        // Lưu token vào localStorage
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          console.log('Access token saved to localStorage:', accessToken);
        } else {
          console.warn('Access token not found in response');
        }
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
          console.log('Refresh token saved to localStorage:', refreshToken);
        } else {
          console.warn('Refresh token not found in response');
        }
        
        // Tạo thông tin người dùng từ dữ liệu API
        const userInfo = {
          name: userData.name || userData.fullName || loginData.email.split('@')[0],
          email: userData.email || loginData.email,
          role: userRole,
          id: userData.id || null,
          ...userData
        };
        
        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('User info saved to localStorage:', userInfo);
        
        return {
          accessToken,
          refreshToken,
          user: userInfo,
          message: response.data.message
        };
      } else {
        // Nếu không có data nhưng request thành công
        console.warn('Login API returned empty data but successful status');
        return {};
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      
      // Kiểm tra nếu có response
      if (error.response) {
        // Máy chủ trả về lỗi với mã trạng thái
        throw {
          status: error.response.status,
          message: error.response.data?.message || 'Đăng nhập thất bại',
          data: error.response.data
        };
      } else if (error.request) {
        // Yêu cầu đã được gửi nhưng không nhận được phản hồi
        throw {
          status: 0,
          message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
          data: null
        };
      } else {
        // Có lỗi xảy ra khi thiết lập yêu cầu
        throw {
          status: 0,
          message: error.message || 'Đã xảy ra lỗi khi đăng nhập',
          data: null
        };
      }
    }
  },

  /**
   * Đăng xuất khỏi hệ thống
   * @returns {Promise} - Promise chứa kết quả đăng xuất
   */
  logout: async () => {
    try {
      // Gọi API đăng xuất với URL tương đối để sử dụng proxy
      const response = await axios.post('/api/v1/auth/logout', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
        }
      });
      
      console.log('Logout response:', response);
      
      // Xóa token và thông tin người dùng khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      
      // Tạo event để thông báo thay đổi trong localStorage
      window.dispatchEvent(new Event('storage'));
      
      return response.data;
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      
      // Xóa token và thông tin người dùng khỏi localStorage ngay cả khi có lỗi
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      
      // Tạo event để thông báo thay đổi trong localStorage
      window.dispatchEvent(new Event('storage'));
      
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise} - Promise chứa thông tin người dùng
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/v1/auth/me');
      
      // Cập nhật thông tin người dùng trong localStorage nếu có dữ liệu mới
      if (response.data && response.data.data) {
        const userData = response.data.data;
        localStorage.setItem('userInfo', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng:', error);
      throw error;
    }
  },

  /**
   * Làm mới token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} - Promise chứa token mới
   */
//   refreshToken: async (refreshToken) => {
//     try {
//       const response = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
      
//       if (response.data.data?.access_token) {
//         localStorage.setItem('accessToken', response.data.data.access_token);
//       }
      
//       return response.data;
//     } catch (error) {
//       console.error('Lỗi làm mới token:', error);
//       throw error;
//     }
//   }
};

export default authApi; 