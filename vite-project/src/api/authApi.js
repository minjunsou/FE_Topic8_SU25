// import axiosInstance from './axiosConfig';
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
        
        // Nếu có accessToken, gọi API để lấy thông tin chi tiết của người dùng
        if (accessToken) {
          try {
            console.log('Fetching user details from /api/v1/auth/me');
            // Gọi API /api/v1/auth/me để lấy thông tin chi tiết người dùng với token trong body
            const userDetailResponse = await axios.post('/api/v1/auth/me', {
              token: accessToken
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            console.log('User detail response:', userDetailResponse);
            
            // Kiểm tra nếu response có dữ liệu và status là 200
            if (userDetailResponse.status === 200 && userDetailResponse.data && userDetailResponse.data.data) {
              // Lấy dữ liệu chi tiết người dùng
              const userDetailData = userDetailResponse.data.data;
              console.log('User detail data:', userDetailData);
              
              // Tạo đối tượng thông tin người dùng từ dữ liệu API chi tiết
              const userInfo = {
                accountId: userDetailData.accountId || '',
                username: userDetailData.username || '',
                fullName: userDetailData.fullName || '',
                name: userDetailData.fullName || userDetailData.username || '',
                dob: userDetailData.dob || null,
                gender: userDetailData.gender || null,
                phone: userDetailData.phone || '',
                roleId: userDetailData.roleId || 0,
                email: userDetailData.email || '',
                // Lưu toàn bộ dữ liệu API
                ...userDetailData
              };
              
              console.log('Formatted user info to save:', userInfo);
              
              // Lưu thông tin người dùng chi tiết vào localStorage
              localStorage.setItem('userInfo', JSON.stringify(userInfo));
              console.log('Detailed user info saved to localStorage:', userInfo);
              
              // Thông báo cho các component khác biết rằng thông tin người dùng đã thay đổi
              window.dispatchEvent(new Event('storage'));
              
              return {
                accessToken,
                refreshToken,
                user: userInfo,
                message: response.data.message
              };
            }
          } catch (userDetailError) {
            console.error('Lỗi khi lấy thông tin chi tiết người dùng:', userDetailError);
            // Nếu không thể lấy thông tin chi tiết, vẫn sử dụng thông tin cơ bản từ API đăng nhập
          }
        }
        
        // Tạo thông tin người dùng từ dữ liệu API đăng nhập (trong trường hợp không lấy được thông tin chi tiết)
        const userInfo = {
          name: userData.name || userData.fullName || loginData.email.split('@')[0],
          email: userData.email || loginData.email,
          role: userRole,
          id: userData.id || null,
          ...userData
        };
        
        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Basic user info saved to localStorage:', userInfo);
        
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
      // Lấy token từ localStorage
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('Không tìm thấy token đăng nhập');
      }
      
      // Gọi API để lấy thông tin người dùng hiện tại với token trong body
      const response = await axios.post('/api/v1/auth/me', {
        token: accessToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('User info response:', response);
      
      // Kiểm tra nếu response có dữ liệu và status là 200
      if (response.status === 200 && response.data && response.data.data) {
        // Lấy dữ liệu từ response.data.data (đây là nơi chứa thông tin người dùng)
        const userData = response.data.data;
        console.log('User data extracted from API response:', userData);
        
        // Tạo đối tượng thông tin người dùng từ dữ liệu API
        const userInfo = {
          accountId: userData.accountId || '',
          username: userData.username || '',
          fullName: userData.fullName || '',
          name: userData.fullName || userData.username || '',
          dob: userData.dob || null,
          gender: userData.gender || null,
          phone: userData.phone || '',
          roleId: userData.roleId || 0,
          email: userData.email || '',
          // Lưu toàn bộ dữ liệu API
          ...userData
        };
        
        console.log('Formatted user info to save:', userInfo);
        
        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('User info saved to localStorage:', userInfo);
        
        // Thông báo cho các component khác biết rằng thông tin người dùng đã thay đổi
        window.dispatchEvent(new Event('storage'));
        
        return {
          data: userInfo,
          message: response.data.message
        };
      } else {
        console.warn('API response does not contain user data or status is not 200:', response);
        return {
          data: null,
          message: response.data?.message || 'Không tìm thấy thông tin người dùng'
        };
      }
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng:', error);
      throw error;
    }
  },

  /**
   * Thay đổi mật khẩu người dùng
   * @param {Object} passwordData - Dữ liệu mật khẩu
   * @param {string} passwordData.currentPassword - Mật khẩu hiện tại
   * @param {string} passwordData.newPassword - Mật khẩu mới
   * @param {string} passwordData.confirmPassword - Xác nhận mật khẩu mới
   * @returns {Promise} - Promise chứa kết quả thay đổi mật khẩu
   */
  changePassword: async (passwordData) => {
    try {
      // Lấy accountId từ localStorage
      const userInfo = localStorage.getItem('userInfo');
      
      if (!userInfo) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      const { accountId } = JSON.parse(userInfo);
      
      if (!accountId) {
        throw new Error('Không tìm thấy accountId của người dùng');
      }
      
      console.log('Changing password for account:', accountId);
      
      // Chuẩn bị dữ liệu gửi đi
      const requestData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      };
      
      // Gọi API thay đổi mật khẩu
      const response = await axios.put(`/api/v1/auth/change-password/${accountId}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      console.log('Change password response:', response);
      
      // Kiểm tra kết quả
      if (response.status === 200) {
        return {
          success: true,
          message: response.data?.message || 'Đổi mật khẩu thành công'
        };
      } else {
        throw new Error(response.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu');
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      
      // Xử lý lỗi từ server
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu',
          data: error.response.data
        };
      }
      
      // Các lỗi khác
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