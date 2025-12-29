const express = require('express');
const router = express.Router();

router.get('/stats', async (req, res, next) => {
    try {
        res.json({ message: 'Analytics endpoint - pendiente de implementar' });
    } catch (error) {
        next(error)
    }
});

module.exports = router;