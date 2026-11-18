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
  
  // Test Centers page directly
  console.log('=== TESTING CENTERS PAGE ===');
  await page.goto('http://localhost:5173/centers', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(5000);
  
  const centersBodyText = await page.locator('body').innerText();
  console.log(centersBodyText.substring(0, 3000));
  
  // Test Chat page directly
  console.log('\n=== TESTING CHAT PAGE ===');
  await page.goto('http://localhost:5173/chat', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(5000);
  
  const chatBodyText = await page.locator('body').innerText();
  console.log(chatBodyText.substring(0, 3000));
  
  // Test About page directly
  console.log('\n=== TESTING ABOUT PAGE ===');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(5000);
  
  const aboutBodyText = await page.locator('body').innerText();
  console.log(aboutBodyText.substring(0, 3000));
  
  await browser.close();
})();
