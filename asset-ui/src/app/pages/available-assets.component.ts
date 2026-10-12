import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Asset } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-available-assets',
  standalone: true,
  imports: [FormsModule, RouterLink, MsgComponent],
  template: `
    <h2>Available assets</h2>
    <app-msg [error]="error" />
    <div class="inline filters">
      <select name="cat" [(ngModel)]="categoryName">
        <option value="">All categories</option>
        @for (n of categoryNames; track n) { <option [value]="n">{{ n }}</option> }
      </select>
      <a routerLink="/my-requests">Need one? Create a request →</a>
    </div>
    <table>
      <thead><tr><th>Tag</th><th>Name</th><th>Category</th><th>Brand / model</th></tr></thead>
      <tbody>
        @for (a of visible(); track a.id) {
          <tr><td>{{ a.assetTag }}</td><td>{{ a.name }}</td><td>{{ a.categoryName }}</td><td>{{ a.brand }} {{ a.model }}</td></tr>
        } @empty { <tr><td colspan="4" class="muted">No available assets.</td></tr> }
      </tbody>
    </table>
  `,
})
export class AvailableAssetsComponent implements OnInit {
  private readonly api = inject(ApiService);
  assets: Asset[] = [];
  categoryNames: string[] = [];
  categoryName = '';
  error = '';

  ngOnInit(): void {
    this.api.availableAssets().subscribe({
      next: a => {
        this.assets = a;
        this.categoryNames = [...new Set(a.map(x => x.categoryName))].sort();
      },
      error: e => (this.error = errorMessage(e)),
    });
  }

  visible(): Asset[] {
    return this.categoryName ? this.assets.filter(a => a.categoryName === this.categoryName) : this.assets;
  }
}
