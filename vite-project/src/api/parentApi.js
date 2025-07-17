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
   * Cập nhật trạng thái yêu cầu thuốc thành đã hủy
   * @param {string} studentId - ID của học sinh
   * @param {string} medicationSentId - ID của yêu cầu thuốc cần hủy
   * @returns {Promise} - Promise chứa kết quả cập nhật trạng thái yêu cầu thuốc
   */
  cancelMedicationRequest: async (studentId, medicationSentId) => {
    try {
      if (!studentId || !medicationSentId) {
        throw new Error('studentId và medicationSentId là bắt buộc để hủy yêu cầu thuốc');
      }

      console.log(`Đang gọi API hủy yêu cầu thuốc ID: ${medicationSentId} cho học sinh ID: ${studentId}`);
      
      // Vì API hiện tại chỉ có endpoint xóa, ta sẽ sử dụng localStorage để lưu trữ các yêu cầu đã hủy
      // Đây là giải pháp tạm thời cho đến khi backend hỗ trợ cập nhật trạng thái
      
      // Lấy danh sách các yêu cầu đã hủy từ localStorage
      let cancelledRequests = [];
      try {
        const cancelledRequestsStr = localStorage.getItem('cancelledMedicationRequests');
        if (cancelledRequestsStr) {
          cancelledRequests = JSON.parse(cancelledRequestsStr);
        }
      } catch (error) {
        console.error('Lỗi khi đọc danh sách yêu cầu đã hủy từ localStorage:', error);
      }
      
      // Thêm yêu cầu mới vào danh sách đã hủy
      cancelledRequests.push({
        studentId,
        medicationSentId,
        cancelledAt: new Date().toISOString()
      });
      
      // Lưu lại danh sách vào localStorage
      localStorage.setItem('cancelledMedicationRequests', JSON.stringify(cancelledRequests));
      
      return { success: true, message: 'Đã hủy yêu cầu thuốc thành công' };
    } catch (error) {
      console.error(`Lỗi khi hủy yêu cầu thuốc ID ${medicationSentId}:`, error);
      throw error;
    }
  },

  /**
   * Kiểm tra xem một yêu cầu thuốc có bị hủy không
   * @param {string} medicationSentId - ID của yêu cầu thuốc cần kiểm tra
   * @returns {boolean} - true nếu yêu cầu đã bị hủy, false nếu không
   */
  isMedicationRequestCancelled: (medicationSentId) => {
    try {
      // Lấy danh sách các yêu cầu đã hủy từ localStorage
      const cancelledRequestsStr = localStorage.getItem('cancelledMedicationRequests');
      if (!cancelledRequestsStr) {
        return false;
      }
      
      const cancelledRequests = JSON.parse(cancelledRequestsStr);
      
      // Kiểm tra xem yêu cầu có trong danh sách đã hủy không
      return cancelledRequests.some(request => request.medicationSentId === medicationSentId);
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái hủy của yêu cầu thuốc:', error);
      return false;
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
// getHealthCheckNotices: async (parentId) => {
//   try {
//     if (!parentId) {
//       throw new Error('parentId là bắt buộc để lấy danh sách thông báo kiểm tra sức khỏe');
//     }
    
//     console.log(`Đang gọi API để lấy thông báo kiểm tra sức khỏe của phụ huynh ID: ${parentId}`);
    
//     // Đảm bảo endpoint đúng định dạng và không có dấu / ở đầu (vì đã được xử lý trong axiosConfig)
//     const endpoint = `v1/parents/${parentId}/health-check-notices`;
//     console.log(`Endpoint đầy đủ: ${endpoint}`);
    
//     const response = await axiosInstance.get(endpoint);
    
//     console.log('API response health check notices:', response);
    
//     // Format dữ liệu từ response
//     const notices = response.data.data || [];
//     console.log('Dữ liệu thông báo nhận được:', notices);
    
//     return notices;
//   } catch (error) {
//     console.error(`Lỗi khi lấy danh sách thông báo kiểm tra sức khỏe của phụ huynh ID ${parentId}:`, error);
    
//     // Thêm chi tiết lỗi
//     if (error.response) {
//       console.error('Chi tiết lỗi response:', {
//         status: error.response.status,
//         statusText: error.response.statusText,
//         data: error.response.data,
//         headers: error.response.headers
//       });
//     } else if (error.request) {
//       console.error('Không nhận được response từ server:', error.request);
//       console.error('Có thể là lỗi CORS hoặc server không phản hồi');
//       console.error('URL gọi API:', `v1/parents/${parentId}/health-check-notices`);
//     } else {
//       console.error('Lỗi cấu hình request:', error.message);
//     }
    
//     // Trả về mảng rỗng để tránh crash ứng dụng
//     return [];
//   }
// },

/**
 * Xác nhận tham gia kiểm tra sức khỏe
 * @param {number} noticeId - ID của thông báo kiểm tra sức khỏe
 * @param {string} studentId - ID của học sinh
 * @param {string} parentId - ID của phụ huynh
 * @param {string} status - Trạng thái xác nhận (CONFIRMED/CANCELLED)
 * @returns {Promise} - Promise chứa kết quả xác nhận
 */
confirmHealthCheck: async (noticeId, studentId, parentId, status) => {
  try {
    const requestBody = {
      healthCheckNoticeId: noticeId,
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
// getChildHealthCheckHistory: async (parentId, studentId) => {
//   try {
//     const response = await axiosInstance.get(`/v1/parents/${parentId}/students/${studentId}/health-check-records`);
//     return response.data.data || [];
//   } catch (error) {
//     console.error(`Lỗi khi lấy lịch sử kiểm tra sức khỏe cho học sinh ID ${studentId}:`, error);
//     throw error;
//   }
// },

/**
 * Lấy danh sách thông báo của phụ huynh
 * @param {string} parentId - ID của phụ huynh
 * @returns {Promise} - Promise chứa danh sách thông báo
 */
// getNotifications: async (parentId) => {
//   try {
//     if (!parentId) {
//       throw new Error('parentId là bắt buộc để lấy danh sách thông báo');
//     }
    
//     console.log(`Đang gọi API để lấy thông báo của phụ huynh ID: ${parentId}`);
//     const response = await axiosInstance.get(`/v1/notifications/parent/${parentId}`);
    
//     // Format dữ liệu thông báo nếu cần
//     const notifications = response.data.data || [];
    
//     return notifications.map(notification => ({
//       id: notification.id,
//       title: notification.title,
//       content: notification.content,
//       type: notification.type || 'HEALTH_CHECK',
//       createdAt: notification.createdAt,
//       isRead: notification.isRead || false,
//       sourceId: notification.sourceId
//     }));
//   } catch (error) {
//     console.error(`Lỗi khi lấy danh sách thông báo của phụ huynh ID ${parentId}:`, error);
//     // Trả về mảng rỗng nếu có lỗi để tránh crash ứng dụng
//     return [];
//   }
// },

/**
 * Đánh dấu thông báo đã đọc
 * @param {string} notificationId - ID của thông báo
 * @returns {Promise} - Promise chứa kết quả cập nhật
 */
// markNotificationAsRead: async (notificationId) => {
//   try {
//     if (!notificationId) {
//       throw new Error('notificationId là bắt buộc để đánh dấu thông báo đã đọc');
//     }
    
//     console.log(`Đang gọi API để đánh dấu thông báo ID: ${notificationId} là đã đọc`);
//     const response = await axiosInstance.put(`/v1/notifications/${notificationId}/read`);
    
//     return response.data;
//   } catch (error) {
//     console.error(`Lỗi khi đánh dấu thông báo ID ${notificationId} đã đọc:`, error);
//     throw error;
//   }
// },

/**
 * Lấy danh sách xác nhận kiểm tra sức khỏe của phụ huynh
 * @param {string} parentId - ID của phụ huynh
 * @returns {Promise} - Promise chứa danh sách xác nhận kiểm tra sức khỏe
 */
getHealthCheckConfirmationsByParent: async (parentId) => {
  try {
    if (!parentId) {
      throw new Error('parentId là bắt buộc để lấy danh sách xác nhận kiểm tra sức khỏe');
    }
    
    console.log(`Đang gọi API để lấy xác nhận kiểm tra sức khỏe của phụ huynh ID: ${parentId}`);
    
    // Đảm bảo endpoint đúng định dạng
    const endpoint = `v1/health-check-confirmations/getByParent/${parentId}`;
    console.log(`Endpoint đầy đủ: ${endpoint}`);
    
    const response = await axiosInstance.get(endpoint);
    
    console.log('API response health check confirmations:', response);
    
    // Format dữ liệu từ response
    const confirmations = response.data.data || [];
    console.log('Dữ liệu xác nhận nhận được:', confirmations);
    
    return confirmations.map(confirmation => ({
      confirmationId: confirmation.confirmationId,
      checkNoticeId: confirmation.checkNoticeId,
      studentId: confirmation.studentId,
      parentId: confirmation.parentId,
      status: confirmation.status,
      confirmedAt: confirmation.confirmedAt || [],
      // Thêm các trường khác nếu cần
      studentName: confirmation.studentName || '',
      className: confirmation.className || '',
      checkDate: confirmation.checkDate || null
    }));
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách xác nhận kiểm tra sức khỏe của phụ huynh ID ${parentId}:`, error);
    
    // Thêm chi tiết lỗi
    if (error.response) {
      console.error('Chi tiết lỗi response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Không nhận được response từ server:', error.request);
      console.error('Có thể là lỗi CORS hoặc server không phản hồi');
      console.error('URL gọi API:', `${axiosInstance.defaults.baseURL}/v1/health-check-confirmations/getByParent/${parentId}`);
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    
    // Trả về mảng rỗng để tránh crash ứng dụng
    return [];
  }
},

/**
 * Lấy thông tin chi tiết của thông báo kiểm tra sức khỏe theo ID
 * @param {string|number} checkNoticeId - ID của thông báo kiểm tra sức khỏe
 * @returns {Promise} - Promise chứa thông tin chi tiết của thông báo
 */
getHealthCheckNoticeById: async (checkNoticeId) => {
  try {
    if (!checkNoticeId) {
      throw new Error('checkNoticeId là bắt buộc để lấy thông tin chi tiết thông báo');
    }
    
    console.log(`Đang gọi API để lấy thông tin chi tiết thông báo ID: ${checkNoticeId}`);
    
    // Đảm bảo endpoint đúng định dạng
    const endpoint = `v1/health-check-notices/getByID/${checkNoticeId}`;
    console.log(`Endpoint đầy đủ: ${endpoint}`);
    
    const response = await axiosInstance.get(endpoint);
    
    console.log('API response health check notice detail:', response);
    
    // Format dữ liệu từ response
    if (response.data && response.data.data) {
      return {
        checkNoticeId: response.data.data.checkNoticeId,
        title: response.data.data.title,
        description: response.data.data.description,
        date: response.data.data.date,
        createdAt: response.data.data.createdAt
      };
    }
    
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin chi tiết thông báo ID ${checkNoticeId}:`, error);
    
    // Thêm chi tiết lỗi
    if (error.response) {
      console.error('Chi tiết lỗi response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Không nhận được response từ server:', error.request);
      console.error('Có thể là lỗi CORS hoặc server không phản hồi');
      console.error('URL gọi API:', `${axiosInstance.defaults.baseURL}/v1/health-check-notices/getByID/${checkNoticeId}`);
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    
    return null;
  }
},

/**
 * Lấy danh sách xác nhận kiểm tra sức khỏe của phụ huynh kèm thông tin chi tiết
 * @param {string} parentId - ID của phụ huynh
 * @returns {Promise} - Promise chứa danh sách xác nhận kiểm tra sức khỏe kèm thông tin chi tiết
 */
getHealthCheckConfirmationsWithDetails: async (parentId) => {
  try {
    if (!parentId) {
      throw new Error('parentId là bắt buộc để lấy danh sách xác nhận kiểm tra sức khỏe');
    }
    
    console.log(`Đang gọi API để lấy xác nhận kiểm tra sức khỏe của phụ huynh ID: ${parentId}`);
    
    // Lấy danh sách xác nhận trực tiếp không qua parentApi để tránh đệ quy
    const confirmationsEndpoint = `v1/health-check-confirmations/getByParent/${parentId}`;
    const confirmationsResponse = await axiosInstance.get(confirmationsEndpoint);
    const confirmations = (confirmationsResponse.data && confirmationsResponse.data.data) || [];
    
    // Nếu không có xác nhận nào, trả về mảng rỗng
    if (!confirmations || confirmations.length === 0) {
      return [];
    }
    
    // Lấy thông tin chi tiết cho mỗi xác nhận
    const confirmationsWithDetails = await Promise.all(
      confirmations.map(async (confirmation) => {
        // Format dữ liệu xác nhận
        const formattedConfirmation = {
          confirmationId: confirmation.confirmationId,
          checkNoticeId: confirmation.checkNoticeId,
          studentId: confirmation.studentId,
          parentId: confirmation.parentId,
          status: confirmation.status,
          confirmedAt: confirmation.confirmedAt || [],
          studentName: confirmation.studentName || '',
          className: confirmation.className || '',
          checkDate: confirmation.checkDate || null
        };
        
        // Lấy thông tin chi tiết của thông báo
        const noticeDetail = await parentApi.getHealthCheckNoticeById(formattedConfirmation.checkNoticeId);
        
        // Kết hợp thông tin
        return {
          ...formattedConfirmation,
          noticeDetail: noticeDetail || {}
        };
      })
    );
    
    return confirmationsWithDetails;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách xác nhận kiểm tra sức khỏe kèm chi tiết của phụ huynh ID ${parentId}:`, error);
    return [];
  }
},

/**
 * Lấy tất cả thông báo kiểm tra sức khỏe
 * @returns {Promise} - Promise chứa danh sách tất cả thông báo kiểm tra sức khỏe
 */
getAllHealthCheckNotices: async () => {
  try {
    console.log('Đang gọi API để lấy tất cả thông báo kiểm tra sức khỏe');
    
    // Đảm bảo endpoint đúng định dạng
    const endpoint = 'v1/health-check-notices/getAll';
    console.log(`Endpoint đầy đủ: ${endpoint}`);
    
    const response = await axiosInstance.get(endpoint);
    
    console.log('API response all health check notices:', response);
    
    // Format dữ liệu từ response
    const notices = response.data.data || [];
    console.log('Dữ liệu thông báo nhận được:', notices);
    
    return notices.map(notice => ({
      checkNoticeId: notice.checkNoticeId,
      title: notice.title,
      description: notice.description,
      date: notice.date || [],
      createdAt: notice.createdAt || []
    }));
  } catch (error) {
    console.error('Lỗi khi lấy tất cả thông báo kiểm tra sức khỏe:', error);
    
    // Thêm chi tiết lỗi
    if (error.response) {
      console.error('Chi tiết lỗi response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Không nhận được response từ server:', error.request);
      console.error('Có thể là lỗi CORS hoặc server không phản hồi');
      console.error('URL gọi API:', `${axiosInstance.defaults.baseURL}/v1/health-check-notices/getAll`);
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    
    // Trả về mảng rỗng để tránh crash ứng dụng
    return [];
  }
},

/**
 * Lấy danh sách xác nhận kiểm tra sức khỏe của một học sinh
 * @param {string} studentId - ID của học sinh
 * @returns {Promise} - Promise chứa danh sách xác nhận kiểm tra sức khỏe
 */
getHealthCheckConfirmationsByStudent: async (studentId) => {
  try {
    if (!studentId) {
      throw new Error('studentId là bắt buộc để lấy danh sách xác nhận kiểm tra sức khỏe');
    }
    
    console.log(`Đang gọi API để lấy xác nhận kiểm tra sức khỏe của học sinh ID: ${studentId}`);
    
    // Đảm bảo endpoint đúng định dạng
    const endpoint = `v1/health-check-confirmations/getByStudent/${studentId}`;
    console.log(`Endpoint đầy đủ: ${endpoint}`);
    
    const response = await axiosInstance.get(endpoint);
    
    console.log('API response health check confirmations by student:', response);
    
    // Format dữ liệu từ response
    const confirmations = response.data.data || [];
    console.log('Dữ liệu xác nhận nhận được:', confirmations);
    
    return confirmations.map(confirmation => ({
      confirmationId: confirmation.confirmationId,
      checkNoticeId: confirmation.checkNoticeId,
      studentId: confirmation.studentId,
      parentId: confirmation.parentId,
      status: confirmation.status,
      confirmedAt: confirmation.confirmedAt || [],
      // Thêm các trường khác nếu cần
      studentName: confirmation.studentName || '',
      className: confirmation.className || '',
      checkDate: confirmation.checkDate || null
    }));
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách xác nhận kiểm tra sức khỏe của học sinh ID ${studentId}:`, error);
    
    // Thêm chi tiết lỗi
    if (error.response) {
      console.error('Chi tiết lỗi response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Không nhận được response từ server:', error.request);
      console.error('Có thể là lỗi CORS hoặc server không phản hồi');
      console.error('URL gọi API:', `${axiosInstance.defaults.baseURL}/v1/health-check-confirmations/getByStudent/${studentId}`);
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    
    // Trả về mảng rỗng để tránh crash ứng dụng
    return [];
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

/**
 * Lấy tất cả thông báo kiểm tra sức khỏe cho tất cả con của một phụ huynh
 * @param {string} parentId - ID của phụ huynh
 * @returns {Promise} - Promise chứa danh sách thông báo kiểm tra sức khỏe với thông tin chi tiết
 */
getHealthCheckNotificationsForAllChildren: async (parentId) => {
  try {
    if (!parentId) {
      throw new Error('parentId là bắt buộc để lấy thông báo kiểm tra sức khỏe');
    }
    
    console.log(`Đang gọi API để lấy thông báo kiểm tra sức khỏe cho tất cả con của phụ huynh ID: ${parentId}`);
    
    // Bước 1: Lấy danh sách tất cả con của phụ huynh
    const children = await parentApi.getParentChildren(parentId);
    console.log('Danh sách con của phụ huynh:', children);
    
    if (!children || children.length === 0) {
      return [];
    }
    
    // Bước 2: Tạo danh sách ID của tất cả con
    const childrenIds = children.map(child => child.childId || child.accountId || child.studentId);
    console.log('ID của tất cả con:', childrenIds);
    
    // Bước 3: Lấy các xác nhận kiểm tra sức khỏe cho từng con
    const allConfirmations = [];
    
    await Promise.all(childrenIds.map(async (studentId) => {
      try {
        const studentConfirmations = await parentApi.getHealthCheckConfirmationsByStudent(studentId);
        console.log(`Xác nhận kiểm tra sức khỏe cho học sinh ID ${studentId}:`, studentConfirmations);
        
        // Thêm thông tin học sinh vào mỗi xác nhận
        const studentInfo = children.find(child => {
          const childId = child.childId || child.accountId || child.studentId;
          return childId === studentId;
        });
        
        const enrichedConfirmations = studentConfirmations.map(confirmation => ({
          ...confirmation,
          studentName: studentInfo ? studentInfo.fullName : 'Học sinh',
          className: studentInfo ? (studentInfo.classId || 'N/A') : 'N/A'
        }));
        
        allConfirmations.push(...enrichedConfirmations);
      } catch (error) {
        console.error(`Lỗi khi lấy xác nhận kiểm tra sức khỏe cho học sinh ID ${studentId}:`, error);
      }
    }));
    
    console.log('Tất cả xác nhận kiểm tra sức khỏe:', allConfirmations);
    
    if (allConfirmations.length === 0) {
      return [];
    }
    
    // Bước 4: Lấy thông tin chi tiết của thông báo cho mỗi xác nhận
    const formatDate = (dateArray) => {
      if (Array.isArray(dateArray) && dateArray.length >= 3) {
        return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
      }
      return 'Chưa xác định';
    };
    
    const notificationsWithDetails = await Promise.all(
      allConfirmations.map(async (confirmation) => {
        try {
          // Bỏ qua các xác nhận có trạng thái CANCELLED
          if (confirmation.status === 'CANCELLED') {
            return null;
          }
          
          // Lấy thông tin chi tiết của thông báo kiểm tra sức khỏe
          const noticeDetail = await parentApi.getHealthCheckNoticeById(confirmation.checkNoticeId);
          console.log(`Chi tiết thông báo ID ${confirmation.checkNoticeId}:`, noticeDetail);
          
          // Kết hợp thông tin xác nhận và thông báo
          return {
            id: `health-check-${confirmation.confirmationId}`,
            confirmationId: confirmation.confirmationId,
            checkNoticeId: confirmation.checkNoticeId,
            title: noticeDetail?.title || 'Thông báo kiểm tra sức khỏe',
            content: `${confirmation.studentName}: ${noticeDetail?.description || 'Thông báo kiểm tra sức khỏe'}`,
            type: 'HEALTH_CHECK',
            createdAt: noticeDetail?.createdAt && Array.isArray(noticeDetail.createdAt) && noticeDetail.createdAt.length >= 3 
              ? new Date(noticeDetail.createdAt[0], noticeDetail.createdAt[1] - 1, noticeDetail.createdAt[2]).toISOString()
              : new Date().toISOString(),
            isRead: confirmation.status !== 'PENDING',
            sourceId: confirmation.checkNoticeId,
            status: confirmation.status.toLowerCase(),
            description: noticeDetail?.description || '',
            date: noticeDetail?.date || [],
            studentId: confirmation.studentId,
            studentName: confirmation.studentName || '',
            className: confirmation.className || '',
            formattedDate: noticeDetail?.date ? formatDate(noticeDetail.date) : 'Chưa xác định',
            noticeDetail: noticeDetail || {}
          };
        } catch (error) {
          console.error(`Lỗi khi lấy chi tiết thông báo ID ${confirmation.checkNoticeId}:`, error);
          
          // Trả về thông tin cơ bản nếu không lấy được chi tiết
          return {
            id: `health-check-${confirmation.confirmationId}`,
            confirmationId: confirmation.confirmationId,
            checkNoticeId: confirmation.checkNoticeId,
            title: 'Thông báo kiểm tra sức khỏe',
            content: `${confirmation.studentName}: Thông báo kiểm tra sức khỏe`,
            type: 'HEALTH_CHECK',
            createdAt: new Date().toISOString(),
            isRead: confirmation.status !== 'PENDING',
            sourceId: confirmation.checkNoticeId,
            status: confirmation.status.toLowerCase(),
            studentId: confirmation.studentId,
            studentName: confirmation.studentName || '',
            className: confirmation.className || '',
            formattedDate: Array.isArray(confirmation.confirmedAt) && confirmation.confirmedAt.length >= 3 
              ? formatDate(confirmation.confirmedAt) 
              : 'Chưa xác định'
          };
        }
      })
    );
    
    // Bước 5: Lọc bỏ các thông báo null và sắp xếp theo thời gian, mới nhất lên đầu
    const filteredNotifications = notificationsWithDetails.filter(notification => notification !== null);
    
    return filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
  } catch (error) {
    console.error(`Lỗi khi lấy thông báo kiểm tra sức khỏe cho tất cả con của phụ huynh ID ${parentId}:`, error);
    return [];
  }
},

/**
 * Cập nhật trạng thái xác nhận kiểm tra sức khỏe
 * @param {number} confirmationId - ID của xác nhận kiểm tra sức khỏe
 * @param {Object} confirmationData - Dữ liệu cập nhật xác nhận kiểm tra sức khỏe
 * @param {number} confirmationData.healthCheckNoticeId - ID của thông báo kiểm tra sức khỏe
 * @param {string} confirmationData.studentId - ID của học sinh
 * @param {string} confirmationData.parentId - ID của phụ huynh
 * @param {string} confirmationData.status - Trạng thái xác nhận (CONFIRMED/CANCELLED)
 * @returns {Promise} - Promise chứa kết quả cập nhật
 */
updateHealthCheckConfirmation: async (confirmationId, confirmationData) => {
  try {
    if (!confirmationId) {
      throw new Error('confirmationId là bắt buộc để cập nhật trạng thái xác nhận');
    }
    
    console.log(`Đang gọi API cập nhật trạng thái xác nhận kiểm tra sức khỏe ID: ${confirmationId}`);
    console.log('Dữ liệu cập nhật:', confirmationData);
    
    const endpoint = `v1/health-check-confirmations/update/${confirmationId}`;
    console.log(`Endpoint đầy đủ: ${endpoint}`);
    
    const response = await axiosInstance.put(endpoint, confirmationData);
    
    console.log('API response update health check confirmation:', response);
    
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái xác nhận kiểm tra sức khỏe ID ${confirmationId}:`, error);
    
    // Thêm chi tiết lỗi
    if (error.response) {
      console.error('Chi tiết lỗi response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Không nhận được response từ server:', error.request);
      console.error('Có thể là lỗi CORS hoặc server không phản hồi');
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    
    throw error;
  }
},

/**
 * Lấy lịch sử kiểm tra sức khỏe của một học sinh
 * @param {string} studentId - ID của học sinh
 * @returns {Promise} - Promise chứa lịch sử kiểm tra sức khỏe
 */
getHealthCheckRecordsByStudent: async (studentId) => {
  try {
    if (!studentId) {
      throw new Error('studentId là bắt buộc để lấy lịch sử kiểm tra sức khỏe');
    }
    
    console.log(`Đang gọi API để lấy lịch sử kiểm tra sức khỏe của học sinh ID: ${studentId}`);
    
    const endpoint = `v1/health-check-records/getByStudent/${studentId}`;
    console.log(`Endpoint đầy đủ: ${endpoint}`);
    
    const response = await axiosInstance.get(endpoint);
    
    console.log('API response health check records:', response);
    
    // Format dữ liệu từ response
    const records = (response.data && response.data.data) || [];
    console.log('Dữ liệu lịch sử kiểm tra sức khỏe nhận được:', records);
    
    return records;
  } catch (error) {
    console.error(`Lỗi khi lấy lịch sử kiểm tra sức khỏe của học sinh ID ${studentId}:`, error);
    
    // Thêm chi tiết lỗi
    if (error.response) {
      console.error('Chi tiết lỗi response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Không nhận được response từ server:', error.request);
      console.error('Có thể là lỗi CORS hoặc server không phản hồi');
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    
    // Trả về mảng rỗng để tránh crash ứng dụng
    return [];
  }
},

/**
 * Lấy danh sách tất cả y tá
 * @param {number} page - Số trang (mặc định là 0)
 * @param {number} size - Kích thước trang (mặc định là 10)
 * @param {string} sortBy - Trường sắp xếp (mặc định là fullName)
 * @param {string} direction - Hướng sắp xếp (asc hoặc desc, mặc định là asc)
 * @returns {Promise} - Promise chứa danh sách y tá
 */
getAllNurses: async (page = 0, size = 10, sortBy = 'fullName', direction = 'asc') => {
  try {
    console.log('Đang gọi API để lấy danh sách y tá');
    
    const endpoint = `v1/accounts`;
    const params = {
      page,
      size,
      roleId: 3, // ID vai trò của y tá
      sortBy,
      direction
    };
    
    console.log(`Endpoint đầy đủ: ${endpoint}`, params);
    
    const response = await axiosInstance.get(endpoint, { params });
    
    console.log('API response all nurses:', response);
    
    // Format dữ liệu từ response
    const nurses = (response.data && response.data.content) || [];
    console.log('Dữ liệu y tá nhận được:', nurses);
    
    return nurses;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách y tá:', error);
    
    // Thêm chi tiết lỗi
    if (error.response) {
      console.error('Chi tiết lỗi response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Không nhận được response từ server:', error.request);
      console.error('Có thể là lỗi CORS hoặc server không phản hồi');
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    
    // Trả về mảng rỗng để tránh crash ứng dụng
    return [];
  }
},
};

export default parentApi;
