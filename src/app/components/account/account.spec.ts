import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { AccountComponent } from './account';
import { AuthService } from '../../service/auth';
import { User } from '../../models/user.model';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { of, Subject } from 'rxjs';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let authService: AuthService;
  let router: Router;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    name: 'Test User'
  };

  beforeEach(async () => {
    const authServiceMock = {
      currentUser: signal<User | null>(mockUser),
      updateAccount: vi.fn(),
      changePassword: vi.fn(),
      deleteAccount: vi.fn()
    };

    const routerMock = {
      navigate: vi.fn(),
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn(),
      events: new Subject(),
      routerState: { root: {} }
    };

    const activatedRouteMock = {
      snapshot: { params: {}, queryParams: {}, data: {}, url: [], fragment: null, outlet: 'primary', title: undefined },
      params: of({}),
      queryParams: of({}),
      fragment: of(null),
      data: of({}),
      url: of([]),
      outlet: 'primary',
      component: null,
      routeConfig: null,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: of(new Map()),
      queryParamMap: of(new Map())
    };

    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should populate form with current user data', () => {
      expect(component['accountForm'].value.username).toBe('testuser');
    });

    it('should initialize with no error message', () => {
      expect(component['errorMessage']()).toBe('');
    });

    it('should initialize with no success message', () => {
      expect(component['successMessage']()).toBe('');
    });

    it('should initialize with isLoading as false', () => {
      expect(component['isLoading']()).toBe(false);
    });

    it('should initialize with showDeleteConfirm as false', () => {
      expect(component['showDeleteConfirm']()).toBe(false);
    });

    it('should have empty password form initially', () => {
      expect(component['passwordForm'].value).toEqual({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    });
  });

  describe('Account Form Validation', () => {
    it('should mark username as required', () => {
      component['accountForm'].get('username')?.setValue('');
      expect(component['accountForm'].get('username')?.hasError('required')).toBe(true);
    });

    it('should validate username minimum length', () => {
      component['accountForm'].get('username')?.setValue('ab');
      expect(component['accountForm'].get('username')?.hasError('minlength')).toBe(true);

      component['accountForm'].get('username')?.setValue('abc');
      expect(component['accountForm'].get('username')?.hasError('minlength')).toBe(false);
    });
  });

  describe('Password Form Validation', () => {
    it('should mark all password fields as required', () => {
      expect(component['passwordForm'].get('currentPassword')?.hasError('required')).toBe(true);
      expect(component['passwordForm'].get('newPassword')?.hasError('required')).toBe(true);
      expect(component['passwordForm'].get('confirmPassword')?.hasError('required')).toBe(true);
    });

    it('should validate new password minimum length', () => {
      component['passwordForm'].get('newPassword')?.setValue('12345');
      expect(component['passwordForm'].get('newPassword')?.hasError('minlength')).toBe(true);

      component['passwordForm'].get('newPassword')?.setValue('123456');
      expect(component['passwordForm'].get('newPassword')?.hasError('minlength')).toBe(false);
    });
  });

  describe('Error Message Methods', () => {
    it('should return username required error', () => {
      component['accountForm'].get('username')?.setValue('');
      component['accountForm'].get('username')?.markAsTouched();
      expect(component['getUsernameError']()).toBe('Username is required');
    });

    it('should return username minlength error', () => {
      component['accountForm'].get('username')?.setValue('ab');
      component['accountForm'].get('username')?.markAsTouched();
      expect(component['getUsernameError']()).toBe('Username must be at least 3 characters');
    });

    it('should return current password required error', () => {
      component['passwordForm'].get('currentPassword')?.setValue('');
      component['passwordForm'].get('currentPassword')?.markAsTouched();
      expect(component['getCurrentPasswordError']()).toBe('Current password is required');
    });

    it('should return new password required error', () => {
      component['passwordForm'].get('newPassword')?.setValue('');
      component['passwordForm'].get('newPassword')?.markAsTouched();
      expect(component['getNewPasswordError']()).toBe('New password is required');
    });

    it('should return new password minlength error', () => {
      component['passwordForm'].get('newPassword')?.setValue('12345');
      component['passwordForm'].get('newPassword')?.markAsTouched();
      expect(component['getNewPasswordError']()).toBe('Password must be at least 6 characters');
    });

    it('should return confirm password required error', () => {
      component['passwordForm'].get('confirmPassword')?.setValue('');
      component['passwordForm'].get('confirmPassword')?.markAsTouched();
      expect(component['getConfirmPasswordError']()).toBe('Please confirm your password');
    });
  });

  describe('onUpdateAccount()', () => {
    it('should not update if form is invalid', () => {
      component['accountForm'].get('username')?.setValue('');
      component['onUpdateAccount']();
      expect(authService.updateAccount).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submission', () => {
      component['accountForm'].get('username')?.setValue('');
      component['onUpdateAccount']();
      expect(component['accountForm'].get('username')?.touched).toBe(true);
    });

    it('should call authService.updateAccount with form values', () => {
      component['accountForm'].setValue({ username: 'newusername' });
      vi.mocked(authService.updateAccount).mockReturnValue({ success: true });

      component['onUpdateAccount']();

      expect(authService.updateAccount).toHaveBeenCalledWith({
        username: 'newusername'
      });
    });

    it('should display success message on successful update', () => {
      component['accountForm'].setValue({ username: 'newusername' });
      vi.mocked(authService.updateAccount).mockReturnValue({ success: true });

      component['onUpdateAccount']();

      expect(component['successMessage']()).toBe('Account updated successfully');
      expect(component['errorMessage']()).toBe('');
    });

    it('should display error message on failed update', () => {
      component['accountForm'].setValue({ username: 'newusername' });
      vi.mocked(authService.updateAccount).mockReturnValue({
        success: false,
        error: 'Account update not supported by backend'
      });

      component['onUpdateAccount']();

      expect(component['errorMessage']()).toBe('Account update not supported by backend');
      expect(component['successMessage']()).toBe('');
    });

    it('should clear messages before update', () => {
      component['errorMessage'].set('old error');
      component['successMessage'].set('old success');
      component['accountForm'].setValue({ username: 'newusername' });
      vi.mocked(authService.updateAccount).mockReturnValue({ success: true });

      component['onUpdateAccount']();

      expect(component['errorMessage']()).toBe('');
    });

    it('should set isLoading to false after update completes', () => {
      component['accountForm'].setValue({ username: 'newusername' });
      vi.mocked(authService.updateAccount).mockReturnValue({ success: true });

      component['onUpdateAccount']();

      expect(component['isLoading']()).toBe(false);
    });
  });

  describe('onChangePassword()', () => {
    it('should not change password if form is invalid', () => {
      component['onChangePassword']();
      expect(authService.changePassword).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submission', () => {
      component['onChangePassword']();
      expect(component['passwordForm'].get('currentPassword')?.touched).toBe(true);
      expect(component['passwordForm'].get('newPassword')?.touched).toBe(true);
      expect(component['passwordForm'].get('confirmPassword')?.touched).toBe(true);
    });

    it('should call authService.changePassword with form values', () => {
      component['passwordForm'].setValue({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
      vi.mocked(authService.changePassword).mockReturnValue({ success: true });

      component['onChangePassword']();

      expect(authService.changePassword).toHaveBeenCalledWith({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
    });

    it('should display success message and reset form on successful password change', () => {
      component['passwordForm'].setValue({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
      vi.mocked(authService.changePassword).mockReturnValue({ success: true });

      component['onChangePassword']();

      expect(component['successMessage']()).toBe('Password changed successfully');
      expect(component['errorMessage']()).toBe('');
      expect(component['passwordForm'].value).toEqual({
        currentPassword: null,
        newPassword: null,
        confirmPassword: null
      });
    });

    it('should display error message on failed password change', () => {
      component['passwordForm'].setValue({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
      vi.mocked(authService.changePassword).mockReturnValue({
        success: false,
        error: 'Password change not supported by backend'
      });

      component['onChangePassword']();

      expect(component['errorMessage']()).toBe('Password change not supported by backend');
      expect(component['successMessage']()).toBe('');
    });

    it('should set isLoading to false after change completes', () => {
      component['passwordForm'].setValue({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
      vi.mocked(authService.changePassword).mockReturnValue({ success: true });

      component['onChangePassword']();

      expect(component['isLoading']()).toBe(false);
    });
  });

  describe('Delete Account Flow', () => {
    it('should show delete confirmation when confirmDelete is called', () => {
      component['confirmDelete']();
      expect(component['showDeleteConfirm']()).toBe(true);
    });

    it('should hide delete confirmation when cancelDelete is called', () => {
      component['showDeleteConfirm'].set(true);
      component['cancelDelete']();
      expect(component['showDeleteConfirm']()).toBe(false);
    });

    it('should call authService.deleteAccount when confirmed', () => {
      vi.mocked(authService.deleteAccount).mockReturnValue({
        success: false,
        error: 'Account deletion not supported by backend'
      });

      component['onDeleteAccount']();

      expect(authService.deleteAccount).toHaveBeenCalled();
    });

    it('should display error message on failed deletion', () => {
      vi.mocked(authService.deleteAccount).mockReturnValue({
        success: false,
        error: 'Account deletion not supported by backend'
      });

      component['onDeleteAccount']();

      expect(component['errorMessage']()).toBe('Account deletion not supported by backend');
      expect(component['isLoading']()).toBe(false);
      expect(component['showDeleteConfirm']()).toBe(false);
    });

    it('should clear error message before deletion', () => {
      component['errorMessage'].set('old error');
      vi.mocked(authService.deleteAccount).mockReturnValue({
        success: false,
        error: 'Delete failed'
      });

      component['onDeleteAccount']();

      expect(component['errorMessage']()).toBe('Delete failed');
    });
  });
});
