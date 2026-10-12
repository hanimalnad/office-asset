import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './config';
import { Allocation, AppUser, Asset, AssetRequest, Category, PageResponse, ReturnRequest, Role } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private url = (path: string) => `${API_URL}${path}`;

  // dashboard
  dashboard(role: Role) {
    const path = role === 'EMPLOYEE' ? 'employee' : role === 'ADMIN' ? 'admin' : 'manager';
    return this.http.get<Record<string, number>>(this.url(`/dashboard/${path}`));
  }

  // categories
  categories() { return this.http.get<Category[]>(this.url('/categories')); }

  // assets
  assets(page: number, size: number, status?: string, categoryId?: number | null) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) { params = params.set('status', status); }
    if (categoryId) { params = params.set('categoryId', categoryId); }
    return this.http.get<PageResponse<Asset>>(this.url('/assets'), { params });
  }
  availableAssets() { return this.http.get<Asset[]>(this.url('/assets/available')); }
  createAsset(body: unknown) { return this.http.post<Asset>(this.url('/assets'), body); }

  updateAsset(id: number, body: unknown) { return this.http.put<Asset>(this.url(`/assets/${id}`), body); }

  // category management
  createCategory(name: string, description: string) {
    return this.http.post<Category>(this.url('/categories'), { name, description });
  }
  updateCategory(id: number, name: string, description: string) {
    return this.http.put<Category>(this.url(`/categories/${id}`), { name, description });
  }
  setCategoryStatus(id: number, status: string) {
    return this.http.put<Category>(this.url(`/categories/${id}/status`), { status });
  }

  // asset requests
  createRequest(categoryId: number, reason: string) {
    return this.http.post<AssetRequest>(this.url('/asset-requests'), { categoryId, reason });
  }
  myRequests() { return this.http.get<AssetRequest[]>(this.url('/asset-requests/my')); }
  pendingRequests() { return this.http.get<AssetRequest[]>(this.url('/asset-requests/pending')); }
  approvedRequests() { return this.http.get<AssetRequest[]>(this.url('/asset-requests/approved')); }
  cancelRequest(id: number) { return this.http.put<AssetRequest>(this.url(`/asset-requests/${id}/cancel`), {}); }
  approveRequest(id: number) { return this.http.put<AssetRequest>(this.url(`/asset-requests/${id}/approve`), {}); }
  rejectRequest(id: number, rejectionReason: string) {
    return this.http.put<AssetRequest>(this.url(`/asset-requests/${id}/reject`), { rejectionReason });
  }

  // allocations
  allocate(assetRequestId: number, assetId: number) {
    return this.http.post<Allocation>(this.url('/allocations'), { assetRequestId, assetId });
  }
  allAllocations() { return this.http.get<Allocation[]>(this.url('/allocations')); }
  myAllocations() { return this.http.get<Allocation[]>(this.url('/allocations/my')); }

  // returns
  createReturn(allocationId: number, reason: string) {
    return this.http.post<ReturnRequest>(this.url('/returns'), { allocationId, reason });
  }
  myReturns() { return this.http.get<ReturnRequest[]>(this.url('/returns/my')); }
  pendingReturns() { return this.http.get<ReturnRequest[]>(this.url('/returns/pending')); }
  processReturn(id: number, body: { status: string; conditionAtReturn?: string; remarks?: string }) {
    return this.http.put<ReturnRequest>(this.url(`/returns/${id}/process`), body);
  }

  // users (admin)
  users(page: number, size: number) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<AppUser>>(this.url('/users'), { params });
  }
  createUser(body: unknown) { return this.http.post<AppUser>(this.url('/users'), body); }
  setUserStatus(id: number, status: string) {
    return this.http.put<AppUser>(this.url(`/users/${id}/status`), { status });
  }
}
