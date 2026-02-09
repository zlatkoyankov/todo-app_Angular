import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoPriority } from './todo-priority';
import { PriorityLabel } from '../../models/priority.model';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { By } from '@angular/platform-browser';

describe('TodoPriority', () => {
  let fixture: ComponentFixture<TodoPriority>;
  let component: TodoPriority;

  beforeEach(async () => {
    localStorage.clear();
    (globalThis as any).process = { env: { VITEST: 'true' } };

    await TestBed.configureTestingModule({
      imports: [TodoPriority]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoPriority);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render priority buttons including "All"', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    // One extra for the "All" button
    expect(buttons.length).toBe(component.priorities.length + 1);
  });

  it('should mark "All" as pressed when no selected priorities', () => {
    component.selectedPriority = (() => []) as any;
    fixture.detectChanges();

    const allButton = fixture.debugElement.query(By.css('div > button'))?.nativeElement as HTMLButtonElement;
    expect(allButton).toBeTruthy();
    expect(allButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('should report priority selected via selectedPriority()', () => {
    const selectedValue = PriorityLabel.HIGH;
    component.selectedPriority = (() => [selectedValue]) as any;
    fixture.detectChanges();

    expect(component.selectedPriority().includes(selectedValue)).toBe(true);
  });

  it('should emit the priority value when a priority button is clicked', () => {
    const targetPriority = PriorityLabel.MEDIUM;
    const emitSpy = vi.spyOn(component.prioritySelected, 'emit');

    // find button with the priority label "Medium"
    const btnDebug = fixture.debugElement.queryAll(By.css('button')).find(d => d.nativeElement.textContent.trim() === 'Medium');
    expect(btnDebug).toBeTruthy();

    btnDebug!.triggerEventHandler('click', null);
    expect(emitSpy).toHaveBeenCalledWith(targetPriority);
  });

  it('should emit "All" when "All" button is clicked', () => {
    const emitSpy = vi.spyOn(component.prioritySelected, 'emit');

    const allButton = fixture.debugElement.query(By.css('div > button'));
    allButton?.triggerEventHandler('click', null);

    expect(emitSpy).toHaveBeenCalledWith('All');
  });
});
