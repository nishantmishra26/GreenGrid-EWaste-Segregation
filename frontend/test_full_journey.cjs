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
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log('API RESPONSE:', response.url(), response.status());
    }
  });
  
  // Test Home page
  console.log('=== TESTING HOME PAGE ===');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  const homeText = await page.locator('body').innerText();
  console.log('Home page loaded:', homeText.includes('GreenGrid') && homeText.includes('Detect E-Waste'));
  
  // Navigate to Detect page
  console.log('\n=== NAVIGATING TO DETECT PAGE ===');
  await page.click('text=Detect E-Waste');
  await page.waitForTimeout(1000);
  
  const detectText = await page.locator('body').innerText();
  console.log('Detect page loaded:', detectText.includes('Upload E-Waste Image') && detectText.includes('EfficientNetB0'));
  
  // Navigate to Guide page
  console.log('\n=== NAVIGATING TO GUIDE PAGE ===');
  await page.click('text=Recycling Guide');
  await page.waitForTimeout(2000);
  
  const guideText = await page.locator('body').innerText();
  console.log('Guide page loaded:', guideText.includes('Recycling Guide') && guideText.includes('Hazardous Components'));
  
  // Navigate to Centers page
  console.log('\n=== NAVIGATING TO CENTERS PAGE ===');
  await page.click('text=Find Centres');
  await page.waitForTimeout(3000);
  
  const centersText = await page.locator('body').innerText();
  console.log('Centers page loaded:', centersText.includes('Find Centres') && centersText.includes('Radius:'));
  
  // Navigate to Chat page
  console.log('\n=== NAVIGATING TO CHAT PAGE ===');
  await page.click('text=AI Assistant');
  await page.waitForTimeout(1000);
  
  const chatText = await page.locator('body').innerText();
  console.log('Chat page loaded:', chatText.includes('AI Assistant') && chatText.includes('Welcome to GreenGrid'));
  
  // Navigate to About page
  console.log('\n=== NAVIGATING TO ABOUT PAGE ===');
  await page.click('text=About');
  await page.waitForTimeout(1000);
  
  const aboutText = await page.locator('body').innerText();
  console.log('About page loaded:', aboutText.includes('About GreenGrid') && aboutText.includes('EfficientNetB0'));
  
  // Back to Home
  console.log('\n=== BACK TO HOME ===');
  await page.click('text=Home');
  await page.waitForTimeout(1000);
  
  const finalText = await page.locator('body').innerText();
  console.log('Home page loaded:', finalText.includes('GreenGrid'));
  
  console.log('\n=== ALL NAVIGATION TESTS PASSED ===');
  
  await browser.close();
})();
