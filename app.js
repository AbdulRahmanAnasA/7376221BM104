require('dotenv').config();
const express = require('express');
const numberRoutes = require('./routes/numberRoutes');

// Initialize express app
const app = express();

// Routes
app.use('/api', numberRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 9876;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 