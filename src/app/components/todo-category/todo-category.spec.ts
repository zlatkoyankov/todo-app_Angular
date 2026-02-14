import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, computed } from '@angular/core';
import { TodoCategory } from './todo-category';
import { TodoService } from '../../service/todo';
import { AuthService } from '../../service/auth';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { By } from '@angular/platform-browser';

describe('TodoCategory', () => {
  let fixture: ComponentFixture<TodoCategory>;
  let component: TodoCategory;
  let todoService: TodoService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // deterministic test environment
    localStorage.clear();
    (globalThis as any).process = { env: { VITEST: 'true' } };

    const currentUserSignal = signal<any>(null);
    const authServiceMock = {
      currentUser: currentUserSignal.asReadonly(),
      isAuthenticated: computed(() => currentUserSignal() !== null)
    };

    await TestBed.configureTestingModule({
      imports: [TodoCategory],
      providers: [
        TodoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoCategory);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render category buttons including "All"', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    // One extra for the "All" button
    expect(buttons.length).toBe(todoService.getCategories()().length + 1);
  });

  it('should mark "All" as pressed when no selected categories', () => {
    component.selectedCategory = (() => []) as any;
    fixture.detectChanges();

    const allButton = fixture.debugElement.query(By.css('div > button'))?.nativeElement as HTMLButtonElement;
    expect(allButton).toBeTruthy();
    expect(allButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('should report category selected via isCategorySelected()', () => {
    const categories = todoService.getCategories()();
    const firstName = categories[0].name;
    component.selectedCategory = (() => [firstName]) as any;
    expect(component.isCategorySelected(firstName)).toBe(true);
  });

  it('should emit the category name when a category button is clicked', () => {
    const categories = todoService.getCategories()();
    const target = categories[0].name;
    const emitSpy = vi.spyOn(component.categorySelected, 'emit');

    // find button with the category text
    const btnDebug = fixture.debugElement.queryAll(By.css('button')).find(d => d.nativeElement.textContent.trim() === target);
    expect(btnDebug).toBeTruthy();

    btnDebug!.triggerEventHandler('click', null);
    expect(emitSpy).toHaveBeenCalledWith(target);
  });
});
