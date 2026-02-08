import { Injectable, signal } from '@angular/core';
import { TodoItem } from '../models/todo.model';
import { Category } from '../models/category.model';
import { Priority, PriorityLabel } from '../models/priority.model';
import { DUMMY_TODOS } from './dummy-todos';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
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
    { value: PriorityLabel.LOW, label: 'Low', coloer: 'bg-gray-200 text-gray-800' },
    { value: PriorityLabel.MEDIUM, label: 'Medium', coloer: 'bg-yellow-200 text-yellow-800' },
    { value: PriorityLabel.HIGH, label: 'High', coloer: 'bg-red-200 text-red-800' }
  ];

  constructor() {
    this.loadTodos();
    this.categoriesSignal.set(this.categories);
    this.prioritiesSignal.set(this.prioorities);
  }

  private loadTodos(): void {
    const storeTodos = localStorage.getItem('todos');
    if (storeTodos) {
      const todos = JSON.parse(storeTodos);
      // Ensure all todos have valid priority objects
      const validTodos = todos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        priority: todo.priority && typeof todo.priority === 'object' 
          ? todo.priority 
          : this.prioorities[1] // Default to MEDIUM priority
      }));
      this.todos.set(validTodos);
    } else {
      // Initialize with dummy data for testing/development
      // To remove dummy data: simply delete/comment out the DUMMY_TODOS import and use an empty array
      const dummyTodos: TodoItem[] = DUMMY_TODOS.map((dummy, index) => ({
        ...dummy,
        id: Date.now() + index,
        createdAt: new Date()
      }));
      this.todos.set(dummyTodos);
    }
  }

  private saveTodos(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos()));
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
    const newTodo: TodoItem = {
      ...todo,
      id: Date.now(),
      createdAt: new Date(),
    };
    this.todos.update(todos => [...todos, newTodo]);
    this.saveTodos();
  }

  updateTodo(id: number, updatedFields: Partial<TodoItem>): void {
    this.todos.update(todos =>
      todos.map(todo => (todo.id === id ? { ...todo, ...updatedFields, modifiedAt: new Date() } : todo))
    );
    this.saveTodos();
  }

  toggleTodo(id: number): void {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed, modifiedAt: new Date() } : todo
      )
    );
    this.saveTodos();
  }

  deleteTodo(id: number): void {
    this.todos.update(todos => todos.filter(t => t.id !== id));
    this.saveTodos();
  }

  clearCompleted(): void {
    this.todos.update(todos => todos.filter(t => !t.completed));
    this.saveTodos();
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
