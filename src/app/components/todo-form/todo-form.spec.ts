import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TodoForm } from './todo-form';
import { TodoService } from '../../service/todo';
import { TodoItem } from '../../models/todo.model';
import { Priority, PriorityLabel } from '../../models/priority.model';

describe('TodoForm', () => {
  let component: TodoForm;
  let fixture: ComponentFixture<TodoForm>;
  let todoService: TodoService;

  const createMockTodo = (): TodoItem => ({
    id: 1,
    text: 'Test todo',
    completed: false,
    category: 'Work',
    priority: { value: PriorityLabel.MEDIUM, label: 'Medium', coloer: 'yellow' },
    createdAt: new Date(),
    tags: ['angular', 'test'],
    dueDate: new Date('2026-03-01')
  });

  beforeEach(async () => {
    localStorage.clear();
    (globalThis as any).process = { env: { VITEST: 'true' } };

    await TestBed.configureTestingModule({
      imports: [TodoForm, ReactiveFormsModule],
      providers: [TodoService]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoForm);
    component = fixture.componentInstance;
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
    const applyEditState = (todo: TodoItem) => {
      component.isEditing = true;
      (component as { editingTodo: () => TodoItem | null }).editingTodo = () => todo;
      component.form.patchValue({
        text: todo.text,
        category: todo.category,
        priority: todo.priority.value,
        dueDate: todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '',
        tags: todo.tags.join(', ')
      });
      component.form.get('text')?.disable();
    };

    it('should call todoService.updateTodo when submitting in edit mode', () => {
      const existingTodo = createMockTodo();
      applyEditState(existingTodo);

      const spy = vi.spyOn(todoService, 'updateTodo');

      component.form.patchValue({
        category: 'Personal',
        priority: 'High',
        tags: 'alpha, beta'
      });

      component.onSubmit();

      expect(spy).toHaveBeenCalledWith(existingTodo.id, expect.objectContaining({
        category: 'Personal',
        tags: ['alpha', 'beta']
      }));
    });

    it('should emit todoUpdated event after updating', () => {
      const existingTodo = createMockTodo();
      applyEditState(existingTodo);

      component.form.patchValue({
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
