import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PriorityLabel } from '../../models/priority.model';

@Component({
  selector: 'app-todo-priority',
  imports: [],
  templateUrl: './todo-priority.html',
  styleUrl: './todo-priority.scss',
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
