import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PriorityLabel } from '../../models/priority.model';

@Component({
  selector: 'app-todo-priority',
  imports: [],
  styles: [],
  template: `
<div>
  <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
  <div class="flex flex-wrap gap-2">
    <button
      (click)="selectPriority('All')"
      [class]="selectedPriority().length === 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'"
      class="px-3 py-1 rounded-full text-sm font-medium transition duration-200"
      [attr.aria-pressed]="selectedPriority().length === 0"
    >
      All
    </button>
    @for (priority of priorities; track priority.value) {
      <button
        (click)="selectPriority(priority.value)"
        [class]="selectedPriority().includes(priority.value) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'"
        class="px-3 py-1 rounded-full text-sm font-medium transition duration-200"
        [attr.aria-pressed]="selectedPriority().includes(priority.value)"
      >
        {{ priority.label }}
      </button>
    }
  </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoPriority {
  // selectedPriority is a signal-based input; use the enum string values or 'All'
  selectedPriority = input<string[]>([]);
  prioritySelected = output<string>();

  priorities = [
    { value: PriorityLabel.LOW, label: 'Low', color: 'bg-gray-200 text-gray-800' },
    { value: PriorityLabel.MEDIUM, label: 'Medium', color: 'bg-yellow-200 text-yellow-800' },
    { value: PriorityLabel.HIGH, label: 'High', color: 'bg-red-200 text-red-800' }
  ];

  selectPriority(priority: string): void {
    this.prioritySelected.emit(priority);
  }
}
