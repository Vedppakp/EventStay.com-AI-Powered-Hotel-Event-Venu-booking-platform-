const mongoose = require('mongoose');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const User = require('../models/User');
const { INDIAN_CITIES_100, findCity } = require('../data/indianCities');
const cityCoordinates = require('../data/cityCoordinates.json');

const HOTEL_CHAINS = [
  { prefix: 'Taj', type: 'palace', tier: 'luxury', minPrice: 18000, maxPrice: 48000, minCap: 300, maxCap: 800 },
  { prefix: 'The Oberoi', type: 'resort', tier: 'luxury', minPrice: 22000, maxPrice: 55000, minCap: 250, maxCap: 600 },
  { prefix: 'ITC', type: 'hotel', tier: 'luxury', minPrice: 15000, maxPrice: 38000, minCap: 400, maxCap: 1200 },
  { prefix: 'The Leela Palace', type: 'palace', tier: 'luxury', minPrice: 20000, maxPrice: 50000, minCap: 300, maxCap: 900 },
  { prefix: 'JW Marriott', type: 'hotel', tier: 'luxury', minPrice: 14000, maxPrice: 35000, minCap: 350, maxCap: 1000 },
  { prefix: 'Grand Hyatt', type: 'resort', tier: 'luxury', minPrice: 16000, maxPrice: 42000, minCap: 400, maxCap: 1100 },
  { prefix: 'Radisson Blu', type: 'hotel', tier: 'mid', minPrice: 7500, maxPrice: 18000, minCap: 250, maxCap: 700 },
  { prefix: 'Lemon Tree Premier', type: 'hotel', tier: 'mid', minPrice: 5500, maxPrice: 14000, minCap: 200, maxCap: 500 },
  { prefix: 'Fortune Select', type: 'hotel', tier: 'mid', minPrice: 6000, maxPrice: 15000, minCap: 200, maxCap: 600 },
  { prefix: 'Courtyard by Marriott', type: 'hotel', tier: 'mid', minPrice: 8000, maxPrice: 19000, minCap: 250, maxCap: 650 },
  { prefix: 'Hyatt Regency', type: 'hotel', tier: 'luxury', minPrice: 11000, maxPrice: 26000, minCap: 300, maxCap: 850 },
  { prefix: 'Holiday Inn Express', type: 'hotel', tier: 'value', minPrice: 3800, maxPrice: 8500, minCap: 100, maxCap: 300 },
  { prefix: 'Ginger Hotel', type: 'hotel', tier: 'value', minPrice: 2800, maxPrice: 6500, minCap: 80, maxCap: 250 },
  { prefix: 'Treebo Trend', type: 'hotel', tier: 'value', minPrice: 2200, maxPrice: 5500, minCap: 60, maxCap: 200 },
  { prefix: 'FabHotel Prime', type: 'hotel', tier: 'value', minPrice: 1900, maxPrice: 4800, minCap: 50, maxCap: 180 },
  { prefix: 'Heritage Haveli & Resort', type: 'palace', tier: 'mid', minPrice: 9500, maxPrice: 24000, minCap: 250, maxCap: 750 },
  { prefix: 'Royal Orchid Convention', type: 'banquet_hall', tier: 'mid', minPrice: 12000, maxPrice: 32000, minCap: 400, maxCap: 1200 },
  { prefix: 'CGH Earth Eco Sanctuary', type: 'resort', tier: 'luxury', minPrice: 15000, maxPrice: 36000, minCap: 150, maxCap: 450 }
];

const HOTEL_SUFFIXES = [
  'City Centre',
  'Resort & Spa',
  'Palace & Lawns',
  'Grand Convention',
  'Suites & Residences',
  'Lakeside Retreat',
  'Airport Gateway',
  'Heritage Villa',
  'Beachfront Estate',
  'Regency & Ballrooms'
];

const CURATED_HOTEL_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545232979-fbf67500b462?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
];

async function seedMoreHotels() {
  console.log('🚀 Starting Additional Hotels Seeding Process...');
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventstay';
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  }

  let owner = await User.findOne({ role: 'owner' });
  if (!owner) {
    owner = await User.findOne({});
  }

  const existingTitles = new Set(
    (await Property.find({}, 'title city').lean()).map(p => `${p.title.toLowerCase().trim()}__${p.city.toLowerCase().trim()}`)
  );
  console.log(`Current existing properties count: ${existingTitles.size}`);

  const propertiesToInsert = [];
  const TARGET_ADDITIONAL_HOTELS = 1000;
  let count = 0;

  const citiesList = Object.values(cityCoordinates);
  console.log(`Distributing new hotels across ${citiesList.length} Indian cities...`);

  // Distribute across all Indian cities
  for (const cityObj of citiesList) {
    if (count >= TARGET_ADDITIONAL_HOTELS) break;

    const coords = { lat: cityObj.lat || 20.5937, lng: cityObj.lng || 78.9629 };
    // 10 new hotels per city = 1,000 new hotels!
    for (let i = 0; i < 10; i++) {
      const chain = HOTEL_CHAINS[(count + i) % HOTEL_CHAINS.length];
      const suffix = HOTEL_SUFFIXES[(count + i * 2) % HOTEL_SUFFIXES.length];
      const hotelTitle = `${chain.prefix} ${cityObj.name} ${suffix}`;
      const key = `${hotelTitle.toLowerCase().trim()}__${cityObj.name.toLowerCase().trim()}`;

      if (existingTitles.has(key)) {
        continue;
      }

      // Small jitter for coordinates so pins don't overlap exactly
      const latOffset = (Math.random() - 0.5) * 0.08;
      const lngOffset = (Math.random() - 0.5) * 0.08;

      const randomPrice = Math.round(
        (chain.minPrice + Math.random() * (chain.maxPrice - chain.minPrice)) / 500
      ) * 500;

      const randomCapacity = Math.round(
        (chain.minCap + Math.random() * (chain.maxCap - chain.minCap)) / 25
      ) * 25;

      const rating = Number((4.0 + Math.random() * 0.95).toFixed(1));
      const reviews = Math.floor(45 + Math.random() * 850);

      const photoIdx1 = (count + i) % CURATED_HOTEL_PHOTOS.length;
      const photoIdx2 = (count + i + 3) % CURATED_HOTEL_PHOTOS.length;
      const photoIdx3 = (count + i + 7) % CURATED_HOTEL_PHOTOS.length;

      propertiesToInsert.push({
        title: hotelTitle,
        propertyType: chain.type,
        category: 'both',
        description: `Experience premier Indian hospitality at ${hotelTitle}. Situated conveniently in prime ${cityObj.name}, offering luxury guest accommodations, state-of-the-art banquet facilities, fine dining restaurants, and immaculate event services.`,
        address: `${Math.floor(10 + Math.random() * 900)} Prime Boulevard, ${cityObj.name}`,
        city: cityObj.name,
        state: 'India',
        zipCode: `${Math.floor(100000 + Math.random() * 899999)}`,
        location: {
          lat: Number((coords.lat + latOffset).toFixed(5)),
          lng: Number((coords.lng + lngOffset).toFixed(5))
        },
        owner: owner._id,
        amenities: [
          'High-Speed Free WiFi',
          'Swimming Pool & Sun Deck',
          'Air Conditioning',
          'Grand Banquet Hall',
          'Fine Dining Restaurant',
          '24/7 Room Service',
          'Valet Parking',
          'Fitness Centre & Spa',
          'Bar & Lounge'
        ],
        images: [
          CURATED_HOTEL_PHOTOS[photoIdx1],
          CURATED_HOTEL_PHOTOS[photoIdx2],
          CURATED_HOTEL_PHOTOS[photoIdx3]
        ],
        rating: rating,
        numReviews: reviews,
        basePrice: randomPrice,
        maxCapacity: randomCapacity,
        suitableFor: ['Wedding', 'Reception', 'Corporate', 'Birthday Party', 'Stay'],
        policies: {
          cancellation: 'Free cancellation up to 48 hours before check-in',
          checkIn: '12:00 PM',
          checkOut: '11:00 AM'
        },
        isApproved: true,
        featured: Math.random() < 0.25
      });

      existingTitles.add(key);
      count++;
      if (count >= TARGET_ADDITIONAL_HOTELS) break;
    }
  }

  console.log(`Generated ${propertiesToInsert.length} additional hotel properties. Inserting in batches...`);

  // Insert in batches of 100
  const batchSize = 100;
  let insertedProperties = [];
  for (let b = 0; b < propertiesToInsert.length; b += batchSize) {
    const chunk = propertiesToInsert.slice(b, b + batchSize);
    const result = await Property.insertMany(chunk);
    insertedProperties.push(...result);
    console.log(`  ✓ Inserted batch ${Math.floor(b / batchSize) + 1} (${insertedProperties.length} / ${propertiesToInsert.length})`);
  }

  console.log(`Generating units for ${insertedProperties.length} new hotels...`);
  const unitsToInsert = [];
  for (const prop of insertedProperties) {
    // 1. Banquet Hall or Event Lawn
    unitsToInsert.push({
      property: prop._id,
      name: `${prop.title} - Grand Ballroom & Lawn`,
      unitType: 'banquet_hall',
      capacity: prop.maxCapacity,
      pricePerUnit: Math.round(prop.basePrice * 0.8),
      priceType: 'per_day',
      sizeSqFt: 5500,
      amenities: ['Central AC', 'Acoustic Sound', 'Stage & Mandap Area', 'Bridal Suite'],
      images: [prop.images[1] || prop.images[0]],
      totalCount: 1,
      isActive: true
    });

    // 2. Deluxe AC Hotel Guest Rooms
    unitsToInsert.push({
      property: prop._id,
      name: `Deluxe AC Guest Room - ${prop.title}`,
      unitType: 'room',
      capacity: 3,
      pricePerUnit: Math.round(prop.basePrice * 0.08),
      priceType: 'per_night',
      sizeSqFt: 380,
      amenities: ['King Bed', 'Free WiFi', 'Flat TV', 'Attached Bath', 'Work Desk'],
      images: [prop.images[0]],
      totalCount: 25,
      isActive: true
    });

    // 3. Executive Suite
    unitsToInsert.push({
      property: prop._id,
      name: `Executive Suite - ${prop.title}`,
      unitType: 'suite',
      capacity: 4,
      pricePerUnit: Math.round(prop.basePrice * 0.14),
      priceType: 'per_night',
      sizeSqFt: 620,
      amenities: ['Living Area', 'King Bed', 'City View', 'Complimentary Breakfast', 'Mini Bar'],
      images: [prop.images[2] || prop.images[0]],
      totalCount: 8,
      isActive: true
    });
  }

  console.log(`Inserting ${unitsToInsert.length} hotel room & banquet units in batches...`);
  for (let u = 0; u < unitsToInsert.length; u += 500) {
    const chunk = unitsToInsert.slice(u, u + 500);
    await Unit.insertMany(chunk);
  }

  const finalCount = await Property.countDocuments();
  const finalUnitsCount = await Unit.countDocuments();
  console.log(`🎉 SUCCESS! Database now contains:`);
  console.log(`   🏨 ${finalCount} Total Hotel & Venue Properties`);
  console.log(`   🛏️ ${finalUnitsCount} Total Units (Hotel Rooms & Banquet Halls)`);
  process.exit(0);
}

seedMoreHotels().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
