import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { signal, computed } from '@angular/core';
import { HeaderComponent } from './header';
import { AuthService } from '../../service/auth';
import { User } from '../../models/user.model';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { of, Subject } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: AuthService;
  let router: Router;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    name: 'Test User'
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

  beforeEach(async () => {
    const currentUserSignal = signal<User | null>(null);
    const authServiceMock = {
      currentUser: currentUserSignal.asReadonly(),
      isAuthenticated: computed(() => currentUserSignal() !== null),
      logout: vi.fn()
    };

    const routerMock = {
      navigate: vi.fn(),
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn(),
      events: new Subject(),
      routerState: { root: {} }
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should expose currentUser from AuthService', () => {
      expect(component['currentUser']).toBeDefined();
      expect(component['currentUser']()).toBeNull();
    });

    it('should expose isAuthenticated from AuthService', () => {
      expect(component['isAuthenticated']).toBeDefined();
      expect(component['isAuthenticated']()).toBe(false);
    });
  });

  describe('Authentication State', () => {
    it('should reflect unauthenticated state', () => {
      expect(component['isAuthenticated']()).toBe(false);
      expect(component['currentUser']()).toBeNull();
    });

    it('should reflect authenticated state', () => {
      // Update the signal through the mock service
      const authServiceInternal = authService as any;
      authServiceInternal.currentUser = signal(mockUser).asReadonly();
      authServiceInternal.isAuthenticated = computed(() => true);

      // Recreate component to pick up new values
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HeaderComponent],
        providers: [
          { provide: AuthService, useValue: authServiceInternal },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRouteMock }
        ]
      });

      fixture = TestBed.createComponent(HeaderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['isAuthenticated']()).toBe(true);
    });
  });

  describe('onLogout()', () => {
    it('should call authService.logout', async () => {
      vi.mocked(authService.logout).mockResolvedValue();

      await component['onLogout']();

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should wait for logout to complete', async () => {
      let logoutCompleted = false;
      vi.mocked(authService.logout).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        logoutCompleted = true;
      });

      await component['onLogout']();

      expect(logoutCompleted).toBe(true);
    });

    it('should handle multiple logout calls', async () => {
      vi.mocked(authService.logout).mockResolvedValue();

      await component['onLogout']();
      await component['onLogout']();
      await component['onLogout']();

      expect(authService.logout).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration with AuthService', () => {
    it('should use the same AuthService instance', () => {
      expect(component['authService']).toBe(authService);
    });

    it('should reflect changes in auth state', () => {
      const currentUserSignal = signal<User | null>(null);
      const mockAuthService = {
        currentUser: currentUserSignal.asReadonly(),
        isAuthenticated: computed(() => currentUserSignal() !== null),
        logout: vi.fn()
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HeaderComponent],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRouteMock }
        ]
      });

      fixture = TestBed.createComponent(HeaderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['isAuthenticated']()).toBe(false);

      // Simulate login
      currentUserSignal.set(mockUser);
      fixture.detectChanges();

      expect(component['isAuthenticated']()).toBe(true);
      expect(component['currentUser']()?.username).toBe('testuser');

      // Simulate logout
      currentUserSignal.set(null);
      fixture.detectChanges();

      expect(component['isAuthenticated']()).toBe(false);
      expect(component['currentUser']()).toBeNull();
    });
  });
});
