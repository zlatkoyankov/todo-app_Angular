import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { HeaderComponent } from './components/header/header';
import { AuthService } from './service/auth';
import { signal, computed } from '@angular/core';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    (globalThis as any).process = { env: { VITEST: 'true' } };

    const currentUserSignal = signal<any>(null);
    const authServiceMock = {
      currentUser: currentUserSignal.asReadonly(),
      isAuthenticated: computed(() => currentUserSignal() !== null),
      logout: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App, HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    localStorage.clear();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should render HeaderComponent', () => {
    const compiled = fixture.nativeElement;
    const headerComponent = compiled.querySelector('app-header');
    expect(headerComponent).toBeTruthy();
  });

  it('should render RouterOutlet for navigation', () => {
    const compiled = fixture.nativeElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should have the correct structure with header and outlet', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('app-header');
    const outlet = compiled.querySelector('router-outlet');
    
    expect(header).toBeTruthy();
    expect(outlet).toBeTruthy();
  });
});
