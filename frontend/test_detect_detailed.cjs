const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // Navigate directly to Detect page
  await page.goto('http://localhost:5174/detect', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // Get page HTML
  const html = await page.content();
  console.log('=== PAGE HTML (first 5000 chars) ===');
  console.log(html.substring(0, 5000));
  
  await browser.close();
})();
