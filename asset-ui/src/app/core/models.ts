export type Role = 'EMPLOYEE' | 'ASSET_MANAGER' | 'ADMIN';

export interface LoginResponse {
  token: string;
  userId: number;
  employeeId: string;
  name: string;
  role: Role;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Category { id: number; name: string; description?: string; status: string; }

export interface Asset {
  id: number; assetTag: string; name: string; categoryId: number; categoryName: string;
  brand?: string; model?: string; serialNumber?: string; status: string;
}

export interface AssetRequest {
  id: number; employeeName: string; employeeCode: string; categoryId: number; categoryName: string;
  reason: string; status: string; rejectionReason?: string; createdAt: string;
}

export interface Allocation {
  id: number; assetId: number; assetTag: string; assetName: string; employeeName: string;
  assetRequestId: number; allocatedAt: string; returnedAt?: string; status: string;
}

export interface ReturnRequest {
  id: number; allocationId: number; assetTag: string; assetName: string; employeeName: string;
  reason: string; status: string; requestedAt: string; conditionAtReturn?: string; remarks?: string;
}

export interface AppUser {
  id: number; employeeId: string; firstName: string; lastName: string; email: string;
  role: Role; department?: string; status: string;
}
