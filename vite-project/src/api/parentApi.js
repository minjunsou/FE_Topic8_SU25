import axiosInstance from './axiosConfig';

const parentApi = {
  /**
   * Lấy danh sách con của một phụ huynh
   * @param {string} parentId - ID của phụ huynh
   * @returns {Promise} - Promise chứa danh sách con của phụ huynh
   */
  getParentChildren: async (parentId) => {
    try {
      if (!parentId) {
        throw new Error('parentId là bắt buộc để lấy danh sách con');
      }
      
      console.log(`Đang gọi API để lấy danh sách con của phụ huynh ID: ${parentId}`);
      // Sử dụng đúng endpoint theo yêu cầu - http://localhost:8080/api/v1/accounts/{parentId}/children
      const response = await axiosInstance.get(`/v1/accounts/${parentId}/children`);
      
      // Log response để debug
      console.log('API response:', response);
      
      // Từ hình ảnh đã cung cấp, API trả về là { children: [...] }
      if (response.data && response.data.children) {
        console.log('Tìm thấy mảng children trong response:', response.data.children);
        return response.data.children; // Trả về mảng children
      }
      
      // Fallback cho các format khác
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách con của phụ huynh ID ${parentId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo yêu cầu thuốc cho học sinh
   * @param {string} studentId - ID của học sinh
   * @param {string} parentId - ID của phụ huynh
   * @param {Object} medicationData - Dữ liệu yêu cầu thuốc
   * @returns {Promise} - Promise chứa kết quả tạo yêu cầu thuốc
   */
  createMedicationRequest: async (studentId, parentId, medicationData) => {
    try {
      if (!studentId || !parentId) {
        throw new Error('studentId và parentId là bắt buộc để tạo yêu cầu thuốc');
      }

      console.log(`Đang gọi API tạo yêu cầu thuốc cho học sinh ID: ${studentId}, phụ huynh ID: ${parentId}`);
      console.log('Dữ liệu yêu cầu thuốc:', medicationData);
      
      // Gọi API tạo yêu cầu thuốc
      const response = await axiosInstance.post(
        `/medication-sent/create/${studentId}/${parentId}`,
        medicationData
      );
      
      // Log response để debug
      console.log('API response:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi tạo yêu cầu thuốc cho học sinh ID ${studentId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử yêu cầu thuốc của một học sinh
   * @param {string} childId - ID của học sinh
   * @returns {Promise} - Promise chứa lịch sử yêu cầu thuốc
   */
  getMedicationHistory: async (childId) => {
    try {
      if (!childId) {
        throw new Error('childId là bắt buộc để lấy lịch sử yêu cầu thuốc');
      }

      console.log(`Đang gọi API để lấy lịch sử yêu cầu thuốc của học sinh ID: ${childId}`);
      
      // Gọi API lấy lịch sử yêu cầu thuốc
      const response = await axiosInstance.get(`/medication-sent/student/${childId}/all-med-sents`);
      
      // Log response để debug
      console.log('API response:', response);
      
      // Kiểm tra định dạng response từ ảnh đã cung cấp
      if (response.data && response.data.medicationSentList) {
        return response.data.medicationSentList;
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy lịch sử yêu cầu thuốc của học sinh ID ${childId}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật yêu cầu thuốc
   * @param {string} childId - ID của học sinh
   * @param {string} medicationSentId - ID của yêu cầu thuốc
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise chứa kết quả cập nhật
   */
  updateMedicationRequest: async (childId, medicationSentId, updateData) => {
    try {
      if (!childId || !medicationSentId) {
        throw new Error('childId và medicationSentId là bắt buộc để cập nhật yêu cầu thuốc');
      }

      console.log(`Đang gọi API cập nhật yêu cầu thuốc ID: ${medicationSentId} cho học sinh ID: ${childId}`);
      console.log('Dữ liệu cập nhật:', updateData);
      
      // Gọi API cập nhật yêu cầu thuốc
      const response = await axiosInstance.put(
        `/medication-sent/update/${childId}/${medicationSentId}`,
        updateData
      );
      
      // Log response để debug
      console.log('API response:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật yêu cầu thuốc ID ${medicationSentId}:`, error);
      throw error;
    }
  },
};

export default parentApi;
