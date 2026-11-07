import { expect, test } from '@playwright/test';

test.describe('FORNIX Phase 1 shell', () => {
  test('login page renders and registers a user into the shell', async ({
    page,
  }) => {
    const email = `ui_${Date.now()}@example.com`;

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    await page.getByLabel('Display name').fill('UI Tester');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 15_000 });
    await expect(page.getByText('FORNIX').first()).toBeVisible();
  });

  test('login page is usable on a phone-sized viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});

