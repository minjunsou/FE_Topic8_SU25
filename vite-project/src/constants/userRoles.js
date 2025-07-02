/**
 * Các vai trò người dùng trong hệ thống
 */
export const USER_ROLES = {
  STUDENT: 'student',
  PARENT: 'parent',
  NURSE: 'nurse',
  ADMIN: 'admin'
};

/**
 * ID của các vai trò trong hệ thống
 */
export const ROLE_IDS = {
  ADMIN: 5,
  NURSE: 3,
  PARENT: 2,
  STUDENT: 1
};

/**
 * Tên hiển thị của các vai trò
 */
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.STUDENT]: 'Học sinh',
  [USER_ROLES.PARENT]: 'Phụ huynh',
  [USER_ROLES.NURSE]: 'Y tá trường',
  [USER_ROLES.ADMIN]: 'Quản trị viên'
}; 