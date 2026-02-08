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
  templateUrl: './todo.html',
  styles: []
})
export class TodoComponent {
  private todoService = inject(TodoService);

  todos = this.todoService.getTodos();
  filteredTodos = signal<ReturnType<typeof this.todos>>([]);
  searchTerm = signal('');
  selectedCategory = signal('All');
  selectedPriority = signal('All');
  editingTodoId = signal<number | null>(null);
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

    // Apply category filter
    if (this.selectedCategory() !== 'All') {
      filtered = filtered.filter(todo => String(todo.category) === this.selectedCategory());
    }

    // Apply priority filter
    if (this.selectedPriority() !== 'All') {
      filtered = filtered.filter(todo => String(todo.priority.value) === this.selectedPriority());
    }

    // Apply search filter
    if (this.searchTerm().trim()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(todo => todo.text.toLowerCase().includes(term));
    }
    this.filteredTodos.set(filtered);
  }

  addTodo(): void {
    //This will be handled by the form component, but we can keep this method for direct calls if needed
    if (!this.newTodoText().trim()) {
      return;
    }
  }

  updateTodo(): void {
    //This will be handled by the form component, but we can keep this method for direct calls if needed
  }

  cancelEdit(): void {
    this.editingTodoId.set(null);
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

  onCategorySelected(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.applyFilters();
  }

  onPrioritySelected(priority: string): void {
    this.selectedPriority.set(priority);
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  editTodo(todo: TodoItem): void {
    this.editingTodoId.set(todo.id);
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
