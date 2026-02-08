import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { Category } from '../../models/category.model';
import { TodoService } from '../../service/todo';

@Component({
  selector: 'app-todo-category',
  imports: [],
  templateUrl: './todo-category.html',
  styleUrl: './todo-category.scss',
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
