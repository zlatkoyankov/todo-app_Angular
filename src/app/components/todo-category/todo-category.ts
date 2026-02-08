import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { Category } from '../../models/category.model';
import { TodoService } from '../../service/todo';

@Component({
  selector: 'app-todo-category',
  imports: [],
  styles: [],
  template: `
<div>
  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
  <div class="flex flex-wrap gap-2">
    <button
      (click)="selectCategory('All')"
      [class]="selectedCategory().length === 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'"
      class="px-3 py-1 rounded-full text-sm font-medium transition duration-200"
      aria-pressed="{{ selectedCategory().length === 0 }}"
    >
      All
    </button>
    @for (category of categories(); track category.id) {
      <button
        (click)="selectCategory(category.name)"
        [class]="isCategorySelected(category.name) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'"
        class="px-3 py-1 rounded-full text-sm font-medium transition duration-200"
        [attr.aria-pressed]="isCategorySelected(category.name)"
      >
        {{ category.name }}
      </button>
    }
  </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoCategory {
  selectedCategory = input<string[]>([]);
  categorySelected = output<string>();

  categories = signal<Category[]>([]);
  todoService: TodoService = inject(TodoService);

  constructor() {
    // Keep categories in sync with service
    effect(() => {
      this.categories.set(this.todoService.getCategories()());
    });
  }
  // Emit the category name so it matches the `category` value stored on todos
  selectCategory(categoryName: string) {
    this.categorySelected.emit(categoryName);
  }

  isCategorySelected(categoryName: string): boolean {
    return this.selectedCategory().includes(categoryName);
  }
}
