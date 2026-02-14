import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { UserCredentials } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected errorMessage = signal<string>('');
  protected isLoading = signal<boolean>(false);

  protected loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  protected async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: UserCredentials = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!,
    };

    const result = await this.authService.login(credentials);

    if (result.success) {
      this.router.navigate(['/todos']);
    } else {
      this.errorMessage.set(result.error || 'Login failed');
      this.isLoading.set(false);
    }
  }

  protected getUsernameError(): string {
    const usernameControl = this.loginForm.get('username');
    if (usernameControl?.hasError('required')) {
      return 'Username is required';
    }
    if (usernameControl?.hasError('minlength')) {
      return 'Username must be at least 3 characters';
    }
    return '';
  }

  protected getPasswordError(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}
