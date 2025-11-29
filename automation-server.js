const express = require('express');
const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

// Use stealth plugin to avoid detection
puppeteer.use(stealthPlugin());

const app = express();

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '🚀 100k Automation Server is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Place order endpoint
app.post('/api/place-order', async (req, res) => {
    const { phone, region, district } = req.body;
    
    console.log('🚀 Starting 100k.uz automation for:', { phone, region, district });
    
    let browser;
    
    try {
        // Launch browser with Render-compatible settings
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
        });
        
        const page = await browser.newPage();
        
        // Set user agent to look more human
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Step 1: Go to product page
        console.log('1. Navigating to product page...');
        await page.goto('https://100k.uz/shop/product-new/tanani-oqartiruvchi-crem?stream=704834', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Step 2: Click buy button
        console.log('2. Clicking buy button...');
        
        const buyButtonSelectors = [
            '.buy-now-btn',
            '.btn-buy', 
            '.product-buy-btn',
            '[data-action="buy"]',
            'button[type="submit"]',
            '.btn-primary',
            'a[href*="/order"]',
            '.add-to-cart',
            '.btn-success'
        ];
        
        let buyButtonClicked = false;
        for (const selector of buyButtonSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await page.click(selector);
                console.log(`✅ Clicked buy button with selector: ${selector}`);
                buyButtonClicked = true;
                break;
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (!buyButtonClicked) {
            // Try to find button by text
            const buyButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, a'));
                return buttons.find(btn => 
                    btn.textContent.toLowerCase().includes('buy') ||
                    btn.textContent.toLowerCase().includes('sotib olish') ||
                    btn.textContent.toLowerCase().includes('harid') ||
                    btn.textContent.toLowerCase().includes('zakaz') ||
                    btn.textContent.toLowerCase().includes('buyurtma')
                );
            });
            
            if (buyButton) {
                await buyButton.click();
                console.log('✅ Clicked buy button by text content');
                buyButtonClicked = true;
            }
        }
        
        if (!buyButtonClicked) {
            throw new Error('Could not find buy button on the page');
        }
        
        // Step 3: Wait for order form
        console.log('3. Waiting for order form...');
        await page.waitForTimeout(5000);
        
        // Step 4: Fill customer phone
        console.log('4. Filling customer phone...');
        const phoneInputSelectors = [
            'input[name="customer_username"]',
            'input.my-phone-mask',
            'input[placeholder*="Telefon"]',
            'input[placeholder*="Phone"]',
            'input[name="phone"]',
            'input[type="tel"]'
        ];
        
        let phoneFilled = false;
        for (const selector of phoneInputSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await page.type(selector, phone, { delay: 100 });
                console.log(`✅ Filled phone with selector: ${selector}`);
                phoneFilled = true;
                break;
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (!phoneFilled) {
            throw new Error('Could not find phone input field');
        }
        
        // Step 5: Select region
        console.log('5. Selecting region...');
        try {
            await page.select('select[name="region_id"]', region || '13');
            console.log('✅ Selected region');
        } catch (error) {
            console.log('⚠️ Could not select region, continuing...');
        }
        
        // Step 6: Select district
        console.log('6. Selecting district...');
        await page.waitForTimeout(2000);
        try {
            // District mapping
            const districtMapping = {
                'chilonzor': '202',
                'yunusobod': '203',
                'mirzo_ulugbek': '204',
                'shayxontohur': '205',
                'samarqand_shahri': '206',
                'buxoro_shahri': '207'
            };
            
            const districtId = districtMapping[district] || '202';
            await page.select('select[name="district_id"]', districtId);
            console.log('✅ Selected district');
        } catch (error) {
            console.log('⚠️ Could not select district, continuing...');
        }
        
        // Step 7: Submit the order
        console.log('7. Submitting order...');
        const submitSelectors = [
            'button[type="submit"]',
            '.submit-order',
            '.btn-submit',
            '.order-btn',
            '[data-action="submit"]'
        ];
        
        let orderSubmitted = false;
        for (const selector of submitSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await page.click(selector);
                console.log(`✅ Submitted order with selector: ${selector}`);
                orderSubmitted = true;
                break;
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (!orderSubmitted) {
            throw new Error('Could not find submit button');
        }
        
        // Step 8: Wait for navigation to SMS page
        console.log('8. Waiting for SMS verification page...');
        await page.waitForTimeout(8000);
        
        // Get current URL
        const currentUrl = page.url();
        console.log('9. Current URL:', currentUrl);
        
        // Check if we're on success/SMS page
        const pageTitle = await page.title();
        const pageContent = await page.content();
        
        const isSuccessPage = currentUrl.includes('/orders/') || 
                             currentUrl.includes('/success') || 
                             currentUrl.includes('/verify') ||
                             pageContent.includes('SMS') ||
                             pageContent.includes('kod') ||
                             pageContent.includes('tasdiqlash');
        
        if (isSuccessPage) {
            console.log('10. ✅ Reached SMS verification page!');
            
            await browser.close();
            
            res.json({
                success: true,
                message: 'SMS code sent successfully!',
                orderUrl: currentUrl,
                nextStep: 'waiting_sms'
            });
            
        } else {
            console.log('10. ❌ Did not reach SMS page. Current page:', pageTitle);
            
            // Take screenshot for debugging
            await page.screenshot({ path: '/tmp/debug.png' });
            
            await browser.close();
            
            res.json({
                success: false,
                message: 'Failed to reach SMS verification page. Current URL: ' + currentUrl
            });
        }
        
    } catch (error) {
        console.error('❌ Automation error:', error);
        
        if (browser) {
            await browser.close();
        }
        
        res.json({
            success: false,
            message: 'Automation failed: ' + error.message
        });
    }
});

// SMS verification endpoint
app.post('/api/verify-sms', async (req, res) => {
    const { orderUrl, smsCode } = req.body;
    
    console.log('📱 Verifying SMS code:', smsCode, 'for order:', orderUrl);
    
    let browser;
    
    try {
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
        
        const page = await browser.newPage();
        
        // Go back to the order page
        await page.goto(orderUrl);
        await page.waitForTimeout(3000);
        
        // Fill SMS code
        console.log('1. Filling SMS code...');
        
        // Try different SMS input strategies
        let codeFilled = false;
        
        // Strategy 1: Single input field
        const singleInputSelectors = [
            'input[name="sms_code"]',
            'input[name="verification_code"]',
            'input[name="code"]',
            'input[type="text"][maxlength="5"]',
            'input[type="number"][maxlength="5"]',
            '.sms-code',
            '.verification-code'
        ];
        
        for (const selector of singleInputSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await page.type(selector, smsCode, { delay: 100 });
                console.log(`✅ Filled SMS code with single input: ${selector}`);
                codeFilled = true;
                break;
            } catch (error) {
                // Continue to next selector
            }
        }
        
        // Strategy 2: Multiple digit inputs
        if (!codeFilled) {
            const digitInputs = await page.$$('input[type="text"], input[type="number"]');
            const suitableInputs = [];
            
            for (const input of digitInputs) {
                const maxLength = await page.evaluate(el => el.maxLength, input);
                if (maxLength === 1) {
                    suitableInputs.push(input);
                }
            }
            
            if (suitableInputs.length >= smsCode.length) {
                for (let i = 0; i < smsCode.length; i++) {
                    await suitableInputs[i].type(smsCode[i], { delay: 100 });
                }
                console.log('✅ Filled SMS code with multiple inputs');
                codeFilled = true;
            }
        }
        
        if (!codeFilled) {
            throw new Error('Could not find SMS code input fields');
        }
        
        // Click verify button
        console.log('2. Submitting SMS code...');
        const verifySelectors = [
            'button[type="submit"]',
            '.btn-submit',
            '.verify-btn',
            '.submit-code',
            'input[type="submit"]'
        ];
        
        let codeSubmitted = false;
        for (const selector of verifySelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await page.click(selector);
                console.log(`✅ Submitted code with selector: ${selector}`);
                codeSubmitted = true;
                break;
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (!codeSubmitted) {
            throw new Error('Could not find verify button');
        }
        
        // Wait for result
        console.log('3. Waiting for verification result...');
        await page.waitForTimeout(5000);
        
        // Check if order was successful
        const pageContent = await page.content();
        const success = pageContent.includes('Arizangiz qabul qilindi') || 
                       pageContent.includes('success') ||
                       pageContent.includes('muvaffaqiyatli') ||
                       pageContent.includes('rahmat') ||
                       pageContent.includes('qabul');
        
        await browser.close();
        
        if (success) {
            res.json({
                success: true,
                message: 'Order completed successfully!'
            });
        } else {
            res.json({
                success: false,
                message: 'SMS verification failed or order not completed'
            });
        }
        
    } catch (error) {
        console.error('❌ SMS verification error:', error);
        
        if (browser) {
            await browser.close();
        }
        
        res.json({
            success: false,
            message: 'SMS verification failed: ' + error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found. Available endpoints: /health, /api/place-order, /api/verify-sms'
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('🚨 Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 100k Automation Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
