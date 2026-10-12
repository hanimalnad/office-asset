import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AppUser } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, MsgComponent],
  template: `
    <h2>Users</h2>
    <app-msg [error]="error" [info]="info" />

    <form class="card inline" (ngSubmit)="create()">
      <input name="eid" [(ngModel)]="form.employeeId" placeholder="Employee ID *" required />
      <input name="fn" [(ngModel)]="form.firstName" placeholder="First name *" required />
      <input name="ln" [(ngModel)]="form.lastName" placeholder="Last name *" required />
      <input name="em" type="email" [(ngModel)]="form.email" placeholder="Email *" required />
      <input name="pw" type="password" [(ngModel)]="form.password" placeholder="Password (min 8) *" required />
      <select name="role" [(ngModel)]="form.role">
        <option value="EMPLOYEE">EMPLOYEE</option>
        <option value="ASSET_MANAGER">ASSET_MANAGER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <input name="dep" [(ngModel)]="form.department" placeholder="Department" />
      <button type="submit">Add user</button>
    </form>

    <table>
      <thead><tr><th>Emp. ID</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th></th></tr></thead>
      <tbody>
        @for (u of users; track u.id) {
          <tr>
            <td>{{ u.employeeId }}</td><td>{{ u.firstName }} {{ u.lastName }}</td><td>{{ u.email }}</td>
            <td>{{ u.role }}</td><td>{{ u.department }}</td>
            <td><span class="badge s-{{ u.status }}">{{ u.status }}</span></td>
            <td><button (click)="toggle(u)">{{ u.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}</button></td>
          </tr>
        }
      </tbody>
    </table>
    <div class="pager">
      <button (click)="go(-1)" [disabled]="page === 0">‹ Prev</button>
      <span>Page {{ page + 1 }} of {{ totalPages || 1 }}</span>
      <button (click)="go(1)" [disabled]="page + 1 >= totalPages">Next ›</button>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private readonly api = inject(ApiService);
  users: AppUser[] = [];
  page = 0;
  totalPages = 0;
  form = this.emptyForm();
  error = '';
  info = '';

  ngOnInit(): void { this.load(); }

  go(delta: number): void { this.page += delta; this.load(); }

  load(): void {
    this.api.users(this.page, 10).subscribe({
      next: r => { this.users = r.content; this.totalPages = r.totalPages; },
      error: e => (this.error = errorMessage(e)),
    });
  }

  create(): void {
    this.error = this.info = '';
    this.api.createUser(this.form).subscribe({
      next: () => { this.info = 'User created'; this.form = this.emptyForm(); this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }

  toggle(u: AppUser): void {
    this.error = this.info = '';
    this.api.setUserStatus(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE').subscribe({
      next: () => { this.info = `${u.email} updated`; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }

  private emptyForm() {
    return { employeeId: '', firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', department: '' };
  }
}
