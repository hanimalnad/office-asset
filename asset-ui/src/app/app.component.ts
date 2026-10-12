import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.user(); as u) {
      <header class="topbar">
        <strong class="brand">Asset Management</strong>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          @if (auth.hasRole('EMPLOYEE')) {
            <a routerLink="/my-requests" routerLinkActive="active">My requests</a>
            <a routerLink="/my-assets" routerLinkActive="active">My assets</a>
            <a routerLink="/available" routerLinkActive="active">Available</a>
          }
          @if (auth.hasRole('ASSET_MANAGER', 'ADMIN')) {
            <a routerLink="/requests" routerLinkActive="active">Requests</a>
            <a routerLink="/returns" routerLinkActive="active">Returns</a>
            <a routerLink="/allocations" routerLinkActive="active">Allocations</a>
            <a routerLink="/assets" routerLinkActive="active">Assets</a>
            <a routerLink="/categories" routerLinkActive="active">Categories</a>
          }
          @if (auth.hasRole('ADMIN')) {
            <a routerLink="/users" routerLinkActive="active">Users</a>
          }
        </nav>
        <span class="who">{{ u.name }} <span class="badge">{{ u.role }}</span>
          <button class="link" (click)="auth.logout()">Logout</button></span>
      </header>
    }
    <main class="container"><router-outlet /></main>
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
}
