import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { UserRegistration } from '../../models/user.model';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected errorMessage = signal<string>('');
  protected isLoading = signal<boolean>(false);

  protected registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  protected async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const registration: UserRegistration = {
      username: this.registerForm.value.username!,
      password: this.registerForm.value.password!,
      confirmPassword: this.registerForm.value.confirmPassword!,
    };

    const result = await this.authService.register(registration);

    if (result.success) {
      this.router.navigate(['/todos']);
    } else {
      this.errorMessage.set(result.error || 'Registration failed');
      this.isLoading.set(false);
    }
  }

  protected getUsernameError(): string {
    const usernameControl = this.registerForm.get('username');
    if (usernameControl?.hasError('required')) {
      return 'Username is required';
    }
    if (usernameControl?.hasError('minlength')) {
      return 'Username must be at least 3 characters';
    }
    return '';
  }

  protected getPasswordError(): string {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  protected getConfirmPasswordError(): string {
    const confirmControl = this.registerForm.get('confirmPassword');
    if (confirmControl?.hasError('required')) {
      return 'Please confirm your password';
    }
    return '';
  }
}
