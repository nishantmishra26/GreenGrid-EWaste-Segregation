const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`${msg.type().toUpperCase()}:`, msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // Test Guide page directly
  console.log('=== TESTING GUIDE PAGE ===');
  await page.goto('http://localhost:5173/guide', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(5000);
  
  const guideBodyText = await page.locator('body').innerText();
  console.log(guideBodyText.substring(0, 3000));
  
  await browser.close();
})();
