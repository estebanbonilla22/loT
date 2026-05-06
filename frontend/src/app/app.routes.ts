import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { CreateShipmentPage } from './pages/create-shipment/create-shipment.page';
import { ShipmentDetailPage } from './pages/shipment-detail/shipment-detail.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },

  { path: 'dashboard', canActivate: [authGuard], component: DashboardPage },
  { path: 'shipments/new', canActivate: [authGuard, adminGuard], component: CreateShipmentPage },
  { path: 'shipments/:id', canActivate: [authGuard], component: ShipmentDetailPage },

  { path: '**', redirectTo: 'dashboard' }
];
