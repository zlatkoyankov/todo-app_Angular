import { Component, ChangeDetectionStrategy, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TodoService } from '../../service/todo';
import { TodoForm } from '../todo-form/todo-form';
import { TodoCategory } from '../todo-category/todo-category';
import { TodoPriority } from '../todo-priority/todo-priority';
import { Category } from '../../models/category.model';
import { Priority, PriorityLabel } from '../../models/priority.model';
import { TodoItem } from '../../models/todo.model';

@Component({
  selector: 'app-todo',
  imports: [CommonModule, DatePipe, TodoForm, TodoCategory, TodoPriority],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="max-w-4xl mx-auto p-4">
  <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Advanced Angular Todo App</h1>
  
  <!-- Stats Overview -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow-md p-4 text-center">
      <div class="text-2xl font-bold text-blue-600">{{ totalTodosCount() }}</div>
      <div class="text-gray-600">Total Tasks</div>
    </div>
    <div class="bg-white rounded-lg shadow-md p-4 text-center">
      <div class="text-2xl font-bold text-green-600">{{ activeTodosCount() }}</div>
      <div class="text-gray-600">Active Tasks</div>
    </div>
    <div class="bg-white rounded-lg shadow-md p-4 text-center">
      <div class="text-2xl font-bold text-purple-600">{{ completedTodosCount() }}</div>
      <div class="text-gray-600">Completed</div>
    </div>
  </div>

  <!-- Search and Filters Section -->
  <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Search & Filter</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Search Bar -->
    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <div class="relative">
        <input
          type="text"
          [value]="searchTerm()"
          (input)="onSearchChange($event.target.value)"
          placeholder="Search tasks..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Category Filter -->
    <div>
      <app-todo-category
        [selectedCategory]="selectedCategory()"
        (categorySelected)="onCategorySelected($event)"
      ></app-todo-category>
    </div>
    
    <!-- Priority Filter -->
    <div>
      <app-todo-priority
        [selectedPriority]="selectedPriority()"
        (prioritySelected)="onPrioritySelected($event)"
      ></app-todo-priority>
    </div>
  </div>

  <!-- Todo List -->
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Tasks</h2>
          <p class="text-gray-600">{{ filteredTodos().length }} tasks found</p>
        </div>
        <button
          (click)="openAddTodoDialog()"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Add Todo
        </button>
      </div>
    </div>
    
    <ul class="divide-y divide-gray-200">
      @for (todo of filteredTodos(); track trackByTodoId($index, todo)) {
        <li class="p-4 hover:bg-gray-50 transition duration-150">
        <div class="flex items-start">
          <input
            type="checkbox"
            [checked]="todo.completed"
            (change)="toggleTodo(todo.id)"
            class="mt-1 h-5 w-5 text-blue-500 rounded focus:ring-blue-400"
          >
          
          <div class="ml-3 flex-1">
            <div class="flex items-start justify-between">
              <span
                [class]="todo.completed ? 'line-through text-gray-500' : 'text-gray-800'"
              >
                {{ todo.text }}
              </span>
              <div class="flex space-x-2">
                <button
                  (click)="editTodo(todo)"
                  class="text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  (click)="deleteTodo(todo.id)"
                  class="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="mt-2 flex flex-wrap gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ getCategoryName(todo.category) }}
              </span>
              
              @if (todo.priority) {
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [class]="getPriorityColor(todo.priority.value) + ' text-white'"
                >
                  {{ todo.priority.label }}
                </span>
              }
              
              @if (todo.dueDate) {
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Due: {{ todo.dueDate | date:'shortDate' }}
                </span>
              }
              
              @for (tag of todo.tags; track tag) {
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ tag }}
                </span>
              }
            </div>
          </div>
        </div>
        </li>
      }
      
      @if (filteredTodos().length === 0) {
        <li class="p-8 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="mt-2">No tasks found</p>
          <p class="text-sm">Try adjusting your search or filters</p>
        </li>
      }
    </ul>

    <!-- Todo Stats and Actions -->
    <div class="p-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
      <div class="text-gray-600 mb-2 sm:mb-0">
        {{ activeTodosCount() }} {{ activeTodosCount() === 1 ? 'item' : 'items' }} left
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
  </div>

  <!-- Instructions -->
  <div class="mt-8 text-center text-gray-500 text-sm">
    <p>Double-click to edit a todo</p>
    <p class="mt-1">Created with Angular and Tailwind CSS</p>
  </div>

  <!-- Form Dialog Modal -->
  @if (showFormDialog()) {
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeFormDialog()">
      <div class="bg-white rounded-lg shadow-xl p-8 w-full mx-4 max-w-2xl" (click)="$event.stopPropagation()">
        <app-todo-form
          [editingTodo]="editingTodo()"
          (todoAdded)="onFormSubmitted()"
          (todoUpdated)="onFormSubmitted()"
          (cancelEdit)="closeFormDialog()"
        ></app-todo-form>
      </div>
    </div>
  }
</div>
  `,
  styles: []
})
export class TodoComponent {
  private todoService = inject(TodoService);

  todos = this.todoService.getTodos();
  filteredTodos = signal<ReturnType<typeof this.todos>>([]);
  searchTerm = signal('');
  selectedCategory = signal<string[]>([]);
  selectedPriority = signal<string[]>([]);
  editingTodoId = signal<number | null>(null);
  showFormDialog = signal(false);
  editingTodo = computed(() => {
    const id = this.editingTodoId();
    return id ? this.todos().find(t => t.id === id) || null : null;
  });

  categories = signal<Category[]>([]);
  priorities = signal<Priority[]>([]);

  newTodoText = signal('');
  activeTodosCount = computed(() =>
    this.todos().filter(todo => !todo.completed).length
  );

  completedTodosCount = computed(() =>
    this.todos().filter(todo => todo.completed).length
  );

  totalTodosCount = computed(() => this.todos().length);

  constructor() {
    // Load categories and priorities synchronously from service signals
    this.categories.set(this.todoService.getCategories()());
    this.priorities.set(this.todoService.getPriorities()());

    // Auto-apply filters when todos, search, category, or priority changes
    effect(() => {
      this.applyFilters();
    });
  }

  get todosByCategory(): { [key: string]: number} {
    return this.todoService.getCountByCategory();
  }

  get todosByPriority(): { [key: string]: number} {
    return this.todoService.getCountByPriority();
  }

  applyFilters() {
    let filtered = [...this.todos()];

    // Apply category filter (multi-select). Empty array means 'All'.
    if (this.selectedCategory().length > 0) {
      filtered = filtered.filter(todo => this.selectedCategory().includes(String(todo.category)));
    }

    // Apply priority filter (multi-select). Empty array means 'All'.
    if (this.selectedPriority().length > 0) {
      filtered = filtered.filter(todo => this.selectedPriority().includes(String(todo.priority.value)));
    }

    // Apply search filter
    if (this.searchTerm().trim()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(todo => todo.text.toLowerCase().includes(term));
    }
    this.filteredTodos.set(filtered);
  }

  addTodo(): void {
    // Allow quick-add from the list: create minimal todo object and delegate to service
    if (!this.newTodoText().trim()) {
      return;
    }

    const text = this.newTodoText().trim();
    const defaultCategory = this.categories()[0]?.name || 'Work';
    const defaultPriority = this.priorities()[1] || this.priorities()[0] || { value: 'Medium', label: 'Medium', coloer: '' };

    this.todoService.addTodo({
      text,
      category: defaultCategory,
      priority: defaultPriority,
      dueDate: undefined,
      tags: [],
      completed: false
    });

    this.newTodoText.set('');
  }

  updateTodo(): void {
    //This will be handled by the form component, but we can keep this method for direct calls if needed
  }

  cancelEdit(): void {
    this.closeFormDialog();
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

  onCategorySelected(categoryName: string): void {
    if (categoryName === 'All') {
      this.selectedCategory.set([]);
      this.applyFilters();
      return;
    }

    const current = [...this.selectedCategory()];
    const idx = current.indexOf(categoryName);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(categoryName);
    }
    this.selectedCategory.set(current);
    this.applyFilters();
  }

  onPrioritySelected(priority: string): void {
    if (priority === 'All') {
      this.selectedPriority.set([]);
      this.applyFilters();
      return;
    }

    const current = [...this.selectedPriority()];
    const idx = current.indexOf(priority);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(priority);
    }
    this.selectedPriority.set(current);
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onFormSubmitted(): void {
    this.applyFilters();
    this.closeFormDialog();
  }

  editTodo(todo: TodoItem): void {
    this.editingTodoId.set(todo.id);
    this.showFormDialog.set(true);
  }

  openAddTodoDialog(): void {
    this.editingTodoId.set(null);
    this.showFormDialog.set(true);
  }

  closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.editingTodoId.set(null);
  }

  trackByTodoId(index: number, todo: TodoItem): number {
    return todo.id;
  }

  getCategoryName(categoryName: string | undefined): string {
    if (!categoryName) return '';
    return categoryName;
  }

  getPriorityColor(priorityValue: string | undefined): string {
    if (!priorityValue) return '';
    return this.priorities().find(p => p.value === priorityValue)?.coloer || '';
  }
}
