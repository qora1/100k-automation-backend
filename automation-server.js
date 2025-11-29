const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK 🚀', 
        message: 'Server is running! Ready for Puppeteer!',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/place-order', (req, res) => {
    console.log('📦 Order received:', req.body);
    // Simulate success for now
    res.json({
        success: true,
        message: 'Order received! (Puppeteer coming soon)',
        orderUrl: 'https://100k.uz/order-test'
    });
});

app.post('/api/verify-sms', (req, res) => {
    console.log('📱 SMS verification:', req.body);
    res.json({
        success: true,
        message: 'Order completed successfully!'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
