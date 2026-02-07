import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo';
import { TodoItem } from '../models/todo.model';
import { firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    // Clear localStorage before each test to ensure isolation
    localStorage.clear();
    // Reset TestBed to ensure service is freshly created
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTodos()', () => {
    it('should return an observable of todos', async () => {
      const result = service.getTodos();
      expect(result).toBeTruthy();
      const todos = await firstValueFrom(result);
      expect(Array.isArray(todos)).toBe(true);
    });

    it('should return empty array when no todos exist', async () => {
      localStorage.clear();
      // recreate the service so it reads from localStorage again
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(TodoService);
      const todos = await firstValueFrom(newService.getTodos());
      expect(todos.length).toBe(0);
    });

    it('should load todos from localStorage on initialization', async () => {
      const mockTodos: TodoItem[] = [
        { id: 1, text: 'Test todo 1', completed: false },
        { id: 2, text: 'Test todo 2', completed: true }
      ];
      localStorage.setItem('todos', JSON.stringify(mockTodos));

      // recreate the service after setting localStorage so constructor loads the stored todos
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(TodoService);
      const todos = await firstValueFrom(newService.getTodos());
      expect(todos).toEqual(mockTodos);
    });
  });

  describe('addTodo()', () => {
    it('should add a new todo', async () => {
      service.addTodo('New test todo');

      const todos = await firstValueFrom(service.getTodos());
      expect(todos.length).toBe(1);
      expect(todos[0].text).toBe('New test todo');
      expect(todos[0].completed).toBe(false);
      expect(typeof todos[0].id).toBe('number');
    });

    it('should assign unique id to each todo', async () => {
      service.addTodo('Todo 1');
      service.addTodo('Todo 2');

      const todos = await firstValueFrom(service.getTodos());
      expect(todos[0].id).not.toBe(todos[1].id);
    });

    it('should persist todos to localStorage', async () => {
      service.addTodo('Persistent todo');

      await firstValueFrom(service.getTodos());
      const storedTodos = localStorage.getItem('todos');
      expect(storedTodos).toBeTruthy();
      if (storedTodos) {
        const parsed = JSON.parse(storedTodos);
        expect(parsed[0].text).toBe('Persistent todo');
      }
    });
  });

  describe('toggleTodo()', () => {
    it('should toggle completed status of a todo', async () => {
      service.addTodo('Toggle me');

      let todoId: number;
      const initial = await firstValueFrom(service.getTodos());
      todoId = initial[0].id;
      expect(initial[0].completed).toBe(false);
      service.toggleTodo(todoId);

      const after = await firstValueFrom(service.getTodos());
      expect(after[0].completed).toBe(true);
    });

    it('should toggle back to false when toggled again', async () => {
      service.addTodo('Toggle twice');

      const initial = await firstValueFrom(service.getTodos());
      const todoId = initial[0].id;
      service.toggleTodo(todoId);
      service.toggleTodo(todoId);

      const after = await firstValueFrom(service.getTodos());
      expect(after[0].completed).toBe(false);
    });

    it('should do nothing for non-existent todo id', async () => {
      service.addTodo('Test todo');

      service.toggleTodo(99999);
      const todos = await firstValueFrom(service.getTodos());
      expect(todos.length).toBe(1);
      expect(todos[0].completed).toBe(false);
    });

    it('should persist toggle state to localStorage', async () => {
      service.addTodo('Persist toggle');

      const initial = await firstValueFrom(service.getTodos());
      const todoId = initial[0].id;
      service.toggleTodo(todoId);

      const after = await firstValueFrom(service.getTodos());
      const storedTodos = localStorage.getItem('todos');
      if (storedTodos) {
        const parsed = JSON.parse(storedTodos);
        expect(parsed[0].completed).toBe(true);
      }
    });
  });

  describe('deleteTodo()', () => {
    it('should delete a todo by id', async () => {
      service.addTodo('Delete me');

      const initial = await firstValueFrom(service.getTodos());
      const todoId = initial[0].id;
      service.deleteTodo(todoId);
      const todos = await firstValueFrom(service.getTodos());
      expect(todos.length).toBe(0);
    });

    it('should not affect other todos when deleting', async () => {
      service.addTodo('Keep me 1');
      service.addTodo('Delete me');
      service.addTodo('Keep me 2');

      const current = await firstValueFrom(service.getTodos());
      const todoIdToDelete = current[1].id;
      service.deleteTodo(todoIdToDelete);
      const todos = await firstValueFrom(service.getTodos());
      expect(todos.length).toBe(2);
      expect(todos.map(t => t.text)).not.toContain('Delete me');
    });

    it('should do nothing for non-existent todo id', async () => {
      service.addTodo('Test todo');

      service.deleteTodo(99999);

      const todos = await firstValueFrom(service.getTodos());
      expect(todos.length).toBe(1);
    });

    it('should persist deletion to localStorage', async () => {
      service.addTodo('Delete and persist');

      const initial = await firstValueFrom(service.getTodos());
      const todoId = initial[0].id;
      service.deleteTodo(todoId);
      const storedTodos = localStorage.getItem('todos');
      expect(storedTodos).toBe('[]');
    });
  });

  describe('clearCompleted()', () => {
    it('should remove all completed todos', async () => {
      service.addTodo('Completed 1');
      service.addTodo('Active');
      service.addTodo('Completed 2');

      const current = await firstValueFrom(service.getTodos());
      const completed1Id = current[0].id;
      const completed2Id = current[2].id;
      service.toggleTodo(completed1Id);
      service.toggleTodo(completed2Id);
      service.clearCompleted();
      const finalTodos = await firstValueFrom(service.getTodos());
      expect(finalTodos.length).toBe(1);
      expect(finalTodos[0].text).toBe('Active');
    });

    it('should not affect active todos', async () => {
      service.addTodo('Active 1');
      service.addTodo('Active 2');

      service.clearCompleted();
      const todos = await firstValueFrom(service.getTodos());
      expect(todos.length).toBe(2);
    });

    it('should do nothing when there are no completed todos', async () => {
      service.addTodo('Not completed');

      const initialLength = 1;
      service.clearCompleted();
      const todos = await firstValueFrom(service.getTodos());
      expect(todos.length).toBe(initialLength);
    });

    it('should persist cleared state to localStorage', async () => {
      service.addTodo('Will be cleared');

      const current = await firstValueFrom(service.getTodos());
      const todoId = current[0].id;
      service.toggleTodo(todoId);
      service.clearCompleted();
      const storedTodos = localStorage.getItem('todos');
      expect(storedTodos).toBe('[]');
    });
  });
});
