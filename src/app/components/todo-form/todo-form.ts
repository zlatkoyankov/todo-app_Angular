import { ChangeDetectionStrategy, Component, inject, input, output, Signal, effect } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TodoItem } from '../../models/todo.model';
import { TodoService } from '../../service/todo';
import { Category } from '../../models/category.model';
import { Priority } from '../../models/priority.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
  <div class="space-y-4">
  @if (isEditing) {
    <h2 class="text-xl font-bold mb-4 text-gray-800">Edit Todo</h2>
  } @else {
    <h2 class="text-xl font-bold mb-4 text-gray-800">Add New Todo</h2>
  }

  <form [formGroup]="form" (ngSubmit)="onSubmit()" role="form" aria-label="Todo form" class="space-y-4">
    <div>
      <label for="todo-text" class="block text-sm font-medium text-gray-700 mb-1">Task</label>
      <input
        id="todo-text"
        formControlName="text"
        type="text"
        placeholder="What needs to be done?"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-required="true"
      >
      @if (form.get('text')?.hasError('required')) {
        <span class="text-red-500 text-sm">Task is required</span>
      }
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="category-select" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          id="category-select"
          formControlName="category"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Category"
        >
          @for (cat of category(); track cat.id) {
            <option [value]="cat.name">{{ cat.name }}</option>
          }
        </select>
      </div>

      <div>
        <label for="priority-select" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          id="priority-select"
          formControlName="priority"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Priority"
        >
          @for (p of priority(); track p.value) {
            <option [value]="p.value">{{ p.label }}</option>
          }
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="due-date" class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input
          id="due-date"
          formControlName="dueDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Due date"
        >
      </div>

      <div>
        <label for="tags-input" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
        <input
          id="tags-input"
          formControlName="tags"
          type="text"
          placeholder="angular, portfolio, project"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Tags"
        >
      </div>
    </div>

    <div class="flex space-x-3 pt-2">
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition duration-200 disabled:opacity-50"
        aria-label="Submit todo"
        [disabled]="form.invalid"
      >
        @if (isEditing) { Update } @else { Add } Todo
      </button>

      <button
        type="button"
        (click)="onCancel()"
        class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition duration-200"
        aria-label="Cancel"
      >
        Cancel
      </button>
    </div>
  </form>
</div>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoForm {
  readonly editingTodo = input<TodoItem | null>(null);
  todoAdded = output<void>();
  todoUpdated = output<void>();
  cancelEdit = output<void>();

  form = new FormGroup({
    text: new FormControl('', { nonNullable: true, validators: [
      Validators.required,
      Validators.minLength(1),
      Validators.pattern(/\S/) // Ensure not just whitespace
    ] 
    }),
    category: new FormControl('Work', { nonNullable: true }),
    priority: new FormControl('Medium', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true }),
    tags: new FormControl('', { nonNullable: true })
  });

  isEditing = false;

  category: Signal<Category[]>;
  priority: Signal<Priority[]>;

  todoService: TodoService = inject(TodoService);

  constructor() {
    // The service exposes signals; bind them directly instead of subscribing
    this.category = this.todoService.getCategories();
    this.priority = this.todoService.getPriorities();

    effect(() => {
      const todo = this.editingTodo();
      console.log('Editing todo:', todo);
      if (!todo) {
          this.isEditing = false;
          this.form.get('text')?.enable();
          return;
        }

      this.isEditing = true;
      this.form.patchValue({
        text: todo.text,
        category: todo.category,
        priority: todo.priority.value,
        dueDate: todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '',
        tags: todo.tags.join(', ')
      });
      this.form.get('text')?.disable();

    });
  } 

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();
    const tags = formValue.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const priorityValue = formValue.priority;

    const todo = this.editingTodo();
    if (this.isEditing && todo) {
      const updateTodoData: Partial<TodoItem> = {
        category: formValue.category,
        priority: this.priority().find(p => p.value === priorityValue) || this.priority()[0],
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        tags
      };
      this.todoService.updateTodo(todo.id, updateTodoData);
      this.todoUpdated.emit();
    } else {
      this.todoService.addTodo({
        text: formValue.text.trim(),
        category: formValue.category,
        priority: this.priority().find(p => p.value === priorityValue) || this.priority()[0],
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        tags,
        completed: false
      });
      this.todoAdded.emit();
    }

    this.resetForm();
  }

  resetForm() {
    this.form.reset({ category: 'Work', priority: 'Medium' });
    this.form.get('text')?.enable();
    this.isEditing = false;
  }

  onCancel(): void {
    this.resetForm();
    this.cancelEdit.emit(); 
  }
}
