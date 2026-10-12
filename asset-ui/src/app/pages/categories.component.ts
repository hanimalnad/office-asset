import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Category } from '../core/models';
import { MsgComponent } from '../core/msg.component';
import { errorMessage } from '../core/util';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, MsgComponent],
  template: `
    <h2>Categories</h2>
    <app-msg [error]="error" [info]="info" />

    <form class="card inline" (ngSubmit)="create()">
      <input name="n" [(ngModel)]="name" placeholder="Category name *" required />
      <input name="d" [(ngModel)]="description" placeholder="Description" />
      <button type="submit">Add category</button>
    </form>

    <table>
      <thead><tr><th>#</th><th>Name</th><th>Description</th><th>Status</th><th></th></tr></thead>
      <tbody>
        @for (c of categories; track c.id) {
          <tr>
            <td>{{ c.id }}</td>
            @if (editId === c.id) {
              <td><input name="en" [(ngModel)]="editName" /></td>
              <td><input name="ed" [(ngModel)]="editDescription" /></td>
              <td><span class="badge s-{{ c.status }}">{{ c.status }}</span></td>
              <td><button (click)="save(c)">Save</button> <button class="link" (click)="editId = null">Cancel</button></td>
            } @else {
              <td>{{ c.name }}</td><td>{{ c.description }}</td>
              <td><span class="badge s-{{ c.status }}">{{ c.status }}</span></td>
              <td>
                <button (click)="startEdit(c)">Edit</button>
                <button class="danger" (click)="toggle(c)">{{ c.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}</button>
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
    <p class="muted">INACTIVE categories can no longer be chosen for new asset requests.</p>
  `,
})
export class CategoriesComponent implements OnInit {
  private readonly api = inject(ApiService);
  categories: Category[] = [];
  name = '';
  description = '';
  editId: number | null = null;
  editName = '';
  editDescription = '';
  error = '';
  info = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.categories().subscribe({ next: c => (this.categories = c), error: e => (this.error = errorMessage(e)) });
  }

  create(): void {
    this.error = this.info = '';
    this.api.createCategory(this.name, this.description).subscribe({
      next: () => { this.info = 'Category created'; this.name = this.description = ''; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }

  startEdit(c: Category): void {
    this.editId = c.id;
    this.editName = c.name;
    this.editDescription = c.description ?? '';
  }

  save(c: Category): void {
    this.error = this.info = '';
    this.api.updateCategory(c.id, this.editName, this.editDescription).subscribe({
      next: () => { this.info = 'Category updated'; this.editId = null; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }

  toggle(c: Category): void {
    this.error = this.info = '';
    this.api.setCategoryStatus(c.id, c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE').subscribe({
      next: () => { this.info = `${c.name} updated`; this.load(); },
      error: e => (this.error = errorMessage(e)),
    });
  }
}
