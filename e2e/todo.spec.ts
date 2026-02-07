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
    await page.waitForSelector('input[placeholder="What needs to be done?"]');
  });

  test('should display the todo app header and empty list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Angular Todo App');
    const todoItems = page.locator('li');
    await expect(todoItems).toHaveCount(0);
  });

  test('should add a new todo', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add first todo
    await input.fill('Buy groceries');
    await addButton.click();

    // Verify todo was added
    const todoItems = page.locator('li');
    await expect(todoItems).toHaveCount(1);
    await expect(page.locator('li')).toContainText('Buy groceries');

    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should add multiple todos', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    const todos = ['Buy groceries', 'Walk the dog', 'Write a test'];
    for (const todo of todos) {
      await input.fill(todo);
      await addButton.click();
    }

    // Verify all todos were added
    const todoItems = page.locator('li');
    await expect(todoItems).toHaveCount(3);

    for (const todo of todos) {
      await expect(page.locator(`li:has-text("${todo}")`)).toBeVisible();
    }
  });

  test('should not add empty todo', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Try to add empty todo
    await addButton.click();

    // Verify no todo was added
    const todoItems = page.locator('li');
    await expect(todoItems).toHaveCount(0);
  });

  test('should add todo when pressing Enter', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');

    // Type and press Enter
    await input.fill('Buy milk');
    await input.press('Enter');

    // Verify todo was added
    const todoItems = page.locator('li');
    await expect(todoItems).toHaveCount(1);
    await expect(page.locator('li')).toContainText('Buy milk');

    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should toggle todo completion status', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add a todo
    await input.fill('Complete this task');
    await addButton.click();

    // Get the checkbox
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
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add a todo
    await input.fill('Delete me');
    await addButton.click();

    // Verify todo was added
    await expect(page.locator('li')).toHaveCount(1);

    // Delete the todo
    const deleteButton = page.locator('button[title="Delete"]');
    await deleteButton.click();

    // Verify todo was deleted
    await expect(page.locator('li')).toHaveCount(0);
  });

  test('should delete specific todo from multiple todos', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add multiple todos
    const todos = ['First', 'Second', 'Third'];
    for (const todo of todos) {
      await input.fill(todo);
      await addButton.click();
    }

    // Verify all todos were added
    await expect(page.locator('li')).toHaveCount(3);

    // Delete the middle todo
    const deleteButtons = page.locator('button[title="Delete"]');
    await deleteButtons.nth(1).click();

    // Verify only 2 todos remain
    await expect(page.locator('li')).toHaveCount(2);
    await expect(page.locator('li').filter({ hasText: 'First' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Third' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Second' })).not.toBeVisible();
  });

  test('should display active todos count', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add todos
    await input.fill('Todo 1');
    await addButton.click();
    await input.fill('Todo 2');
    await addButton.click();
    await input.fill('Todo 3');
    await addButton.click();

    // Check count shows 3 items left
    await expect(page.locator('div.text-gray-600').getByText('3 items left')).toBeVisible();

    // Complete one todo
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.click();

    // Check count shows 2 items left
    await expect(page.locator('div.text-gray-600').getByText('2 items left')).toBeVisible();

    // Complete another
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).click();

    // Check count shows 1 item left
    await expect(page.locator('div.text-gray-600').getByText('1 item left')).toBeVisible();
  });

  test('should clear completed todos', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add multiple todos
    const todos = ['Keep me', 'Completed 1', 'Completed 2', 'Keep me too'];
    for (const todo of todos) {
      await input.fill(todo);
      await addButton.click();
    }

    // Complete some todos
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).click(); // Complete "Completed 1"
    await checkboxes.nth(2).click(); // Complete "Completed 2"

    // Click clear completed
    const clearButton = page.locator('button', { hasText: 'Clear completed' });
    await clearButton.click();

    // Verify only uncompleted todos remain
    const todoItems = page.locator('li');
    await expect(todoItems).toHaveCount(2);
    await expect(page.locator('li').filter({ hasText: 'Keep me' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Keep me too' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Completed 1' })).not.toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Completed 2' })).not.toBeVisible();
  });

  test('should persist todos to localStorage', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add a todo
    await input.fill('Persistent todo');
    await addButton.click();

    // Verify localStorage contains the todo
    const storedTodos = await page.evaluate(() => localStorage.getItem('todos'));
    expect(storedTodos).toBeTruthy();
    const parsed = JSON.parse(storedTodos!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].text).toBe('Persistent todo');
  });

  test('should load todos from localStorage on page reload', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add todos
    await input.fill('Todo 1');
    await addButton.click();
    await input.fill('Todo 2');
    await addButton.click();

    // Complete one todo
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.click();

    // Reload page
    await page.reload();

    // Wait for app to load
    await page.waitForSelector('li');

    // Verify todos are restored
    const todoItems = page.locator('li');
    await expect(todoItems).toHaveCount(2);

    // Verify completion state is preserved
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes.first()).toBeChecked();
    await expect(checkboxes.nth(1)).not.toBeChecked();
  });

  test('should handle rapid todo operations', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add 5 todos quickly
    for (let i = 1; i <= 5; i++) {
      await input.fill(`Task ${i}`);
      await addButton.click();
    }

    // Verify all were added
    await expect(page.locator('li')).toHaveCount(5);

    // Toggle and delete various todos
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(2).click();
    await checkboxes.nth(4).click();

    // Delete first todo
    const deleteButtons = page.locator('button[title="Delete"]');
    await deleteButtons.first().click();

    // Verify state is correct
    await expect(page.locator('li')).toHaveCount(4);
    await expect(page.locator('div.text-gray-600').getByText('2 items left')).toBeVisible();
  });

  test('should maintain todo order', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button', { hasText: 'Add' });

    // Add todos in specific order
    const todos = ['Alpha', 'Beta', 'Gamma', 'Delta'];
    for (const todo of todos) {
      await input.fill(todo);
      await addButton.click();
    }

    // Verify todos appear in the correct order
    const todoTexts = await page.locator('li span').allTextContents();
    const trimmedTexts = todoTexts.map(text => text.trim());
    expect(trimmedTexts).toEqual(todos);
  });
});
