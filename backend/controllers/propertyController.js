const Property = require('../models/Property');
const Unit = require('../models/Unit');
const Review = require('../models/Review');
const { getCitiesByTier } = require('../data/indianCities');

// @desc    Get all properties with filtering & search
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const {
      search,
      city,
      tier,
      category,
      propertyType,
      minGuests,
      minPrice,
      maxPrice,
      suitableFor,
      amenities,
      sort,
      bounds,
      limit = 60,
      page = 1
    } = req.query;

    const conditions = [{ isApproved: true }];

    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (city && city !== 'All') {
      // Strip parenthetical text like "Goa (Panaji)" -> "Goa", "Delhi NCR" -> "Delhi"
      const cleanCity = city.replace(/\s*\(.*?\)\s*/g, '').trim();
      const cityRegex = cleanCity.toLowerCase() === 'delhi'
        ? '(?:New\\s+)?Delhi'
        : cleanCity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conditions.push({ city: { $regex: new RegExp(cityRegex, 'i') } });
    }

    // Budget Tier Filter (High Budget, Mid Budget, Value Budget) based on 100 Indian Cities Hierarchy
    if (tier && tier !== 'all') {
      const tierCities = getCitiesByTier(tier);
      if (tierCities && tierCities.length > 0) {
        if (!city || city === 'All') {
          conditions.push({ city: { $regex: new RegExp(`\\b(${tierCities.join('|')})\\b`, 'i') } });
        }
      }
    }

    // Map viewport bounds filtering (north,south,east,west)
    if (bounds) {
      const parts = bounds.split(',').map(Number);
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        const [north, south, east, west] = parts;
        conditions.push({
          'location.lat': { $gte: Math.min(north, south), $lte: Math.max(north, south) },
          'location.lng': { $gte: Math.min(east, west), $lte: Math.max(east, west) }
        });
      }
    }

    if (category && category !== 'all') {
      if (category === 'hotel') {
        conditions.push({
          $or: [
            { category: 'hotel' },
            { propertyType: { $in: ['hotel', 'resort'] } }
          ]
        });
      } else if (category === 'venue') {
        conditions.push({
          $or: [
            { category: 'venue' },
            { propertyType: { $in: ['banquet_hall', 'palace', 'venue'] } }
          ]
        });
      } else if (category === 'both') {
        conditions.push({ category: 'both' });
      } else {
        conditions.push({ category: { $in: [category, 'both'] } });
      }
    }

    if (propertyType && propertyType !== 'all') {
      conditions.push({ propertyType });
    }

    if (minGuests) {
      conditions.push({ maxCapacity: { $gte: Number(minGuests) } });
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      conditions.push({ basePrice: priceFilter });
    }

    if (suitableFor) {
      conditions.push({ suitableFor: { $in: [new RegExp(suitableFor, 'i')] } });
    }

    if (amenities) {
      const amenitiesList = amenities.split(',');
      conditions.push({ amenities: { $all: amenitiesList } });
    }

    const query = conditions.length === 1 ? conditions[0] : { $and: conditions };

    let sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'price_asc') sortOption = { basePrice: 1 };
    if (sort === 'price_desc') sortOption = { basePrice: -1 };
    if (sort === 'capacity_desc') sortOption = { maxCapacity: -1 };
    if (sort === 'rating_desc') sortOption = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name email phone businessName');

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by ID with units & reviews
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone businessName avatar');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const units = await Unit.find({ property: property._id, isActive: true });
    const reviews = await Review.find({ property: property._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      property,
      units,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured properties for homepage
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ isApproved: true, featured: true })
      .limit(12)
      .populate('owner', 'name businessName');

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct cities and counts
// @route   GET /api/properties/cities
// @access  Public
exports.getCities = async (req, res, next) => {
  try {
    const cities = await Property.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ['$images', 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      cities: cities.map((c) => ({
        name: c._id,
        count: c.count,
        image: c.image
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property (Owner/Admin)
// @route   POST /api/properties
// @access  Private (Owner/Admin)
exports.createProperty = async (req, res, next) => {
  try {
    req.body.owner = req.user._id;
    // Admins auto-approve, owners are approved for seamless demo
    req.body.isApproved = true;

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await Unit.deleteMany({ property: property._id });
    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Property and associated units deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add unit (hall/room) to property
// @route   POST /api/properties/:id/units
// @access  Private (Owner/Admin)
exports.addUnit = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this property' });
    }

    req.body.property = property._id;
    const unit = await Unit.create(req.body);

    res.status(201).json({ success: true, unit });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete unit
// @route   DELETE /api/properties/units/:unitId
// @access  Private (Owner/Admin)
exports.deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.unitId).populate('property');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    if (unit.property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this unit' });
    }

    await Unit.findByIdAndDelete(req.params.unitId);
    res.status(200).json({ success: true, message: 'Unit deleted' });
  } catch (error) {
    next(error);
  }
};

const xlsx = require('xlsx');
let cityCoords = null;
try {
  cityCoords = require('../data/cityCoordinates.json');
} catch (e) {
  cityCoords = {};
}

// @desc    Bulk Upload Properties from Excel/CSV
// @route   POST /api/properties/bulk-upload
// @access  Private (Owner/Admin)
exports.bulkUploadProperties = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel (.xlsx, .xls) or CSV file.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: 'No sheets found in uploaded spreadsheet.' });
    }

    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    if (!rawRows || rawRows.length < 2) {
      return res.status(400).json({ success: false, message: 'Spreadsheet has no data rows.' });
    }

    const headers = rawRows[0].map(h => (h || '').toString().trim());
    const dataRows = rawRows.slice(1);

    // Normalize column finding
    const findCol = (...names) => {
      for (const n of names) {
        const idx = headers.findIndex(h => h.toLowerCase() === n.toLowerCase());
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const colCity = findCol('City', 'Destination', 'Location');
    const colState = findCol('State', 'Province');
    const colName = findCol('Hotel Name', 'Title', 'Property Name', 'Name');
    const colCategory = findCol('Category', 'Tier', 'Segment');
    const colPrice = findCol('Base Price', 'Price', 'Price Range', 'Daily Rent');
    const colCapacity = findCol('Capacity', 'Max Capacity', 'Guests');
    const colWedding = findCol('Wedding');
    const colReception = findCol('Reception');
    const colBirthday = findCol('Birthday');
    const colConference = findCol('Conference', 'Corporate');

    if (colName === -1 || colCity === -1) {
      return res.status(400).json({
        success: false,
        message: 'Could not detect required columns. Header row must include at least "Hotel Name" and "City".'
      });
    }

    const DEFAULT_IMAGES = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
    ];

    const propertiesToInsert = [];
    let skipped = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const hotelName = (row[colName] || '').toString().trim();
      const cityName = (row[colCity] || '').toString().trim();
      const stateName = colState !== -1 ? (row[colState] || '').toString().trim() : '';
      const rawCategory = colCategory !== -1 ? (row[colCategory] || 'Mid-Range').toString().trim() : 'Mid-Range';

      if (!hotelName || !cityName) {
        skipped++;
        continue;
      }

      const cityKey = cityName.toLowerCase();
      const cityData = cityCoords[cityKey] || {
        lat: 22.9734,
        lng: 78.6569,
        state: stateName || 'India',
        tier: 'mid'
      };

      const latOffset = (Math.sin(i * 1.5) * 0.02) + ((i % 5 - 2) * 0.003);
      const lngOffset = (Math.cos(i * 1.2) * 0.02) + ((i % 7 - 3) * 0.003);

      let basePrice = 120000;
      let maxCapacity = 400;
      let propertyType = 'hotel';

      if (rawCategory.toLowerCase().includes('lux')) {
        basePrice = 380000;
        maxCapacity = 800;
        propertyType = 'palace';
      } else if (rawCategory.toLowerCase().includes('prem')) {
        basePrice = 220000;
        maxCapacity = 600;
        propertyType = 'resort';
      } else if (rawCategory.toLowerCase().includes('mid')) {
        basePrice = 130000;
        maxCapacity = 400;
        propertyType = 'hotel';
      } else {
        basePrice = 65000;
        maxCapacity = 250;
        propertyType = 'hotel';
      }

      if (colPrice !== -1 && row[colPrice] && !isNaN(Number(row[colPrice]))) {
        basePrice = Number(row[colPrice]);
      }
      if (colCapacity !== -1 && row[colCapacity] && !isNaN(Number(row[colCapacity]))) {
        maxCapacity = Number(row[colCapacity]);
      }

      const suitableFor = ['Stay'];
      if (colWedding !== -1 && (row[colWedding] === 'Yes' || row[colWedding] === true || row[colWedding] === '1')) suitableFor.push('Wedding');
      if (colReception !== -1 && (row[colReception] === 'Yes' || row[colReception] === true || row[colReception] === '1')) suitableFor.push('Reception');
      if (colBirthday !== -1 && (row[colBirthday] === 'Yes' || row[colBirthday] === true || row[colBirthday] === '1')) suitableFor.push('Birthday Party');
      if (colConference !== -1 && (row[colConference] === 'Yes' || row[colConference] === true || row[colConference] === '1')) suitableFor.push('Corporate');

      propertiesToInsert.push({
        title: hotelName,
        propertyType,
        category: 'both',
        description: `${hotelName} is a top-rated ${rawCategory} hotel and event venue in ${cityName}, offering majestic banquet halls, modern amenities, and world-class guest accommodation.`,
        address: `City Center, ${cityName}`,
        city: cityName,
        state: cityData.state || stateName || 'India',
        zipCode: '110001',
        location: {
          lat: Number((cityData.lat + latOffset).toFixed(6)),
          lng: Number((cityData.lng + lngOffset).toFixed(6))
        },
        owner: req.user._id,
        amenities: ['High Speed Wi-Fi', 'Central Air Conditioning', 'Valet Parking', 'Elevator', 'In-house Catering', 'Power Backup'],
        images: [
          DEFAULT_IMAGES[i % DEFAULT_IMAGES.length],
          DEFAULT_IMAGES[(i + 1) % DEFAULT_IMAGES.length]
        ],
        rating: 4.5,
        numReviews: 10,
        basePrice,
        maxCapacity,
        suitableFor,
        isApproved: true
      });
    }

    if (propertiesToInsert.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid property rows found in file.' });
    }

    const inserted = await Property.insertMany(propertiesToInsert, { ordered: false });

    // Create a banquet hall unit for each
    const unitsToInsert = inserted.map(p => ({
      property: p._id,
      name: `${p.title} Main Ballroom`,
      unitType: 'banquet_hall',
      capacity: p.maxCapacity,
      pricePerUnit: p.basePrice,
      priceType: 'per_day',
      sizeSqFt: Math.max(3000, p.maxCapacity * 10),
      amenities: ['Central AC', 'Stage', 'Acoustic Sound'],
      images: [p.images[0]],
      totalCount: 1,
      isActive: true
    }));
    await Unit.insertMany(unitsToInsert, { ordered: false });

    res.status(201).json({
      success: true,
      count: inserted.length,
      skipped,
      message: `Successfully imported ${inserted.length} properties from spreadsheet!`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Sample Excel / CSV Template
// @route   GET /api/properties/excel-template
// @access  Public
exports.downloadExcelTemplate = async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  
  const templateData = [
    {
      City: 'Mumbai',
      State: 'Maharashtra',
      'Hotel Name': 'The Grand Palace Marine Drive',
      Category: 'Luxury',
      'Price Range': 450000,
      'Banquet Hall': 'Yes',
      Wedding: 'Yes',
      Birthday: 'Yes',
      Reception: 'Yes',
      Conference: 'Yes'
    },
    {
      City: 'Jaipur',
      State: 'Rajasthan',
      'Hotel Name': 'Royal Haveli Heritage Banquets',
      Category: 'Premium',
      'Price Range': 280000,
      'Banquet Hall': 'Yes',
      Wedding: 'Yes',
      Birthday: 'Yes',
      Reception: 'Yes',
      Conference: 'Yes'
    },
    {
      City: 'Patna',
      State: 'Bihar',
      'Hotel Name': 'Maurya Crown Hotel & Lawns',
      Category: 'Mid-Range',
      'Price Range': 140000,
      'Banquet Hall': 'Yes',
      Wedding: 'Yes',
      Birthday: 'Yes',
      Reception: 'Yes',
      Conference: 'Yes'
    },
    {
      City: 'Ayodhya',
      State: 'Uttar Pradesh',
      'Hotel Name': 'Saryu Riverside Heritage Inn',
      Category: 'Budget',
      'Price Range': 75000,
      'Banquet Hall': 'Yes',
      Wedding: 'Yes',
      Birthday: 'Yes',
      Reception: 'Yes',
      Conference: 'No'
    }
  ];

  if (format === 'xlsx') {
    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'HotelsTemplate');
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="eventstay_hotels_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buf);
  }

  // Default CSV
  const headers = Object.keys(templateData[0]).join(',');
  const rows = templateData.map(r => Object.values(r).map(v => `"${v}"`).join(','));
  const csvContent = [headers, ...rows].join('\n');

  res.setHeader('Content-Disposition', 'attachment; filename="eventstay_hotels_template.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.status(200).send(csvContent);
};
