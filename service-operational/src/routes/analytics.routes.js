import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

// 1. Define the Python Service URL
// In Docker, 'service-analytics' is the hostname defined in docker-compose.yml
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://service-analytics:8000';

// 2. Define the Proxy Route
// Frontend calls: GET /api/analytics/forecast/:sku
router.get('/forecast/:sku', async (req, res) => {
    const { sku } = req.params;
    const { days } = req.query;

    try {
        logger.info(`[Proxy] Forwarding forecast request for ${sku} to Analytics Engine...`);

        // 3. Call the Python Service
        // Python Endpoint: GET /api/forecast/predict/{sku}
        const response = await axios.get(`${ANALYTICS_SERVICE_URL}/api/forecast/predict/${sku}`, {
            params: { days: days || 7 }
        });

        // 4. Return Python's response to the Frontend
        res.json(response.data);

    } catch (error) {
        logger.error(`[Proxy Error] Analytics Service: ${error.message}`);
        
        if (error.response) {
            // If Python returned an error (e.g. 404 or 500), forward it
            res.status(error.response.status).json(error.response.data);
        } else {
            // If Python is unreachable (container down)
            res.status(503).json({ message: "Analytics Service is unreachable" });
        }
    }
});

export default router;