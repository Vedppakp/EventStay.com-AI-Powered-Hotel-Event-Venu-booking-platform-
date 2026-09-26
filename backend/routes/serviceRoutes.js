const express = require('express');
const router = express.Router();
const { getServices, getServiceById, createService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', protect, authorize('owner', 'admin'), createService);

module.exports = router;
