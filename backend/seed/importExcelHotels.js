const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const mongoose = require('mongoose');

const Property = require('../models/Property');
const Unit = require('../models/Unit');
const User = require('../models/User');

const cityCoords = require('../data/cityCoordinates.json');

const CURATED_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1545232979-fbf67500b462?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
];

async function importExcelHotels(excelFilePath) {
  console.log('🚀 Starting Excel Hotel Dataset Import...');
  console.log('Target file:', excelFilePath);

  if (!fs.existsSync(excelFilePath)) {
    throw new Error(`Excel file not found at: ${excelFilePath}`);
  }

  // Connect to MongoDB
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventstay';
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  }

  // Find or use default owner
  let owner = await User.findOne({ role: 'owner' });
  if (!owner) {
    owner = await User.findOne({});
  }
  if (!owner) {
    throw new Error('No user found in database to assign as owner. Seed users first.');
  }
  console.log(`👤 Assigning properties to owner: ${owner.name} (${owner.email})`);

  // Read Excel File
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  const headers = rawRows[0];
  const dataRows = rawRows.slice(1);
  console.log(`📊 Read ${dataRows.length} rows from Excel sheet "${sheetName}".`);

  // Column indexes
  const colIndex = {
    city: headers.indexOf('City'),
    state: headers.indexOf('State'),
    name: headers.indexOf('Hotel Name'),
    category: headers.indexOf('Category'),
    priceRange: headers.indexOf('Price Range'),
    banquet: headers.indexOf('Banquet Hall'),
    wedding: headers.indexOf('Wedding'),
    birthday: headers.indexOf('Birthday'),
    reception: headers.indexOf('Reception'),
    conference: headers.indexOf('Conference')
  };

  // Get existing property titles to avoid duplicate insertions
  const existingProps = await Property.find({}, 'title city').lean();
  const existingKeys = new Set(existingProps.map((p) => `${p.title.trim().toLowerCase()}__${p.city.trim().toLowerCase()}`));
  console.log(`ℹ️ Existing properties in DB: ${existingProps.length}`);

  const propertiesToInsert = [];
  let skipped = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const cityName = (row[colIndex.city] || '').toString().trim();
    const stateName = (row[colIndex.state] || '').toString().trim();
    const hotelName = (row[colIndex.name] || '').toString().trim();
    const rawCategory = (row[colIndex.category] || 'Mid-Range').toString().trim();

    if (!hotelName || !cityName) {
      skipped++;
      continue;
    }

    const key = `${hotelName.toLowerCase()}__${cityName.toLowerCase()}`;
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }

    // City coordinates lookup with random offset
    const cityKey = cityName.toLowerCase();
    const cityData = cityCoords[cityKey] || {
      lat: 22.9734,
      lng: 78.6569,
      state: stateName || 'India',
      tier: 'mid'
    };

    // Realistic coordinate jitter (within ~2.5 km of city center)
    const latOffset = (Math.sin(i * 1.7) * 0.025) + ((i % 7 - 3) * 0.003);
    const lngOffset = (Math.cos(i * 1.3) * 0.025) + ((i % 5 - 2) * 0.003);
    const lat = Number((cityData.lat + latOffset).toFixed(6));
    const lng = Number((cityData.lng + lngOffset).toFixed(6));

    // Pricing & Capacity based on category
    let basePrice = 120000;
    let maxCapacity = 400;
    let propertyType = 'hotel';

    if (rawCategory === 'Luxury') {
      basePrice = Math.round((350000 + (i % 8) * 25000) / 1000) * 1000;
      maxCapacity = 700 + (i % 6) * 100;
      propertyType = i % 3 === 0 ? 'palace' : i % 2 === 0 ? 'resort' : 'hotel';
    } else if (rawCategory === 'Premium') {
      basePrice = Math.round((200000 + (i % 6) * 20000) / 1000) * 1000;
      maxCapacity = 500 + (i % 5) * 80;
      propertyType = i % 2 === 0 ? 'resort' : 'hotel';
    } else if (rawCategory === 'Mid-Range') {
      basePrice = Math.round((110000 + (i % 5) * 15000) / 1000) * 1000;
      maxCapacity = 350 + (i % 4) * 60;
      propertyType = i % 2 === 0 ? 'banquet_hall' : 'hotel';
    } else {
      // Budget
      basePrice = Math.round((55000 + (i % 4) * 10000) / 1000) * 1000;
      maxCapacity = 200 + (i % 3) * 50;
      propertyType = 'hotel';
    }

    // Suitable For
    const suitableFor = ['Stay'];
    if (row[colIndex.wedding] === 'Yes') suitableFor.push('Wedding');
    if (row[colIndex.reception] === 'Yes') suitableFor.push('Reception');
    if (row[colIndex.birthday] === 'Yes') suitableFor.push('Birthday Party');
    if (row[colIndex.conference] === 'Yes') suitableFor.push('Corporate');

    // Amenities
    const amenities = [
      'High Speed Wi-Fi',
      'Central Air Conditioning',
      'Valet Parking',
      'Elevator / Lift',
      'In-house Catering',
      'Bridal Dressing Room',
      '100% Power Backup'
    ];
    if (rawCategory === 'Luxury' || rawCategory === 'Premium') {
      amenities.push('Swimming Pool', 'Spa & Wellness', 'Airport Shuttle', 'Rooftop Lounge');
    }

    const img1 = CURATED_IMAGES[i % CURATED_IMAGES.length];
    const img2 = CURATED_IMAGES[(i + 3) % CURATED_IMAGES.length];
    const img3 = CURATED_IMAGES[(i + 7) % CURATED_IMAGES.length];

    const rating = Number((4.1 + (i % 9) * 0.1).toFixed(1));
    const numReviews = 12 + (i % 45);

    propertiesToInsert.push({
      title: hotelName,
      propertyType,
      category: 'both',
      description: `${hotelName} is a premier ${rawCategory.toLowerCase()} hospitality property located in prime ${cityName}, ${cityData.state || stateName}. Featuring luxury banquet halls, world-class guest accommodation, gourmet catering, and state-of-the-art event hosting infrastructure.`,
      address: `Main Boulevard, Near City Centre, ${cityName}`,
      city: cityName,
      state: cityData.state || stateName,
      zipCode: '110001',
      location: { lat, lng },
      owner: owner._id,
      amenities,
      images: [img1, img2, img3],
      rating,
      numReviews,
      basePrice,
      maxCapacity,
      suitableFor,
      policies: {
        cancellation: 'Free cancellation up to 7 days before event date. 50% refund within 7 days.',
        checkIn: '12:00 PM',
        checkOut: '11:00 AM',
        alcoholAllowed: true,
        outsideCateringAllowed: rawCategory !== 'Luxury',
        musicAllowedUntil: '11:30 PM'
      },
      isApproved: true,
      isFeatured: rawCategory === 'Luxury' || i % 20 === 0
    });
  }

  console.log(`📦 Prepared ${propertiesToInsert.length} new properties to insert (Skipped ${skipped} duplicates/invalid).`);

  // Insert properties in batches of 250
  const insertedProperties = [];
  const BATCH_SIZE = 250;
  for (let i = 0; i < propertiesToInsert.length; i += BATCH_SIZE) {
    const chunk = propertiesToInsert.slice(i, i + BATCH_SIZE);
    const res = await Property.insertMany(chunk, { ordered: false });
    insertedProperties.push(...res);
    console.log(`  ✓ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(propertiesToInsert.length / BATCH_SIZE)} (${insertedProperties.length}/${propertiesToInsert.length})`);
  }

  // Create Sub-units for each inserted property
  console.log('🏛️ Creating sub-units (Banquet Halls & Guest Rooms) for new properties...');
  const unitsToInsert = [];
  for (const prop of insertedProperties) {
    // 1 Banquet Hall
    unitsToInsert.push({
      property: prop._id,
      name: `${prop.title} Grand Ballroom`,
      unitType: 'banquet_hall',
      capacity: prop.maxCapacity,
      pricePerUnit: prop.basePrice,
      priceType: 'per_day',
      sizeSqFt: Math.max(3500, prop.maxCapacity * 12),
      amenities: ['Central AC', 'Acoustic Soundproofing', 'Stage & Mandap Area', 'Chandelier Lighting'],
      images: [prop.images[0]],
      totalCount: 1,
      isActive: true
    });

    // 1 Guest Room Wing
    unitsToInsert.push({
      property: prop._id,
      name: 'Deluxe AC Guest Stay Suite',
      unitType: 'room',
      capacity: 3,
      pricePerUnit: Math.round(prop.basePrice * 0.035),
      priceType: 'per_night',
      sizeSqFt: 380,
      amenities: ['King Bed', 'Attached Washroom', 'Wi-Fi', '24/7 Room Service'],
      images: [prop.images[1] || prop.images[0]],
      totalCount: 20,
      isActive: true
    });
  }

  for (let i = 0; i < unitsToInsert.length; i += BATCH_SIZE * 2) {
    const chunk = unitsToInsert.slice(i, i + BATCH_SIZE * 2);
    await Unit.insertMany(chunk, { ordered: false });
  }

  const finalCount = await Property.countDocuments();
  console.log(`🎉 SUCCESS: Excel Hotel Dataset Import Complete!`);
  console.log(`📊 Total Properties in MongoDB: ${finalCount}`);

  return {
    insertedProperties: insertedProperties.length,
    totalProperties: finalCount
  };
}

if (require.main === module) {
  const filePath = process.argv[2] || 'C:\\Users\\KIIT0001\\Downloads\\india_100_cities_2000_hotel_seed_records.xlsx';
  importExcelHotels(filePath)
    .then((res) => {
      console.log('Done:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}

module.exports = importExcelHotels;
