const EventService = require('../models/EventService');

// @desc    Get all event services with filters
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    const { category, city, search, pricingType } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (pricingType) {
      query.pricingType = pricingType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { providerName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await EventService.find(query).sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await EventService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Event service not found' });
    }
    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event service
// @route   POST /api/services
// @access  Private (Owner/Admin)
exports.createService = async (req, res, next) => {
  try {
    const service = await EventService.create(req.body);
    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};
