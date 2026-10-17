import { test, expect, type Page } from '@playwright/test';
import { installTauriFixture } from './tauriFixture';

async function expandNode(page: Page, label: string) {
    const item = page.getByRole('tree').getByRole('treeitem')
        .filter({ has: page.getByText(label, { exact: true }) }).last();
    await item.locator('button').first().click();
}

test('opens a nested CYBOL file, edits a value, and keeps XML and table views in sync', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await installTauriFixture(page);
    await page.goto('/');
    await page.getByText('Demo project', { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Editor', exact: true })).toBeVisible();
    await expandNode(page, 'Demo project');
    await expandNode(page, 'models');
    await expect(page.getByRole('tree').getByText('loop', { exact: true })).toHaveCount(0);
    await page.getByRole('tree').getByText('hello.cybol', { exact: true }).click();
    await expect(page.getByRole('cell', { name: 'first', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'second', exact: true })).toBeVisible();

    await page.getByRole('cell', { name: 'first', exact: true }).click();
    const input = page.getByRole('cell').getByRole('textbox').first();
    await input.fill('renamed');
    await input.press('Tab');
    await expect.poll(() => page.evaluate(() => window.__CYBOLE_TEST__.writes.slice(-1)[0]?.content)).toContain('name="renamed"');

    await page.locator('.p-dropdown-label').filter({ hasText: /^DataTable$/ }).click();
    await page.getByRole('option', { name: 'XML', exact: true }).click();
    await expect(page.locator('.xonomy').getByText('renamed', { exact: true })).toBeVisible();
    await expect(page.locator('.xonomy').getByText('second', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
});

test('validates project creation, handles dialog cancellation, and remembers a new project', async ({ page }) => {
    await installTauriFixture(page, { projects: [], dialogResults: [null, '/fixtures/demo'] });
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Project', exact: true }).click();
    await expect(page.getByText('You need to specify a name for the project', { exact: true })).toBeVisible();
    await expect(page.getByText('Please select an existing directory.', { exact: true })).toBeVisible();
    await page.getByPlaceholder('Project Name', { exact: true }).fill('New project');
    const directory = page.getByLabel('project-directory-input');
    await directory.click();
    await expect(directory).toBeEnabled();
    await expect(directory).toHaveValue('');
    await directory.click();
    await expect(directory).toHaveValue('/fixtures/demo');
    await page.getByRole('button', { name: 'Create Project', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Editor', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Back To Project Selection' }).click();
    await expect(page.getByText('New project', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('New project', { exact: true })).toBeVisible();
});

test('removes a recent project and retains the change after reload', async ({ page }) => {
    await installTauriFixture(page);
    await page.goto('/');
    await expect(page.getByText('Demo project', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByText('Demo project', { exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.getByText('Demo project', { exact: true })).toHaveCount(0);
    await expect(page.getByText('No available options', { exact: true })).toBeVisible();
});

test('selects and saves the interpreter path', async ({ page }) => {
    await installTauriFixture(page, { dialogResults: ['/fixtures/cyboi'] });
    await page.goto('/');
    await page.getByRole('menuitem', { name: 'Settings', exact: true }).click();
    await page.getByLabel('Path to Cybop', { exact: true }).click();
    await expect(page.getByLabel('Path to Cybop', { exact: true })).toHaveValue('/fixtures/cyboi');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('cybole-browser-test-settings'))).toContain('/fixtures/cyboi');
    await page.reload();
    await expect(page.getByLabel('Path to Cybop', { exact: true })).toHaveValue('/fixtures/cyboi');
});

test('shows a storage failure without crashing the project screen', async ({ page }) => {
    await installTauriFixture(page, { storeError: 'Settings unavailable' });
    await page.goto('/');
    await expect(page.getByRole('alert')).toContainText('Settings unavailable');
    await expect(page.getByRole('button', { name: 'Create Project', exact: true })).toBeVisible();
});
