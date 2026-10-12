import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MsgComponent],
  template: `
    <h2>Welcome, {{ auth.user()?.name }}</h2>
    <app-msg [error]="error" />
    <div class="tiles">
      @for (c of counts; track c[0]) {
        <div class="tile"><div class="num">{{ c[1] }}</div><div>{{ label(c[0]) }}</div></div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  counts: [string, number][] = [];
  error = '';

  ngOnInit(): void {
    const role = this.auth.user()!.role;
    this.api.dashboard(role).subscribe({
      next: d => (this.counts = Object.entries(d)),
      error: e => (this.error = errorMessage(e)),
    });
  }

  label(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  }
}
