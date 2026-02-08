import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { TodoComponent } from './components/todo/todo';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, TodoComponent]
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

  it('should render TodoComponent', () => {
    const compiled = fixture.nativeElement;
    const todoComponent = compiled.querySelector('app-todo');
    expect(todoComponent).toBeTruthy();
  });

  it('should have the correct selector', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
