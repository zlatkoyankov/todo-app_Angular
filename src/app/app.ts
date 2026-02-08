import { Component, signal } from '@angular/core';
import { TodoComponent } from './components/todo/todo';


@Component({
  selector: 'app-root',
  imports: [TodoComponent],
  template: '<app-todo></app-todo>',
  styles: []
})
export class App {
  protected readonly title = signal('todo-app');
}
