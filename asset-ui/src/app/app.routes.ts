import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { AllocationsComponent } from './pages/allocations.component';
import { AssetsComponent } from './pages/assets.component';
import { AvailableAssetsComponent } from './pages/available-assets.component';
import { CategoriesComponent } from './pages/categories.component';
import { DashboardComponent } from './pages/dashboard.component';
import { LoginComponent } from './pages/login.component';
import { ManageRequestsComponent } from './pages/manage-requests.component';
import { ManageReturnsComponent } from './pages/manage-returns.component';
import { MyAssetsComponent } from './pages/my-assets.component';
import { MyRequestsComponent } from './pages/my-requests.component';
import { UsersComponent } from './pages/users.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', component: DashboardComponent },
      { path: 'my-requests', canActivate: [roleGuard('EMPLOYEE')], component: MyRequestsComponent },
      { path: 'my-assets', canActivate: [roleGuard('EMPLOYEE')], component: MyAssetsComponent },
      { path: 'available', canActivate: [roleGuard('EMPLOYEE')], component: AvailableAssetsComponent },
      { path: 'requests', canActivate: [roleGuard('ASSET_MANAGER', 'ADMIN')], component: ManageRequestsComponent },
      { path: 'returns', canActivate: [roleGuard('ASSET_MANAGER', 'ADMIN')], component: ManageReturnsComponent },
      { path: 'assets', canActivate: [roleGuard('ASSET_MANAGER', 'ADMIN')], component: AssetsComponent },
      { path: 'allocations', canActivate: [roleGuard('ASSET_MANAGER', 'ADMIN')], component: AllocationsComponent },
      { path: 'categories', canActivate: [roleGuard('ASSET_MANAGER', 'ADMIN')], component: CategoriesComponent },
      { path: 'users', canActivate: [roleGuard('ADMIN')], component: UsersComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
