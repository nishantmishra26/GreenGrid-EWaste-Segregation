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
  
  console.log('=== DETECT PAGE ===');
  let bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 3000));
  
  // Check for upload zone
  const hasUpload = bodyText.includes('Upload') || bodyText.includes('Drag') || bodyText.includes('Drop');
  const hasModelSelector = bodyText.includes('EfficientNetB0') || bodyText.includes('ResNet50') || bodyText.includes('MobileNetV2');
  
  console.log('\n=== CHECKS ===');
  console.log('Has Upload:', hasUpload);
  console.log('Has Model Selector:', hasModelSelector);
  
  // Try to find and click file input
  const fileInput = page.locator('input[type="file"]');
  const fileInputExists = await fileInput.count() > 0;
  console.log('Has File Input:', fileInputExists);
  
  // Get page HTML
  const html = await page.content();
  console.log('\n=== PAGE HTML (first 5000 chars) ===');
  console.log(html.substring(0, 5000));
  
  await browser.close();
})();
