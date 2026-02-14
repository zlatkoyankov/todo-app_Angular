import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { UserUpdate, PasswordChange } from '../../models/user.model';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class AccountComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected currentUser = this.authService.currentUser;
  protected errorMessage = signal<string>('');
  protected successMessage = signal<string>('');
  protected isLoading = signal<boolean>(false);
  protected showDeleteConfirm = signal<boolean>(false);

  protected accountForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  protected passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  constructor() {
    const user = this.currentUser();
    if (user) {
      this.accountForm.patchValue({
        name: user.name,
        email: user.email,
      });
    }
  }

  protected onUpdateAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const update: UserUpdate = {
      name: this.accountForm.value.name!,
      email: this.accountForm.value.email!,
    };

    const result = this.authService.updateAccount(update);

    if (result.success) {
      this.successMessage.set('Account updated successfully');
    } else {
      this.errorMessage.set(result.error || 'Update failed');
    }

    this.isLoading.set(false);
  }

  protected onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const passwordChange: PasswordChange = {
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!,
      confirmPassword: this.passwordForm.value.confirmPassword!,
    };

    const result = this.authService.changePassword(passwordChange);

    if (result.success) {
      this.successMessage.set('Password changed successfully');
      this.passwordForm.reset();
    } else {
      this.errorMessage.set(result.error || 'Password change failed');
    }

    this.isLoading.set(false);
  }

  protected confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  protected cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  protected onDeleteAccount(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const result = this.authService.deleteAccount();

    if (result.success) {
      // User is logged out and redirected by the service
    } else {
      this.errorMessage.set(result.error || 'Delete failed');
      this.isLoading.set(false);
      this.showDeleteConfirm.set(false);
    }
  }

  protected getNameError(): string {
    const nameControl = this.accountForm.get('name');
    if (nameControl?.hasError('required')) {
      return 'Name is required';
    }
    if (nameControl?.hasError('minlength')) {
      return 'Name must be at least 2 characters';
    }
    return '';
  }

  protected getEmailError(): string {
    const emailControl = this.accountForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  protected getCurrentPasswordError(): string {
    const control = this.passwordForm.get('currentPassword');
    if (control?.hasError('required')) {
      return 'Current password is required';
    }
    return '';
  }

  protected getNewPasswordError(): string {
    const control = this.passwordForm.get('newPassword');
    if (control?.hasError('required')) {
      return 'New password is required';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  protected getConfirmPasswordError(): string {
    const control = this.passwordForm.get('confirmPassword');
    if (control?.hasError('required')) {
      return 'Please confirm your password';
    }
    return '';
  }
}
