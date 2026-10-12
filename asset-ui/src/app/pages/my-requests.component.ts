import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AssetRequest, Category } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [FormsModule, DatePipe, MsgComponent],
  template: `
    <h2>My asset requests</h2>
    <app-msg [error]="error" [info]="info" />

    <form class="card inline" (ngSubmit)="create()">
      <select name="cat" [(ngModel)]="categoryId" required>
        <option [ngValue]="null" disabled>Select category…</option>
        @for (c of categories; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
      </select>
      <input name="reason" [(ngModel)]="reason" placeholder="Why do you need it?" required />
      <button type="submit">Request asset</button>
    </form>

    <table>
      <thead><tr><th>#</th><th>Category</th><th>Reason</th><th>Status</th><th>Created</th><th></th></tr></thead>
      <tbody>
        @for (r of requests; track r.id) {
          <tr>
            <td>{{ r.id }}</td><td>{{ r.categoryName }}</td><td>{{ r.reason }}</td>
            <td><span class="badge s-{{ r.status }}">{{ r.status }}</span>
              @if (r.rejectionReason) { <div class="muted">{{ r.rejectionReason }}</div> }</td>
            <td>{{ r.createdAt | date: 'short' }}</td>
            <td>@if (r.status === 'PENDING') { <button class="danger" (click)="cancel(r)">Cancel</button> }</td>
          </tr>
        } @empty { <tr><td colspan="6" class="muted">No requests yet.</td></tr> }
      </tbody>
    </table>
  `,
})
export class MyRequestsComponent implements OnInit {
  private readonly api = inject(ApiService);
  categories: Category[] = [];
  requests: AssetRequest[] = [];
  categoryId: number | null = null;
  reason = '';
  error = '';
  info = '';

  ngOnInit(): void {
    this.api.categories().subscribe({ next: c => (this.categories = c), error: e => (this.error = errorMessage(e)) });
    this.load();
  }

  load(): void {
    this.api.myRequests().subscribe({ next: r => (this.requests = r), error: e => (this.error = errorMessage(e)) });
  }

  create(): void {
    this.error = this.info = '';
    if (this.categoryId === null) { this.error = 'Please select a category'; return; }
    this.api.createRequest(this.categoryId, this.reason).subscribe({
      next: () => { this.info = 'Request submitted'; this.reason = ''; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }

  cancel(r: AssetRequest): void {
    this.error = this.info = '';
    this.api.cancelRequest(r.id).subscribe({
      next: () => { this.info = 'Request cancelled'; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }
}
