// adminApi.js - API cho admin quản lý hệ thống SMMS
import axios from './axiosConfig';

// ===================== ACCOUNT =====================
/**
 * Tạo tài khoản mới
 * @param {Object} data - { username, password, fullName, dob, gender, phone, roleId }
 * @returns {Promise<AccountResponse>}
 */
export const createAccount = (data) => axios.post('/v1/accounts', data);

/**
 * Cập nhật tài khoản
 * @param {string} accountId
 * @param {Object} data - { fullName, dob, gender, phone, emailNotificationsEnabled, notificationTypes }
 * @returns {Promise<AccountResponse>}
 */
export const updateAccount = (accountId, data) => axios.put(`/v1/accounts/${accountId}`, data);

/**
 * Lấy danh sách tài khoản (phân trang, lọc)
 * @param {Object} params - { page, size, name, roleId, sortBy, direction }
 * @returns {Promise<PagedAccountResponse>}
 */
export const getAccounts = (params) => axios.get('/v1/accounts', { params });

/**
 * Import tài khoản từ file Excel
 * @param {FormData} formData - { file }
 * @returns {Promise<ImportAccountResponse>}
 */
export const importAccounts = (formData) => axios.post('/v1/accounts/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

/**
 * Lấy thống kê tài khoản theo role
 * @returns {Promise<{students: number, parents: number, nurses: number, admins: number}>}
 */
export const getAccountStatistics = () => axios.get('/v1/accounts/statistics');

/**
 * Lấy danh sách học sinh theo khối lớp
 * @param {string} grade - Khối lớp
 * @returns {Promise<AccountResponse[]>}
 */
export const getStudentsByGrade = (grade) => axios.get('/v1/accounts/students/by-grade', { params: { grade } });

/**
 * Lấy danh sách học sinh theo lớp
 * @param {string} className - Tên lớp
 * @returns {Promise<AccountResponse[]>}
 */
export const getStudentsByClass = (className) => axios.get('/v1/accounts/students/by-class', { params: { className } });

// ===================== CLASS =====================
/**
 * Tạo lớp học mới
 * @param {Object} data - { className, description, schoolYear }
 * @returns {Promise<ClassResponse>}
 */
export const createClass = (data) => axios.post('/v1/classes', data);

/**
 * Lấy danh sách lớp theo khối
 * @param {string} grade
 * @returns {Promise<ClassResponse[]>}
 */
export const getClassesByGrade = (grade) => axios.get('/v1/classes/by-grade', { params: { grade } });

/**
 * Lấy tất cả lớp học
 * @returns {Promise<ClassResponse[]>}
 */
export const getAllClasses = () => axios.get('/v1/classes');

/**
 * Cập nhật lớp học
 * @param {number} classId
 * @param {Object} data - { className, description, schoolYear }
 * @returns {Promise<ClassResponse>}
 */
export const updateClass = (classId, data) => axios.put(`/v1/classes/${classId}`, data);

/**
 * Xóa lớp học
 * @param {number} classId
 * @returns {Promise<{message: string}>}
 */
export const deleteClass = (classId) => axios.delete(`/v1/classes/${classId}`);

/**
 * Lấy thống kê lớp học
 * @returns {Promise<{totalClasses: number, studentsByGrade: Object}>}
 */
export const getClassStatistics = () => axios.get('/v1/classes/statistics');

// ===================== MEDICATION =====================
/**
 * Tạo thuốc mới
 * @param {Object} data - { name, description, quantity, quantityType, medicationType, expiryDate }
 * @returns {Promise<MedicationResponse>}
 */
export const createMedication = (data) => axios.post('/v1/medications', data);

/**
 * Lấy tất cả thuốc
 * @returns {Promise<MedicationResponse[]>}
 */
export const getAllMedications = () => axios.get('/v1/medications');

/**
 * Tìm kiếm thuốc theo tên
 * @param {string} name
 * @returns {Promise<MedicationResponse[]>}
 */
export const searchMedications = (name) => axios.get('/v1/medications/search', { params: { name } });

/**
 * Cập nhật thuốc
 * @param {number} id
 * @param {Object} data - { name, description, quantity, quantityType, medicationType, expiryDate }
 * @returns {Promise<MedicationResponse>}
 */
export const updateMedication = (id, data) => axios.put(`/v1/medications/${id}`, data);

/**
 * Xóa thuốc
 * @param {number} id
 * @returns {Promise<{message: string}>}
 */
export const deleteMedication = (id) => axios.delete(`/v1/medications/${id}`);

/**
 * Lấy danh sách thuốc sắp hết (low stock)
 * @param {number} threshold - ngưỡng số lượng (mặc định 10)
 * @returns {Promise<MedicationResponse[]>}
 */
export const getLowStockMedications = (threshold = 10) => axios.get('/v1/medications/low-stock', { params: { threshold } });

/**
 * Lấy thống kê thuốc
 * @returns {Promise<{totalMedications: number, lowStockCount: number, expiredCount: number, byType: Object}>}
 */
export const getMedicationStatistics = () => axios.get('/v1/medications/statistics');

/**
 * Lấy danh sách thuốc sắp hết hạn
 * @param {number} days - Số ngày trước khi hết hạn
 * @returns {Promise<MedicationResponse[]>}
 */
export const getExpiringMedications = (days = 30) => axios.get('/v1/medications/expiring', { params: { days } });

// ===================== HEALTH EVENT =====================
/**
 * Tạo sự kiện sức khỏe
 * @param {string} studentId
 * @param {string} nurseId
 * @param {Object} data - HealthEventRequest
 * @returns {Promise<HealthEventResponse>}
 */
export const createHealthEvent = (studentId, nurseId, data) => axios.post(`/v1/healthEvents/create/${studentId}/${nurseId}`, data);

/**
 * Lấy tất cả sự kiện sức khỏe
 * @returns {Promise<HealthEventResponse[]>}
 */
export const getAllHealthEvents = () => axios.get('/v1/healthEvents/get-all');

/**
 * Cập nhật sự kiện sức khỏe
 * @param {number} eventId
 * @param {Object} data - HealthEventRequest
 * @returns {Promise<HealthEventResponse>}
 */
export const updateHealthEvent = (eventId, data) => axios.put(`/v1/healthEvents/update/${eventId}`, data);

/**
 * Xóa sự kiện sức khỏe
 * @param {number} eventId
 * @returns {Promise<{message: string}>}
 */
export const deleteHealthEvent = (eventId) => axios.delete(`/v1/healthEvents/delete/${eventId}`);

/**
 * Lấy thống kê sự kiện sức khỏe
 * @returns {Promise<{totalEvents: number, pendingEvents: number, byStatus: Object, byType: Object}>}
 */
export const getHealthEventStatistics = () => axios.get('/v1/healthEvents/statistics');

/**
 * Lấy sự kiện sức khỏe theo học sinh
 * @param {string} studentId
 * @returns {Promise<HealthEventResponse[]>}
 */
export const getHealthEventsByStudent = (studentId) => axios.get(`/v1/healthEvents/student/${studentId}`);

/**
 * Lấy sự kiện sức khỏe theo y tá
 * @param {string} nurseId
 * @returns {Promise<HealthEventResponse[]>}
 */
export const getHealthEventsByNurse = (nurseId) => axios.get(`/v1/healthEvents/nurse/${nurseId}`);

// ===================== HEALTH CHECK =====================
/**
 * Tạo record kiểm tra sức khỏe
 * @param {Object} data - HealthCheckRecordRequest
 * @param {string} studentId
 * @param {string} nurseId
 * @returns {Promise<HealthCheckRecordResponse>}
 */
export const createHealthCheckRecord = (data, studentId, nurseId) => axios.post('/v1/health-check-records/create', data, { params: { studentId, nurseId } });

/**
 * Lấy tất cả record kiểm tra sức khỏe
 * @returns {Promise<HealthCheckRecordResponse[]>}
 */
export const getAllHealthCheckRecords = () => axios.get('/v1/health-check-records/getAll');

/**
 * Lấy thống kê kiểm tra sức khỏe
 * @returns {Promise<{totalRecords: number, byStatus: Object, byMonth: Object}>}
 */
export const getHealthCheckStatistics = () => axios.get('/v1/health-check-records/statistics');

// ===================== VACCINATION =====================
/**
 * Tạo record tiêm chủng
 * @param {Object} data - VaccinationRecordRequest
 * @param {string} nurseId
 * @returns {Promise<VaccinationRecordResponse>}
 */
export const createVaccinationRecord = (data, nurseId) => axios.post('/v1/vaccination-records', data, { params: { nurseId } });

/**
 * Lấy tất cả record tiêm chủng
 * @returns {Promise<VaccinationRecordResponse[]>}
 */
export const getAllVaccinationRecords = () => axios.get('/v1/vaccination-records');

/**
 * Lấy thống kê tiêm chủng
 * @returns {Promise<{totalRecords: number, pendingRecords: number, confirmedRecords: number, declinedRecords: number, byStatus: Object, byMonth: Object}>}
 */
export const getVaccinationRecordStatistics = () => axios.get('/v1/vaccination-records/statistics');

/**
 * Lấy record tiêm chủng theo học sinh
 * @param {string} studentId
 * @returns {Promise<VaccinationRecordResponse[]>}
 */
export const getVaccinationRecordsByStudent = (studentId) => axios.get(`/v1/vaccination-records/student/${studentId}`);

/**
 * Lấy record tiêm chủng theo vaccine
 * @param {string} vaccineId
 * @returns {Promise<VaccinationRecordResponse[]>}
 */
export const getVaccinationRecordsByVaccine = (vaccineId) => axios.get(`/v1/vaccination-records/vaccine/${vaccineId}`);

// ===================== HEALTH CHECK NOTICE =====================
/**
 * Tạo thông báo kiểm tra sức khỏe
 * @param {Object} data - HealthCheckNoticeRequest
 * @returns {Promise<HealthCheckNoticeResponse>}
 */
export const createHealthCheckNotice = (data) => axios.post('/v1/health-check-notices/create', data);

/**
 * Lấy tất cả thông báo kiểm tra sức khỏe
 * @returns {Promise<HealthCheckNoticeResponse[]>}
 */
export const getAllHealthCheckNotices = () => axios.get('/v1/health-check-notices/getAll');

/**
 * Lấy thống kê thông báo kiểm tra sức khỏe
 * @returns {Promise<{totalNotices: number, byStatus: Object}>}
 */
export const getHealthCheckNoticeStatistics = () => axios.get('/v1/health-check-notices/statistics');

// ===================== VACCINATION NOTICE =====================
/**
 * Tạo thông báo tiêm chủng
 * @param {Object} data - VaccinationNoticeRequest
 * @returns {Promise<VaccinationNoticeResponse>}
 */
export const createVaccinationNotice = (data) => axios.post('/v1/vaccination-notices', data);

/**
 * Lấy tất cả thông báo tiêm chủng
 * @returns {Promise<VaccinationNoticeResponse[]>}
 */
export const getAllVaccinationNotices = () => axios.get('/v1/vaccination-notices');

/**
 * Tìm kiếm thông báo tiêm chủng theo tên vaccine
 * @param {string} vaccineName
 * @returns {Promise<VaccinationNoticeResponse[]>}
 */
export const searchVaccinationNotices = (vaccineName) => axios.get('/v1/vaccination-notices/search', { params: { vaccineName } });

/**
 * Lấy thống kê thông báo tiêm chủng
 * @returns {Promise<{totalNotices: number, upcomingNotices: number, overdueNotices: number, byStatus: Object}>}
 */
export const getVaccinationNoticeStatistics = () => axios.get('/v1/vaccination-notices/statistics');

// ===================== CONSULTATION =====================
/**
 * Lên lịch tư vấn
 * @param {Object} data - ConsultationRequest
 * @returns {Promise<ConsultationResponse>}
 */
export const scheduleConsultation = (data) => axios.post('/v1/consultations/schedule', data);

/**
 * Tìm kiếm tư vấn theo ngày
 * @param {string} date - YYYY-MM-DD
 * @param {string} sort - asc/desc
 * @returns {Promise<ConsultationResponse[]>}
 */
export const searchConsultationsByDate = (date, sort = 'asc') => axios.get('/v1/consultations/search', { params: { date, sort } });

/**
 * Lấy slot trống của staff
 * @param {string} staffId
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<{availableSlots: string[]}>}
 */
export const getAvailableSlotsForStaff = (staffId, date) => axios.get('/v1/consultations/staff-availability', { params: { staffId, date } });

/**
 * Lấy tất cả tư vấn
 * @returns {Promise<ConsultationResponse[]>}
 */
export const getAllConsultations = () => axios.get('/v1/consultations');

/**
 * Lấy thống kê tư vấn
 * @returns {Promise<{totalConsultations: number, upcomingConsultations: number, byStatus: Object}>}
 */
export const getConsultationStatistics = () => axios.get('/v1/consultations/statistics');

// ===================== VACCINE =====================
/**
 * Lấy tất cả vaccine
 * @returns {Promise<VaccineResponse[]>}
 */
export const getAllVaccines = () => axios.get('/all-vaccines');

/**
 * Tạo vaccine mới
 * @param {Object} data - VaccineRequest
 * @returns {Promise<VaccineResponse>}
 */
export const createVaccine = (data) => axios.post('/create-vaccine', data);

/**
 * Cập nhật vaccine
 * @param {number} vaccineId
 * @param {Object} data - VaccineRequest
 * @returns {Promise<VaccineResponse>}
 */
export const updateVaccine = (vaccineId, data) => axios.put(`/vaccines/${vaccineId}`, data);

/**
 * Xóa vaccine
 * @param {number} vaccineId
 * @returns {Promise<{message: string}>}
 */
export const deleteVaccine = (vaccineId) => axios.delete(`/vaccines/${vaccineId}`);

/**
 * Tạo batch vaccine
 * @param {number} vaccineId
 * @param {Object} data - VaccineBatchRequest
 * @returns {Promise<VaccineBatchResponse>}
 */
export const createVaccineBatch = (vaccineId, data) => axios.post(`/${vaccineId}/create-vaccine-batch`, data);

/**
 * Lấy danh sách batch của vaccine
 * @param {number} vaccineId
 * @returns {Promise<VaccineBatchResponse[]>}
 */
export const getVaccineBatches = (vaccineId) => axios.get(`/vaccines/${vaccineId}/batches`);

/**
 * Giảm số lượng batch vaccine
 * @param {number} batchId
 * @param {number} quantityToReduce
 * @returns {Promise<VaccineBatchResponse>}
 */
export const reduceVaccineBatchQuantity = (batchId, quantityToReduce) => axios.patch(`/vaccine-batches/${batchId}/reduce`, { quantityToReduce });

/**
 * Lấy thống kê vaccine
 * @returns {Promise<{totalVaccines: number, totalBatches: number, lowStockBatches: number, byType: Object}>}
 */
export const getVaccineStatistics = () => axios.get('/vaccines/statistics');

// ===================== MEDICAL REFERENCE =====================
/**
 * Tạo allergen mới
 * @param {Object} data - AllergenRequest
 * @returns {Promise<AllergenResponse>}
 */
export const createAllergen = (data) => axios.post('/reference/allergens', data);

/**
 * Tìm kiếm allergen
 * @param {string} name
 * @returns {Promise<AllergenResponse[]>}
 */
export const searchAllergens = (name = '') => axios.get('/reference/allergens/search', { params: { name } });

/**
 * Lấy tất cả allergen
 * @returns {Promise<AllergenResponse[]>}
 */
export const getAllAllergens = () => axios.get('/reference/allergens');

/**
 * Tạo disease mới
 * @param {Object} data - DiseaseRequest
 * @returns {Promise<DiseaseResponse>}
 */
export const createDisease = (data) => axios.post('/reference/diseases', data);

/**
 * Tìm kiếm disease
 * @param {string} name
 * @returns {Promise<DiseaseResponse[]>}
 */
export const searchDiseases = (name = '') => axios.get('/reference/diseases/search', { params: { name } });

/**
 * Lấy tất cả disease
 * @returns {Promise<DiseaseResponse[]>}
 */
export const getAllDiseases = () => axios.get('/reference/diseases');

/**
 * Tạo syndrome mới
 * @param {Object} data - SyndromeRequest
 * @returns {Promise<SyndromeResponse>}
 */
export const createSyndrome = (data) => axios.post('/reference/syndromes', data);

/**
 * Tìm kiếm syndrome
 * @param {string} name
 * @returns {Promise<SyndromeResponse[]>}
 */
export const searchSyndromes = (name = '') => axios.get('/reference/syndromes/search', { params: { name } });

/**
 * Lấy tất cả syndrome
 * @returns {Promise<SyndromeResponse[]>}
 */
export const getAllSyndromes = () => axios.get('/reference/syndromes');

// ===================== DASHBOARD STATISTICS =====================
/**
 * Lấy thống kê tổng hợp cho Dashboard
 * @returns {Promise<{
 *   accounts: {totalStudents: number, totalStaff: number, totalParents: number, totalAdmins: number},
 *   medications: {totalMedications: number, lowStockCount: number, expiredCount: number},
 *   healthEvents: {totalEvents: number, pendingEvents: number, completedEvents: number},
 *   vaccinations: {totalNotices: number, totalRecords: number, pendingRecords: number},
 *   consultations: {totalConsultations: number, upcomingConsultations: number},
 *   vaccines: {totalVaccines: number, totalBatches: number, lowStockBatches: number}
 * }>}
 */
export const getDashboardStatistics = () => axios.get('/v1/dashboard/statistics');

/**
 * Lấy hoạt động gần đây
 * @param {number} limit - Số lượng hoạt động (mặc định 10)
 * @returns {Promise<Array<{id: string, type: string, title: string, description: string, date: string, status: string}>>}
 */
export const getRecentActivities = (limit = 10) => axios.get('/v1/dashboard/recent-activities', { params: { limit } });

/**
 * Lấy cảnh báo hệ thống
 * @returns {Promise<Array<{type: string, message: string, severity: string, action: string}>>}
 */
export const getSystemAlerts = () => axios.get('/v1/dashboard/alerts');

/**
 * Lấy thống kê theo thời gian
 * @param {string} period - daily/weekly/monthly/yearly
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{healthEvents: Object, vaccinations: Object, consultations: Object}>}
 */
export const getTimeSeriesStatistics = (period, startDate, endDate) => 
  axios.get('/v1/dashboard/time-series', { params: { period, startDate, endDate } });

// ===================== EXPORT/REPORT =====================
/**
 * Xuất báo cáo Excel
 * @param {string} reportType - students/medications/healthEvents/vaccinations
 * @param {Object} filters - Các bộ lọc
 * @returns {Promise<Blob>}
 */
export const exportReport = (reportType, filters = {}) => 
  axios.get(`/v1/reports/export/${reportType}`, { 
    params: filters, 
    responseType: 'blob' 
  });

/**
 * Tạo báo cáo PDF
 * @param {string} reportType - students/medications/healthEvents/vaccinations
 * @param {Object} filters - Các bộ lọc
 * @returns {Promise<Blob>}
 */
export const generatePDFReport = (reportType, filters = {}) => 
  axios.get(`/v1/reports/pdf/${reportType}`, { 
    params: filters, 
    responseType: 'blob' 
  });

// ===================== SYSTEM MANAGEMENT =====================
/**
 * Lấy thông tin hệ thống
 * @returns {Promise<{version: string, uptime: number, databaseStatus: string, lastBackup: string}>}
 */
export const getSystemInfo = () => axios.get('/v1/system/info');

/**
 * Lấy log hệ thống
 * @param {number} limit - Số lượng log (mặc định 100)
 * @param {string} level - error/warn/info/debug
 * @returns {Promise<Array<{timestamp: string, level: string, message: string, source: string}>>}
 */
export const getSystemLogs = (limit = 100, level = '') => 
  axios.get('/v1/system/logs', { params: { limit, level } });

/**
 * Backup database
 * @returns {Promise<{message: string, backupFile: string}>}
 */
export const backupDatabase = () => axios.post('/v1/system/backup');

/**
 * Restore database
 * @param {FormData} formData - File backup
 * @returns {Promise<{message: string}>}
 */
export const restoreDatabase = (formData) => 
  axios.post('/v1/system/restore', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }); 