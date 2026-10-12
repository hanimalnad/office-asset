import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Allocation, ReturnRequest } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [FormsModule, DatePipe, MsgComponent],
  template: `
    <h2>My assets</h2>
    <app-msg [error]="error" [info]="info" />

    <table>
      <thead><tr><th>Asset</th><th>Tag</th><th>Allocated</th><th>Status</th><th></th></tr></thead>
      <tbody>
        @for (a of allocations; track a.id) {
          <tr>
            <td>{{ a.assetName }}</td><td>{{ a.assetTag }}</td><td>{{ a.allocatedAt | date: 'short' }}</td>
            <td><span class="badge s-{{ a.status }}">{{ a.status }}</span></td>
            <td>
              @if (a.status === 'ACTIVE' && !hasOpenReturn(a)) {
                @if (returningId === a.id) {
                  <input [(ngModel)]="reason" name="reason" placeholder="Reason for return" />
                  <button (click)="submitReturn(a)">Send</button>
                  <button class="link" (click)="returningId = null">Cancel</button>
                } @else {
                  <button (click)="returningId = a.id; reason = ''">Request return</button>
                }
              } @else if (a.status === 'ACTIVE') { <span class="muted">Return requested</span> }
            </td>
          </tr>
        } @empty { <tr><td colspan="5" class="muted">No allocated assets.</td></tr> }
      </tbody>
    </table>

    <h3>My return requests</h3>
    <table>
      <thead><tr><th>#</th><th>Asset</th><th>Reason</th><th>Status</th><th>Condition</th><th>Remarks</th></tr></thead>
      <tbody>
        @for (r of returns; track r.id) {
          <tr>
            <td>{{ r.id }}</td><td>{{ r.assetName }}</td><td>{{ r.reason }}</td>
            <td><span class="badge s-{{ r.status }}">{{ r.status }}</span></td>
            <td>{{ r.conditionAtReturn ?? '' }}</td><td>{{ r.remarks ?? '' }}</td>
          </tr>
        } @empty { <tr><td colspan="6" class="muted">No return requests.</td></tr> }
      </tbody>
    </table>
  `,
})
export class MyAssetsComponent implements OnInit {
  private readonly api = inject(ApiService);
  allocations: Allocation[] = [];
  returns: ReturnRequest[] = [];
  returningId: number | null = null;
  reason = '';
  error = '';
  info = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.myAllocations().subscribe({ next: a => (this.allocations = a), error: e => (this.error = errorMessage(e)) });
    this.api.myReturns().subscribe({ next: r => (this.returns = r), error: e => (this.error = errorMessage(e)) });
  }

  hasOpenReturn(a: Allocation): boolean {
    return this.returns.some(r => r.allocationId === a.id && r.status !== 'REJECTED');
  }

  submitReturn(a: Allocation): void {
    this.error = this.info = '';
    this.api.createReturn(a.id, this.reason).subscribe({
      next: () => { this.info = 'Return requested'; this.returningId = null; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }
}
