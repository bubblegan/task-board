import { test, expect } from "@playwright/test";
import { mockData } from "./mock/board-response";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/boards", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockData),
    });
  });
  await page.goto("http://localhost:3000");
});

test('open "Create Board" modal', async ({ page }) => {
  // Click the button with text "Create Board"
  await page.click('text="Create Board"');

  // Wait for the modal title to appear
  const modalTitle = page.locator('h2:has-text("Create Board")');

  // Assert that the modal title is visible
  await expect(modalTitle).toBeVisible();
});

test('open "Create Task" modal', async ({ page }) => {
  // Click the button with text "Create Board"
  await page.click('text="Create Task"');

  // Wait for the modal title to appear
  const modalTitle = page.locator('h2:has-text("Create Task")');

  // Assert that the modal title is visible
  await expect(modalTitle).toBeVisible();
});

test("It renders the board", async ({ page }) => {
  const todoTitle = await page.locator("text=Todo");
  const doneTitle = await page.locator("text=Done");
  const inProgressTitle = await page.locator("text=In Progress");

  await expect(todoTitle).toBeVisible();
  await expect(doneTitle).toBeVisible();
  await expect(inProgressTitle).toBeVisible();

  const taskCards = page.locator('[data-testid="task-card"]');
  const count = await taskCards.count();

  // Verify the count matches the number of tasks in the mock data
  expect(count).toBe(10);
});
