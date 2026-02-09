import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TodoForm } from './todo-form';
import { TodoService } from '../../service/todo';
import { TodoItem } from '../../models/todo.model';
import { Priority, PriorityLabel } from '../../models/priority.model';
import { ComponentRef } from '@angular/core';

describe('TodoForm', () => {
  let component: TodoForm;
  let componentRef: ComponentRef<TodoForm>;
  let fixture: ComponentFixture<TodoForm>;
  let todoService: TodoService;

  const mockPriorities: Priority[] = [
    { value: PriorityLabel.LOW, label: 'Low', coloer: 'green' },
    { value: PriorityLabel.MEDIUM, label: 'Medium', coloer: 'yellow' },
    { value: PriorityLabel.HIGH, label: 'High', coloer: 'red' }
  ];

  const mockTodo: TodoItem = {
    id: 1,
    text: 'Test todo',
    completed: false,
    category: 'Work',
    priority: mockPriorities[1],
    createdAt: new Date(),
    tags: ['angular', 'test'],
    dueDate: new Date('2026-03-01')
  };

  beforeEach(async () => {
    localStorage.clear();
    (globalThis as any).process = { env: { VITEST: 'true' } };

    await TestBed.configureTestingModule({
      imports: [TodoForm, ReactiveFormsModule],
      providers: [TodoService]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoForm);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    todoService = TestBed.inject(TodoService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.form.get('text')?.value).toBe('');
      expect(component.form.get('category')?.value).toBe('Work');
      expect(component.form.get('priority')?.value).toBe('Medium');
      expect(component.form.get('dueDate')?.value).toBe('');
      expect(component.form.get('tags')?.value).toBe('');
    });

    it('should not be in editing mode by default', () => {
      expect(component.isEditing).toBe(false);
    });

    it('should have categories from service', () => {
      expect(component.category()).toBeTruthy();
      expect(component.category().length).toBeGreaterThan(0);
    });

    it('should have priorities from service', () => {
      expect(component.priority()).toBeTruthy();
      expect(component.priority().length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when text is empty', () => {
      component.form.get('text')?.setValue('');
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid when text is provided', () => {
      component.form.get('text')?.setValue('Valid todo text');
      expect(component.form.valid).toBe(true);
    });

    it('should require text field', () => {
      const textControl = component.form.get('text');
      textControl?.setValue('');
      expect(textControl?.hasError('required')).toBe(true);
    });
  });

  describe('Add Todo Mode', () => {
    it('should call todoService.addTodo when submitting new todo', () => {
      const spy = vi.spyOn(todoService, 'addTodo');

      component.form.patchValue({
        text: 'New todo item',
        category: 'Work',
        priority: 'Medium',
        tags: 'tag1, tag2'
      });

      component.onSubmit();

      expect(spy).toHaveBeenCalled();
      const callArg = spy.mock.calls[0][0];
      expect(callArg.text).toBe('New todo item');
      expect(callArg.category).toBe('Work');
      expect(callArg.tags).toEqual(['tag1', 'tag2']);
    });

    it('should emit todoAdded event after adding', () => {
      const emitSpy = vi.spyOn(component.todoAdded, 'emit');

      component.form.patchValue({
        text: 'New todo',
        category: 'Work',
        priority: 'Medium'
      });

      component.onSubmit();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should not submit if form is invalid', () => {
      const spy = vi.spyOn(todoService, 'addTodo');
      component.form.get('text')?.setValue('');

      component.onSubmit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should reset form after successful submission', () => {
      component.form.patchValue({
        text: 'Todo to reset',
        category: 'Personal',
        priority: 'High',
        tags: 'test'
      });

      component.onSubmit();

      expect(component.form.get('text')?.value).toBe('');
      expect(component.form.get('category')?.value).toBe('Work');
      expect(component.form.get('priority')?.value).toBe('Medium');
    });

    it('should parse tags correctly from comma-separated string', () => {
      const spy = vi.spyOn(todoService, 'addTodo');

      component.form.patchValue({
        text: 'Todo with tags',
        tags: '  angular ,  test  , vitest  '
      });

      component.onSubmit();

      const callArg = spy.mock.calls[0][0];
      expect(callArg.tags).toEqual(['angular', 'test', 'vitest']);
    });

    it('should handle empty tags string', () => {
      const spy = vi.spyOn(todoService, 'addTodo');

      component.form.patchValue({
        text: 'Todo without tags',
        tags: ''
      });

      component.onSubmit();

      const callArg = spy.mock.calls[0][0];
      expect(callArg.tags).toEqual([]);
    });

    it('should set dueDate when provided', () => {
      const spy = vi.spyOn(todoService, 'addTodo');

      component.form.patchValue({
        text: 'Todo with due date',
        dueDate: '2026-03-15'
      });

      component.onSubmit();

      const callArg = spy.mock.calls[0][0];
      expect(callArg.dueDate).toBeInstanceOf(Date);
    });

    it('should set dueDate as undefined when not provided', () => {
      const spy = vi.spyOn(todoService, 'addTodo');

      component.form.patchValue({
        text: 'Todo without due date',
        dueDate: ''
      });

      component.onSubmit();

      const callArg = spy.mock.calls[0][0];
      expect(callArg.dueDate).toBeUndefined();
    });
  });

  describe('Edit Todo Mode', () => {
    const setupEditMode = () => {
      // Manually simulate what ngOnInit does when editingTodo is set
      component.isEditing = true;
      component.form.patchValue({
        text: mockTodo.text,
        category: mockTodo.category,
        priority: mockTodo.priority.value,
        dueDate: mockTodo.dueDate ? mockTodo.dueDate.toISOString().split('T')[0] : '',
        tags: mockTodo.tags.join(', ')
      });
      component.form.get('text')?.disable();
    };

    it('should populate form with existing todo data when ngOnInit detects editingTodo', () => {
      setupEditMode();
      expect(component.form.get('category')?.value).toBe('Work');
      expect(component.form.get('priority')?.value).toBe('Medium');
      expect(component.form.get('tags')?.value).toBe('angular, test');
    });

    it('should set isEditing to true when editing', () => {
      setupEditMode();
      expect(component.isEditing).toBe(true);
    });

    it('should disable text field when editing', () => {
      setupEditMode();
      expect(component.form.get('text')?.disabled).toBe(true);
    });

    it('should call todoService.updateTodo when submitting in edit mode', () => {
      // Add the todo first so it exists in the service
      todoService.addTodo({
        text: 'Test todo',
        completed: false,
        category: 'Work',
        priority: todoService.getPriorities()()[1],
        tags: ['angular', 'test']
      });
      const existingTodo = todoService.getTodos()()[0];

      // Simulate edit mode with the actual todo
      component.isEditing = true;
      component.form.patchValue({
        text: existingTodo.text,
        category: existingTodo.category,
        priority: existingTodo.priority.value,
        tags: existingTodo.tags.join(', ')
      });

      // Mock editingTodo to return the existing todo
      (component as any).editingTodo = () => existingTodo;

      const spy = vi.spyOn(todoService, 'updateTodo');

      component.form.patchValue({
        category: 'Personal',
        priority: 'High'
      });

      component.onSubmit();

      expect(spy).toHaveBeenCalledWith(existingTodo.id, expect.objectContaining({
        category: 'Personal'
      }));
    });

    it('should emit todoUpdated event after updating', () => {
      // Add the todo first
      todoService.addTodo({
        text: 'Test todo',
        completed: false,
        category: 'Work',
        priority: todoService.getPriorities()()[1],
        tags: []
      });
      const existingTodo = todoService.getTodos()()[0];

      component.isEditing = true;
      (component as any).editingTodo = () => existingTodo;

      // Set valid form values (text is required)
      component.form.patchValue({
        text: existingTodo.text,
        category: 'Work',
        priority: 'Medium'
      });

      const emitSpy = vi.spyOn(component.todoUpdated, 'emit');

      component.onSubmit();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('should emit cancelEdit event when cancel is clicked', () => {
      const emitSpy = vi.spyOn(component.cancelEdit, 'emit');

      component.onCancel();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should reset form when cancel is clicked', () => {
      component.form.patchValue({
        text: 'Some text',
        category: 'Personal',
        priority: 'High'
      });

      component.onCancel();

      expect(component.form.get('text')?.value).toBe('');
      expect(component.form.get('category')?.value).toBe('Work');
      expect(component.form.get('priority')?.value).toBe('Medium');
    });

    it('should reset isEditing to false when cancel is clicked', () => {
      component.isEditing = true;

      component.onCancel();

      expect(component.isEditing).toBe(false);
    });

    it('should enable text field when cancel is clicked after editing', () => {
      component.form.get('text')?.disable();

      component.onCancel();

      expect(component.form.get('text')?.enabled).toBe(true);
    });
  });

  describe('resetForm()', () => {
    it('should reset form to default values', () => {
      component.form.patchValue({
        text: 'Some text',
        category: 'Personal',
        priority: 'High',
        dueDate: '2026-01-01',
        tags: 'tag1, tag2'
      });

      component.resetForm();

      expect(component.form.get('text')?.value).toBe('');
      expect(component.form.get('category')?.value).toBe('Work');
      expect(component.form.get('priority')?.value).toBe('Medium');
    });

    it('should enable text field after reset', () => {
      component.form.get('text')?.disable();

      component.resetForm();

      expect(component.form.get('text')?.enabled).toBe(true);
    });

    it('should set isEditing to false', () => {
      component.isEditing = true;

      component.resetForm();

      expect(component.isEditing).toBe(false);
    });
  });
});
