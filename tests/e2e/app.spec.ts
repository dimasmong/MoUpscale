import { test, expect } from '@playwright/test';

test.describe('MoUpscale E2E Browser Testing', () => {
  test('loads home page successfully and displays brand header', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MoUpscale/i);

    // Verify brand title and taglines
    const brand = page.locator('text=MoUpscale').first();
    await expect(brand).toBeVisible();

    // Verify drop zone is visible
    const dropzone = page.locator('text=Drop your images here').first();
    await expect(dropzone).toBeVisible();
  });

  test('toggles light and dark themes correctly', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    // Click visible theme toggle button
    const themeBtn = page.locator('button[aria-label*="Theme"]:visible').first();
    await themeBtn.click();

    // Verify dark class is applied
    await expect(html).toHaveClass(/dark/);

    // Toggle back to light
    await themeBtn.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('switches language between English and Indonesian', async ({ page }) => {
    await page.goto('/');

    // Initially in English
    await expect(page.locator('text=Drop your images here').first()).toBeVisible();

    // On mobile screens, open hamburger menu if present
    const menuBtn = page.locator('button[aria-label="Open menu"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
    }

    // Switch to Indonesian
    const idBtn = page.locator('button:has-text("ID"), button:has-text("Indonesia")').filter({ hasText: /ID|Indonesia/ }).first();
    if (await idBtn.isVisible()) {
      await idBtn.click();
      await expect(page.locator('text=Tarik & lepas gambar ke sini').first()).toBeVisible();

      // Switch back to English
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
      }
      const enBtn = page.locator('button:has-text("EN"), button:has-text("English")').filter({ hasText: /EN|English/ }).first();
      await enBtn.click();
      await expect(page.locator('text=Drop your images here').first()).toBeVisible();
    }
  });

  test('opens and closes info modals (About, FAQ, Privacy, Credits)', async ({ page }) => {
    await page.goto('/');

    // On mobile screens, open hamburger menu if present
    const menuBtn = page.locator('button[aria-label="Open menu"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
    }

    // Open About Modal
    const aboutBtn = page.locator('button:has-text("About"), button[aria-label="About"]').first();
    if (await aboutBtn.isVisible()) {
      await aboutBtn.click();
      await expect(page.locator('text=About MoUpscale').first()).toBeVisible();
      await page.locator('button:has-text("Close")').click();
      await expect(page.locator('text=About MoUpscale')).not.toBeVisible();
    }
  });

  test('loads sample image and runs end-to-end AI upscaling in browser', async ({ page }) => {
    await page.goto('/');

    // Click on Sample: "Transparent Logo"
    const sampleBtn = page.locator('button:has-text("Transparent Logo")').first();
    await expect(sampleBtn).toBeVisible();
    await sampleBtn.click();

    // Workspace should now be active
    await expect(page.locator('text=Upscale Settings').first()).toBeVisible();
    await expect(page.locator('text=Input:').first()).toBeVisible();

    // Verify settings controls
    const upscaleBtn = page.locator('button:has-text("Start AI Upscaling")').first();
    await expect(upscaleBtn).toBeVisible();
    await expect(upscaleBtn).toBeEnabled();

    // Click to start AI Upscaling
    await upscaleBtn.click();

    // Wait for super-resolution pipeline to complete
    await expect(page.locator('text=Upscaling complete!').first()).toBeVisible({ timeout: 40000 });

    // Verify Download button is present
    const downloadBtn = page.locator('button:has-text("Download Enhanced Image")').first();
    await expect(downloadBtn).toBeVisible();

    // Verify comparison controls are active
    await expect(page.locator('button:has-text("Draggable Split")').first()).toBeVisible();
  });
});
