import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login';
import { AuthService } from '../../service/auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { of, Subject } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    const authServiceMock = {
      login: vi.fn()
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
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
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
      expect(component['loginForm'].value).toEqual({
        username: '',
        password: ''
      });
    });

    it('should initialize with no error message', () => {
      expect(component['errorMessage']()).toBe('');
    });

    it('should initialize with isLoading as false', () => {
      expect(component['isLoading']()).toBe(false);
    });

    it('should have invalid form initially', () => {
      expect(component['loginForm'].invalid).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should mark username as required', () => {
      const usernameControl = component['loginForm'].get('username');
      expect(usernameControl?.hasError('required')).toBe(true);
    });

    it('should mark password as required', () => {
      const passwordControl = component['loginForm'].get('password');
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should validate username minimum length', () => {
      const usernameControl = component['loginForm'].get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBe(true);

      usernameControl?.setValue('abc');
      expect(usernameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component['loginForm'].get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should be valid with correct input', () => {
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'password123'
      });
      expect(component['loginForm'].valid).toBe(true);
    });
  });

  describe('getUsernameError()', () => {
    it('should return empty string when no error', () => {
      component['loginForm'].get('username')?.setValue('validuser');
      expect(component['getUsernameError']()).toBe('');
    });

    it('should return required error message', () => {
      component['loginForm'].get('username')?.setValue('');
      component['loginForm'].get('username')?.markAsTouched();
      expect(component['getUsernameError']()).toBe('Username is required');
    });

    it('should return minlength error message', () => {
      component['loginForm'].get('username')?.setValue('ab');
      component['loginForm'].get('username')?.markAsTouched();
      expect(component['getUsernameError']()).toBe('Username must be at least 3 characters');
    });
  });

  describe('getPasswordError()', () => {
    it('should return empty string when no error', () => {
      component['loginForm'].get('password')?.setValue('validpassword');
      expect(component['getPasswordError']()).toBe('');
    });

    it('should return required error message', () => {
      component['loginForm'].get('password')?.setValue('');
      component['loginForm'].get('password')?.markAsTouched();
      expect(component['getPasswordError']()).toBe('Password is required');
    });

    it('should return minlength error message', () => {
      component['loginForm'].get('password')?.setValue('12345');
      component['loginForm'].get('password')?.markAsTouched();
      expect(component['getPasswordError']()).toBe('Password must be at least 6 characters');
    });
  });

  describe('onSubmit()', () => {
    it('should not submit if form is invalid', async () => {
      await component['onSubmit']();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submission', async () => {
      await component['onSubmit']();
      expect(component['loginForm'].get('username')?.touched).toBe(true);
      expect(component['loginForm'].get('password')?.touched).toBe(true);
    });

    it('should call authService.login with form values', async () => {
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'password123'
      });

      vi.mocked(authService.login).mockResolvedValue({ success: true });

      await component['onSubmit']();

      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should set isLoading to true during login', async () => {
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'password123'
      });

      let isLoadingDuringLogin = false;
      vi.mocked(authService.login).mockImplementation(async () => {
        isLoadingDuringLogin = component['isLoading']();
        return { success: true };
      });

      await component['onSubmit']();

      expect(isLoadingDuringLogin).toBe(true);
    });

    it('should clear error message before login', async () => {
      component['errorMessage'].set('Previous error');
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'password123'
      });

      vi.mocked(authService.login).mockResolvedValue({ success: true });

      await component['onSubmit']();

      expect(component['errorMessage']() === '').toBeTruthy();
    });

    it('should navigate to /todos on successful login', async () => {
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'password123'
      });

      vi.mocked(authService.login).mockResolvedValue({ success: true });

      await component['onSubmit']();

      expect(router.navigate).toHaveBeenCalledWith(['/todos']);
    });

    it('should display error message on failed login', async () => {
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'wrongpassword'
      });

      vi.mocked(authService.login).mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      });

      await component['onSubmit']();

      expect(component['errorMessage']()).toBe('Invalid credentials');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should set isLoading to false on failed login', async () => {
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'wrongpassword'
      });

      vi.mocked(authService.login).mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      });

      await component['onSubmit']();

      expect(component['isLoading']()).toBe(false);
    });

    it('should display default error message if none provided', async () => {
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'password123'
      });

      vi.mocked(authService.login).mockResolvedValue({
        success: false
      });

      await component['onSubmit']();

      expect(component['errorMessage']()).toBe('Login failed');
    });

    it('should not navigate on failed login', async () => {
      component['loginForm'].setValue({
        username: 'testuser',
        password: 'wrongpassword'
      });

      vi.mocked(authService.login).mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      });

      await component['onSubmit']();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
