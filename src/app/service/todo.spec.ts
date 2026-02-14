import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TodoService } from './todo';
import { AuthService } from './auth';
import { TodoItem } from '../models/todo.model';
import { signal, computed } from '@angular/core';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  const make = (text: string) => ({ text, completed: false, category: 'Work', priority: service.getPriorities()()[1] || service.getPriorities()()[0], tags: [] });

  beforeEach(() => {
    // Clear localStorage before each test to ensure isolation
    localStorage.clear();
    
    // Create mock auth service
    const currentUserSignal = signal<any>(null);
    const authServiceMock = {
      currentUser: currentUserSignal.asReadonly(),
      isAuthenticated: computed(() => currentUserSignal() !== null)
    };

    // Reset TestBed to ensure service is freshly created
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        TodoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
    
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTodos()', () => {
    it('should return a signal of todos', () => {
      const result = service.getTodos();
      expect(result).toBeTruthy();
      expect(typeof result()).toBe('object');
      expect(Array.isArray(result())).toBe(true);
    });

    it('should return empty array when no todos exist', () => {
      localStorage.clear();
      TestBed.resetTestingModule();
      
      const currentUserSignal = signal<any>(null);
      const authServiceMock = {
        currentUser: currentUserSignal.asReadonly(),
        isAuthenticated: computed(() => false)
      };
      
      TestBed.configureTestingModule({
        providers: [
          TodoService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: AuthService, useValue: authServiceMock }
        ]
      });
      const newService = TestBed.inject(TodoService);
      const todos = newService.getTodos();
      expect(todos().length).toBe(0);
    });

    it('should load todos from localStorage on initialization', async () => {
      const mockTodos: TodoItem[] = [
        { id: 1, text: 'Test todo 1', completed: false, category: 'Work', priority: { value: ("Medium" as any), label: 'Medium', color: '' }, createdAt: new Date(), tags: [] },
        { id: 2, text: 'Test todo 2', completed: true, category: 'Work', priority: { value: ("Medium" as any), label: 'Medium', color: '' }, createdAt: new Date(), tags: [] }
      ];
      localStorage.setItem('todos_guest', JSON.stringify(mockTodos));

      TestBed.resetTestingModule();
      
      const currentUserSignal = signal<any>(null);
      const authServiceMock = {
        currentUser: currentUserSignal.asReadonly(),
        isAuthenticated: computed(() => false)
      };
      
      TestBed.configureTestingModule({
        providers: [
          TodoService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: AuthService, useValue: authServiceMock }
        ]
      });
      const newService = TestBed.inject(TodoService);
      newService.reloadTodos();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      const todos = newService.getTodos();
      expect(todos().length).toBe(2);
    });
  });

  describe('addTodo()', () => {
    it('should add a new todo', () => {
      service.addTodo(make('New test todo'));

      const todos = service.getTodos();
      expect(todos().length).toBe(1);
      expect(todos()[0].text).toBe('New test todo');
      expect(todos()[0].completed).toBe(false);
      expect(typeof todos()[0].id).toBe('number');
    });

    it('should assign unique id to each todo', () => {
      service.addTodo(make('Todo 1'));
      service.addTodo(make('Todo 2'));

      const todos = service.getTodos();
      expect(todos()[0].id).not.toBe(todos()[1].id);
    });

    it('should persist todos to localStorage', () => {
      service.addTodo(make('Persistent todo'));

      const storedTodos = localStorage.getItem('todos_guest');
      expect(storedTodos).toBeTruthy();
      if (storedTodos) {
        const parsed = JSON.parse(storedTodos);
        expect(parsed[0].text).toBe('Persistent todo');
      }
    });
  });

  describe('toggleTodo()', () => {
    it('should toggle completed status of a todo', () => {
      service.addTodo(make('Toggle me'));

      const initial = service.getTodos();
      const todoId = initial()[0].id;
      expect(initial()[0].completed).toBe(false);
      service.toggleTodo(todoId);

      const after = service.getTodos();
      expect(after()[0].completed).toBe(true);
    });

    it('should toggle back to false when toggled again', () => {
      service.addTodo(make('Toggle twice'));

      const initial = service.getTodos();
      const todoId = initial()[0].id;
      service.toggleTodo(todoId);
      service.toggleTodo(todoId);

      const after = service.getTodos();
      expect(after()[0].completed).toBe(false);
    });

    it('should do nothing for non-existent todo id', () => {
      service.addTodo(make('Test todo'));

      service.toggleTodo(99999);
      const todos = service.getTodos();
      expect(todos().length).toBe(1);
      expect(todos()[0].completed).toBe(false);
    });

    it('should persist toggle state to localStorage', () => {
      service.addTodo(make('Persist toggle'));

      const initial = service.getTodos();
      const todoId = initial()[0].id;
      service.toggleTodo(todoId);

      const after = service.getTodos();
      const storedTodos = localStorage.getItem('todos_guest');
      if (storedTodos) {
        const parsed = JSON.parse(storedTodos);
        expect(parsed[0].completed).toBe(true);
      }
    });
  });

  describe('deleteTodo()', () => {
    it('should delete a todo by id', () => {
      service.addTodo(make('Delete me'));

      const initial = service.getTodos();
      const todoId = initial()[0].id;
      service.deleteTodo(todoId);
      const todos = service.getTodos();
      expect(todos().length).toBe(0);
    });

    it('should not affect other todos when deleting', () => {
      service.addTodo(make('Keep me 1'));
      service.addTodo(make('Delete me'));
      service.addTodo(make('Keep me 2'));

      const current = service.getTodos();
      const todoIdToDelete = current()[1].id;
      service.deleteTodo(todoIdToDelete);
      const todos = service.getTodos();
      expect(todos().length).toBe(2);
      expect(todos().map(t => t.text)).not.toContain('Delete me');
    });

    it('should do nothing for non-existent todo id', () => {
      service.addTodo(make('Test todo'));

      service.deleteTodo(99999);

      const todos = service.getTodos();
      expect(todos().length).toBe(1);
    });

    it('should persist deletion to localStorage', () => {
      service.addTodo(make('Delete and persist'));

      const initial = service.getTodos();
      const todoId = initial()[0].id;
      service.deleteTodo(todoId);
      const storedTodos = localStorage.getItem('todos_guest');
      expect(storedTodos).toBe('[]');
    });
  });

  describe('clearCompleted()', () => {
    it('should remove all completed todos', () => {
      service.addTodo(make('Completed 1'));
      service.addTodo(make('Active'));
      service.addTodo(make('Completed 2'));

      const current = service.getTodos();
      const completed1Id = current()[0].id;
      const completed2Id = current()[2].id;
      service.toggleTodo(completed1Id);
      service.toggleTodo(completed2Id);
      service.clearCompleted();
      const finalTodos = service.getTodos();
      expect(finalTodos().length).toBe(1);
      expect(finalTodos()[0].text).toBe('Active');
    });

    it('should not affect active todos', () => {
      service.addTodo(make('Active 1'));
      service.addTodo(make('Active 2'));

      service.clearCompleted();
      const todos = service.getTodos();
      expect(todos().length).toBe(2);
    });

    it('should do nothing when there are no completed todos', () => {
      service.addTodo(make('Not completed'));

      const initialLength = 1;
      service.clearCompleted();
      const todos = service.getTodos();
      expect(todos().length).toBe(initialLength);
    });

    it('should persist cleared state to localStorage', () => {
      service.addTodo(make('Will be cleared'));

      const current = service.getTodos();
      const todoId = current()[0].id;
      service.toggleTodo(todoId);
      service.clearCompleted();
      const storedTodos = localStorage.getItem('todos_guest');
      expect(storedTodos).toBe('[]');
    });
  });

  describe('Dual-mode operation (Guest vs Authenticated)', () => {
    describe('Guest mode (unauthenticated)', () => {
      it('should use localStorage for guest users', () => {
        service.addTodo(make('Guest todo'));
        
        const storedTodos = localStorage.getItem('todos_guest');
        expect(storedTodos).toBeTruthy();
        if (storedTodos) {
          const parsed = JSON.parse(storedTodos);
          expect(parsed[0].text).toBe('Guest todo');
        }
      });

      it('should load todos from todos_guest key', () => {
        const mockTodo = {
          id: 1,
          text: 'Guest todo',
          completed: false,
          category: 'Work',
          priority: { value: 'Medium', label: 'Medium', color: '' },
          createdAt: new Date().toISOString(),
          tags: []
        };
        localStorage.setItem('todos_guest', JSON.stringify([mockTodo]));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            TodoService,
            provideHttpClient(),
            provideHttpClientTesting(),
            { provide: AuthService, useValue: { isAuthenticated: () => false } }
          ]
        });
        const newService = TestBed.inject(TodoService);
        newService.reloadTodos();

        setTimeout(() => {
          const todos = newService.getTodos();
          expect(todos().length).toBe(1);
          expect(todos()[0].text).toBe('Guest todo');
        }, 10);
      });
    });

    describe('Authenticated mode', () => {
      beforeEach(() => {
        // Set up authenticated state
        const currentUserSignal = signal({ id: 1, username: 'testuser' });
        const authServiceMock = {
          currentUser: currentUserSignal.asReadonly(),
          isAuthenticated: computed(() => true)
        };

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            TodoService,
            provideHttpClient(),
            provideHttpClientTesting(),
            { provide: AuthService, useValue: authServiceMock }
          ]
        });
        
        service = TestBed.inject(TodoService);
        httpMock = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(AuthService);
      });

      it('should fetch todos from API when authenticated', async () => {
        const mockApiResponse = {
          todos: [
            {
              id: 1,
              text: 'API todo',
              completed: false,
              category: 'Work',
              priority: { value: 'High', label: 'High', color: '' },
              tags: [],
              createdAt: new Date().toISOString()
            }
          ]
        };

        service.reloadTodos();

        const req = httpMock.expectOne('/api/todos');
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);

        await new Promise(resolve => setTimeout(resolve, 100));
        const todos = service.getTodos();
        expect(todos().length).toBe(1);
        expect(todos()[0].text).toBe('API todo');
      });

      it('should send todo to API when adding', () => {
        const mockResponse = {
          id: 1,
          text: 'New API todo',
          completed: false,
          category: 'Work',
          priority: { value: 'Medium', label: 'Medium', color: '' },
          tags: [],
          createdAt: new Date().toISOString()
        };

        service.addTodo(make('New API todo'));

        const req = httpMock.expectOne('/api/todos');
        expect(req.request.method).toBe('POST');
        expect(req.request.body.task).toBe('New API todo');
        req.flush(mockResponse);
      });

      it('should update todo via API', () => {
        const mockTodo = {
          id: 1,
          text: 'Original text',
          completed: false,
          category: 'Work',
          priority: service.getPriorities()()[0],
          tags: [],
          createdAt: new Date()
        };

        // First set a todo in the service
        service['todos'].set([mockTodo]);

        const updatedTodo = {
          ...mockTodo,
          text: 'Updated text',
          completed: true
        };

        service.updateTodo(1, updatedTodo);

        const req = httpMock.expectOne('/api/todos/1');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body.text).toBe('Updated text');
        req.flush(updatedTodo);
      });

      it('should delete todo via API', () => {
        service.deleteTodo(1);

        const req = httpMock.expectOne('/api/todos/1');
        expect(req.request.method).toBe('DELETE');
        req.flush({});
      });

      it('should handle API errors gracefully', async () => {
        service.reloadTodos();

        const req = httpMock.expectOne('/api/todos');
        req.flush('Error', { status: 500, statusText: 'Server Error' });

        await new Promise(resolve => setTimeout(resolve, 100));
        const todos = service.getTodos();
        expect(todos().length).toBe(0);
      });
    });

    describe('reloadTodos()', () => {
      it('should be callable to refresh todos', () => {
        const reloadSpy = vi.spyOn(service, 'reloadTodos');
        service.reloadTodos();
        expect(reloadSpy).toHaveBeenCalled();
      });

      it('should reload todos from storage in guest mode', async () => {
        localStorage.setItem('todos_guest', JSON.stringify([{
          id: 1,
          text: 'Guest todo',
          completed: false,
          category: 'Work',
          priority: { value: 'Medium', label: 'Medium', color: '' },
          createdAt: new Date().toISOString(),
          tags: []
        }]));

        service.reloadTodos();

        await new Promise(resolve => setTimeout(resolve, 10));
        const todos = service.getTodos();
        expect(todos().length).toBe(1);
      });
    });
  });
});
