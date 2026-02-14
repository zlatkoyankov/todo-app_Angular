import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { signal, computed } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../service/auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('authGuard', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    const currentUserSignal = signal<any>(null);
    const authServiceMock = {
      currentUser: currentUserSignal.asReadonly(),
      isAuthenticated: computed(() => currentUserSignal() !== null)
    };

    const routerMock = {
      createUrlTree: vi.fn((commands: any[]) => {
        return { toString: () => commands.join('/') } as UrlTree;
      }),
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  describe('When user is authenticated', () => {
    it('should allow activation', () => {
      // Set authenticated state
      const authServiceInternal = authService as any;
      authServiceInternal.currentUser = signal({ id: 1, username: 'test' }).asReadonly();
      authServiceInternal.isAuthenticated = computed(() => true);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceInternal },
          { provide: Router, useValue: router }
        ]
      });

      authService = TestBed.inject(AuthService);

      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result).toBe(true);
    });

    it('should not redirect authenticated users', () => {
      const authServiceInternal = authService as any;
      authServiceInternal.currentUser = signal({ id: 1, username: 'test' }).asReadonly();
      authServiceInternal.isAuthenticated = computed(() => true);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceInternal },
          { provide: Router, useValue: router }
        ]
      });

      authService = TestBed.inject(AuthService);

      TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(router.createUrlTree).not.toHaveBeenCalled();
    });
  });

  describe('When user is not authenticated', () => {
    it('should prevent activation', () => {
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result).not.toBe(true);
      expect(result).toBeInstanceOf(Object); // UrlTree
    });

    it('should redirect to login page', () => {
      TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    });

    it('should return UrlTree for redirection', () => {
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result).toHaveProperty('toString');
    });
  });

  describe('State transitions', () => {
    it('should allow access after user logs in', () => {
      // Initial unauthenticated state
      let result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).not.toBe(true);

      // Simulate login
      const currentUserSignal = signal({ id: 1, username: 'test' });
      const authServiceInternal = {
        currentUser: currentUserSignal.asReadonly(),
        isAuthenticated: computed(() => currentUserSignal() !== null)
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceInternal },
          { provide: Router, useValue: router }
        ]
      });

      // Check authenticated state
      result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should deny access after user logs out', () => {
      // Initial authenticated state
      const currentUserSignal = signal<any>({ id: 1, username: 'test' });
      const authServiceInternal = {
        currentUser: currentUserSignal.asReadonly(),
        isAuthenticated: computed(() => currentUserSignal() !== null)
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceInternal },
          { provide: Router, useValue: router }
        ]
      });

      let result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(true);

      // Simulate logout
      currentUserSignal.set(null);

      result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).not.toBe(true);
    });
  });

  describe('Multiple guard evaluations', () => {
    it('should consistently allow authenticated users', () => {
      const authServiceInternal = authService as any;
      authServiceInternal.currentUser = signal({ id: 1, username: 'test' }).asReadonly();
      authServiceInternal.isAuthenticated = computed(() => true);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceInternal },
          { provide: Router, useValue: router }
        ]
      });

      for (let i = 0; i < 5; i++) {
        const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
        expect(result).toBe(true);
      }
    });

    it('should consistently redirect unauthenticated users', () => {
      for (let i = 0; i < 5; i++) {
        const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
        expect(result).not.toBe(true);
      }

      expect(router.createUrlTree).toHaveBeenCalledTimes(5);
    });
  });
});
