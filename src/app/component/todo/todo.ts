import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { TodoItem } from '../../models/todo.model';
import { Subscription } from 'rxjs';
import { TodoService } from '../../service/todo';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  imports: [FormsModule],
  template: `<div class="max-w-2xl mx-auto p-4">
  <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Angular Todo App</h1>
  
  <!-- Add Todo Form -->
  <div class="mb-6 flex">
    <input
      type="text"
      [(ngModel)]="newTodoText"
      (keyup.enter)="addTodo()"
      placeholder="What needs to be done?"
      class="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
    <button
      (click)="addTodo()"
      class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-r-lg font-medium transition duration-200"
    >
      Add
    </button>
  </div>

  <!-- Todo List -->
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <ul class="divide-y divide-gray-200">
      @for (todo of todos; track todo.id) {
        <li class="p-4 hover:bg-gray-50 transition duration-150">
          <div class="flex items-center">
            <input
              type="checkbox"
              [checked]="todo.completed"
              (change)="toggleTodo(todo.id)"
              class="h-5 w-5 text-blue-500 rounded focus:ring-blue-400"
            >
            <span
              [class.line-through]="todo.completed"
              [class.text-gray-500]="todo.completed"
              class="ml-3 flex-1"
            >
              {{ todo.text }}
            </span>
            <button
              (click)="deleteTodo(todo.id)"
              class="text-red-500 hover:text-red-700 ml-2"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </li>
      }
    </ul>

    <!-- Todo Stats and Actions -->
    <div class="p-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
      <div class="text-gray-600 mb-2 sm:mb-0">
        {{ activeTodosCount }} {{ activeTodosCount === 1 ? 'item' : 'items' }} left
      </div>
      <div class="flex space-x-2">
        <button
          (click)="clearCompleted()"
          class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded transition duration-200"
        >
          Clear completed
        </button>
      </div>
    </div>
  </div>

  <!-- Instructions -->
  <div class="mt-8 text-center text-gray-500 text-sm">
    <p>Double-click to edit a todo</p>
    <p class="mt-1">Created with Angular and Tailwind CSS</p>
  </div>
</div>`,
  styles: []
})
export class TodoComponent implements OnInit, OnDestroy {

  todos: TodoItem[] = [];
  newTodoText: string = '';
  subscription: Subscription = new Subscription();
  todoService: TodoService = inject(TodoService);

  ngOnInit(): void {
    this.subscription = this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  addTodo(): void {
    if (this.newTodoText.trim()) {
      this.todoService.addTodo(this.newTodoText);
      this.newTodoText = '';
    }
  }

  toggleTodo(id: number): void {
    this.todoService.toggleTodo(id);
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id);
  }

  clearCompleted(): void {
    this.todoService.clearCompleted();
  }
  get activeTodosCount(): number {
    return this.todos.filter(todo => !todo.completed).length;
  }
}
