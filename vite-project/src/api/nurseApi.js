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
   * @returns {Promise} - Promise chứa danh sách phụ huynh
   */
  getAllParents: async () => {
    try {
      console.log('Fetching all parents data');
      const response = await axiosInstance.get('/v1/accounts', {
        params: {
          page: 0,
          size: 100,
          roleId: 2,
          sortBy: 'fullName',
          direction: 'asc'
        }
      });
      
      // Dựa vào cấu trúc response thực tế từ API
      if (response.data && response.data.accounts) {
        console.log(`Found ${response.data.accounts.length} parents`);
        return response.data.accounts;
      }
      
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phụ huynh:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả học sinh
   * @returns {Promise} - Promise chứa danh sách học sinh
   */
  getAllStudents: async () => {
    try {
      console.log('Fetching all students data');
      const response = await axiosInstance.get('/v1/accounts', {
        params: {
          page: 0,
          size: 100,
          roleId: 1,
          sortBy: 'fullName',
          direction: 'asc'
        }
      });
      
      // Dựa vào cấu trúc response thực tế từ API
      if (response.data && response.data.accounts) {
        console.log(`Found ${response.data.accounts.length} students`);
        return response.data.accounts;
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
      
      // Định dạng lại response theo cấu trúc mới từ API
      if (response.data && Array.isArray(response.data.medicationSentList)) {
        return response.data.medicationSentList.map(item => ({
          medSentId: item.medSentId,
          studentId: item.studentId,
          parentId: item.parentId,
          requestDate: item.requestDate,
          sentAt: item.sentAt,
          isAccepted: item.isAccepted,
          dosages: Array.isArray(item.dosages) ? item.dosages.map(dosage => ({
            id: dosage.id,
            timingNotes: dosage.timingNotes,
            medicationItems: Array.isArray(dosage.medicationItems) ? dosage.medicationItems.map(med => ({
              id: med.id,
              medicationName: med.medicationName,
              amount: med.amount
            })) : []
          })) : []
        }));
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
      console.log('Creating health check notice with data:', healthCheckData);
      const response = await axiosInstance.post('/v1/health-check-notices/create', healthCheckData);
      console.log('Health check notice API response:', response);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo kiểm tra sức khỏe:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách thông báo kiểm tra sức khỏe
   * @returns {Promise} - Promise chứa danh sách thông báo
   */
  getAllHealthCheckNotices: async () => {
    try {
      const response = await axiosInstance.get('/v1/health-check-notices/getAll');
      // The response format is { time_stamp, data: [...notices] }
      return response.data;
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
   * Lấy danh sách xác nhận kiểm tra sức khỏe cho một thông báo
   * @param {number} noticeId - ID của thông báo kiểm tra sức khỏe
   * @returns {Promise} - Promise chứa danh sách xác nhận
   */
  getHealthCheckConfirmations: async (noticeId) => {
    try {
      const response = await axiosInstance.get(`/v1/health-check-confirmations/getByNotice/${noticeId}`);
      // The response format might be { time_stamp, data: [...confirmations] }
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách xác nhận kiểm tra sức khỏe cho thông báo ID ${noticeId}:`, error);
      throw error;
    }
  },

  /**
   * Gửi kết quả kiểm tra sức khỏe cho học sinh
   * @param {string} studentId - ID của học sinh
   * @param {string} nurseId - ID của y tá
   * @param {Object} healthCheckResult - Kết quả kiểm tra sức khỏe
   * @returns {Promise} - Promise chứa kết quả gửi
   */
  submitHealthCheckResult: async (studentId, nurseId, healthCheckResult) => {
    try {
      // Log detailed request information for debugging
      const endpoint = `/v1/health-check-records/create?studentId=${studentId}&nurseId=${nurseId}`;
      
      // Create payload with exact field order as per Swagger docs
      const payload = JSON.stringify({
        healthCheckNoticeId: healthCheckResult.healthCheckNoticeId,
        result: healthCheckResult.result,
        date: healthCheckResult.date
      });
      
      console.log('Calling API endpoint:', endpoint);
      console.log('Request payload:', payload);
      console.log('Student ID:', studentId);
      console.log('Nurse ID:', nurseId);
      
      // Make the API call with specific content-type header
      const response = await axiosInstance.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Health check result API response:', response);

      // Check if response is successful, even if it doesn't have data
      if (response && response.status >= 200 && response.status < 300) {
        // Success - return whatever data is available
        return response.data || { success: true };
      }
      
      // If we get here, the response is not successful
      throw new Error(`Unsuccessful response: ${response.status}`);
    } catch (error) {
      console.error('Lỗi khi gửi kết quả kiểm tra sức khỏe:', error);
      
      // Enhanced error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
      
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
      const response = await axiosInstance.get(`/v1/health-check-records/getByStudent/${studentId}`);
      // The response format might be { time_stamp, data: [...records] }
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy lịch sử kiểm tra sức khỏe cho học sinh ID ${studentId}:`, error);
      throw error;
    }
  },

  /**
   * Vaccination Notice APIs
   */
  getAllVaccinationNotices: async () => {
    try {
      const response = await axiosInstance.get('/v1/vaccination-notices');
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông báo tiêm chủng:', error);
      throw error;
    }
  },

  getVaccinationNoticeById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-notices/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông báo tiêm chủng ID ${id}:`, error);
      throw error;
    }
  },

  createVaccinationNotice: async (noticeData, vaccineBatchId) => {
    try {
      const response = await axiosInstance.post(`/v1/vaccination-notices?vaccineBatchId=${vaccineBatchId}`, noticeData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo tiêm chủng:', error);
      throw error;
    }
  },

  updateVaccinationNotice: async (id, noticeData) => {
    try {
      const response = await axiosInstance.put(`/v1/vaccination-notices/${id}`, noticeData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông báo tiêm chủng ID ${id}:`, error);
      throw error;
    }
  },

  deleteVaccinationNotice: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/vaccination-notices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa thông báo tiêm chủng ID ${id}:`, error);
      throw error;
    }
  },

  searchVaccinationNotices: async (vaccineName) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-notices/search?vaccineName=${encodeURIComponent(vaccineName)}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi tìm kiếm thông báo tiêm chủng:', error);
      throw error;
    }
  },

  getTodayVaccinationNotices: async () => {
    try {
      const response = await axiosInstance.get('/v1/vaccination-notices/today');
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy thông báo tiêm chủng hôm nay:', error);
      throw error;
    }
  },

  getActiveVaccinationNotices: async () => {
    try {
      const response = await axiosInstance.get('/v1/vaccination-notices/active');
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy thông báo tiêm chủng sắp tới:', error);
      throw error;
    }
  },

  /**
   * Lọc thông báo tiêm chủng theo vaccine, batch, ngày tiêm, exact
   * @param {Object} params - { vaccineId, vaccineBatchId, vaccinationDate, exact }
   * @returns {Promise}
   */
  filterVaccinationNotices: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.vaccineId) query.append('vaccineId', params.vaccineId);
      if (params.vaccineBatchId) query.append('vaccineBatchId', params.vaccineBatchId);
      if (params.vaccinationDate) query.append('vaccinationDate', params.vaccinationDate); // yyyy-MM-dd
      if (params.exact !== undefined) query.append('exact', params.exact);
      const response = await axiosInstance.get(`/v1/vaccination-notices/filter?${query.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lọc thông báo tiêm chủng:', error);
      throw error;
    }
  },

  /**
   * Vaccination Confirmation APIs 
   */
  getVaccinationConfirmationById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-confirmations/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy xác nhận tiêm chủng ID ${id}:`, error);
      throw error;
    }
  },

  getAllVaccinationConfirmations: async () => {
    try {
      const response = await axiosInstance.get('/v1/vaccination-confirmations');
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách xác nhận tiêm chủng:', error);
      throw error;
    }
  },

  getVaccinationConfirmationsByStudent: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-confirmations/student/${studentId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy xác nhận tiêm chủng theo học sinh ID ${studentId}:`, error);
      throw error;
    }
  },

  getVaccinationConfirmationsByParent: async (parentId) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-confirmations/parent/${parentId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy xác nhận tiêm chủng theo phụ huynh ID ${parentId}:`, error);
      throw error;
    }
  },

  getVaccinationConfirmationsByNotice: async (vaccineNoticeId) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-confirmations/notice/${vaccineNoticeId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy xác nhận tiêm chủng theo thông báo ID ${vaccineNoticeId}:`, error);
      throw error;
    }
  },

  getVaccinationConfirmationsByStatus: async (status) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-confirmations/status/${status}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy xác nhận tiêm chủng theo trạng thái ${status}:`, error);
      throw error;
    }
  },

  updateVaccinationConfirmation: async (id, confirmationData) => {
    try {
      const response = await axiosInstance.put(`/v1/vaccination-confirmations/${id}`, confirmationData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật xác nhận tiêm chủng ID ${id}:`, error);
      throw error;
    }
  },

  deleteVaccinationConfirmation: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/vaccination-confirmations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa xác nhận tiêm chủng ID ${id}:`, error);
      throw error;
    }
  },

  getConfirmedStudentsByNotice: async (vaccineNoticeId) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-confirmations/notice/${vaccineNoticeId}/students/confirmed`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách học sinh đã xác nhận tiêm theo noticeId ${vaccineNoticeId}:`, error);
      throw error;
    }
  },

  getVaccinationConfirmationsByStatusAndParent: async (status, parentId) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-confirmations/status`, { params: { status, parentId } });
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy xác nhận tiêm chủng theo trạng thái ${status} và parentId ${parentId}:`, error);
      throw error;
    }
  },

  /**
   * Xác nhận tất cả xác nhận tiêm chủng (PUT /api/v1/vaccination-confirmations/confirm-all)
   * @param {Array} confirmationIds - Mảng các ID xác nhận cần xác nhận
   * @returns {Promise}
   */
  confirmAllVaccinationConfirmations: async (confirmationIds) => {
    try {
      const response = await axiosInstance.put('/v1/vaccination-confirmations/confirm-all', confirmationIds);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xác nhận tất cả xác nhận tiêm chủng:', error);
      throw error;
    }
  },

  /**
   * Vaccine APIs
   */
  getAllVaccines: async () => {
    try {
      const response = await axiosInstance.get('/all-vaccines');
      return response.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vaccine:', error);
      throw error;
    }
  },

  createVaccine: async (vaccineData) => {
    try {
      const response = await axiosInstance.post('/create-vaccine', vaccineData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo vaccine:', error);
      throw error;
    }
  },

  createVaccineBatch: async (vaccineId, batchData) => {
    try {
      const response = await axiosInstance.post(`/${vaccineId}/create-vaccine-batch`, batchData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi tạo lô vaccine cho vaccineId ${vaccineId}:`, error);
      throw error;
    }
  },

  getVaccineBatchesByVaccineId: async (vaccineId) => {
    try {
      const response = await axiosInstance.get(`/vaccines/${vaccineId}/batches`);
      return response.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách lô vaccine cho vaccineId ${vaccineId}:`, error);
      throw error;
    }
  },

  reduceVaccineBatchQuantity: async (batchId, quantityToReduce) => {
    try {
      const response = await axiosInstance.patch(`/vaccine-batches/${batchId}/reduce`, { quantityToReduce });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi giảm số lượng lô vaccine batchId ${batchId}:`, error);
      throw error;
    }
  },

  /**
   * Vaccination Record APIs
   */
  createVaccinationRecord: async (recordData, nurseId) => {
    try {
      const response = await axiosInstance.post(`/v1/vaccination-records`, recordData, { params: { nurseId } });
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi tạo vaccination record:', error);
      throw error;
    }
  },

  getVaccinationRecordById: async (id) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-records/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy vaccination record ID ${id}:`, error);
      throw error;
    }
  },

  getAllVaccinationRecords: async () => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-records`);
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vaccination records:', error);
      throw error;
    }
  },

  getVaccinationRecordsByStudent: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-records/student/${studentId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy vaccination records cho student ${studentId}:`, error);
      throw error;
    }
  },

  getVaccinationRecordsByNurse: async (nurseId) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-records/nurse/${nurseId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy vaccination records cho nurse ${nurseId}:`, error);
      throw error;
    }
  },

  getVaccinationRecordsByNotice: async (vaccineNoticeId) => {
    try {
      const response = await axiosInstance.get(`/v1/vaccination-records/notice/${vaccineNoticeId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Lỗi khi lấy vaccination records cho notice ${vaccineNoticeId}:`, error);
      throw error;
    }
  },

  updateVaccinationRecord: async (id, recordData) => {
    try {
      const response = await axiosInstance.put(`/v1/vaccination-records/${id}`, recordData);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật vaccination record ID ${id}:`, error);
      throw error;
    }
  },

  deleteVaccinationRecord: async (id) => {
    try {
      const response = await axiosInstance.delete(`/v1/vaccination-records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa vaccination record ID ${id}:`, error);
      throw error;
    }
  },

  createMedicalProfile: async (childId, medicalData, recordId) => {
    try {
      if (!childId) {
        throw new Error('childId là bắt buộc để tạo hồ sơ y tế');
      }

      console.log(`Đang gọi API tạo hồ sơ y tế cho học sinh ID: ${childId}`);
      console.log('Dữ liệu hồ sơ y tế:', JSON.stringify(medicalData, null, 2));
      
      // Xây dựng endpoint dựa trên việc có recordId hay không
      let endpoint;
      if (recordId) {
        endpoint = `/medicalProfiles/create/${childId}/${recordId}`;
      } else {
        endpoint = `/medicalProfiles/create/${childId}/1`; // Default to recordId 1 if not provided
      }
      
      console.log('Medical profile API endpoint:', endpoint);
      
      // Gọi API tạo hồ sơ y tế
      const response = await axiosInstance.post(endpoint, medicalData);
      
      // Log response để debug
      console.log('Medical profile API response:', response);
      
      // Check if response is successful, even if it doesn't have data
      if (response && response.status >= 200 && response.status < 300) {
        // Success - return whatever data is available
        return response.data || { success: true };
      }
      
      // If we get here, the response is not successful
      throw new Error(`Unsuccessful response: ${response.status}`);
    } catch (error) {
      console.error(`Lỗi khi tạo hồ sơ y tế cho học sinh ID ${childId}:`, error);
      
      // Enhanced error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
      
      throw error;
    }
  },
  
  /**
   * Lấy tất cả hồ sơ sức khỏe của học sinh
   * @param {string} studentId - ID của học sinh
   * @returns {Promise} - Promise chứa danh sách hồ sơ sức khỏe
   */
  getStudentMedicalProfiles: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/medicalProfiles/all/${studentId}`);
      return response.data.medicalProfiles || [];
    } catch (error) {
      console.error(`Lỗi khi lấy hồ sơ sức khỏe cho học sinh ID ${studentId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo thông báo cho phụ huynh
   * @param {Object} notificationData - Dữ liệu thông báo
   * @returns {Promise} - Promise chứa kết quả tạo thông báo
   */
  createParentNotification: async (notificationData) => {
    try {
      console.log('Đang tạo thông báo cho phụ huynh:', notificationData);
      const response = await axiosInstance.post('/v1/notifications/create', notificationData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo cho phụ huynh:', error);
      throw error;
    }
  },

  /**
   * Tạo thông báo kiểm tra sức khỏe và tự động tạo các xác nhận cho tất cả học sinh
   * @param {Object} healthCheckData - Dữ liệu kiểm tra sức khỏe
   * @returns {Promise} - Promise chứa kết quả tạo thông báo và xác nhận
   */
  createHealthCheckNoticeWithConfirmations: async (healthCheckData) => {
    try {
      console.log('Creating health check notice with data:', healthCheckData);
      
      // Bước 1: Tạo thông báo kiểm tra sức khỏe
      const healthCheckResponse = await nurseApi.createHealthCheckNotice(healthCheckData);
      console.log('Health check notice created:', healthCheckResponse);
      
      // Xác định ID của thông báo vừa tạo - kiểm tra nhiều vị trí có thể chứa ID
      let noticeId = null;
      
      // Kiểm tra cấu trúc response để tìm checkNoticeId
      if (healthCheckResponse && typeof healthCheckResponse === 'object') {
        if (healthCheckResponse.checkNoticeId) {
          noticeId = healthCheckResponse.checkNoticeId;
        } else if (healthCheckResponse.data && healthCheckResponse.data.checkNoticeId) {
          noticeId = healthCheckResponse.data.checkNoticeId;
        } else if (healthCheckResponse.id) {
          noticeId = healthCheckResponse.id;
        } else if (healthCheckResponse.data && healthCheckResponse.data.id) {
          noticeId = healthCheckResponse.data.id;
        }
      }
      
      // Log cấu trúc response để debug
      console.log('Health check response structure:', JSON.stringify(healthCheckResponse, null, 2));
      
      if (!noticeId) {
        console.error('Could not determine notice ID from response:', healthCheckResponse);
        throw new Error('Không thể xác định ID của thông báo vừa tạo');
      }
      
      console.log('Successfully created health check notice with ID:', noticeId);
      
      // Bước 2: Lấy danh sách tất cả phụ huynh
      console.log('Fetching all parents...');
      const parentsResponse = await axiosInstance.get('/v1/accounts', {
        params: {
          page: 0,
          size: 100, // Đủ lớn để lấy tất cả phụ huynh
          roleId: 2, // Phụ huynh
          sortBy: 'fullName',
          direction: 'asc'
        }
      });
      
      if (!parentsResponse.data || !parentsResponse.data.accounts || !Array.isArray(parentsResponse.data.accounts)) {
        console.error('Invalid parents response:', parentsResponse.data);
        throw new Error('Không thể lấy danh sách phụ huynh');
      }
      
      const parents = parentsResponse.data.accounts;
      console.log(`Found ${parents.length} parents`);
      
      // Bước 3: Với mỗi phụ huynh, lấy danh sách con
      const confirmationPromises = [];
      
      for (const parent of parents) {
        const parentId = parent.accountId;
        if (!parentId) {
          console.warn(`Skipping parent with missing accountId:`, parent);
          continue;
        }
        
        console.log(`Fetching children for parent ID: ${parentId}`);
        
        try {
          const childrenResponse = await axiosInstance.get(`/v1/accounts/${parentId}/children`);
          
          if (childrenResponse.data && childrenResponse.data.children && Array.isArray(childrenResponse.data.children)) {
            const children = childrenResponse.data.children;
            console.log(`Found ${children.length} children for parent ID: ${parentId}`);
            
            // Bước 4: Với mỗi cặp parent-child, tạo confirmation
            for (const child of children) {
              // Kiểm tra và lấy childId từ các trường có thể chứa ID
              let childId = null;
              if (child.childId) {
                childId = child.childId;
              } else if (child.accountId) {
                childId = child.accountId;
              } else if (child.studentId) {
                childId = child.studentId;
              }
              
              if (!childId) {
                console.warn(`Skipping child with missing ID:`, child);
                continue;
              }
              
              console.log(`Creating confirmation for notice ID: ${noticeId}, parent ID: ${parentId}, child ID: ${childId}`);
              
              // Đảm bảo thứ tự trường khớp với yêu cầu API
              const confirmationData = {
                "healthCheckNoticeId": parseInt(noticeId),
                "studentId": childId,
                "parentId": parentId,
                "status": "PENDING"
              };
              
              console.log('Confirmation request body:', JSON.stringify(confirmationData));
              
              // Thêm promise vào mảng để thực hiện song song
              confirmationPromises.push(
                axiosInstance.post('/v1/health-check-confirmations', confirmationData)
                  .then(res => {
                    console.log(`Confirmation created successfully for child ID: ${childId}`);
                    return res.data;
                  })
                  .catch(err => {
                    console.error(`Error creating confirmation for child ID: ${childId}`, err);
                    if (err.response) {
                      console.error('Error response data:', err.response.data);
                      console.error('Error response status:', err.response.status);
                    }
                    return null;
                  })
              );
            }
          } else {
            console.warn(`No children found or invalid response format for parent ID: ${parentId}`, childrenResponse.data);
          }
        } catch (error) {
          console.error(`Error fetching children for parent ID: ${parentId}`, error);
        }
      }
      
      // Bước 5: Đợi tất cả các promise hoàn thành
      console.log(`Waiting for ${confirmationPromises.length} confirmation requests to complete...`);
      const confirmationResults = await Promise.allSettled(confirmationPromises);
      
      const successCount = confirmationResults.filter(result => result.status === 'fulfilled' && result.value).length;
      const failCount = confirmationResults.length - successCount;
      
      console.log(`Created ${successCount} confirmations successfully, ${failCount} failed`);
      
      // Trả về kết quả tạo thông báo và số lượng xác nhận đã tạo
      return {
        ...healthCheckResponse,
        confirmations: {
          total: confirmationPromises.length,
          success: successCount,
          failed: failCount
        }
      };
    } catch (error) {
      console.error('Error in createHealthCheckNoticeWithConfirmations:', error);
      
      // Log chi tiết lỗi
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  },

  /**
   * Lấy danh sách học sinh dựa trên danh sách ID
   * @param {Array<string>} studentIds - Danh sách ID của học sinh cần lấy thông tin
   * @returns {Promise} - Promise chứa danh sách học sinh
   */
  getStudentsByIds: async (studentIds) => {
    try {
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        console.log('Không có ID học sinh nào được cung cấp');
        return [];
      }
      
      console.log(`Lấy thông tin cho ${studentIds.length} học sinh với ID:`, studentIds);
      
      // Sử dụng API accounts với roleId=1 (học sinh)
      const response = await axiosInstance.get('/v1/accounts', {
        params: {
          page: 0,
          size: 100, // Đủ lớn để chứa tất cả học sinh cần lấy
          roleId: 1,
          sortBy: 'fullName',
          direction: 'asc'
        }
      });
      
      // Kiểm tra response
      if (!response.data || !response.data.accounts || !Array.isArray(response.data.accounts)) {
        console.error('API trả về dữ liệu không hợp lệ:', response.data);
        return [];
      }
      
      // Lọc học sinh theo danh sách ID
      const students = response.data.accounts.filter(student => 
        studentIds.includes(student.accountId)
      );
      
      console.log(`Tìm thấy ${students.length}/${studentIds.length} học sinh`);
      
      return students;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học sinh theo ID:', error);
      
      // Chi tiết lỗi
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      return [];
    }
  }

};

export default nurseApi;
