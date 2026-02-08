import { TodoItem } from '../models/todo.model';
import { PriorityLabel } from '../models/priority.model';

/**
 * Dummy todo data for testing and development.
 * Remove this import from todo.ts when moving to production.
 */
export const DUMMY_TODOS: Omit<TodoItem, 'id' | 'createdAt'>[] = [
  {
    text: 'Complete Angular project refactoring',
    completed: false,
    category: 'Work',
    priority: {
      value: PriorityLabel.HIGH,
      label: 'High',
      coloer: 'bg-red-200 text-red-800'
    },
    dueDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    tags: ['angular', 'urgent', 'refactor']
  },
  {
    text: 'Buy groceries for the week',
    completed: true,
    category: 'Shopping',
    priority: {
      value: PriorityLabel.MEDIUM,
      label: 'Medium',
      coloer: 'bg-yellow-200 text-yellow-800'
    },
    dueDate: undefined,
    tags: ['shopping', 'groceries']
  },
  {
    text: 'Review team pull requests',
    completed: false,
    category: 'Work',
    priority: {
      value: PriorityLabel.MEDIUM,
      label: 'Medium',
      coloer: 'bg-yellow-200 text-yellow-800'
    },
    dueDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    tags: ['code-review', 'work']
  },
  {
    text: 'Go to the gym',
    completed: false,
    category: 'Health',
    priority: {
      value: PriorityLabel.MEDIUM,
      label: 'Medium',
      coloer: 'bg-yellow-200 text-yellow-800'
    },
    dueDate: undefined,
    tags: ['exercise', 'health']
  },
  {
    text: 'Learn TypeScript generics',
    completed: false,
    category: 'Learning',
    priority: {
      value: PriorityLabel.HIGH,
      label: 'High',
      coloer: 'bg-red-200 text-red-800'
    },
    dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    tags: ['typescript', 'learning', 'generics']
  },
  {
    text: 'Call mom',
    completed: false,
    category: 'Personal',
    priority: {
      value: PriorityLabel.LOW,
      label: 'Low',
      coloer: 'bg-gray-200 text-gray-800'
    },
    dueDate: undefined,
    tags: ['personal', 'family']
  },
  {
    text: 'Write unit tests for new component',
    completed: false,
    category: 'Work',
    priority: {
      value: PriorityLabel.HIGH,
      label: 'High',
      coloer: 'bg-red-200 text-red-800'
    },
    dueDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    tags: ['testing', 'work', 'unit-tests']
  },
  {
    text: 'Update documentation',
    completed: true,
    category: 'Work',
    priority: {
      value: PriorityLabel.MEDIUM,
      label: 'Medium',
      coloer: 'bg-yellow-200 text-yellow-800'
    },
    dueDate: undefined,
    tags: ['documentation', 'work']
  },
  {
    text: 'Buy running shoes',
    completed: false,
    category: 'Shopping',
    priority: {
      value: PriorityLabel.LOW,
      label: 'Low',
      coloer: 'bg-gray-200 text-gray-800'
    },
    dueDate: undefined,
    tags: ['shopping', 'sports']
  },
  {
    text: 'Read Angular security best practices',
    completed: false,
    category: 'Learning',
    priority: {
      value: PriorityLabel.MEDIUM,
      label: 'Medium',
      coloer: 'bg-yellow-200 text-yellow-800'
    },
    dueDate: undefined,
    tags: ['angular', 'security', 'learning']
  }
];
