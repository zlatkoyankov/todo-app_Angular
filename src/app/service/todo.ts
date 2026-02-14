import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, of } from 'rxjs';
import { TodoItem } from '../models/todo.model';
import { Category } from '../models/category.model';
import { Priority, PriorityLabel } from '../models/priority.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly API_URL = '/api';
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private todos = signal<TodoItem[]>([]);
  private categoriesSignal = signal<Category[]>([]);
  private prioritiesSignal = signal<Priority[]>([]);

  private idCounter = 0;

  private categories: Category[] = [
    { id: 1, name: 'Work', description: 'Tasks related to work', color: 'bg-blue-500' },
    { id: 2, name: 'Personal', description: 'Personal tasks and errands', color: 'bg-green-500' },
    { id: 3, name: 'Shopping', description: 'Shopping tasks and errands', color: 'bg-yellow-500' },
    { id: 4, name: 'Health', description: 'Health and fitness tasks', color: 'bg-red-500' },
    { id: 5, name: 'Learning', description: 'Learning and education tasks', color: 'bg-purple-500' }
  ];

  private prioorities: Priority[] = [
    { value: PriorityLabel.LOW, label: 'Low', color: 'bg-gray-200 text-gray-800' },
    { value: PriorityLabel.MEDIUM, label: 'Medium', color: 'bg-yellow-200 text-yellow-800' },
    { value: PriorityLabel.HIGH, label: 'High', color: 'bg-red-200 text-red-800' }
  ];

  constructor() {
    this.categoriesSignal.set(this.categories);
    this.prioritiesSignal.set(this.prioorities);
    // Don't load todos automatically - let components call reloadTodos() when needed
  }

  private isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  private loadTodos(): void {
    if (this.isAuthenticated()) {
      // Load from API
      this.loadTodosFromAPI();
    } else {
      // Load from localStorage for guest mode
      this.loadTodosFromLocalStorage();
    }
  }

  private loadTodosFromAPI(): void {
    this.http.get<any[]>(`${this.API_URL}/todos`)
      .pipe(
        tap((todos:any) => {
          // Transform backend format to frontend TodoItem format
          const validTodos = todos.todos.map((todo: any) => ({
            id: todo.id,
            text: todo.text, // Backend uses 'task', frontend uses 'text'
            completed: todo.completed,
            category: todo.category || '1', // Default category if not present
            priority: todo.priority || this.prioorities[1], // Default priority
            tags: todo.tags || [],
            createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          }));
          
          this.todos.set(validTodos);
        }),
        catchError(() => {
          console.error('Failed to load todos from API');
          this.todos.set([]);
          return of([]);
        })
      )
      .subscribe();
  }

  private loadTodosFromLocalStorage(): void {
    const storeTodos = localStorage.getItem('todos_guest');
    if (storeTodos) {
      const todos = JSON.parse(storeTodos);
      const validTodos = todos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        priority: todo.priority && typeof todo.priority === 'object'
          ? todo.priority
          : this.prioorities[1]
      }));
      this.todos.set(validTodos);
    } else {
      this.todos.set([]);
    }
  }

  private saveTodosToLocalStorage(): void {
    localStorage.setItem('todos_guest', JSON.stringify(this.todos()));
  }

  reloadTodos(): void {
    this.loadTodos();
  }

  getTodos() {
    return this.todos.asReadonly();
  }

  getCategories() {
    return this.categoriesSignal.asReadonly();
  }
  
  getPriorities() {
    return this.prioritiesSignal.asReadonly();
  }

  addTodo(todo: Omit<TodoItem, 'id' | 'createdAt'>): void {
    if (this.isAuthenticated()) {
      // Add via API - transform to backend format
      const payload = {
        task: todo.text,
        completed: todo.completed || false
      };
      
      this.http.post<any>(`${this.API_URL}/todos`, payload)
        .pipe(
          tap((response) => {
            // Transform backend response to frontend TodoItem
            const newTodo: TodoItem = {
              id: response.id,
              text: response.text,
              completed: response.completed,
              category: todo.category,
              priority: todo.priority,
              tags: todo.tags || [],
              createdAt: response.createdAt ? new Date(response.createdAt) : new Date(),
              dueDate: todo.dueDate,
            };
            this.todos.update(todos => [...todos, newTodo]);
          }),
          catchError((error) => {
            console.error('Failed to add todo:', error);
            return of(null);
          })
        )
        .subscribe();
    } else {
      // Add to localStorage for guest mode
      const id = Date.now() + (++this.idCounter);
      const newTodo: TodoItem = {
        ...todo,
        id,
        createdAt: new Date(),
      };
      this.todos.update(todos => [...todos, newTodo]);
      this.saveTodosToLocalStorage();
    }
  }

  updateTodo(id: number, updatedFields: Partial<TodoItem>): void {
    if (this.isAuthenticated()) {
    //   // Update via API - transform to backend format
    //   const payload: any = {};
    //   if (updatedFields.text !== undefined) {
    //     payload.text = updatedFields.text;
    //   }
    //   if (updatedFields.completed !== undefined) {
    //     payload.completed = updatedFields.completed;
    //   }
      
      this.http.put<any>(`${this.API_URL}/todos/${id}`, updatedFields)
        .pipe(
          tap((response) => {
            debugger
            // Update local state with all changed fields (backend + local-only fields)
            this.todos.update(todos =>
              todos.map(todo => todo.id === id ? {
                ...todo,
                ...updatedFields, // Apply all local updates (category, priority, tags, dueDate)
                text: response.text !== undefined ? response.text : todo.text, // Override with backend response
                completed: response.completed !== undefined ? response.completed : todo.completed,
                modifiedAt: new Date()
              } : todo)
            );
          }),
          catchError((error) => {
            console.error('Failed to update todo:', error);
            return of(null);
          })
        )
        .subscribe();
    } else {
      // Update in localStorage for guest mode
      this.todos.update(todos =>
        todos.map(todo => (todo.id === id ? { ...todo, ...updatedFields, modifiedAt: new Date() } : todo))
      );
      this.saveTodosToLocalStorage();
    }
  }

  toggleTodo(id: number): void {
    const todo = this.todos().find(t => t.id === id);
    if (todo) {
      this.updateTodo(id, { completed: !todo.completed });
    }
  }

  deleteTodo(id: number): void {
    if (this.isAuthenticated()) {
      // Delete via API
      this.http.delete(`${this.API_URL}/todos/${id}`)
        .pipe(
          tap(() => {
            this.todos.update(todos => todos.filter(t => t.id !== id));
          }),
          catchError((error) => {
            console.error('Failed to delete todo:', error);
            return of(null);
          })
        )
        .subscribe();
    } else {
      // Delete from localStorage for guest mode
      this.todos.update(todos => todos.filter(t => t.id !== id));
      this.saveTodosToLocalStorage();
    }
  }

  clearCompleted(): void {
    const completedTodos = this.todos().filter(t => t.completed);
    if (this.isAuthenticated()) {
      // Delete each completed todo via API
      completedTodos.forEach(todo => this.deleteTodo(todo.id));
    } else {
      // Clear from localStorage for guest mode
      this.todos.update(todos => todos.filter(t => !t.completed));
      this.saveTodosToLocalStorage();
    }
  }

  // Filter todo by category
  filterByCategory(categoryId: string): TodoItem[] {
    return this.todos().filter(todo => todo.category === categoryId);
  }

  // Filter todo by priority
  filterByPriority(priorityValue: PriorityLabel): TodoItem[] {
    return this.todos().filter(todo => todo.priority.value === priorityValue);
  } 

  // Get todos count by category
  getCountByCategory(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    this.todos().forEach(todo => {
      counts[todo.category] = (counts[todo.category] || 0) + 1;
    });
    
    return counts;  
  }

  // Get todos count by priority
  getCountByPriority(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    this.todos().forEach(todo => {
      counts[todo.priority.value] = (counts[todo.priority.value] || 0) + 1;
    });

    return counts;
  }

  // Search todos by text
  searchTodos(query: string): TodoItem[] {
    const lowerQuery = query.toLowerCase();
    return this.todos().filter(todo => todo.text.toLowerCase().includes(lowerQuery));
  }

  get activeTodosCount(): number {
    return this.todos().filter(todo => !todo.completed).length;
  }

  get completedTodosCount(): number {
    return this.todos().filter(todo => todo.completed).length;
  }

  get totalTodosCount(): number {
    return this.todos().length; 
  }
}
