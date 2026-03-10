export interface User {
  id: number;
  code: string;
  first_name: string | null;
  last_name: string | null;
  description: string | null;
  type: number | null;
  balance: number | string;
  is_verified: boolean;
  is_blocked: boolean | null;
  is_active: boolean | null;
  date_added: string;
  password?: string;
  role?: string | null;
}

export interface Permission {
  id: number;
  code: string;
  description: string | null;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UserFormData {
  id?: number;
  first_name: string;
  last_name: string;
  description: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export interface PermissionsState {
  userId: number;
  userName: string;
  userRole: string | null;
  permissions: Permission[];
}

export const INITIAL_FORM_DATA: UserFormData = {
  first_name: "",
  last_name: "",
  description: "",
  role: "",
  password: "",
  confirmPassword: "",
};
