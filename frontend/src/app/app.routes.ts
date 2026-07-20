import { Routes } from '@angular/router';
import { LandingPage } from './features/landing/pages/landing-page/landing-page';
import { DashboardPage } from './features/dashboard/pages/dashboard-page/dashboard-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    title: 'Ledgerly | Personal Finance',
  },
  {
    path: 'login',
    component: LoginPage,
    title: 'Login | Ledgerly',
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [authGuard],
    title: 'Dashboard | Ledgerly',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
