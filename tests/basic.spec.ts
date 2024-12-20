import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
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
