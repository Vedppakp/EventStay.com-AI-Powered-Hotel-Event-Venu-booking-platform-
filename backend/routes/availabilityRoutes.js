const express = require('express');
const router = express.Router();
const { getPropertyAvailability } = require('../controllers/availabilityController');

router.get('/:propertyId', getPropertyAvailability);

module.exports = router;
