const express = require('express');
const router = express.Router();
const { recommendPackage, chatAssistant } = require('../controllers/aiController');

router.post('/recommend-package', recommendPackage);
router.post('/chat', chatAssistant);

module.exports = router;
