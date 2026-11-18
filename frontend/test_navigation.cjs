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
  
  // Navigate to the dev server
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  
  console.log('=== HOME PAGE ===');
  let bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 1000));
  
  // Test navigation to Detect page
  console.log('\n=== NAVIGATING TO DETECT PAGE ===');
  await page.click('text=Detect E-Waste');
  await page.waitForTimeout(1000);
  bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 1000));
  
  // Test navigation to Guide page
  console.log('\n=== NAVIGATING TO GUIDE PAGE ===');
  await page.click('text=Recycling Guide');
  await page.waitForTimeout(1000);
  bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 1000));
  
  // Test navigation to Centers page
  console.log('\n=== NAVIGATING TO CENTERS PAGE ===');
  await page.click('text=Find Centres');
  await page.waitForTimeout(1000);
  bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 1000));
  
  // Test navigation to Chat page
  console.log('\n=== NAVIGATING TO CHAT PAGE ===');
  await page.click('text=AI Assistant');
  await page.waitForTimeout(1000);
  bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 1000));
  
  // Test navigation to About page
  console.log('\n=== NAVIGATING TO ABOUT PAGE ===');
  await page.click('text=About');
  await page.waitForTimeout(1000);
  bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 1000));
  
  // Go back to Home
  console.log('\n=== BACK TO HOME ===');
  await page.click('text=Home');
  await page.waitForTimeout(1000);
  bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 1000));
  
  await browser.close();
})();
