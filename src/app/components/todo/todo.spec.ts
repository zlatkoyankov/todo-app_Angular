import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoComponent } from './todo';
import { TodoService } from '../../service/todo';
import { FormsModule } from '@angular/forms';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TodoComponent', () => {
  let component: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;
  let todoService: TodoService;
  const make = (text: string) => ({ text, completed: false, category: 'Work', priority: todoService.getPriorities()()[1] || todoService.getPriorities()()[0], tags: [] });

  beforeEach(async () => {
    // Ensure a clean test environment before services are instantiated
    localStorage.clear();
    (globalThis as any).process = { env: { VITEST: 'true' } };

    await TestBed.configureTestingModule({
      imports: [TodoComponent, FormsModule],
      providers: [TodoService]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoComponent);
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
    it('should initialize with empty todos signal', () => {
      expect(component.todos()).toEqual([]);
    });

    it('should initialize with empty newTodoText signal', () => {
      expect(component.newTodoText()).toBe('');
    });

    it('should have active todos count computed signal', () => {
      expect(component.activeTodosCount()).toBe(0);
    });
  });

  describe('addTodo()', () => {
    it('should add a new todo when text is provided', () => {
      component.newTodoText.set('New test todo');
      const spy = vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(spy).toHaveBeenCalled();
      const arg0 = spy.mock.calls[0][0];
      expect(arg0.text).toBe('New test todo');
      expect(component.newTodoText()).toBe('');
    });

    it('should not add todo if text is empty', () => {
      component.newTodoText.set('');
      const spy = vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not add todo if text is only whitespace', () => {
      component.newTodoText.set('   ');
      const spy = vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should clear input field after adding todo', () => {
      component.newTodoText.set('Todo to add');
      vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(component.newTodoText()).toBe('');
    });

    it('should trim whitespace before adding todo', () => {
      component.newTodoText.set('  Todo with spaces  ');
      const spy = vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(spy).toHaveBeenCalled();
      const arg1 = spy.mock.calls[0][0];
      expect(arg1.text).toBe('Todo with spaces');
    });
  });

  describe('toggleTodo()', () => {
    it('should call todoService toggleTodo method', () => {
      const spy = vi.spyOn(todoService, 'toggleTodo');

      component.toggleTodo(123);

      expect(spy).toHaveBeenCalledWith(123);
    });

    it('should toggle with correct todo id', () => {
      const todoIds = [1, 2, 3];
      const spy = vi.spyOn(todoService, 'toggleTodo');

      todoIds.forEach(id => {
        component.toggleTodo(id);
      });

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenCalledWith(1);
      expect(spy).toHaveBeenCalledWith(2);
      expect(spy).toHaveBeenCalledWith(3);
    });
  });

  describe('deleteTodo()', () => {
    it('should call todoService deleteTodo method', () => {
      const spy = vi.spyOn(todoService, 'deleteTodo');

      component.deleteTodo(456);

      expect(spy).toHaveBeenCalledWith(456);
    });

    it('should delete with correct todo id', () => {
      const todoIds = [1, 2, 3];
      const spy = vi.spyOn(todoService, 'deleteTodo');

      todoIds.forEach(id => {
        component.deleteTodo(id);
      });

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenCalledWith(1);
      expect(spy).toHaveBeenCalledWith(2);
      expect(spy).toHaveBeenCalledWith(3);
    });
  });

  describe('clearCompleted()', () => {
    it('should call todoService clearCompleted method', () => {
      const spy = vi.spyOn(todoService, 'clearCompleted');

      component.clearCompleted();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('activeTodosCount (computed signal)', () => {
    it('should return 0 for empty todos', () => {
      expect(component.activeTodosCount()).toBe(0);
    });

    it('should count only incomplete todos', () => {
      todoService.addTodo(make('Active todo 1'));
      todoService.addTodo(make('Completed todo'));
      todoService.addTodo(make('Active todo 2'));

      const todos = component.todos();
      if (todos.length >= 2) {
        todoService.toggleTodo(todos[1].id);
      }

      expect(component.activeTodosCount()).toBe(2);
    });

    it('should return 0 when all todos are completed', () => {
      todoService.addTodo(make('Todo 1'));
      todoService.addTodo(make('Todo 2'));

      const todos = component.todos();
      todos.forEach(todo => {
        todoService.toggleTodo(todo.id);
      });

      expect(component.activeTodosCount()).toBe(0);
    });

    it('should update when todos are added', () => {
      expect(component.activeTodosCount()).toBe(0);

      todoService.addTodo(make('Todo 1'));
      expect(component.activeTodosCount()).toBe(1);

      todoService.addTodo(make('Todo 2'));
      expect(component.activeTodosCount()).toBe(2);
    });

    it('should update when todos are toggled', () => {
      todoService.addTodo(make('Todo 1'));
      todoService.addTodo(make('Todo 2'));

      expect(component.activeTodosCount()).toBe(2);

      const todos = component.todos();
      todoService.toggleTodo(todos[0].id);

      expect(component.activeTodosCount()).toBe(1);
    });

    it('should update when todos are deleted', () => {
      todoService.addTodo(make('Todo 1'));
      todoService.addTodo(make('Todo 2'));

      expect(component.activeTodosCount()).toBe(2);

      const todos = component.todos();
      todoService.deleteTodo(todos[0].id);

      expect(component.activeTodosCount()).toBe(1);
    });
  });

  describe('Component Integration', () => {
    it('should handle complete workflow: add, toggle, and delete todos', () => {
      component.newTodoText.set('First todo');
      component.addTodo();

      expect(component.todos().length).toBe(1);
      expect(component.activeTodosCount()).toBe(1);
      const firstTodoId = component.todos()[0].id;

      component.toggleTodo(firstTodoId);
      expect(component.todos()[0].completed).toBe(true);
      expect(component.activeTodosCount()).toBe(0);

      component.newTodoText.set('Second todo');
      component.addTodo();

      expect(component.todos().length).toBe(2);
      expect(component.activeTodosCount()).toBe(1);

      component.deleteTodo(firstTodoId);
      expect(component.todos().length).toBe(1);
      expect(component.todos()[0].text).toBe('Second todo');
      expect(component.activeTodosCount()).toBe(1);
    });

    it('should sync with service state changes', () => {
      component.newTodoText.set('Todo A');
      component.addTodo();

      expect(component.todos().length).toBe(1);
      expect(component.todos()[0].text).toBe('Todo A');

      const todoId = component.todos()[0].id;
      component.toggleTodo(todoId);

      expect(component.todos()[0].completed).toBe(true);

      component.clearCompleted();
      expect(component.todos().length).toBe(0);
    });

    it('should persist todos to localStorage', () => {
      component.newTodoText.set('Persistent todo');
      component.addTodo();

      const stored = localStorage.getItem('todos');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed[0].text).toBe('Persistent todo');
      }
    });
  });
});
