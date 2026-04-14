import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { ForgotPassword } from './forgot-password/forgot-password';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'home', component: Home },
  { path: '**', redirectTo: '' }
];
