const express = require('express');
const historyController = require('../controllers/history.controller');
const authMiddleware = require('../middleware/auth.middleware'); // Assuming auth exists

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', historyController.addHistory);
router.get('/me', historyController.getMyHistory);
router.delete('/me', historyController.clearHistory);

module.exports = router;
