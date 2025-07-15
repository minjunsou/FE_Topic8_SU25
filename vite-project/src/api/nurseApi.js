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
   * Lấy danh sách tất cả phụ huynh
   * @param {Object} params - Tham số truy vấn
   * @param {number} params.page - Trang hiện tại (mặc định: 0)
   * @param {number} params.size - Số lượng mục trên mỗi trang (mặc định: 100)
   * @param {number} params.roleId - ID vai trò (mặc định: 3 - phụ huynh)
   * @param {string} params.sortBy - Trường để sắp xếp (mặc định: fullName)
   * @param {string} params.direction - Hướng sắp xếp (mặc định: asc)
   * @returns {Promise} - Promise chứa danh sách phụ huynh
   */
  getAllParents: async (params = {}) => {
    try {
      const defaultParams = {
        page: 0,
        size: 100,
        roleId: 2, // ID vai trò phụ huynh
        sortBy: 'fullName',
        direction: 'asc'
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      const response = await axiosInstance.get('/v1/accounts', { params: queryParams });
      
      // Dựa vào cấu trúc response thực tế từ API
      if (response.data && response.data.accounts) {
        return response.data.accounts || [];
      }
      
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phụ huynh:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả học sinh
   * @param {Object} params - Tham số truy vấn
   * @param {number} params.page - Trang hiện tại (mặc định: 0)
   * @param {number} params.size - Số lượng mục trên mỗi trang (mặc định: 100)
   * @param {number} params.roleId - ID vai trò (mặc định: 4 - học sinh)
   * @param {string} params.sortBy - Trường để sắp xếp (mặc định: fullName)
   * @param {string} params.direction - Hướng sắp xếp (mặc định: asc)
   * @returns {Promise} - Promise chứa danh sách học sinh
   */
  getAllStudents: async (params = {}) => {
    try {
      const defaultParams = {
        page: 0,
        size: 100,
        roleId: 1, // ID vai trò học sinh
        sortBy: 'fullName',
        direction: 'asc'
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      const response = await axiosInstance.get('/v1/accounts', { params: queryParams });
      
      // Dựa vào cấu trúc response thực tế từ API
      if (response.data && response.data.accounts) {
        return response.data.accounts || [];
      }
      
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học sinh:', error);
      throw error;
    }
  },

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
      
      const response = await axiosInstance.get(`/v1/accounts/${parentId}/children`);
      
      // Dựa vào cấu trúc response thực tế từ API
      if (response.data && response.data.children) {
        return response.data.children || [];
      }
      
      return [];
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách con của phụ huynh ID ${parentId}:`, error);
      throw error;
    }
  },

  /**
   * Thêm học sinh vào phụ huynh
   * @param {string} studentId - ID của học sinh
   * @param {string} parentId - ID của phụ huynh
   * @returns {Promise} - Promise chứa kết quả thêm học sinh vào phụ huynh
   */
  addStudentToParent: async (studentId, parentId) => {
    try {
      if (!studentId || !parentId) {
        throw new Error('studentId và parentId là bắt buộc');
      }
      
      const requestBody = {
        studentId,
        parentId
      };
      
      console.log(`Gọi API POST /v1/student-parents với body:`, requestBody);
      
      const response = await axiosInstance.post('/v1/student-parents', requestBody);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi thêm học sinh ID ${studentId} vào phụ huynh ID ${parentId}:`, error);
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
        quantityType: medicationData.quantityType || 'viên',
        medicationType: medicationData.medicationType || 'MEDICATION',
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
        quantityType: medicationData.quantityType || 'viên',
        medicationType: medicationData.medicationType || 'MEDICATION',
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
  },

  /**
   * Lấy danh sách tất cả các yêu cầu thuốc đang hoạt động
   * @returns {Promise} - Promise chứa danh sách yêu cầu thuốc
   */
  getAllActiveMedicationRequests: async () => {
    try {
      console.log('Đang gọi API lấy danh sách yêu cầu thuốc đang hoạt động');
      const response = await axiosInstance.get('/medication-sent/all-students/active-med-sents');
      console.log('API response:', response);
      
      // Dựa vào cấu trúc response từ API
      if (response.data && response.data.medicationSentList) {
        return response.data.medicationSentList;
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu cầu thuốc đang hoạt động:', error);
      throw error;
    }
  },

  /**
   * Tạo thông báo kiểm tra sức khỏe mới
   * @param {Object} healthCheckData - Dữ liệu kiểm tra sức khỏe
   * @returns {Promise} - Promise chứa kết quả tạo thông báo
   */
  createHealthCheckNotice: async (healthCheckData) => {
    try {
      const response = await axiosInstance.post('/v1/health-check-notices', healthCheckData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo kiểm tra sức khỏe:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách thông báo kiểm tra sức khỏe
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise} - Promise chứa danh sách thông báo
   */
  getAllHealthCheckNotices: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/health-check-notices', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông báo kiểm tra sức khỏe:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin thông báo kiểm tra sức khỏe
   * @param {number} noticeId - ID của thông báo cần cập nhật
   * @param {Object} healthCheckData - Dữ liệu cập nhật
   * @returns {Promise} - Promise chứa kết quả cập nhật
   */
  updateHealthCheckNotice: async (noticeId, healthCheckData) => {
    try {
      const response = await axiosInstance.put(`/v1/health-check-notices/${noticeId}`, healthCheckData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông báo kiểm tra sức khỏe ID ${noticeId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa thông báo kiểm tra sức khỏe
   * @param {number} noticeId - ID của thông báo cần xóa
   * @returns {Promise} - Promise chứa kết quả xóa
   */
  deleteHealthCheckNotice: async (noticeId) => {
    try {
      const response = await axiosInstance.delete(`/v1/health-check-notices/${noticeId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa thông báo kiểm tra sức khỏe ID ${noticeId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xác nhận kiểm tra sức khỏe
   * @param {number} noticeId - ID của thông báo kiểm tra sức khỏe
   * @returns {Promise} - Promise chứa danh sách xác nhận
   */
  getHealthCheckConfirmations: async (noticeId) => {
    try {
      const response = await axiosInstance.get(`/v1/health-check-notices/${noticeId}/confirmations`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách xác nhận kiểm tra sức khỏe cho thông báo ID ${noticeId}:`, error);
      throw error;
    }
  },

  /**
   * Gửi kết quả kiểm tra sức khỏe cho học sinh
   * @param {Object} healthCheckResult - Kết quả kiểm tra sức khỏe
   * @returns {Promise} - Promise chứa kết quả gửi
   */
  submitHealthCheckResult: async (healthCheckResult) => {
    try {
      const response = await axiosInstance.post('/v1/health-check-records', healthCheckResult);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gửi kết quả kiểm tra sức khỏe:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử kiểm tra sức khỏe của học sinh
   * @param {string} studentId - ID của học sinh
   * @returns {Promise} - Promise chứa lịch sử kiểm tra sức khỏe
   */
  getStudentHealthCheckHistory: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/v1/students/${studentId}/health-check-records`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy lịch sử kiểm tra sức khỏe cho học sinh ID ${studentId}:`, error);
      throw error;
    }
  }
};

export default nurseApi;
