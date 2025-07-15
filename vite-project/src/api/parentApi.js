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
      const response = await axiosInstance.get(`/v1/accounts/${parentId}/children`);
      
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
   * Tạo hồ sơ y tế cho học sinh
   * @param {string} childId - ID của học sinh
   * @param {Object} medicalData - Dữ liệu hồ sơ y tế
   * @param {string|number} [recordId=1] - ID của bản ghi (mặc định là 1)
   * @returns {Promise} - Promise chứa kết quả tạo hồ sơ y tế
   */
  createMedicalProfile: async (childId, medicalData, recordId = 1) => {
    try {
      if (!childId) {
        throw new Error('childId là bắt buộc để tạo hồ sơ y tế');
      }

      console.log(`Đang gọi API tạo hồ sơ y tế cho học sinh ID: ${childId}, recordId: ${recordId}`);
      console.log('Dữ liệu hồ sơ y tế:', medicalData);
      
      // Luôn sử dụng recordId (mặc định là 1 nếu không được cung cấp)
      const endpoint = `/medicalProfiles/create/${childId}/${recordId}`;
      
      // Gọi API tạo hồ sơ y tế
      const response = await axiosInstance.post(endpoint, medicalData);
      
      // Log response để debug
      console.log('API response:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi tạo hồ sơ y tế cho học sinh ID ${childId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo yêu cầu thuốc cho học sinh
   * @param {string} studentId - ID của học sinh
   * @param {string} parentId - ID của phụ huynh
   * @param {Object} medicationData - Dữ liệu yêu cầu thuốc với format mới:
   * {
   *   requestDate: "YYYY-MM-DD",
   *   dosages: [
   *     {
   *       timingNotes: "sang|trua|chieu", // Buổi dùng thuốc
   *       medicationItems: [
   *         {
   *           medicationName: "Tên thuốc",
   *           amount: 1 // Số lượng
   *         }
   *       ]
   *     }
   *   ]
   * }
   * @returns {Promise} - Promise chứa kết quả tạo yêu cầu thuốc
   */
  createMedicationRequest: async (studentId, parentId, medicationData) => {
    try {
      if (!studentId || !parentId) {
        throw new Error('studentId và parentId là bắt buộc để tạo yêu cầu thuốc');
      }

      console.log(`Đang gọi API tạo yêu cầu thuốc cho học sinh ID: ${studentId}, phụ huynh ID: ${parentId}`);
      console.log('Dữ liệu yêu cầu thuốc:', medicationData);
      
      const response = await axiosInstance.post(
        `/medication-sent/create/${studentId}/${parentId}`,
        medicationData
      );
      
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
      
      // Format mới của response từ API - theo ảnh cung cấp
      if (response.data && Array.isArray(response.data.medicationSentList)) {
        const formattedData = response.data.medicationSentList.map(item => {
          return {
            id: item.medSentId,
            studentId: item.studentId,
            parentId: item.parentId,
            requestDate: Array.isArray(item.requestDate) 
              ? `${item.requestDate[0]}-${item.requestDate[1]}-${item.requestDate[2]}` 
              : (item.requestDate || ''),
            sentDate: Array.isArray(item.sentAt) 
              ? `${item.sentAt[0]}-${item.sentAt[1]}-${item.sentAt[2]}` 
              : (item.sentAt || ''),
            status: item.isAccepted === true ? 'APPROVED' : 
                   item.isAccepted === false ? 'REJECTED' : 'PENDING',
            dosages: item.dosages || []
          };
        });
        return formattedData;
      }
      
      // Nếu response là mảng trực tiếp (tương thích ngược)
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error(`Lỗi khi lấy lịch sử yêu cầu thuốc của học sinh ID ${childId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa yêu cầu thuốc
   * @param {string} studentId - ID của học sinh
   * @param {string} medicationSentId - ID của yêu cầu thuốc cần xóa
   * @returns {Promise} - Promise chứa kết quả xóa yêu cầu thuốc
   */
  deleteMedicationRequest: async (studentId, medicationSentId) => {
    try {
      if (!studentId || !medicationSentId) {
        throw new Error('studentId và medicationSentId là bắt buộc để xóa yêu cầu thuốc');
      }

      console.log(`Đang gọi API xóa yêu cầu thuốc ID: ${medicationSentId} cho học sinh ID: ${studentId}`);
      
      // Gọi API xóa yêu cầu thuốc
      const response = await axiosInstance.delete(
        `/medication-sent/delete/${studentId}/${medicationSentId}`
      );
      
      // Log response để debug
      console.log('API response:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa yêu cầu thuốc ID ${medicationSentId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin sức khỏe mới nhất của học sinh
   * @param {string} childId - ID của học sinh
   * @returns {Promise} - Promise chứa thông tin sức khỏe của học sinh
   */
  getMedicalProfile: async (childId) => {
    try {
      if (!childId) {
        throw new Error('childId là bắt buộc để lấy thông tin sức khỏe');
      }

      console.log(`Đang gọi API để lấy thông tin sức khỏe của học sinh ID: ${childId}`);
      
      // Gọi API lấy thông tin sức khỏe mới nhất
      const response = await axiosInstance.get(`/medicalProfiles/latest/${childId}`);
      
      // Log response để debug
      console.log('API response medical profile:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sức khỏe của học sinh ID ${childId}:`, error);
      throw error;
    }
  },

  /**
   * Đặt lịch hẹn khám với bác sĩ
   * @param {string} childId - ID của học sinh
   * @param {string} parentId - ID của phụ huynh
   * @param {Object} appointmentData - Dữ liệu đặt lịch hẹn
   * @returns {Promise} - Promise chứa kết quả đặt lịch hẹn
   */
  scheduleAppointment: async (childId, parentId, appointmentData) => {
    try {
      if (!childId || !parentId) {
        throw new Error('childId và parentId là bắt buộc để đặt lịch hẹn');
      }

      console.log(`Đang gọi API đặt lịch hẹn cho học sinh ID: ${childId}, phụ huynh ID: ${parentId}`);
      console.log('Dữ liệu lịch hẹn:', appointmentData);
      
      const response = await axiosInstance.post(
        `/appointments/schedule/${childId}/${parentId}`,
        appointmentData
      );
      
      console.log('API response:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi đặt lịch hẹn cho học sinh ID ${childId}:`, error);
      throw error;
    }
  },

  /**
 * Lấy danh sách thông báo kiểm tra sức khỏe dành cho phụ huynh
 * @param {string} parentId - ID của phụ huynh
 * @returns {Promise} - Promise chứa danh sách thông báo
 */
getHealthCheckNotices: async (parentId) => {
  try {
    const response = await axiosInstance.get(`/v1/parents/${parentId}/health-check-notices`);
    return response.data.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thông báo kiểm tra sức khỏe:', error);
    throw error;
  }
},

/**
 * Xác nhận tham gia kiểm tra sức khỏe
 * @param {number} noticeId - ID của thông báo kiểm tra sức khỏe
 * @param {string} studentId - ID của học sinh
 * @param {string} parentId - ID của phụ huynh
 * @param {string} status - Trạng thái xác nhận (CONFIRMED/DECLINED)
 * @returns {Promise} - Promise chứa kết quả xác nhận
 */
confirmHealthCheck: async (noticeId, studentId, parentId, status) => {
  try {
    const requestBody = {
      checkNoticeId: noticeId,
      studentId: studentId,
      parentId: parentId,
      status: status
    };
    
    const response = await axiosInstance.post('/v1/health-check-confirmations', requestBody);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xác nhận kiểm tra sức khỏe:', error);
    throw error;
  }
},

/**
 * Lấy lịch sử kiểm tra sức khỏe của con
 * @param {string} parentId - ID của phụ huynh
 * @param {string} studentId - ID của học sinh
 * @returns {Promise} - Promise chứa lịch sử kiểm tra sức khỏe
 */
getChildHealthCheckHistory: async (parentId, studentId) => {
  try {
    const response = await axiosInstance.get(`/v1/parents/${parentId}/students/${studentId}/health-check-records`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Lỗi khi lấy lịch sử kiểm tra sức khỏe cho học sinh ID ${studentId}:`, error);
    throw error;
  }
},

/**
 * Vaccination Confirmation APIs (dành cho phụ huynh)
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

confirmAllVaccinationConfirmations: async (confirmationIds) => {
  try {
    const response = await axiosInstance.put('/v1/vaccination-confirmations/confirm-all', confirmationIds);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xác nhận tất cả xác nhận tiêm chủng:', error);
    throw error;
  }
},
};

export default parentApi;
