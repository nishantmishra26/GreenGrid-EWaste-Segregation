const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navigate to the dev server
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for the app to render
  await page.waitForSelector('#root', { timeout: 10000 });
  
  // Get page content
  const title = await page.title();
  const bodyText = await page.locator('body').innerText();
  
  console.log('=== PAGE TITLE ===');
  console.log(title);
  console.log('');
  console.log('=== BODY TEXT (first 2000 chars) ===');
  console.log(bodyText.substring(0, 2000));
  
  // Check for GreenGrid elements
  const hasGreenGrid = bodyText.includes('GreenGrid');
  const hasDetect = bodyText.includes('Detect') || bodyText.includes('detect');
  const hasNav = bodyText.includes('Home') || bodyText.includes('Guide') || bodyText.includes('Centers') || bodyText.includes('Chat') || bodyText.includes('About');
  
  console.log('');
  console.log('=== CHECKS ===');
  console.log('Has GreenGrid:', hasGreenGrid);
  console.log('Has Detect:', hasDetect);
  console.log('Has Navigation:', hasNav);
  
  // Check for errors in console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  // Wait a bit more for any async content
  await page.waitForTimeout(2000);
  
  const finalBodyText = await page.locator('body').innerText();
  console.log('');
  console.log('=== FINAL BODY TEXT (first 3000 chars) ===');
  console.log(finalBodyText.substring(0, 3000));
  
  await browser.close();
})();
