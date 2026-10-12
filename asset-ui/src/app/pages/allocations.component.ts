import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Allocation } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-allocations',
  standalone: true,
  imports: [FormsModule, DatePipe, MsgComponent],
  template: `
    <h2>All allocations</h2>
    <app-msg [error]="error" />
    <div class="inline filters">
      <select name="f" [(ngModel)]="filter">
        <option value="">All</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>
    </div>
    <table>
      <thead><tr><th>#</th><th>Employee</th><th>Asset</th><th>Allocated</th><th>Returned</th><th>Status</th></tr></thead>
      <tbody>
        @for (a of visible(); track a.id) {
          <tr>
            <td>{{ a.id }}</td><td>{{ a.employeeName }}</td><td>{{ a.assetTag }} – {{ a.assetName }}</td>
            <td>{{ a.allocatedAt | date: 'short' }}</td><td>{{ a.returnedAt | date: 'short' }}</td>
            <td><span class="badge s-{{ a.status }}">{{ a.status }}</span></td>
          </tr>
        } @empty { <tr><td colspan="6" class="muted">No allocations.</td></tr> }
      </tbody>
    </table>
  `,
})
export class AllocationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  allocations: Allocation[] = [];
  filter = '';
  error = '';

  ngOnInit(): void {
    this.api.allAllocations().subscribe({ next: a => (this.allocations = a), error: e => (this.error = errorMessage(e)) });
  }

  visible(): Allocation[] {
    return this.filter ? this.allocations.filter(a => a.status === this.filter) : this.allocations;
  }
}
