import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Asset, Category } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [FormsModule, MsgComponent],
  template: `
    <h2>Assets</h2>
    <app-msg [error]="error" [info]="info" />

    @if (editId === null) {
      <form class="card inline" (ngSubmit)="create()">
        <strong>New asset</strong>
        <input name="tag" [(ngModel)]="form.assetTag" placeholder="Asset tag *" required />
        <input name="name" [(ngModel)]="form.name" placeholder="Name *" required />
        <select name="fcat" [(ngModel)]="form.categoryId" required>
          <option [ngValue]="null" disabled>Category *</option>
          @for (c of categories; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
        </select>
        <input name="brand" [(ngModel)]="form.brand" placeholder="Brand" />
        <input name="model" [(ngModel)]="form.model" placeholder="Model" />
        <input name="serial" [(ngModel)]="form.serialNumber" placeholder="Serial number" />
        <button type="submit">Add asset</button>
      </form>
    } @else {
      <form class="card inline" (ngSubmit)="save()">
        <strong>Edit {{ editTag }}</strong>
        <input name="ename" [(ngModel)]="edit.name" placeholder="Name *" required />
        <select name="ecat" [(ngModel)]="edit.categoryId" required>
          @for (c of categories; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
        </select>
        <input name="ebrand" [(ngModel)]="edit.brand" placeholder="Brand" />
        <input name="emodel" [(ngModel)]="edit.model" placeholder="Model" />
        <input name="eserial" [(ngModel)]="edit.serialNumber" placeholder="Serial number" />
        <select name="estatus" [(ngModel)]="edit.status">
          @for (s of editableStatuses; track s) { <option [value]="s">{{ s }}</option> }
        </select>
        <button type="submit">Save</button>
        <button type="button" class="link" (click)="editId = null">Cancel</button>
      </form>
    }

    <div class="inline filters">
      <select name="status" [(ngModel)]="status" (ngModelChange)="reload()">
        <option value="">All statuses</option>
        @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
      </select>
      <select name="cat" [(ngModel)]="categoryId" (ngModelChange)="reload()">
        <option [ngValue]="null">All categories</option>
        @for (c of categories; track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
      </select>
    </div>

    <table>
      <thead><tr><th>Tag</th><th>Name</th><th>Category</th><th>Brand / model</th><th>Serial</th><th>Status</th><th></th></tr></thead>
      <tbody>
        @for (a of assets; track a.id) {
          <tr>
            <td>{{ a.assetTag }}</td><td>{{ a.name }}</td><td>{{ a.categoryName }}</td>
            <td>{{ a.brand }} {{ a.model }}</td><td>{{ a.serialNumber }}</td>
            <td><span class="badge s-{{ a.status }}">{{ a.status }}</span></td>
            <td>
              @if (a.status === 'ALLOCATED') { <span class="muted">In use</span> }
              @else { <button (click)="startEdit(a)">Edit</button> }
            </td>
          </tr>
        } @empty { <tr><td colspan="7" class="muted">No assets found.</td></tr> }
      </tbody>
    </table>
    <div class="pager">
      <button (click)="go(-1)" [disabled]="page === 0">‹ Prev</button>
      <span>Page {{ page + 1 }} of {{ totalPages || 1 }}</span>
      <button (click)="go(1)" [disabled]="page + 1 >= totalPages">Next ›</button>
    </div>
    <p class="muted">Allocated assets cannot be edited; process their return first. Use Edit to move an asset out of MAINTENANCE or to RETIRED.</p>
  `,
})
export class AssetsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly statuses = ['AVAILABLE', 'ALLOCATED', 'MAINTENANCE', 'RETIRED'];
  readonly editableStatuses = ['AVAILABLE', 'MAINTENANCE', 'RETIRED'];
  assets: Asset[] = [];
  categories: Category[] = [];
  status = '';
  categoryId: number | null = null;
  page = 0;
  totalPages = 0;
  form = this.emptyForm();
  editId: number | null = null;
  editTag = '';
  edit = { name: '', categoryId: 0, brand: '', model: '', serialNumber: '', status: 'AVAILABLE' };
  error = '';
  info = '';

  ngOnInit(): void {
    this.api.categories().subscribe({ next: c => (this.categories = c), error: e => (this.error = errorMessage(e)) });
    this.load();
  }

  reload(): void { this.page = 0; this.load(); }

  go(delta: number): void { this.page += delta; this.load(); }

  load(): void {
    this.api.assets(this.page, 10, this.status, this.categoryId).subscribe({
      next: r => { this.assets = r.content; this.totalPages = r.totalPages; },
      error: e => (this.error = errorMessage(e)),
    });
  }

  create(): void {
    this.error = this.info = '';
    this.api.createAsset(this.form).subscribe({
      next: () => { this.info = 'Asset created'; this.form = this.emptyForm(); this.reload(); },
      error: e => (this.error = errorMessage(e)),
    });
  }

  startEdit(a: Asset): void {
    this.editId = a.id;
    this.editTag = a.assetTag;
    this.edit = {
      name: a.name, categoryId: a.categoryId, brand: a.brand ?? '', model: a.model ?? '',
      serialNumber: a.serialNumber ?? '', status: a.status,
    };
  }

  save(): void {
    if (this.editId === null) { return; }
    this.error = this.info = '';
    this.api.updateAsset(this.editId, this.edit).subscribe({
      next: () => { this.info = 'Asset updated'; this.editId = null; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }

  private emptyForm() {
    return { assetTag: '', name: '', categoryId: null as number | null, brand: '', model: '', serialNumber: '' };
  }
}
