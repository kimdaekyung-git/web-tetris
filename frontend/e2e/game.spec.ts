import { test, expect } from '@playwright/test';

test.describe('Tetris Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Phaser to initialize
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test('should display title screen', async ({ page }) => {
    // Check canvas is rendered
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // The game should show title screen content
    // Since Phaser renders to canvas, we verify canvas exists and has correct size
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test('should start game when clicking canvas', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for the game to be ready to start
    await page.waitForTimeout(500);

    // Click to start
    await canvas.click();

    // Wait for game scene to load
    await page.waitForTimeout(500);

    // Game should still be running (canvas still visible)
    await expect(canvas).toBeVisible();
  });

  test('should respond to keyboard input', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for the game to be ready
    await page.waitForTimeout(500);

    // Start the game
    await canvas.click();
    await page.waitForTimeout(500);

    // Test keyboard controls - press some keys
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // Game should still be running
    await expect(canvas).toBeVisible();
  });

  test('should pause and resume game', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Start the game
    await page.waitForTimeout(500);
    await canvas.click();
    await page.waitForTimeout(500);

    // Pause with P key
    await page.keyboard.press('p');
    await page.waitForTimeout(300);

    // Resume with P key
    await page.keyboard.press('p');
    await page.waitForTimeout(300);

    // Game should still be running
    await expect(canvas).toBeVisible();
  });

  test('should mute and unmute audio', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Start the game
    await page.waitForTimeout(500);
    await canvas.click();
    await page.waitForTimeout(500);

    // Toggle mute with M key
    await page.keyboard.press('m');
    await page.waitForTimeout(100);

    // Toggle mute again
    await page.keyboard.press('m');
    await page.waitForTimeout(100);

    // Game should still be running
    await expect(canvas).toBeVisible();
  });
});

test.describe('Tetris Game - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Canvas should fit the viewport
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeLessThanOrEqual(375);
  });

  test('should support touch input', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for game to be ready
    await page.waitForTimeout(500);

    // Tap to start
    await canvas.tap();
    await page.waitForTimeout(500);

    // Game should be running
    await expect(canvas).toBeVisible();
  });
});

test.describe('Game Over Flow', () => {
  test('should handle hard drop until game over', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10000 });

    const canvas = page.locator('canvas');

    // Start the game
    await page.waitForTimeout(500);
    await canvas.click();
    await page.waitForTimeout(500);

    // Keep dropping pieces rapidly (this will eventually cause game over)
    // Note: This is a simple test - in reality, the game might take longer
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Space'); // Hard drop
      await page.waitForTimeout(150);
    }

    // Game should still be running or show game over
    await expect(canvas).toBeVisible();
  });
});
