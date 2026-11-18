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
  
  // Navigate directly to Detect page
  await page.goto('http://localhost:5174/detect', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Check the actual URL
  const url = page.url();
  console.log('=== CURRENT URL ===');
  console.log(url);
  
  // Check if the path is in the URL
  console.log('\n=== PAGE TITLE ===');
  const title = await page.title();
  console.log(title);
  
  // Get all text content
  const bodyText = await page.locator('body').innerText();
  console.log('\n=== FULL BODY TEXT ===');
  console.log(bodyText);
  
  // Check for specific elements on Detect page
  const uploadZone = await page.locator('.upload-zone').count();
  const modelSelector = await page.locator('.model-chip').count();
  console.log('\n=== ELEMENT COUNTS ===');
  console.log('Upload zones:', uploadZone);
  console.log('Model chips:', modelSelector);
  
  await browser.close();
})();
