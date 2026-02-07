import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoComponent } from './todo';
import { TodoService } from '../../service/todo';
import { FormsModule } from '@angular/forms';
import { TodoItem } from '../../models/todo.model';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TodoComponent', () => {
  let component: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;
  let todoService: TodoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoComponent, FormsModule],
      providers: [TodoService]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService);
    localStorage.clear();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should load todos from service', async () => {
      todoService.addTodo('Test todo');

      component.ngOnInit();

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(component.todos.length).toBe(1);
      expect(component.todos[0].text).toBe('Test todo');
    });

    it('should subscribe to todos observable', async () => {
      const mockTodos: TodoItem[] = [
        { id: 1, text: 'Test 1', completed: false }
      ];

      vi.spyOn(todoService, 'getTodos').mockReturnValue({
        subscribe: (callback: (todos: TodoItem[]) => void) => {
          callback(mockTodos);
          return { unsubscribe: () => {} } as any;
        }
      } as any);

      component.ngOnInit();

      expect(component.todos).toEqual(mockTodos);
    });
  });

  describe('addTodo()', () => {
    it('should add a new todo when text is provided', () => {
      component.newTodoText = 'New test todo';
      const spy = vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(spy).toHaveBeenCalledWith('New test todo');
      expect(component.newTodoText).toBe('');
    });

    it('should not add todo if text is empty', () => {
      component.newTodoText = '';
      const spy = vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not add todo if text is only whitespace', () => {
      component.newTodoText = '   ';
      const spy = vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should clear input field after adding todo', () => {
      component.newTodoText = 'Todo to add';
      vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(component.newTodoText).toBe('');
    });

    it('should preserve whitespace at beginning and end if text has content', () => {
      component.newTodoText = '  Todo with spaces  ';
      const spy = vi.spyOn(todoService, 'addTodo');

      component.addTodo();

      expect(spy).toHaveBeenCalledWith('  Todo with spaces  ');
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

  describe('activeTodosCount', () => {
    it('should return count of incomplete todos', () => {
      component.todos = [
        { id: 1, text: 'Active 1', completed: false },
        { id: 2, text: 'Completed', completed: true },
        { id: 3, text: 'Active 2', completed: false }
      ];

      expect(component.activeTodosCount).toBe(2);
    });

    it('should return 0 when all todos are completed', () => {
      component.todos = [
        { id: 1, text: 'Completed 1', completed: true },
        { id: 2, text: 'Completed 2', completed: true }
      ];

      expect(component.activeTodosCount).toBe(0);
    });

    it('should return correct count when no todos exist', () => {
      component.todos = [];

      expect(component.activeTodosCount).toBe(0);
    });

    it('should return total count when no todos are completed', () => {
      component.todos = [
        { id: 1, text: 'Active 1', completed: false },
        { id: 2, text: 'Active 2', completed: false },
        { id: 3, text: 'Active 3', completed: false }
      ];

      expect(component.activeTodosCount).toBe(3);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from todos subscription', () => {
      const spy = vi.spyOn(component.subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Component Integration', () => {
    it('should handle complete workflow: add, toggle, and delete todos', async () => {
      component.ngOnInit();
      await new Promise(resolve => setTimeout(resolve, 20));

      // Add first todo
      component.newTodoText = 'First todo';
      component.addTodo();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(component.todos.length).toBe(1);
      const firstTodoId = component.todos[0].id;

      // Toggle the todo
      component.toggleTodo(firstTodoId);
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(component.todos[0].completed).toBe(true);

      // Add second todo
      component.newTodoText = 'Second todo';
      component.addTodo();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(component.todos.length).toBe(2);
      expect(component.activeTodosCount).toBe(1);

      // Delete first todo
      component.deleteTodo(firstTodoId);
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(component.todos.length).toBe(1);
      expect(component.todos[0].text).toBe('Second todo');
    });

    it('should update active todos count when todos change', async () => {
      component.ngOnInit();
      await new Promise(resolve => setTimeout(resolve, 20));

      component.newTodoText = 'Todo 1';
      component.addTodo();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(component.activeTodosCount).toBe(1);

      component.newTodoText = 'Todo 2';
      component.addTodo();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(component.activeTodosCount).toBe(2);

      const firstTodoId = component.todos[0].id;
      component.toggleTodo(firstTodoId);
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(component.activeTodosCount).toBe(1);
    });
  });
});
