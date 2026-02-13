import { test, expect } from '@playwright/test';

test.describe('Todo App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app first
    await page.goto('/');
    // Now clear localStorage (only works after navigation)
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    // Reload the page to reflect cleared storage
    await page.reload();
    // Wait for the app to load
    await page.waitForSelector('h1:has-text("Advanced Angular Todo App")');
  });

  test('should display the todo app header and empty list message', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Advanced Angular Todo App');
    // The empty state message
    await expect(page.getByText('No tasks found')).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    // Click Add Todo button to open modal
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    // Wait for modal to appear
    await page.waitForSelector('form[role="form"][aria-label="Todo form"]');
    
    // Fill in the task field
    const taskInput = page.locator('input#todo-text');
    await taskInput.fill('Buy groceries');
    
    // Submit the form (use the submit button inside the form)
    await page.locator('form button[type="submit"]').click();
    
    // Wait for modal to close and todo to appear
    await page.waitForSelector('li', { state: 'visible' });
    
    // Verify todo was added
    const todoItems = page.locator('ul.divide-y li');
    await expect(todoItems).toHaveCount(1);
    await expect(page.locator('li')).toContainText('Buy groceries');
    
    // Verify modal is closed
    await expect(page.locator('form[role="form"]')).not.toBeVisible();
  });

  test('should add multiple todos', async ({ page }) => {
    const todos = ['Buy groceries', 'Walk the dog', 'Write a test'];
    
    for (const todo of todos) {
      // Open modal
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      
      // Fill and submit
      await page.locator('input#todo-text').fill(todo);
      await page.locator('form button[type="submit"]').click();
      
      // Wait for modal to close
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Verify all todos were added
    const todoItems = page.locator('ul.divide-y li');
    await expect(todoItems).toHaveCount(3);

    for (const todo of todos) {
      await expect(page.locator(`li:has-text("${todo}")`)).toBeVisible();
    }
  });

  test('should not add empty todo', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');

    // Try to submit without filling the task field
    // The submit button should be disabled for empty/invalid input
    const submitButton = page.locator('form button[type="submit"]');
    
    // Submit button should be disabled for empty input
    await expect(submitButton).toBeDisabled();
    
    // Cancel the modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify no todo was added
    await expect(page.getByText('No tasks found')).toBeVisible();
  });

  test('should add todo when pressing Enter in form', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');

    // Type and submit
    const taskInput = page.locator('input#todo-text');
    await taskInput.fill('Buy milk');
    await page.locator('form button[type="submit"]').click();

    // Wait for modal to close and todo to appear
    await page.waitForSelector('li', { state: 'visible' });

    // Verify todo was added
    const todoItems = page.locator('ul.divide-y li');
    await expect(todoItems).toHaveCount(1);
    await expect(page.locator('li')).toContainText('Buy milk');
  });

  test('should toggle todo completion status', async ({ page }) => {
    // Add a todo first
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');
    await page.locator('input#todo-text').fill('Complete this task');
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('li', { state: 'visible' });

    // Get the checkbox and todo text
    const checkbox = page.locator('input[type="checkbox"]').first();
    const todoText = page.locator('li span').first();

    // Initially should not be checked
    await expect(checkbox).not.toBeChecked();
    await expect(todoText).not.toHaveClass(/line-through/);

    // Toggle completion
    await checkbox.click();

    // Should now be checked and have line-through
    await expect(checkbox).toBeChecked();
    await expect(todoText).toHaveClass(/line-through/);

    // Toggle back
    await checkbox.click();

    // Should be unchecked and no line-through
    await expect(checkbox).not.toBeChecked();
    await expect(todoText).not.toHaveClass(/line-through/);
  });

  test('should delete a todo', async ({ page }) => {
    // Add a todo
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');
    await page.locator('input#todo-text').fill('Delete me');
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('li', { state: 'visible' });

    // Verify todo was added
    await expect(page.locator('ul.divide-y li')).toHaveCount(1);

    // Delete the todo
    const deleteButton = page.locator('button[title="Delete"]');
    await deleteButton.click();

    // Verify todo was deleted
    await expect(page.getByText('No tasks found')).toBeVisible();
  });

  test('should delete specific todo from multiple todos', async ({ page }) => {
    // Add multiple todos
    const todos = ['First', 'Second', 'Third'];
    for (const todo of todos) {
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      await page.locator('input#todo-text').fill(todo);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Verify all todos were added
    await expect(page.locator('ul.divide-y li')).toHaveCount(3);

    // Delete the middle todo
    const deleteButtons = page.locator('button[title="Delete"]');
    await deleteButtons.nth(1).click();

    // Verify only 2 todos remain
    await expect(page.locator('ul.divide-y li')).toHaveCount(2);
    await expect(page.locator('li').filter({ hasText: 'First' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Third' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Second' })).not.toBeVisible();
  });

  test('should display active todos count', async ({ page }) => {
    // Add todos
    const todos = ['Todo 1', 'Todo 2', 'Todo 3'];
    for (const todo of todos) {
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      await page.locator('input#todo-text').fill(todo);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Check count shows 3 items left
    await expect(page.getByText('3 items left')).toBeVisible();

    // Complete one todo
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.click();

    // Check count shows 2 items left
    await expect(page.getByText('2 items left')).toBeVisible();

    // Complete another
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).click();

    // Check count shows 1 item left
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('should clear completed todos', async ({ page }) => {
    // Add multiple todos
    const todos = ['Keep me', 'Completed 1', 'Completed 2', 'Keep me too'];
    for (const todo of todos) {
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      await page.locator('input#todo-text').fill(todo);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Complete some todos
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).click(); // Complete "Completed 1"
    await checkboxes.nth(2).click(); // Complete "Completed 2"

    // Click clear completed
    const clearButton = page.getByRole('button', { name: 'Clear completed' });
    await clearButton.click();

    // Verify only uncompleted todos remain
    const todoItems = page.locator('ul.divide-y li');
    await expect(todoItems).toHaveCount(2);
    // Check that the remaining todos contain the expected text
    const remainingTasks = await todoItems.allTextContents();
    expect(remainingTasks.some(text => text.includes('Keep me') && !text.includes('too'))).toBeTruthy();
    expect(remainingTasks.some(text => text.includes('Keep me too'))).toBeTruthy();
    // Verify completed todos are not visible
    await expect(page.locator('li').filter({ hasText: 'Completed 1' })).not.toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Completed 2' })).not.toBeVisible();
  });

  test('should persist todos to localStorage', async ({ page }) => {
    // Add a todo
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');
    await page.locator('input#todo-text').fill('Persistent todo');
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('li', { state: 'visible' });

    // Verify localStorage contains the todo
    const storedTodos = await page.evaluate(() => localStorage.getItem('todos'));
    expect(storedTodos).toBeTruthy();
    const parsed = JSON.parse(storedTodos!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].text).toBe('Persistent todo');
  });

  test('should load todos from localStorage on page reload', async ({ page }) => {
    // Add todos
    const todos = ['Todo 1', 'Todo 2'];
    for (const todo of todos) {
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      await page.locator('input#todo-text').fill(todo);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Complete one todo
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.click();

    // Reload page
    await page.reload();

    // Wait for app to load
    await page.waitForSelector('li');

    // Verify todos are restored
    const todoItems = page.locator('ul.divide-y li');
    await expect(todoItems).toHaveCount(2);

    // Verify completion state is preserved
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes.first()).toBeChecked();
    await expect(checkboxes.nth(1)).not.toBeChecked();
  });

  test('should handle rapid todo operations', async ({ page }) => {
    // Add 5 todos quickly
    for (let i = 1; i <= 5; i++) {
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      await page.locator('input#todo-text').fill(`Task ${i}`);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Verify all were added
    await expect(page.locator('ul.divide-y li')).toHaveCount(5);

    // Toggle and delete various todos
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(2).click();
    await checkboxes.nth(4).click();

    // Delete first todo
    const deleteButtons = page.locator('button[title="Delete"]');
    await deleteButtons.first().click();

    // Verify state is correct
    await expect(page.locator('ul.divide-y li')).toHaveCount(4);
    await expect(page.getByText('2 items left')).toBeVisible();
  });

  test('should maintain todo order', async ({ page }) => {
    // Add todos in specific order
    const todos = ['Alpha', 'Beta', 'Gamma', 'Delta'];
    for (const todo of todos) {
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      await page.locator('input#todo-text').fill(todo);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Verify todos appear in the correct order
    const todoElements = page.locator('ul.divide-y li');
    const count = await todoElements.count();
    expect(count).toBe(todos.length);
    
    // Check that todos are displayed
    for (let i = 0; i < todos.length; i++) {
      await expect(todoElements.nth(i)).toContainText(todos[i]);
    }
  });

  test('should search todos by text', async ({ page }) => {
    // Add multiple todos
    const todos = ['Buy groceries', 'Write code', 'Buy books', 'Read documentation'];
    for (const todo of todos) {
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      await page.locator('input#todo-text').fill(todo);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Search for "Buy"
    const searchInput = page.locator('input[placeholder="Search tasks..."]');
    await searchInput.fill('Buy');

    // Should show only 2 todos
    await expect(page.locator('ul.divide-y li')).toHaveCount(2);
    await expect(page.locator('li').filter({ hasText: 'Buy groceries' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Buy books' })).toBeVisible();

    // Clear search
    await searchInput.clear();
    await expect(page.locator('ul.divide-y li')).toHaveCount(4);
  });

  test('should filter todos by category', async ({ page }) => {
    // Add todos with different categories
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');
    await page.locator('input#todo-text').fill('Work task');
    await page.locator('select#category-select').selectOption('Work');
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('form[role="form"]', { state: 'hidden' });

    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');
    await page.locator('input#todo-text').fill('Personal task');
    await page.locator('select#category-select').selectOption('Personal');
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('form[role="form"]', { state: 'hidden' });

    // Filter by Work category
    await page.locator('button', { hasText: 'Work' }).click();
    
    // Should show only work task
    await expect(page.locator('ul.divide-y li')).toHaveCount(1);
    await expect(page.locator('li').filter({ hasText: 'Work task' })).toBeVisible();

    // Click All to show all todos
    await page.locator('button', { hasText: 'All' }).first().click();
    await expect(page.locator('ul.divide-y li')).toHaveCount(2);
  });

  test('should edit an existing todo', async ({ page }) => {
    // Add a todo
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');
    await page.locator('input#todo-text').fill('Original task');
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('form[role="form"]', { state: 'hidden' });

    // Click edit button
    await page.locator('button[title="Edit"]').click();
    await page.waitForSelector('form[role="form"]');

    // Verify form is in edit mode
    await expect(page.getByText('Edit Todo')).toBeVisible();

    // Update category
    await page.locator('select#category-select').selectOption('Personal');
    
    // Update priority
    await page.locator('select#priority-select').selectOption('High');

    // Submit update (use the submit button)
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('form[role="form"]', { state: 'hidden' });

    // Verify changes (check for Personal category badge and High priority badge)
    await expect(page.locator('li').filter({ hasText: 'Original task' })).toBeVisible();
    await expect(page.locator('span.bg-blue-100:has-text("Personal")')).toBeVisible();
    await expect(page.locator('span:has-text("High")')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    // Add and complete some todos
    const todos = ['Task 1', 'Task 2', 'Task 3'];
    for (const todo of todos) {
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await page.waitForSelector('input#todo-text');
      await page.locator('input#todo-text').fill(todo);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('form[role="form"]', { state: 'hidden' });
    }

    // Check statistics
    await expect(page.locator('div.text-2xl.text-blue-600:has-text("3")')).toBeVisible(); // Total
    await expect(page.locator('div.text-2xl.text-green-600:has-text("3")')).toBeVisible(); // Active

    // Complete one todo
    await page.locator('input[type="checkbox"]').first().click();

    // Check updated statistics
    await expect(page.locator('div.text-2xl.text-green-600:has-text("2")')).toBeVisible(); // Active
    await expect(page.locator('div.text-2xl.text-purple-600:has-text("1")')).toBeVisible(); // Completed
  });

  test('should cancel form without saving changes', async ({ page }) => {
    // Open add todo modal
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await page.waitForSelector('input#todo-text');

    // Fill in some data
    await page.locator('input#todo-text').fill('This should not be saved');

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal is closed and no todo was added
    await expect(page.locator('form[role="form"]')).not.toBeVisible();
    await expect(page.getByText('No tasks found')).toBeVisible();
  });
});
