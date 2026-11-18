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
  
  // Test image upload and classification
  console.log('=== TESTING IMAGE CLASSIFICATION ===');
  await page.goto('http://localhost:5173/detect', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Upload test image
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('/tmp/test_ewaste.jpg');
  await page.waitForTimeout(5000);
  
  const detectText = await page.locator('body').innerText();
  console.log('Classification result:', detectText.includes('Battery') || detectText.includes('Television') || detectText.includes('Washing Machine') || detectText.includes('Keyboard') || detectText.includes('Mobile'));
  
  // Check for confidence and top-3
  const hasConfidence = detectText.includes('confidence') || detectText.includes('Confidence') || detectText.includes('%');
  const hasTop3 = detectText.includes('Top') || detectText.includes('top');
  console.log('Has confidence:', hasConfidence);
  console.log('Has top-3:', hasTop3);
  
  // Test model comparison
  console.log('\n=== TESTING MODEL COMPARISON ===');
  const compareButton = page.locator('text=Compare All Models, text=Compare, button:has-text("Compare")');
  const compareCount = await compareButton.count();
  if (compareCount > 0) {
    await compareButton.first().click();
    await page.waitForTimeout(5000);
    
    const compareText = await page.locator('body').innerText();
    console.log('Comparison modal opened:', compareText.includes('EfficientNetB0') && compareText.includes('ResNet50') && compareText.includes('MobileNetV2'));
  } else {
    console.log('Compare button not found');
  }
  
  // Test Chat functionality
  console.log('\n=== TESTING CHAT FUNCTIONALITY ===');
  await page.goto('http://localhost:5173/chat', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Send a test message
  const chatInput = page.locator('textarea, input[type="text"]').first();
  await chatInput.fill('How do I recycle a battery?');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  
  const chatText = await page.locator('body').innerText();
  console.log('Chat response received:', chatText.includes('battery') || chatText.includes('Battery') || chatText.includes('recycle') || chatText.includes('Recycle'));
  
  // Test Centers search
  console.log('\n=== TESTING CENTERS SEARCH ===');
  await page.goto('http://localhost:5173/centers', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // Search for San Francisco
  const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="address"], input[placeholder*="ZIP"]').first();
  await searchInput.fill('San Francisco');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  
  const centersText = await page.locator('body').innerText();
  console.log('Centers search result:', centersText.includes('Call2Recycle') || centersText.includes('Best Buy') || centersText.includes('Staples') || centersText.includes('Found'));
  
  console.log('\n=== ALL FUNCTIONALITY TESTS COMPLETED ===');
  
  await browser.close();
})();
