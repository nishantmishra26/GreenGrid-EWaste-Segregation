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
  
  // Test Guide page directly
  console.log('=== TESTING GUIDE PAGE ===');
  await page.goto('http://localhost:5174/guide', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  const guideBodyText = await page.locator('body').innerText();
  console.log(guideBodyText.substring(0, 2000));
  
  // Test Centers page directly
  console.log('\n=== TESTING CENTERS PAGE ===');
  await page.goto('http://localhost:5174/centers', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  const centersBodyText = await page.locator('body').innerText();
  console.log(centersBodyText.substring(0, 2000));
  
  // Test Chat page directly
  console.log('\n=== TESTING CHAT PAGE ===');
  await page.goto('http://localhost:5174/chat', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  const chatBodyText = await page.locator('body').innerText();
  console.log(chatBodyText.substring(0, 2000));
  
  // Test About page directly
  console.log('\n=== TESTING ABOUT PAGE ===');
  await page.goto('http://localhost:5174/about', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  const aboutBodyText = await page.locator('body').innerText();
  console.log(aboutBodyText.substring(0, 2000));
  
  await browser.close();
})();
