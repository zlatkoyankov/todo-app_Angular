import { ChangeDetectionStrategy, Component, inject, input, output, OnInit, Signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TodoItem } from '../../models/todo.model';
import { TodoService } from '../../service/todo';
import { Category } from '../../models/category.model';
import { Priority } from '../../models/priority.model';

@Component({
  selector: 'app-todo-form',
  imports: [ReactiveFormsModule],
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoForm implements OnInit {
  editingTodo = input<TodoItem | null>(null);
  todoAdded = output<void>();
  todoUpdated = output<void>();
  cancelEdit = output<void>();

  form = new FormGroup({
    text: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(1)] }),
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
  }

  ngOnInit() {
    const todo = this.editingTodo();
    if (todo) {
      this.isEditing = true;
      this.form.patchValue({
        text: todo.text,
        category: todo.category,
        priority: todo.priority.value,
        dueDate: todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '',
        tags: todo.tags.join(', ')
      });
      this.form.get('text')?.disable();
    }
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
