import axiosInstance from './axiosConfig';

const nurseApi = {
  /**
   * Lấy danh sách tất cả thuốc
   * @returns {Promise} - Promise chứa danh sách thuốc
   */
  getAllMedications: async () => {
    try {
      const response = await axiosInstance.get('/v1/medications');
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thuốc:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách thuốc có số lượng thấp hơn ngưỡng
   * @param {number} threshold - Ngưỡng số lượng tối thiểu
   * @returns {Promise} - Promise chứa danh sách thuốc sắp hết
   */
  getLowStockMedications: async (threshold = 5) => {
    try {
      const response = await axiosInstance.get(`/v1/medications/low-stock?threshold=${threshold}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách thuốc sắp hết với ngưỡng ${threshold}:`, error);
      throw error;
    }
  },

  /**
   * Thêm thuốc mới
   * @param {Object} medicationData - Dữ liệu thuốc mới
   * @returns {Promise} - Promise chứa kết quả thêm thuốc
   */
  addMedication: async (medicationData) => {
    try {
      // Đảm bảo format của request body đúng với yêu cầu API
      const requestBody = {
        name: medicationData.name,
        description: medicationData.description,
        quantity: medicationData.quantity,
        expiryDate: medicationData.expiryDate
      };
      
      console.log('Request body để thêm thuốc mới:', requestBody);
      
      const response = await axiosInstance.post('/v1/medications', requestBody);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm thuốc mới:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin thuốc
   * @param {number} medicationId - ID của thuốc cần cập nhật
   * @param {Object} medicationData - Dữ liệu thuốc cần cập nhật
   * @returns {Promise} - Promise chứa kết quả cập nhật thuốc
   */
  updateMedication: async (medicationId, medicationData) => {
    try {
      if (!medicationId) {
        throw new Error('medicationId là bắt buộc để cập nhật thuốc');
      }

      // Đảm bảo format của request body đúng với yêu cầu API
      const requestBody = {
        name: medicationData.name,
        description: medicationData.description,
        quantity: medicationData.quantity,
        expiryDate: medicationData.expiryDate
      };
      
      console.log(`Request body để cập nhật thuốc ID ${medicationId}:`, requestBody);
      console.log(`Gọi API PUT /v1/medications/${medicationId}`);
      
      const response = await axiosInstance.put(`/v1/medications/${medicationId}`, requestBody);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thuốc ID ${medicationId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa thuốc
   * @param {number} medicationId - ID của thuốc cần xóa
   * @returns {Promise} - Promise chứa kết quả xóa thuốc
   */
  deleteMedication: async (medicationId) => {
    try {
      if (!medicationId) {
        throw new Error('medicationId là bắt buộc để xóa thuốc');
      }
      
      console.log(`Gọi API DELETE /v1/medications/${medicationId}`);
      
      const response = await axiosInstance.delete(`/v1/medications/${medicationId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa thuốc ID ${medicationId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết của một thuốc
   * @param {number} medicationId - ID của thuốc cần lấy thông tin
   * @returns {Promise} - Promise chứa thông tin chi tiết của thuốc
   */
  getMedicationById: async (medicationId) => {
    try {
      const response = await axiosInstance.get(`/v1/medications/${medicationId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thuốc ID ${medicationId}:`, error);
      throw error;
    }
  }
};

export default nurseApi;
