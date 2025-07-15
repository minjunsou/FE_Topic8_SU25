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

// ===================== HEALTH CHECK RECORD =====================
/**
 * Tạo phiếu khám sức khỏe
 * @param {Object} data - HealthCheckRecordRequest
 * @param {string} studentId
 * @param {string} nurseId
 * @returns {Promise<HealthCheckRecordResponse>}
 */
export const createHealthCheckRecord = (data, studentId, nurseId) => axios.post('/v1/health-check-records/create', data, { params: { studentId, nurseId } });

/**
 * Lấy tất cả phiếu khám sức khỏe
 * @returns {Promise<HealthCheckRecordResponse[]>}
 */
export const getAllHealthCheckRecords = () => axios.get('/v1/health-check-records/getAll');

// ===================== VACCINATION RECORD =====================
/**
 * Tạo phiếu tiêm chủng
 * @param {Object} data - VaccinationRecordRequest
 * @param {string} nurseId
 * @returns {Promise<VaccinationRecordResponse>}
 */
export const createVaccinationRecord = (data, nurseId) => axios.post('/v1/vaccination-records', data, { params: { nurseId } });

/**
 * Lấy tất cả phiếu tiêm chủng
 * @returns {Promise<VaccinationRecordResponse[]>}
 */
export const getAllVaccinationRecords = () => axios.get('/v1/vaccination-records');

// ===================== HEALTH CHECK NOTICE =====================
/**
 * Tạo thông báo khám sức khỏe
 * @param {Object} data - HealthCheckNoticeRequest
 * @returns {Promise<HealthCheckNoticeResponse>}
 */
export const createHealthCheckNotice = (data) => axios.post('/v1/health-check-notices/create', data);

/**
 * Lấy tất cả thông báo khám sức khỏe
 * @returns {Promise<HealthCheckNoticeResponse[]>}
 */
export const getAllHealthCheckNotices = () => axios.get('/v1/health-check-notices/getAll');

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
 * Tìm kiếm thông báo tiêm chủng theo tên vắc xin
 * @param {string} vaccineName
 * @returns {Promise<VaccinationNoticeResponse[]>}
 */
export const searchVaccinationNotices = (vaccineName) => axios.get('/v1/vaccination-notices/search', { params: { vaccineName } });

// ===================== CONSULTATION SCHEDULE =====================
/**
 * Đặt lịch tư vấn
 * @param {Object} data - ConsultationScheduleRequest
 * @returns {Promise<ConsultationScheduleResponse>}
 */
export const scheduleConsultation = (data) => axios.post('/v1/consultations/schedule', data);

/**
 * Tìm kiếm lịch tư vấn theo ngày
 * @param {string} date - yyyy-MM-dd
 * @param {string} sort - asc|desc
 * @returns {Promise<ConsultationScheduleResponse[]>}
 */
export const searchConsultationsByDate = (date, sort = 'asc') => axios.get('/v1/consultations/search', { params: { date, sort } });

/**
 * Lấy slot trống của nhân viên
 * @param {string} staffId
 * @param {string} date - yyyy-MM-dd
 * @returns {Promise<ConsultationSlot[]>}
 */
export const getAvailableSlotsForStaff = (staffId, date) => axios.get('/v1/consultations/staff-availability', { params: { staffId, date } });

// ===================== VACCINE =====================
/**
 * Lấy tất cả vaccine
 * @returns {Promise<VaccineResponse[]>}
 */
export const getAllVaccines = () => axios.get('/all-vaccines');

/**
 * Tạo vaccine mới
 * @param {Object} data - { name, type, version, releaseDate }
 * @returns {Promise<VaccineResponse>}
 */
export const createVaccine = (data) => axios.post('/create-vaccine', data);

/**
 * Tạo lô vaccine mới cho vaccine
 * @param {number} vaccineId
 * @param {Object} data - { stockInDate, expiryDate, quantity }
 * @returns {Promise<VaccineBatchResponse>}
 */
export const createVaccineBatch = (vaccineId, data) => axios.post(`/${vaccineId}/create-vaccine-batch`, data);

/**
 * Lấy tất cả lô của một vaccine
 * @param {number} vaccineId
 * @returns {Promise<VaccineBatchResponse[]>}
 */
export const getVaccineBatches = (vaccineId) => axios.get(`/vaccines/${vaccineId}/batches`);

/**
 * Giảm số lượng lô vaccine
 * @param {number} batchId
 * @param {number} quantityToReduce
 * @returns {Promise<{message: string}>}
 */
export const reduceVaccineBatchQuantity = (batchId, quantityToReduce) => axios.patch(`/vaccine-batches/${batchId}/reduce`, { quantityToReduce }); 