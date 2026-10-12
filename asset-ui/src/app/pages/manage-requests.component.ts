import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Asset, AssetRequest } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-manage-requests',
  standalone: true,
  imports: [FormsModule, DatePipe, MsgComponent],
  template: `
    <h2>Pending requests</h2>
    <app-msg [error]="error" [info]="info" />
    <table>
      <thead><tr><th>#</th><th>Employee</th><th>Category</th><th>Reason</th><th>Created</th><th></th></tr></thead>
      <tbody>
        @for (r of pending; track r.id) {
          <tr>
            <td>{{ r.id }}</td><td>{{ r.employeeName }} ({{ r.employeeCode }})</td><td>{{ r.categoryName }}</td>
            <td>{{ r.reason }}</td><td>{{ r.createdAt | date: 'short' }}</td>
            <td>
              @if (rejectingId === r.id) {
                <input name="rr" [(ngModel)]="rejectReason" placeholder="Rejection reason" />
                <button class="danger" (click)="reject(r)">Confirm reject</button>
                <button class="link" (click)="rejectingId = null">Cancel</button>
              } @else {
                <button (click)="approve(r)">Approve</button>
                <button class="danger" (click)="rejectingId = r.id; rejectReason = ''">Reject</button>
              }
            </td>
          </tr>
        } @empty { <tr><td colspan="6" class="muted">Nothing pending.</td></tr> }
      </tbody>
    </table>

    <h2>Approved – ready to allocate</h2>
    <table>
      <thead><tr><th>#</th><th>Employee</th><th>Category</th><th>Asset to allocate</th><th></th></tr></thead>
      <tbody>
        @for (r of approved; track r.id) {
          <tr>
            <td>{{ r.id }}</td><td>{{ r.employeeName }}</td><td>{{ r.categoryName }}</td>
            <td>
              <select name="asset{{ r.id }}" [(ngModel)]="selectedAsset[r.id]">
                <option [ngValue]="undefined" disabled>Choose asset…</option>
                @for (a of assetsFor(r.categoryId); track a.id) { <option [ngValue]="a.id">{{ a.assetTag }} – {{ a.name }}</option> }
              </select>
            </td>
            <td><button (click)="allocate(r)" [disabled]="!selectedAsset[r.id]">Allocate</button></td>
          </tr>
        } @empty { <tr><td colspan="5" class="muted">No approved requests waiting.</td></tr> }
      </tbody>
    </table>
  `,
})
export class ManageRequestsComponent implements OnInit {
  private readonly api = inject(ApiService);
  pending: AssetRequest[] = [];
  approved: AssetRequest[] = [];
  available: Asset[] = [];
  selectedAsset: Record<number, number | undefined> = {};
  rejectingId: number | null = null;
  rejectReason = '';
  error = '';
  info = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.pendingRequests().subscribe({ next: r => (this.pending = r), error: e => (this.error = errorMessage(e)) });
    this.api.approvedRequests().subscribe({ next: r => (this.approved = r), error: e => (this.error = errorMessage(e)) });
    this.api.availableAssets().subscribe({ next: a => (this.available = a), error: e => (this.error = errorMessage(e)) });
  }

  assetsFor(categoryId: number): Asset[] {
    return this.available.filter(a => a.categoryId === categoryId);
  }

  approve(r: AssetRequest): void {
    this.run(this.api.approveRequest(r.id), `Request ${r.id} approved`);
  }

  reject(r: AssetRequest): void {
    this.run(this.api.rejectRequest(r.id, this.rejectReason), `Request ${r.id} rejected`);
    this.rejectingId = null;
  }

  allocate(r: AssetRequest): void {
    const assetId = this.selectedAsset[r.id];
    if (assetId) { this.run(this.api.allocate(r.id, assetId), `Asset allocated to ${r.employeeName}`); }
  }

  private run(call: { subscribe: (o: { next: () => void; error: (e: unknown) => void }) => unknown }, okMsg: string): void {
    this.error = this.info = '';
    call.subscribe({ next: () => { this.info = okMsg; this.load(); }, error: e => (this.error = errorMessage(e)) });
  }
}
