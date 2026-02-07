# Angular Todo App

A modern, fully-featured Todo application built with **Angular 21** showcasing the latest best practices including **Signals**, **OnPush change detection**, **Standalone components**, and **Control flow syntax**.

## 🎯 Features

- ✅ **Add todos** with real-time updates
- ✅ **Mark todos complete/incomplete** with visual feedback
- ✅ **Delete individual todos** with confirmation-free action
- ✅ **Clear all completed todos** in one click
- ✅ **Active todo counter** automatically updates
- ✅ **Persistent storage** using browser localStorage
- ✅ **Page reload preservation** - todos restored from storage
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Keyboard support** - Press Enter to add todos

## 🏗️ Technology Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Angular** | Frontend framework | 21 |
| **TypeScript** | Language | 5.x |
| **Tailwind CSS** | Styling | 3.x |
| **Signals** | State management | Angular 21 native |
| **Vitest** | Unit testing | Latest |
| **Playwright** | E2E testing | Latest |
| **localStorage** | Data persistence | Browser API |

## 🎨 Modern Angular Features

This application demonstrates Angular 21 best practices:

### 1. **Signals-Based State Management**
- Replaced RxJS `BehaviorSubject` with native `signal()`
- Uses `computed()` for derived state (active todos count)
- Automatic change detection at signal updates

### 2. **Standalone Components** 
- No NgModules - components are self-contained
- Simplified dependency injection with `inject()`

### 3. **OnPush Change Detection**
- Set on `@Component` decorator for performance
- Only updates when inputs/signals change

### 4. **Modern Control Flow**
- Uses `@for` instead of `*ngFor`
- `@if` and `@switch` available (future-proof syntax)

### 5. **Immutable State Updates**
- Uses `.update()` and `.set()` instead of mutations
- Readonly signals with `.asReadonly()`

## 📁 Project Structure

```
src/
├── app/
│   ├── app.ts                 # Main application component
│   ├── app.routes.ts          # Route definitions
│   ├── component/
│   │   └── todo/
│   │       ├── todo.ts        # TodoComponent with Signals
│   │       └── todo.spec.ts   # Component unit tests
│   ├── service/
│   │   ├── todo.ts            # TodoService with Signals
│   │   └── todo.spec.ts       # Service unit tests
│   └── models/
│       └── todo.model.ts      # TodoItem interface
├── main.ts                    # Application bootstrap
├── styles.scss                # Global styles
└── index.html                 # Entry HTML
e2e/
└── todo.spec.ts               # Playwright e2e tests
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd todo-app_Angular

# Install dependencies
npm install
```

### Development Server

```bash
# Start development server
npm run start

# Navigate to http://localhost:4200
# The app reloads automatically on file changes
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Output is in dist/
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run tests for specific file
npx vitest run src/app/service/todo.spec.ts
npx vitest run src/app/component/todo/todo.spec.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:ui
```

**Test Coverage:**
- **TodoService**: 19 tests - CRUD operations, state management, localStorage persistence
- **TodoComponent**: 20 tests - signal binding, computed values, user interactions
- **Total**: 42 unit tests (100% passing ✅)

### End-to-End Tests (Playwright)

```bash
# Run all e2e tests
npx playwright test

# Run specific test file
npx playwright test e2e/todo.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

**E2E Coverage:**
- 14 tests covering user workflows
- Add, edit, delete, complete, persist operations
- localStorage persistence across page reloads
- HTML report: `playwright-report/index.html`

## 📋 API Reference

### TodoService
Located in `src/app/service/todo.ts`

```typescript
// Get readonly signal of todos
getTodos(): ReadonlySignal<TodoItem[]>

// Add a new todo
addTodo(text: string): void

// Toggle completion status
toggleTodo(id: number): void

// Delete a todo by id
deleteTodo(id: number): void

// Clear all completed todos
clearCompleted(): void
```

### TodoComponent
Located in `src/app/component/todo/todo.ts`

**Public Properties:**
- `todos` - Readonly signal of current todos
- `newTodoText` - Writable signal for form input
- `activeTodosCount` - Computed signal of incomplete todos

**Public Methods:**
- `addTodo()` - Add a new todo from form input
- `toggleTodo(id)` - Toggle todo completion status
- `deleteTodo(id)` - Delete a todo
- `clearCompleted()` - Remove all completed todos

## 💾 Data Model

```typescript
interface TodoItem {
  id: number;                // Unique identifier (timestamp + counter)
  text: string;              // Todo description
  completed: boolean;        // Completion status
}
```

## 🔄 Data Persistence

Todos are automatically persisted to browser `localStorage` at key `'todos'` with JSON format:

```json
[
  { "id": 1708450000123, "text": "Buy groceries", "completed": false },
  { "id": 1708450000124, "text": "Walk the dog", "completed": true }
]
```

Persistence triggers on every:
- Add todo
- Toggle completion
- Delete todo
- Clear completed

## 🎓 Learning Resources

This project is excellent for learning:

- **Angular Signals**: Modern reactive state without RxJS
- **Standalone Components**: Simplified Angular architecture
- **Vitest**: Fast unit testing in Angular
- **Playwright**: Enterprise-grade e2e testing
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Strict type safety

## 📝 Code Examples

### Using Signals in a Component

```typescript
import { signal, computed } from '@angular/core';

export class MyComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}
```

### Template with Signals

```html
<p>Count: {{ count() }}</p>
<p>Doubled: {{ doubled() }}</p>
<button (click)="increment()">Increment</button>

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

## ⚡ Performance Optimizations

- ✅ OnPush change detection strategy
- ✅ Signals for fine-grained reactivity
- ✅ Standalone components (smaller bundle)
- ✅ Tree-shakeable code
- ✅ No unnecessary subscriptions

## 🐛 Debugging

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Sources tab to set breakpoints
3. Console to inspect signal values: `ng.probe($0).componentInstance.todos()`

### VSCode Debugging
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

## 📚 Additional Resources

- [Angular 21 Documentation](https://angular.dev)
- [Signals Guide](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/standalone-components)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

MIT

## 👤 Author

Created as a modern Angular reference application showcasing Angular 21 best practices.

---

**Happy coding!** 🚀
