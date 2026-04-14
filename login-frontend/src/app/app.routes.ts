import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { ForgotPassword } from './forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'home', component: Home },
  { path: '**', redirectTo: '' }
];
