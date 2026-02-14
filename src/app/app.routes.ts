import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { TodoComponent } from './components/todo/todo';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { AccountComponent } from './components/account/account';

export const routes: Routes = [
  {
    path: '',
    component: TodoComponent,
    title: 'Todo App - Guest Mode',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Todo App',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Sign Up - Todo App',
  },
  {
    path: 'todos',
    component: TodoComponent,
    canActivate: [authGuard],
    title: 'My Todos - Todo App',
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [authGuard],
    title: 'Account Settings - Todo App',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
