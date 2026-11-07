import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'test-results', 'ui-ux-audit');
const email = `audit_${Date.now()}@example.com`;
const password = 'password123';

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage: true,
  });
}

async function registerAndLand(page: Page) {
  await page.goto('/register');
  await page.getByRole('textbox', { name: 'Display name' }).fill('Audit User');
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.locator('input[formcontrolname="password"]').fill(password);
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/($|\?)/, { timeout: 15_000 });
}


test.describe('UI/UX audit crawl', () => {
  test.beforeAll(() => {
    mkdirSync(OUT, { recursive: true });
  });

  test('desktop crawl', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto('/login');
    await shot(page, '01-login-desktop');

    await page.goto('/register');
    await shot(page, '02-register-desktop');

    await registerAndLand(page);
    await page.waitForTimeout(600);
    await shot(page, '03-dashboard-empty-desktop');

    // Seed via UI: create research
    await page.goto('/research/new');
    await shot(page, '04-research-form-desktop');
    await page.getByLabel(/title/i).fill('SPI flash dump review');
    const desc = page.getByLabel(/description/i);
    if (await desc.count()) {
      await desc.fill('Looking at vendor firmware layout.');
    }
    await page.getByRole('button', { name: /create|save/i }).first().click();
    await page.waitForURL(/\/research\//, { timeout: 15_000 });
    await shot(page, '05-research-detail-desktop');

    await page.goto('/projects');
    await shot(page, '06-projects-list-desktop');

    await page.goto('/projects/new');
    await page.getByLabel(/title/i).fill('Flash tool harness');
    await page.getByRole('button', { name: /create|save/i }).first().click();
    await page.waitForURL(/\/projects\//, { timeout: 15_000 });
    await shot(page, '07-project-detail-desktop');

    await page.goto('/checkpoints');
    await shot(page, '08-checkpoints-list-desktop');

    await page.goto('/checkpoints/new');
    await shot(page, '09-checkpoint-form-desktop');
    // parent may need select - fill title at least
    await page.getByLabel(/^title$/i).fill('Read JEDEC ID');
    const parentType = page.locator('mat-select').first();
    if (await parentType.count()) {
      await parentType.click();
      await page.getByRole('option', { name: /research/i }).click();
      const parent = page.locator('mat-select').nth(1);
      await parent.click();
      await page.getByRole('option').first().click();
    }
    await page.getByRole('button', { name: /create|save/i }).first().click();
    await page.waitForTimeout(1200);
    await shot(page, '10-checkpoint-after-create-desktop');

    await page.goto('/docs');
    await shot(page, '11-docs-list-desktop');

    await page.goto('/docs/new');
    await shot(page, '12-docs-form-desktop');
    await page.getByLabel(/title/i).fill('U-Boot notes');
    await page.getByRole('button', { name: /create|save/i }).first().click();
    await page.waitForURL(/\/docs\//, { timeout: 15_000 });
    await shot(page, '13-docs-detail-desktop');

    await page.goto('/search?q=SPI');
    await shot(page, '14-search-desktop');

    await page.goto('/archive');
    await shot(page, '15-archive-desktop');

    await page.goto('/');
    await page.waitForTimeout(500);
    await shot(page, '16-dashboard-filled-desktop');
  });

  test('mobile crawl', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/login');
    await shot(page, 'm01-login-mobile');

    await page.goto('/register');
    await page.getByRole('textbox', { name: 'Display name' }).fill('Mobile Audit');
    await page.getByRole('textbox', { name: 'Email' }).fill(`m_${email}`);
    await page.locator('input[formcontrolname="password"]').fill(password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 15_000 });
    await page.waitForTimeout(500);
    await shot(page, 'm02-dashboard-mobile');

    await page.goto('/research');
    await shot(page, 'm03-research-list-mobile');

    await page.goto('/search');
    await shot(page, 'm04-search-mobile');

    // bottom nav visible?
    const mobileNav = page.getByRole('navigation', { name: /mobile/i });
    await expect(mobileNav).toBeVisible();
    await shot(page, 'm05-mobile-nav');
  });
});
