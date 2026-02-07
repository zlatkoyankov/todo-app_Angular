import { Injectable, signal } from '@angular/core';
import { TodoItem } from '../models/todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private todos = signal<TodoItem[]>([]);
  private idCounter = 0;

  constructor() {
    this.loadTodos();
  }

  private loadTodos(): void {
    const storeTodos = localStorage.getItem('todos');
    if (storeTodos) {
      this.todos.set(JSON.parse(storeTodos));
    }
  }

  private saveTodos(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos()));
  }

  getTodos() {
    return this.todos.asReadonly();
  }

  addTodo(text: string): void {
    const newTodo: TodoItem = {
      id: Date.now() + (this.idCounter++),
      text,
      completed: false
    };
    this.todos.update(todos => [...todos, newTodo]);
    this.saveTodos();
  }

  toggleTodo(id: number): void {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
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
}
