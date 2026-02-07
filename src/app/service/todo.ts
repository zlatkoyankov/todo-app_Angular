import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TodoItem } from '../models/todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private todos: TodoItem[] = [];
  private todoSubject = new BehaviorSubject<TodoItem[]>([]);
  private idCounter = 0;

  constructor() {
    this.loadTodos();
  }

  private loadTodos(): void {
    const storeTodos = localStorage.getItem('todos');

    if (storeTodos) {
      this.todos = JSON.parse(storeTodos);
    }
    this.todoSubject.next(this.todos);
  }

  private saveTodos(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
    this.todoSubject.next(this.todos);
  }


  getTodos(): Observable<TodoItem[]> {
    return this.todoSubject.asObservable();
  }

  addTodo(text: string):void {
    const newTodo: TodoItem = {
      id: Date.now() + (this.idCounter++),
      text,
      completed: false
    };
    this.todos.push(newTodo);
    this.saveTodos();
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
    }
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
  }

  clearCompleted(): void {
    this.todos = this.todos.filter(t => !t.completed);
    this.saveTodos();
  }
}
