import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { User, UserCredentials, UserRegistration } from '../models/user.model';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  const API_URL = '/api';

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    name: 'Test User'
  };

  const mockLoginResponse = {
    token: 'test-token-123',
    user: mockUser
  };

  const mockRegisterResponse = {
    token: 'new-token-456',
    user: { id: 2, username: 'newuser', name: 'New User' }
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: vi.fn()
          }
        }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with no user when localStorage is empty', () => {
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should load user from localStorage on initialization', () => {
      localStorage.setItem('authToken', 'stored-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: { navigate: vi.fn() } }
        ]
      });

      const newService = TestBed.inject(AuthService);
      expect(newService.currentUser()).toEqual(mockUser);
      expect(newService.isAuthenticated()).toBe(true);
    });

    it('should not load user if token is missing', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: { navigate: vi.fn() } }
        ]
      });

      const newService = TestBed.inject(AuthService);
      expect(newService.currentUser()).toBeNull();
      expect(newService.isAuthenticated()).toBe(false);
    });
  });

  describe('login()', () => {
    const credentials: UserCredentials = {
      username: 'testuser',
      password: 'password123'
    };

    it('should login successfully with valid credentials', async () => {
      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);

      req.flush(mockLoginResponse);

      const result = await promise;
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should save token and user data to localStorage on successful login', async () => {
      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(mockLoginResponse);

      await promise;

      expect(localStorage.getItem('authToken')).toBe('test-token-123');
      expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUser));
    });

    it('should update currentUser signal on successful login', async () => {
      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(mockLoginResponse);

      await promise;

      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return error on failed login', async () => {
      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' }
      );

      const result = await promise;
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle error object with error property', async () => {
      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(
        { error: 'Login failed' },
        { status: 400, statusText: 'Bad Request' }
      );

      const result = await promise;
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login failed');
    });

    it('should provide default error message on network error', async () => {
      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(
        {},
        { status: 500, statusText: 'Internal Server Error' }
      );

      const result = await promise;
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login failed');
    });
  });

  describe('register()', () => {
    const registration: UserRegistration = {
      username: 'newuser',
      password: 'password123',
      confirmPassword: 'password123'
    };

    it('should register successfully with valid data', async () => {
      const promise = service.register(registration);

      const req = httpMock.expectOne(`${API_URL}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: registration.username,
        password: registration.password
      });

      req.flush(mockRegisterResponse);

      const result = await promise;
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should save token and user data on successful registration', async () => {
      const promise = service.register(registration);

      const req = httpMock.expectOne(`${API_URL}/register`);
      req.flush(mockRegisterResponse);

      await promise;

      expect(localStorage.getItem('authToken')).toBe('new-token-456');
      expect(localStorage.getItem('currentUser')).toContain('newuser');
    });

    it('should update currentUser signal on successful registration', async () => {
      const promise = service.register(registration);

      const req = httpMock.expectOne(`${API_URL}/register`);
      req.flush(mockRegisterResponse);

      await promise;

      expect(service.currentUser()?.username).toBe('newuser');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return error when passwords do not match', async () => {
      const invalidRegistration = {
        ...registration,
        confirmPassword: 'different-password'
      };

      const result = await service.register(invalidRegistration);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Passwords do not match');
      httpMock.expectNone(`${API_URL}/register`);
    });

    it('should return error when password is too short', async () => {
      const weakPasswordRegistration = {
        username: 'testuser',
        password: '12345',
        confirmPassword: '12345'
      };

      const result = await service.register(weakPasswordRegistration);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters');
      httpMock.expectNone(`${API_URL}/register`);
    });

    it('should handle registration error from server', async () => {
      const promise = service.register(registration);

      const req = httpMock.expectOne(`${API_URL}/register`);
      req.flush(
        { message: 'Username already exists' },
        { status: 409, statusText: 'Conflict' }
      );

      const result = await promise;
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists');
    });

    it('should not send confirmPassword to server', async () => {
      const promise = service.register(registration);

      const req = httpMock.expectOne(`${API_URL}/register`);
      expect(req.request.body).not.toHaveProperty('confirmPassword');

      req.flush(mockRegisterResponse);
      await promise;
    });
  });

  describe('logout()', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      service['currentUserSignal'].set(mockUser);
    });

    it('should call logout endpoint', async () => {
      const promise = service.logout();

      const req = httpMock.expectOne(`${API_URL}/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({});

      await promise;
    });

    it('should clear localStorage on logout', async () => {
      const promise = service.logout();

      const req = httpMock.expectOne(`${API_URL}/logout`);
      req.flush({});

      await promise;

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should clear currentUser signal on logout', async () => {
      const promise = service.logout();

      const req = httpMock.expectOne(`${API_URL}/logout`);
      req.flush({});

      await promise;

      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should navigate to home page on logout', async () => {
      const promise = service.logout();

      const req = httpMock.expectOne(`${API_URL}/logout`);
      req.flush({});

      await promise;

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should clear auth data even if logout request fails', async () => {
      const promise = service.logout();

      const req = httpMock.expectOne(`${API_URL}/logout`);
      req.flush({}, { status: 500, statusText: 'Server Error' });

      await promise;

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('getProfile()', () => {
    it('should fetch user profile successfully', async () => {
      const promise = service.getProfile();

      const req = httpMock.expectOne(`${API_URL}/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      const result = await promise;
      expect(result).toEqual(mockUser);
    });

    it('should update currentUser signal with profile data', async () => {
      const promise = service.getProfile();

      const req = httpMock.expectOne(`${API_URL}/profile`);
      req.flush(mockUser);

      await promise;

      expect(service.currentUser()).toEqual(mockUser);
    });

    it('should update localStorage with profile data', async () => {
      const promise = service.getProfile();

      const req = httpMock.expectOne(`${API_URL}/profile`);
      req.flush(mockUser);

      await promise;

      expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUser));
    });

    it('should clear auth data if profile fetch fails', async () => {
      localStorage.setItem('authToken', 'invalid-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      service['currentUserSignal'].set(mockUser);

      const promise = service.getProfile();

      const req = httpMock.expectOne(`${API_URL}/profile`);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      const result = await promise;

      expect(result).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('unsupported operations', () => {
    it('should return error for updateAccount', () => {
      const result = service.updateAccount({ username: 'newname' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should return error for changePassword', () => {
      const result = service.changePassword({
        currentPassword: 'old',
        newPassword: 'new',
        confirmNewPassword: 'new'
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should return error for deleteAccount', () => {
      const result = service.deleteAccount();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });
  });
});
