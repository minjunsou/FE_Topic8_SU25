import axiosInstance from './axiosConfig';
import authApi from './authApi';
import nurseApi from './nurseApi';
import parentApi from './parentApi';

// API cho thông tin người dùng
const userApi = {
  // Cập nhật thông tin người dùng
  updateUserProfile: async (accountId, userData) => {
    try {
      if (!accountId) {
        throw new Error('accountId là bắt buộc để cập nhật thông tin người dùng');
      }
      
      console.log(`Đang gọi API để cập nhật thông tin người dùng ID: ${accountId}`);
      console.log('Dữ liệu cập nhật:', userData);
      
      // Gọi API cập nhật thông tin người dùng
      const response = await axiosInstance.put(`/v1/accounts/${accountId}`, userData);
      
      // Log response để debug
      console.log('API response:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin người dùng ID ${accountId}:`, error);
      throw error;
    }
  },

  // Lấy thông tin người dùng
  getUserProfile: async (accountId) => {
    try {
      if (!accountId) {
        throw new Error('accountId là bắt buộc để lấy thông tin người dùng');
      }
      
      console.log(`Đang gọi API để lấy thông tin người dùng ID: ${accountId}`);
      
      // Gọi API lấy thông tin người dùng
      const response = await axiosInstance.get(`/v1/accounts/${accountId}`);
      
      // Log response để debug
      console.log('API response:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ID ${accountId}:`, error);
      throw error;
    }
  }
};

export {
  authApi,
  nurseApi,
  parentApi,
  userApi
}; 