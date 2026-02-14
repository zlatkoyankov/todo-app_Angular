import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RegisterComponent } from './register';
import { AuthService } from '../../service/auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { of, Subject } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    const authServiceMock = {
      register: vi.fn()
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
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component['registerForm'].value).toEqual({
        username: '',
        password: '',
        confirmPassword: ''
      });
    });

    it('should initialize with no error message', () => {
      expect(component['errorMessage']()).toBe('');
    });

    it('should initialize with isLoading as false', () => {
      expect(component['isLoading']()).toBe(false);
    });

    it('should have invalid form initially', () => {
      expect(component['registerForm'].invalid).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should mark username as required', () => {
      const usernameControl = component['registerForm'].get('username');
      expect(usernameControl?.hasError('required')).toBe(true);
    });

    it('should mark password as required', () => {
      const passwordControl = component['registerForm'].get('password');
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should mark confirmPassword as required', () => {
      const confirmControl = component['registerForm'].get('confirmPassword');
      expect(confirmControl?.hasError('required')).toBe(true);
    });

    it('should validate username minimum length', () => {
      const usernameControl = component['registerForm'].get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBe(true);

      usernameControl?.setValue('abc');
      expect(usernameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component['registerForm'].get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should be valid with correct input', () => {
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
      expect(component['registerForm'].valid).toBe(true);
    });
  });

  describe('getUsernameError()', () => {
    it('should return empty string when no error', () => {
      component['registerForm'].get('username')?.setValue('validuser');
      expect(component['getUsernameError']()).toBe('');
    });

    it('should return required error message', () => {
      component['registerForm'].get('username')?.setValue('');
      component['registerForm'].get('username')?.markAsTouched();
      expect(component['getUsernameError']()).toBe('Username is required');
    });

    it('should return minlength error message', () => {
      component['registerForm'].get('username')?.setValue('ab');
      component['registerForm'].get('username')?.markAsTouched();
      expect(component['getUsernameError']()).toBe('Username must be at least 3 characters');
    });
  });

  describe('getPasswordError()', () => {
    it('should return empty string when no error', () => {
      component['registerForm'].get('password')?.setValue('validpassword');
      expect(component['getPasswordError']()).toBe('');
    });

    it('should return required error message', () => {
      component['registerForm'].get('password')?.setValue('');
      component['registerForm'].get('password')?.markAsTouched();
      expect(component['getPasswordError']()).toBe('Password is required');
    });

    it('should return minlength error message', () => {
      component['registerForm'].get('password')?.setValue('12345');
      component['registerForm'].get('password')?.markAsTouched();
      expect(component['getPasswordError']()).toBe('Password must be at least 6 characters');
    });
  });

  describe('getConfirmPasswordError()', () => {
    it('should return empty string when no error', () => {
      component['registerForm'].get('confirmPassword')?.setValue('password');
      expect(component['getConfirmPasswordError']()).toBe('');
    });

    it('should return required error message', () => {
      component['registerForm'].get('confirmPassword')?.setValue('');
      component['registerForm'].get('confirmPassword')?.markAsTouched();
      expect(component['getConfirmPasswordError']()).toBe('Please confirm your password');
    });
  });

  describe('onSubmit()', () => {
    it('should not submit if form is invalid', async () => {
      await component['onSubmit']();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submission', async () => {
      await component['onSubmit']();
      expect(component['registerForm'].get('username')?.touched).toBe(true);
      expect(component['registerForm'].get('password')?.touched).toBe(true);
      expect(component['registerForm'].get('confirmPassword')?.touched).toBe(true);
    });

    it('should call authService.register with form values', async () => {
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });

      vi.mocked(authService.register).mockResolvedValue({ success: true });

      await component['onSubmit']();

      expect(authService.register).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
    });

    it('should set isLoading to true during registration', async () => {
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });

      let isLoadingDuringRegistration = false;
      vi.mocked(authService.register).mockImplementation(async () => {
        isLoadingDuringRegistration = component['isLoading']();
        return { success: true };
      });

      await component['onSubmit']();

      expect(isLoadingDuringRegistration).toBe(true);
    });

    it('should clear error message before registration', async () => {
      component['errorMessage'].set('Previous error');
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });

      vi.mocked(authService.register).mockResolvedValue({ success: true });

      await component['onSubmit']();

      expect(component['errorMessage']() === '').toBeTruthy();
    });

    it('should navigate to /todos on successful registration', async () => {
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });

      vi.mocked(authService.register).mockResolvedValue({ success: true });

      await component['onSubmit']();

      expect(router.navigate).toHaveBeenCalledWith(['/todos']);
    });

    it('should display error message on failed registration', async () => {
      component['registerForm'].setValue({
        username: 'existinguser',
        password: 'password123',
        confirmPassword: 'password123'
      });

      vi.mocked(authService.register).mockResolvedValue({
        success: false,
        error: 'Username already exists'
      });

      await component['onSubmit']();

      expect(component['errorMessage']()).toBe('Username already exists');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should set isLoading to false on failed registration', async () => {
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });

      vi.mocked(authService.register).mockResolvedValue({
        success: false,
        error: 'Registration failed'
      });

      await component['onSubmit']();

      expect(component['isLoading']()).toBe(false);
    });

    it('should display default error message if none provided', async () => {
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });

      vi.mocked(authService.register).mockResolvedValue({
        success: false
      });

      await component['onSubmit']();

      expect(component['errorMessage']()).toBe('Registration failed');
    });

    it('should handle password mismatch error from service', async () => {
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'different123'
      });

      vi.mocked(authService.register).mockResolvedValue({
        success: false,
        error: 'Passwords do not match'
      });

      await component['onSubmit']();

      expect(component['errorMessage']()).toBe('Passwords do not match');
    });

    it('should not navigate on failed registration', async () => {
      component['registerForm'].setValue({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      });

      vi.mocked(authService.register).mockResolvedValue({
        success: false,
        error: 'Registration failed'
      });

      await component['onSubmit']();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
