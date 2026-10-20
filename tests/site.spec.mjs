import { test, expect } from '@playwright/test';

test('homepage: message, navigation, media, layout, keyboard', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Want to Start a Trade School? Start With a Plan.');
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/(?:01 \/|02 \/|03 \/|04 \/)/);
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(horizontalOverflow,'No horizontal scrolling at this viewport').toBeLessThanOrEqual(1);
  const headline = await page.locator('h1').boundingBox();
  expect(headline,'Headline must be visible').toBeTruthy();
  expect(headline.x).toBeGreaterThanOrEqual(-1);
  expect(headline.x + headline.width).toBeLessThanOrEqual(testInfo.project.use.viewport.width + 1);
  const hero = page.locator('.hero-media img');
  await expect(hero).toHaveAttribute('alt',/temporary|Unsplash/i);
  const loaded = await hero.evaluate(img => img.complete && img.naturalWidth > 0);
  expect(loaded,'Hero photography must load successfully').toBeTruthy();
  const mobileMenu = page.getByRole('button',{name:'Menu'});
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await expect(mobileMenu).toHaveAttribute('aria-expanded','true');
    await expect(page.getByRole('link',{name:'About'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(mobileMenu).toHaveAttribute('aria-expanded','false');
  }
  await expect(page.locator('main')).not.toContainText(/nonprofit|new world kids/i);
  expect(errors,'No uncaught page JavaScript exceptions').toEqual([]);
  await page.screenshot({path:`test-results/home-${testInfo.project.name}.png`,fullPage:true,animations:'disabled'});
});

test('founder: portrait remains intentionally blank and content is readable', async ({ page }, testInfo) => {
  await page.goto('/founder.html');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.portrait-placeholder')).toBeVisible();
  expect(await page.locator('.portrait-placeholder img').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.locator('body')).not.toContainText(/fake testimonial|lorem ipsum/i);
  await page.screenshot({path:`test-results/founder-${testInfo.project.name}.png`,fullPage:true,animations:'disabled'});
});

test('reduced motion: hero animation disabled', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const value = await page.locator('.hero-media img').evaluate(el=>getComputedStyle(el).animationName);
  expect(value).toBe('none');
});

test('navigation: links resolve to the intended pages', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('a[href^="/"]');
  const hrefs = await links.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
  expect(hrefs).toContain('/founder.html');
  await page.goto('/founder.html');
  await expect(page.locator('h1')).toBeVisible();
});
