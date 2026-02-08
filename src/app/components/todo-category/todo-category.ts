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
  selectedCategory = input<string>('All');
  categorySelected = output<string>();

  categories = signal<Category[]>([]);
  todoService: TodoService = inject(TodoService);

  constructor() {
    // Keep categories in sync with service
    effect(() => {
      this.categories.set(this.todoService.getCategories()());
    });
  }

  selectCategory(categoryId: string | number) {
    this.categorySelected.emit(String(categoryId));
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategory() === String(categoryId);
  }
}
