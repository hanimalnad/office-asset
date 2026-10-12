import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ReturnRequest } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-manage-returns',
  standalone: true,
  imports: [FormsModule, DatePipe, MsgComponent],
  template: `
    <h2>Pending returns</h2>
    <app-msg [error]="error" [info]="info" />
    <table>
      <thead><tr><th>#</th><th>Employee</th><th>Asset</th><th>Reason</th><th>Requested</th><th>Process</th></tr></thead>
      <tbody>
        @for (r of returns; track r.id) {
          <tr>
            <td>{{ r.id }}</td><td>{{ r.employeeName }}</td><td>{{ r.assetTag }} – {{ r.assetName }}</td>
            <td>{{ r.reason }}</td><td>{{ r.requestedAt | date: 'short' }}</td>
            <td>
              <select name="cond{{ r.id }}" [(ngModel)]="condition[r.id]">
                <option value="GOOD">GOOD</option><option value="DAMAGED">DAMAGED</option>
              </select>
              <input name="rem{{ r.id }}" [(ngModel)]="remarks[r.id]" placeholder="Remarks" />
              <button (click)="complete(r)">Complete</button>
              <button class="danger" (click)="reject(r)">Reject</button>
            </td>
          </tr>
        } @empty { <tr><td colspan="6" class="muted">No pending returns.</td></tr> }
      </tbody>
    </table>
    <p class="muted">GOOD → asset becomes AVAILABLE · DAMAGED → asset goes to MAINTENANCE · Reject needs remarks.</p>
  `,
})
export class ManageReturnsComponent implements OnInit {
  private readonly api = inject(ApiService);
  returns: ReturnRequest[] = [];
  condition: Record<number, string> = {};
  remarks: Record<number, string> = {};
  error = '';
  info = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.pendingReturns().subscribe({
      next: r => { this.returns = r; r.forEach(x => (this.condition[x.id] ??= 'GOOD')); },
      error: e => (this.error = errorMessage(e)),
    });
  }

  complete(r: ReturnRequest): void {
    this.send(r, { status: 'COMPLETED', conditionAtReturn: this.condition[r.id], remarks: this.remarks[r.id] }, 'Return completed');
  }

  reject(r: ReturnRequest): void {
    this.send(r, { status: 'REJECTED', remarks: this.remarks[r.id] }, 'Return rejected');
  }

  private send(r: ReturnRequest, body: { status: string; conditionAtReturn?: string; remarks?: string }, okMsg: string): void {
    this.error = this.info = '';
    this.api.processReturn(r.id, body).subscribe({
      next: () => { this.info = okMsg; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }
}
