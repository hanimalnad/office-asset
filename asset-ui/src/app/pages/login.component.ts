import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MsgComponent],
  template: `
    <div class="card login">
      <h2>Sign in</h2>
      <app-msg [error]="error" />
      <form (ngSubmit)="submit()">
        <label>Email <input name="email" type="email" [(ngModel)]="email" required /></label>
        <label>Password <input name="password" type="password" [(ngModel)]="password" required /></label>
        <button type="submit" [disabled]="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
      </form>
      <p class="hint">Dev users (password <code>Password&#64;123</code>):<br />
        admin&#64;company.com · manager&#64;company.com<br />
        employee1&#64;company.com · employee2&#64;company.com</p>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  error = '';
  loading = false;

  submit(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: e => { this.error = errorMessage(e); this.loading = false; },
    });
  }
}
