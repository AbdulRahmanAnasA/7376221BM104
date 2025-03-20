const NodeCache = require('node-cache');
const axios = require('axios');

// Initialize cache for storing numbers
const numberCache = new NodeCache();
const WINDOW_SIZE = process.env.WINDOW_SIZE || 10;

// Helper function to calculate average
const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

// Controller methods
const getNumbersByType = async (req, res) => {
    try {
        const { type } = req.params;
        
        // Validate number type
        if (!['p', 'f', 'e', 'r'].includes(type)) {
            return res.status(400).json({ error: 'Invalid number type' });
        }

        // Get current numbers for this type
        let currentNumbers = numberCache.get(type) || [];
        const windowPrevState = [...currentNumbers];

        // Fetch new numbers from third-party API with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 500);

        try {
            // Map endpoints to their respective URLs
            const apiUrls = {
                p: 'http://20.244.56.144/test/primes',    // Prime numbers
                f: 'http://20.244.56.144/test/fibo',      // Fibonacci numbers
                e: 'http://20.244.56.144/test/even',      // Even numbers
                r: 'http://20.244.56.144/test/rand'       // Random numbers
            };

            const response = await axios.get(apiUrls[type], {
                signal: controller.signal
            });
            clearTimeout(timeout);

            // Get numbers from response
            const newNumbers = response.data.numbers;

            // Update cache with new unique numbers
            currentNumbers = [...currentNumbers, ...newNumbers];
            
            // Remove duplicates
            currentNumbers = [...new Set(currentNumbers)];
            
            // Keep only the latest WINDOW_SIZE numbers
            if (currentNumbers.length > WINDOW_SIZE) {
                currentNumbers = currentNumbers.slice(-WINDOW_SIZE);
            }

            // Store updated numbers
            numberCache.set(type, currentNumbers);

            // Calculate average
            const avg = calculateAverage(currentNumbers);

            // Format response according to requirements
            const responseObj = {
                windowPrevState: windowPrevState,
                windowCurrState: currentNumbers,
                numbers: newNumbers,
                avg: parseFloat(avg.toFixed(2))
            };

            res.json(responseObj);

        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return res.status(408).json({ error: 'Request timeout exceeded 500ms' });
            }
            throw error;
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getNumbersByType
}; 