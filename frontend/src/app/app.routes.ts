import { Routes } from '@angular/router';
import { LandingPage } from './features/landing/pages/landing-page/landing-page';
import { DashboardPage } from './features/dashboard/pages/dashboard-page/dashboard-page';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    title: 'Ledgerly | Personal Finance',
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    title: 'Dashboard | Ledgerly',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
