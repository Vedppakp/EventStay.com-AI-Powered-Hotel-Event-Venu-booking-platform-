require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const EventService = require('../models/EventService');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Complaint = require('../models/Complaint');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventstay';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Property.deleteMany({});
    await Unit.deleteMany({});
    await EventService.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    await Complaint.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Seed Users
    const customer = await User.create({
      name: 'Aarav Sharma',
      email: 'customer@eventstay.com',
      password: 'password123',
      role: 'customer',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
    });

    const owner1 = await User.create({
      name: 'Ved Prakash Pandey',
      email: 'owner@eventstay.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98123 45678',
      businessName: 'Pandey Hospitality & Heritage Venues',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
    });

    const owner2 = await User.create({
      name: 'Sunita Roy',
      email: 'owner2@eventstay.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 97234 56789',
      businessName: 'Royal Celebrations Group',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    });

    const admin = await User.create({
      name: 'Platform Administrator',
      email: 'admin@eventstay.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 99999 00000',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
    });

    console.log('Created Users (Customer, Owners, Admin).');

    // 2. Seed Properties
    const mithilaPalace = await Property.create({
      title: 'Mithila Palace Banquet & Resort',
      propertyType: 'palace',
      category: 'both',
      description:
        'A magnificent heritage-inspired banquet and luxury stay designed for royal weddings, grand receptions, and cultural celebrations. Features expansive pillarless halls, lush landscaped gardens, and high-end guest rooms.',
      address: 'Station Road, Near Janaki Mandir Chowk',
      city: 'Janakpur',
      state: 'Janakpurdham',
      zipCode: '45600',
      location: { lat: 26.7288, lng: 85.9244 },
      owner: owner1._id,
      amenities: [
        'Central AC',
        'Ample Car Parking (150+ cars)',
        'Bridal Dressing Suite',
        '24/7 Power Generator Backup',
        'In-house Catering Setup',
        'High Speed Wi-Fi',
        'Swimming Pool',
        'Grand Stage with LED wall'
      ],
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.4,
      numReviews: 28,
      basePrice: 65000,
      maxCapacity: 350,
      suitableFor: ['Wedding', 'Reception', 'Engagement', 'Birthday Party', 'Anniversary', 'Cultural Event'],
      policies: {
        cancellation: 'Free cancellation up to 7 days before event date',
        checkIn: '12:00 PM',
        checkOut: '11:00 AM',
        decorPolicy: 'In-house decor and approved vendor panels only',
        cateringPolicy: 'Vegetarian and non-vegetarian pure ingredients cooked in dedicated kitchens'
      },
      isApproved: true,
      featured: true
    });

    const royalBanquet = await Property.create({
      title: 'Royal Banquet & Convention Centre',
      propertyType: 'banquet_hall',
      category: 'venue',
      description:
        'Sophisticated banquet hall equipped with crystal chandeliers, acoustic wall panels, and state-of-the-art stage lighting. Ideal for lavish wedding galas, corporate annual meetings, and conferences.',
      address: 'Main Ring Road, Ramanand Chowk',
      city: 'Janakpur',
      state: 'Janakpurdham',
      zipCode: '45601',
      location: { lat: 26.732, lng: 85.931 },
      owner: owner1._id,
      amenities: [
        'Central AC',
        'Valet Parking',
        'Stage Lighting System',
        'DJ Console Area',
        'Power Backup',
        'Catering Kitchen Space'
      ],
      images: [
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.6,
      numReviews: 42,
      basePrice: 80000,
      maxCapacity: 400,
      suitableFor: ['Wedding', 'Corporate', 'Reception', 'Exhibition'],
      isApproved: true,
      featured: true
    });

    const cityCelebration = await Property.create({
      title: 'City Celebration Hall & Garden Lawn',
      propertyType: 'venue',
      category: 'venue',
      description:
        'Sprawling celebration destination combining an opulent indoor ballroom and an open-air starlit garden lawn capable of hosting large guest gatherings up to 500 people.',
      address: 'Civil Lines, Near Stadium Road',
      city: 'Janakpur',
      state: 'Janakpurdham',
      zipCode: '45602',
      location: { lat: 26.719, lng: 85.918 },
      owner: owner2._id,
      amenities: [
        'Open Air Lawn',
        'Covered Banquet',
        'Bridal Room',
        'Large Parking Ground',
        'Fireworks Zone Permitted',
        'Full Power Backup'
      ],
      images: [
        'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.7,
      numReviews: 35,
      basePrice: 95000,
      maxCapacity: 500,
      suitableFor: ['Wedding', 'Reception', 'Musical Concert', 'Cultural Festival'],
      isApproved: true,
      featured: true
    });

    const heritageGrand = await Property.create({
      title: 'Hotel Heritage Grand & Suites',
      propertyType: 'hotel',
      category: 'both',
      description:
        'Premium 4-star boutique hotel with luxury rooms, rooftop banquet terrace, conference boardrooms, and all-day dining multi-cuisine restaurant. Perfect for guest stay packages.',
      address: 'Bhanu Chowk, Central Avenue',
      city: 'Janakpur',
      state: 'Janakpurdham',
      zipCode: '45600',
      location: { lat: 26.735, lng: 85.929 },
      owner: owner2._id,
      amenities: [
        'Luxury Hotel Rooms',
        'Rooftop Terrace',
        'Fine Dining Restaurant',
        'Elevator',
        'Room Service',
        'High Speed Wi-Fi'
      ],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.5,
      numReviews: 19,
      basePrice: 55000,
      maxCapacity: 250,
      suitableFor: ['Guest Accommodation', 'Corporate Meeting', 'Intimate Wedding', 'Birthday'],
      isApproved: true,
      featured: false
    });

    const patnaResort = await Property.create({
      title: 'The Grand Vivanta Resort & Spa',
      propertyType: 'resort',
      category: 'both',
      description:
        'An oasis of luxury offering lake views, grand ballrooms, private luxury cottages, and spa services for destination weddings and corporate retreats.',
      address: 'Patliputra Greens, Bailey Road',
      city: 'Patna',
      state: 'Bihar',
      zipCode: '800001',
      location: { lat: 25.5941, lng: 85.1376 },
      owner: owner1._id,
      amenities: ['Resort Cottages', 'Lake View Banquet', 'Spa & Wellness', 'Valet Parking', 'Swimming Pool'],
      images: [
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 53,
      basePrice: 120000,
      maxCapacity: 600,
      suitableFor: ['Destination Wedding', 'Corporate Retreat', 'Mega Reception'],
      isApproved: true,
      featured: true
    });

    const hotelMaurya = await Property.create({
      title: 'Hotel Maurya Heritage Banquet & Lawns',
      propertyType: 'hotel',
      category: 'both',
      description:
        'Patna premier landmark luxury hotel featuring the majestic Kautilya and Ashoka Ballrooms, executive suites, and poolside cocktail lawns in the heart of the city.',
      address: 'Fraser Road, South Gandhi Maidan',
      city: 'Patna',
      state: 'Bihar',
      zipCode: '800001',
      location: { lat: 25.6135, lng: 85.1384 },
      owner: owner2._id,
      amenities: ['City Center', 'Ballroom Suites', 'Swimming Pool', 'Multi-cuisine Dining', 'Valet Parking'],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.6,
      numReviews: 38,
      basePrice: 95000,
      maxCapacity: 450,
      suitableFor: ['Wedding', 'Corporate', 'Reception'],
      isApproved: true,
      featured: false
    });

    // --- NEW DELHI / NCR ---
    const leelaDelhi = await Property.create({
      title: 'The Leela Palace New Delhi',
      propertyType: 'palace',
      category: 'both',
      description:
        'A monument of architectural grandeur in the Diplomatic Enclave, blending Lutyens architectural style with royal Indian palaces. Features the Grand Ballroom, royal rooftop infinity pool, and gold-leafed banquet halls.',
      address: 'Diplomatic Enclave, Chanakyapuri',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110023',
      location: { lat: 28.5794, lng: 77.1866 },
      owner: owner1._id,
      amenities: ['Royal Ballroom', 'Rooftop Infinity Pool', 'Michelin Star Dining', 'Helipad', 'Central AC', 'Valet Parking'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 87,
      basePrice: 280000,
      maxCapacity: 700,
      suitableFor: ['Luxury Wedding', 'High-Profile Reception', 'Diplomatic Gala', 'Corporate Summit'],
      isApproved: true,
      featured: true
    });

    const tivoliDelhi = await Property.create({
      title: 'Tivoli Grand Resort & Celebration Lawns',
      propertyType: 'resort',
      category: 'both',
      description:
        'North Delhi premier destination wedding wonderland featuring sprawling manicured lawns, two indoor royal ballrooms, and 60+ lavish guest suites for big-fat Indian weddings.',
      address: 'Main G.T. Karnal Road, Alipur',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110036',
      location: { lat: 28.7972, lng: 77.1322 },
      owner: owner2._id,
      amenities: ['Sprawling Wedding Lawns', 'Dual Indoor Ballrooms', '60+ Guest Rooms', 'Dedicated Baraat Pathway', 'Ample Parking (500+ cars)'],
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.7,
      numReviews: 64,
      basePrice: 190000,
      maxCapacity: 1200,
      suitableFor: ['Grand Wedding', 'Sangeet Night', 'Mega Reception', 'Cultural Festival'],
      isApproved: true,
      featured: true
    });

    // --- MUMBAI ---
    const tajMumbai = await Property.create({
      title: 'The Taj Mahal Palace & Tower Mumbai',
      propertyType: 'palace',
      category: 'both',
      description:
        'The timeless icon of Indian hospitality standing majestically opposite the Gateway of India since 1903. Host royal wedding galas in the landmark Crystal Room and Ballroom with sweeping Arabian Sea views.',
      address: 'Apollo Bunder, Colaba, Gateway of India',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      location: { lat: 18.9217, lng: 72.8332 },
      owner: owner1._id,
      amenities: ['Arabian Sea View', 'Crystal Ballroom', 'Heritage Luxury Suites', 'Valet Parking', '24/7 Butler Service'],
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 112,
      basePrice: 380000,
      maxCapacity: 600,
      suitableFor: ['Royal Wedding', 'Celebrity Reception', 'Luxury Gala'],
      isApproved: true,
      featured: true
    });

    const jwMarriottMumbai = await Property.create({
      title: 'JW Marriott Mumbai Juhu',
      propertyType: 'hotel',
      category: 'both',
      description:
        'Iconic beachfront luxury hotel overlooking the shimmering waters of the Arabian Sea at Juhu Beach. Features sprawling seaside lawns, salt-water pools, and the Grand Sangam Ballroom.',
      address: 'Juhu Tara Road, Juhu Beach',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400049',
      location: { lat: 19.1009, lng: 72.8258 },
      owner: owner2._id,
      amenities: ['Beachfront Sunset Lawn', 'Sangam Grand Ballroom', 'Infinity Pool', 'Celebrity Preferred Venue'],
      images: [
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 78,
      basePrice: 260000,
      maxCapacity: 800,
      suitableFor: ['Beach Wedding', 'Cocktail Night', 'Sangeet Party', 'Reception'],
      isApproved: true,
      featured: false
    });

    // --- JAIPUR ---
    const rambaghJaipur = await Property.create({
      title: 'Rambagh Palace — The Jewel of Jaipur',
      propertyType: 'palace',
      category: 'both',
      description:
        'Former residence of the Maharaja of Jaipur, Rambagh Palace offers 47 acres of tranquil Mughal gardens, marble corridors, and world-renowned heritage hospitality for fairy-tale royal weddings.',
      address: 'Bhawani Singh Road, Rambagh',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302005',
      location: { lat: 26.8980, lng: 75.8080 },
      owner: owner1._id,
      amenities: ['Mughal Heritage Lawns', 'Maharani Suite', 'Elephant Welcome Pathway', 'Peacock Gardens', 'Royal Spa'],
      images: [
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 5.0,
      numReviews: 95,
      basePrice: 450000,
      maxCapacity: 850,
      suitableFor: ['Royal Wedding', 'Heritage Ceremony', 'Destination Wedding'],
      isApproved: true,
      featured: true
    });

    const fairmontJaipur = await Property.create({
      title: 'Fairmont Jaipur Luxury Palace & Lawns',
      propertyType: 'palace',
      category: 'both',
      description:
        'Nestled among the majestic Aravalli hills, Fairmont Jaipur is built in the style of Mughal palaces and Rajput strongholds, offering massive banquet spaces, rooftop terraces, and royal courtyards.',
      address: 'Riico Kukas, Amer',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302028',
      location: { lat: 27.0394, lng: 75.8982 },
      owner: owner2._id,
      amenities: ['Aravalli Mountain Views', 'Grand Zubin Ballroom', 'Aishbagh Courtyard', 'Royal Carriage Entrance'],
      images: [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 72,
      basePrice: 290000,
      maxCapacity: 1000,
      suitableFor: ['Destination Wedding', 'Grand Reception', 'Sangeet Gala'],
      isApproved: true,
      featured: true
    });

    // --- UDAIPUR ---
    const oberoiUdaivilas = await Property.create({
      title: 'The Oberoi Udaivilas — Lake Pichola',
      propertyType: 'palace',
      category: 'both',
      description:
        'Consistently rated among the top destination wedding resorts on Earth. Situated on the bank of Lake Pichola, featuring magnificent domes, frescoed corridors, reflecting pools, and starlit promenade lawns.',
      address: 'Haridas Ji Ki Magri, Lake Pichola',
      city: 'Udaipur',
      state: 'Rajasthan',
      zipCode: '313001',
      location: { lat: 24.5772, lng: 73.6730 },
      owner: owner1._id,
      amenities: ['Lake Pichola Boat Arrival', 'Reflecting Pools', 'Chandra Mahal Ballroom', 'Kohinoor Suite', 'Royal Spa'],
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 5.0,
      numReviews: 120,
      basePrice: 500000,
      maxCapacity: 500,
      suitableFor: ['Fairy Tale Wedding', 'Lakefront Reception', 'Celebrity Event'],
      isApproved: true,
      featured: true
    });

    const tajLakePalace = await Property.create({
      title: 'Taj Lake Palace — Floating Marble Island',
      propertyType: 'palace',
      category: 'both',
      description:
        'A magical 18th-century floating palace of white marble in the middle of Lake Pichola, accessible only by private boat. Unparalleled romance for intimate destination weddings and vows.',
      address: 'Pichola Island, Lake Pichola',
      city: 'Udaipur',
      state: 'Rajasthan',
      zipCode: '313001',
      location: { lat: 24.5755, lng: 73.6800 },
      owner: owner2._id,
      amenities: ['Island Location', 'Private Boat Shuttle', 'Lily Pond Courtyard', 'Royal Mewar Dining'],
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 82,
      basePrice: 420000,
      maxCapacity: 350,
      suitableFor: ['Intimate Royal Wedding', 'Vow Renewal', 'Exclusive Buyout'],
      isApproved: true,
      featured: true
    });

    // --- GOA ---
    const tajExoticaGoa = await Property.create({
      title: 'Taj Exotica Resort & Spa South Goa',
      propertyType: 'resort',
      category: 'both',
      description:
        'Mediterranean-style resort set along 56 acres of pristine greenery on Benaulim Beach. Enjoy sun-kissed barefoot beach weddings, sunset lawns, and palatial air-conditioned ballrooms.',
      address: 'Calwaddo, Benaulim Beach',
      city: 'Goa',
      state: 'Goa',
      zipCode: '403716',
      location: { lat: 15.2443, lng: 73.9262 },
      owner: owner1._id,
      amenities: ['Direct Beach Access', 'Sunset Sea Lawn', 'Sala Grande Ballroom', 'Tropical Golf Course', 'Pool Villas'],
      images: [
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 91,
      basePrice: 320000,
      maxCapacity: 750,
      suitableFor: ['Beach Wedding', 'Sunset Reception', 'Poolside Cocktail'],
      isApproved: true,
      featured: true
    });

    const wGoa = await Property.create({
      title: 'W Goa — Luxury Beachfront Resort',
      propertyType: 'resort',
      category: 'both',
      description:
        'Electrifying destination wedding venue situated beneath the historic Chapora Fort overlooking Vagator Beach. Features cliffside Rockpool lawns, neon-lit lounges, and contemporary luxury.',
      address: 'Vagator Beach, Bardez',
      city: 'Goa',
      state: 'Goa',
      zipCode: '403509',
      location: { lat: 15.6025, lng: 73.7380 },
      owner: owner2._id,
      amenities: ['Cliffside Rockpool Lawn', 'Vagator Beachfront', 'Great Room Banquet', 'Chic Pool Villas'],
      images: [
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 67,
      basePrice: 275000,
      maxCapacity: 600,
      suitableFor: ['Destination Beach Wedding', 'Youth Party', 'Sangeet Night'],
      isApproved: true,
      featured: false
    });

    // --- BENGALURU ---
    const leelaBengaluru = await Property.create({
      title: 'The Leela Palace Bengaluru',
      propertyType: 'palace',
      category: 'both',
      description:
        'Inspired by the architectural opulence of Mysore Palace, The Leela Palace Bengaluru stands amidst 7 acres of lush greenery with grand domes, arches, and the majestic Grand Ballroom.',
      address: '23 HAL Old Airport Road, Kodihalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560008',
      location: { lat: 12.9606, lng: 77.6484 },
      owner: owner1._id,
      amenities: ['Grand Ballroom', 'Royal Garden Courtyards', 'Mysore Palace Architecture', 'Luxury Spa'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 76,
      basePrice: 220000,
      maxCapacity: 650,
      suitableFor: ['Grand Wedding', 'Tech Conference', 'Reception'],
      isApproved: true,
      featured: true
    });

    const tajWestEnd = await Property.create({
      title: 'Taj West End — Heritage Garden Hotel',
      propertyType: 'hotel',
      category: 'both',
      description:
        'Bengaluru oldest and most romantic heritage luxury hotel, sprawling across 20 acres of tropical flora, 125-year-old banyan trees, and colonial banquet pavilions.',
      address: 'Race Course Road, High Grounds',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560001',
      location: { lat: 12.9863, lng: 77.5850 },
      owner: owner2._id,
      amenities: ['Prince of Wales Lawn', 'Heritage Banyan Tree Canopy', 'Grand Ballroom', 'Open Terrace'],
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.7,
      numReviews: 58,
      basePrice: 210000,
      maxCapacity: 800,
      suitableFor: ['Garden Wedding', 'Evening Reception', 'Corporate Gala'],
      isApproved: true,
      featured: false
    });

    // --- HYDERABAD ---
    const falaknumaHyderabad = await Property.create({
      title: 'Taj Falaknuma Palace — Mirror in the Sky',
      propertyType: 'palace',
      category: 'both',
      description:
        'Perched 2,000 feet above Hyderabad, Falaknuma was the royal residence of the Nizam. Arrive by horse-drawn carriage and exchange vows on marble terraces overlooking the illuminated City of Pearls.',
      address: 'Engine Bowli, Fatima Nagar, Falaknuma',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500053',
      location: { lat: 17.3314, lng: 78.4674 },
      owner: owner1._id,
      amenities: ['Horse-Drawn Carriage Arrival', 'Durbar Hall', '101 Dining Table', 'Panoramic City Views', 'Nizam Suites'],
      images: [
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 5.0,
      numReviews: 104,
      basePrice: 520000,
      maxCapacity: 600,
      suitableFor: ['Royal Nizam Wedding', 'Celebrity Vows', 'Heritage Reception'],
      isApproved: true,
      featured: true
    });

    // --- KOLKATA ---
    const itcKolkata = await Property.create({
      title: 'ITC Sonar & ITC Royal Bengal',
      propertyType: 'hotel',
      category: 'both',
      description:
        'An architectural masterpiece paying tribute to Bengal aristocratic past, featuring one of largest pillarless ballrooms in India (The Bengal Stateroom), lily ponds, and award-winning cuisines.',
      address: '1 JBS Haldane Avenue, EM Bypass',
      city: 'Kolkata',
      state: 'West Bengal',
      zipCode: '700046',
      location: { lat: 22.5448, lng: 88.3986 },
      owner: owner2._id,
      amenities: ['The Bengal Stateroom (16,000 sq.ft)', 'Pillarless Ballroom', 'Lily Pond Lawns', 'Dum Pukht Dining'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 69,
      basePrice: 230000,
      maxCapacity: 1000,
      suitableFor: ['Grand Wedding', 'Corporate Summit', 'Fashion Gala'],
      isApproved: true,
      featured: true
    });

    // --- VARANASI ---
    const brijramaVaranasi = await Property.create({
      title: 'BrijRama Palace Heritage Hotel — Ganga Ghats',
      propertyType: 'palace',
      category: 'both',
      description:
        'One of the oldest heritage structures on Darbhanga Ghat dating back to 1812. Accessible by Bajra boats along the holy River Ganga, providing an ethereal setting for sacred spiritual wedding ceremonies.',
      address: 'Darbhanga Ghat, Dashashwamedh',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      zipCode: '221001',
      location: { lat: 25.3045, lng: 83.0094 },
      owner: owner1._id,
      amenities: ['Private Ganga Boat Transfer', 'Riverfront Terrace Mandap', 'Pure Vegetarian Royal Kitchen', 'Classical Sitar Evenings'],
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 54,
      basePrice: 140000,
      maxCapacity: 300,
      suitableFor: ['Spiritual Wedding', 'Traditional Mandap Vows', 'Cultural Gathering'],
      isApproved: true,
      featured: true
    });

    // --- ADDITIONAL TIER 1 (HIGH BUDGET) PROPERTIES ---
    const ritzPune = await Property.create({
      title: 'The Ritz-Carlton Pune & Golf Course Greens',
      propertyType: 'hotel',
      category: 'both',
      description: 'Opulent urban palace overlooking the 100-acre Poona Club Golf Course. Features soaring ballroom ceilings, private outdoor terraces, and Michelin-inspired wedding culinary curation.',
      address: 'Golf Course Square, Airport Road, Yerawada',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411006',
      location: { lat: 18.5529, lng: 73.8996 },
      owner: owner1._id,
      amenities: ['Grand Ballroom (7,200 sq.ft)', 'Golf Course View Foyer', 'Bridal Dressing Lounge', 'Helipad Access'],
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 62,
      basePrice: 260000,
      maxCapacity: 700,
      suitableFor: ['Luxury Wedding', 'Golf Cocktail Gala', 'Corporate Summit'],
      isApproved: true,
      featured: true
    });

    const himalayanManali = await Property.create({
      title: 'The Himalayan Luxury Castle & Apple Orchard Lawns',
      propertyType: 'resort',
      category: 'both',
      description: 'Victorian Gothic castle nestled in lush deodar woods and historic apple orchards. Unrivaled panoramic vistas of snow-draped Himalayan peaks and glacial torrents for intimate destination weddings.',
      address: 'Hadimba Temple Road, Log Huts Area',
      city: 'Manali',
      state: 'Himachal Pradesh',
      zipCode: '175131',
      location: { lat: 32.2530, lng: 77.1890 },
      owner: owner2._id,
      amenities: ['Snow Peak Amphitheatre', 'Apple Orchard Mandap', 'Bonfire Courtyard', 'Chalet Guest Suites'],
      images: [
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 48,
      basePrice: 280000,
      maxCapacity: 350,
      suitableFor: ['Mountain Destination Wedding', 'Winter Wonderland Ceremony', 'Intimate Luxury Nuptials'],
      isApproved: true,
      featured: true
    });

    const itcAgra = await Property.create({
      title: 'ITC Mughal — Taj View Luxury Collection Resort',
      propertyType: 'resort',
      category: 'both',
      description: 'Sprawled over 35 acres of Mughal gardens with tranquil water bodies and courtyards reminiscent of royal imperial Mughal dynasty. Exclusive Taj Mahal viewing terraces.',
      address: 'Taj Ganj, Fatehabad Road',
      city: 'Agra',
      state: 'Uttar Pradesh',
      zipCode: '282001',
      location: { lat: 27.1610, lng: 78.0420 },
      owner: owner1._id,
      amenities: ['Mughal Waterway Lawns', 'Dewan-e-Khas Ballroom', 'Kaya Kalp Royal Spa', 'Elephant Welcome Foyer'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 76,
      basePrice: 280000,
      maxCapacity: 800,
      suitableFor: ['Imperial Mughal Wedding', 'Taj View Reception', 'Grand Gala Dinner'],
      isApproved: true,
      featured: true
    });

    const oberoiGurgaon = await Property.create({
      title: 'The Oberoi Gurugram Grand Ballroom & Water Courtyard',
      propertyType: 'hotel',
      category: 'both',
      description: 'Ultra-contemporary luxury urban sanctuary with an iconic Olympic-size reflecting water pool, manicured gardens, and Delhi-NCR largest pillarless glass-front ballrooms.',
      address: '443 Udyog Vihar, Phase V',
      city: 'Gurugram',
      state: 'Haryana',
      zipCode: '122016',
      location: { lat: 28.5021, lng: 77.0878 },
      owner: owner2._id,
      amenities: ['Water Courtyard Amphitheatre', 'Pillarless Grand Ballroom', 'Skyline Suites', '24-hour Personal Butler'],
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 83,
      basePrice: 320000,
      maxCapacity: 650,
      suitableFor: ['High-Profile Wedding', 'Corporate Gala', 'Cocktail Sundowner'],
      isApproved: true,
      featured: true
    });

    const hyattKochi = await Property.create({
      title: 'Grand Hyatt Kochi Bolgatty & Waterfront Lawns',
      propertyType: 'resort',
      category: 'both',
      description: 'A spectacular waterfront resort perched on Bolgatty Island overlooking Vembanad Lake and Kochi city skyline. Features grand indoor arenas and coconut grove waterfront lawns.',
      address: 'Bolgatty Island, Mulavukad',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682504',
      location: { lat: 9.9876, lng: 76.2655 },
      owner: owner1._id,
      amenities: ['Private Marina Yacht Arrival', 'Lakeside Wedding Lawn', 'Grand Pillarless Ballroom', 'Ayurvedic Retreat'],
      images: [
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 68,
      basePrice: 270000,
      maxCapacity: 900,
      suitableFor: ['Backwaters Destination Wedding', 'Island Sangeet', 'Grand Waterfront Reception'],
      isApproved: true,
      featured: true
    });

    const tajRishikesh = await Property.create({
      title: 'Taj Rishikesh Resort & Spa — Ganga Cliff Lawns',
      propertyType: 'resort',
      category: 'both',
      description: 'Poised on a majestic forested cliff facing the sacred white sands of River Ganga. Provides tranquil outdoor pavilions for Vedic wedding rituals in pristine Himalayan serenity.',
      address: 'Singthali, Rishikesh-Badrinath Road',
      city: 'Rishikesh',
      state: 'Uttarakhand',
      zipCode: '249192',
      location: { lat: 30.0620, lng: 78.4350 },
      owner: owner1._id,
      amenities: ['Private Ganga Sand Beach', 'Vedic Fire Pavilion', 'Cliffside Horizon Lawn', 'Jiva Spa & Wellness'],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 5.0,
      numReviews: 59,
      basePrice: 210000,
      maxCapacity: 400,
      suitableFor: ['Vedic Sacred Nuptials', 'Wellness Wedding Retreat', 'Serene Ganga Mandap'],
      isApproved: true,
      featured: true
    });

    // --- ADDITIONAL TIER 2 (MID BUDGET) PROPERTIES ---
    const lalithaMysuru = await Property.create({
      title: 'Lalitha Mahal Palace Heritage Hotel & Royal Lawns',
      propertyType: 'palace',
      category: 'both',
      description: 'A glimmering white Renaissance palace built by Maharaja of Mysore, set in sprawling terraced gardens beneath Chamundi Hill. Italian marble staircases and Belgian glass chandeliers.',
      address: 'Lalitha Mahal Nagar',
      city: 'Mysuru',
      state: 'Karnataka',
      zipCode: '570028',
      location: { lat: 12.2980, lng: 76.6910 },
      owner: owner2._id,
      amenities: ['Royal Banqueting Hall', 'Chamundi Hill Backdrop Lawn', 'Maharani Balcony', 'Vintage Car Chauffeur'],
      images: [
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 44,
      basePrice: 190000,
      maxCapacity: 500,
      suitableFor: ['Royal Palace Wedding', 'Heritage Reception', 'Royal Feast Banquet'],
      isApproved: true,
      featured: true
    });

    const brilliantIndore = await Property.create({
      title: 'Brilliant Convention Centre & Grand Wedding Lawns',
      propertyType: 'banquet_hall',
      category: 'both',
      description: 'Central India premier 5-star venue complex with world-class acoustic pillarless halls and lush party lawns. Acclaimed for legendary Malwi and Royal Marwari culinary feasts.',
      address: 'Plot No. 5, Scheme 78, Vijay Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      zipCode: '452010',
      location: { lat: 22.7540, lng: 75.8920 },
      owner: owner1._id,
      amenities: ['Pillarless Grand Ballrooms (15,000 sq.ft)', '500-car Valet Parking', 'Bridal Dressing Suites', 'High-speed Wi-Fi'],
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.7,
      numReviews: 65,
      basePrice: 180000,
      maxCapacity: 850,
      suitableFor: ['Grand Wedding Gala', 'Corporate Conference', 'Elaborate Sangeet'],
      isApproved: true,
      featured: true
    });

    const radissonAmritsar = await Property.create({
      title: 'Radisson Blu Resort & Royal Farmhouse Lawns',
      propertyType: 'resort',
      category: 'both',
      description: 'Expansive Punjabi countryside resort featuring Olympic greens, brass band baraat paths, and high-capacity ballrooms known for authentic rich culinary banquets.',
      address: 'Ajnala Road, Near Airport',
      city: 'Amritsar',
      state: 'Punjab',
      zipCode: '143001',
      location: { lat: 31.7050, lng: 74.8020 },
      owner: owner2._id,
      amenities: ['Sprawling Farmhouse Green', 'Dhol & Baraat Promenade', 'Live Tandoor Counters', 'Luxury AC Rooms'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 53,
      basePrice: 170000,
      maxCapacity: 800,
      suitableFor: ['Grand Punjabi Wedding', 'Royal Reception', 'Baraat Extravaganza'],
      isApproved: true,
      featured: true
    });

    const jodhpurHeritage = await Property.create({
      title: 'Umaid Bhawan Vicinity Marwar Heritage Lawns',
      propertyType: 'resort',
      category: 'both',
      description: 'Chittar sandstone architecture overlooking the majestic Mehrangarh Fort. Features grand peacocks in manicured royal courtyards and authentic Marwari royal culinary masters.',
      address: 'Circuit House Road, Cantt Area',
      city: 'Jodhpur',
      state: 'Rajasthan',
      zipCode: '342006',
      location: { lat: 26.2810, lng: 73.0480 },
      owner: owner1._id,
      amenities: ['Mehrangarh Fort View Courtyard', 'Folk Dancer Stage', 'Royal Sandstone Mandap', 'Heritage Suites'],
      images: [
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.8,
      numReviews: 51,
      basePrice: 210000,
      maxCapacity: 550,
      suitableFor: ['Marwari Royal Wedding', 'Folk Music Sangeet', 'Heritage Reception'],
      isApproved: true,
      featured: true
    });

    // --- ADDITIONAL TIER 3 (VALUE BUDGET) PROPERTIES ---
    const ayodhyaRamayana = await Property.create({
      title: 'Ramayana Royal Heritage Resort & Saryu Lawns',
      propertyType: 'resort',
      category: 'both',
      description: 'Sacred riverfront destination venue in holy Ayodhya. Features Ramayana-themed ornate floral mandaps, peaceful Saryu breeze lawns, and pure sattvic Awadhi culinary feasts.',
      address: 'Naya Ghat, Near Saryu River Promenade',
      city: 'Ayodhya',
      state: 'Uttar Pradesh',
      zipCode: '224123',
      location: { lat: 26.7950, lng: 82.2040 },
      owner: owner1._id,
      amenities: ['Saryu River View Mandap', 'Vedic Chanting Acoustics', 'Pure Sattvic Dining Hall', 'Spiritual Retreat Rooms'],
      images: [
        'https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.9,
      numReviews: 47,
      basePrice: 120000,
      maxCapacity: 600,
      suitableFor: ['Spiritual Wedding', 'Auspicious Vivaha Mandap', 'Vedic Ceremony'],
      isApproved: true,
      featured: true
    });

    const mathuraSarovar = await Property.create({
      title: 'Nidhivan Sarovar Portico — Braj Bhoomi Vivaha Mandap',
      propertyType: 'hotel',
      category: 'both',
      description: 'Nestled in the spiritual realm of Vrindavan & Mathura, offering elegant banquet halls and open-air lawns for sacred Radha-Krishna-themed matrimonial celebrations.',
      address: 'Khasra No. 797, Gopalgarh, Tehra Road, Vrindavan',
      city: 'Mathura',
      state: 'Uttar Pradesh',
      zipCode: '281121',
      location: { lat: 27.5720, lng: 77.6890 },
      owner: owner2._id,
      amenities: ['Braj Theme Floral Stage', 'Sattvic Feast Kitchen', 'AC Banquet Hall', 'Spiritual Music Sound System'],
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.7,
      numReviews: 38,
      basePrice: 110000,
      maxCapacity: 400,
      suitableFor: ['Spiritual Vivaha', 'Family Reception', 'Traditional Bhajn & Sangeet'],
      isApproved: true,
      featured: true
    });

    const bodhiGaya = await Property.create({
      title: 'The Bodhi Palace Resort & Falgu River Lawn',
      propertyType: 'resort',
      category: 'both',
      description: 'Serene destination resort near world-heritage Mahabodhi Temple with peaceful meditation gardens, water bodies, and expansive banquet greens at an exceptional budget value.',
      address: 'Bodhgaya Road, Near Falgu Bridge',
      city: 'Gaya',
      state: 'Bihar',
      zipCode: '824231',
      location: { lat: 24.7120, lng: 84.9920 },
      owner: owner1._id,
      amenities: ['Peaceful Garden Lawn', 'AC Banquet Hall', 'Lotus Pond Deck', 'Budget AC Guest Rooms'],
      images: [
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
      ],
      rating: 4.6,
      numReviews: 29,
      basePrice: 85000,
      maxCapacity: 400,
      suitableFor: ['Budget Destination Wedding', 'Family Celebration', 'Cultural Reception'],
      isApproved: true,
      featured: true
    });

    console.log('Created Properties across India across Tier 1, 2, and 3 Budget Cities.');

    // 3. Seed Units (Halls and Hotel Rooms for properties)
    await Unit.create([
      // Mithila Palace Units
      {
        property: mithilaPalace._id,
        name: 'Royal Mithila Durbar Hall',
        unitType: 'banquet_hall',
        capacity: 350,
        pricePerUnit: 65000,
        priceType: 'per_day',
        sizeSqFt: 5000,
        amenities: ['AC', 'Stage', 'Bridal Suite', 'Chandeliers'],
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80']
      },
      {
        property: mithilaPalace._id,
        name: 'Deluxe Guest Room (King Bed)',
        unitType: 'room',
        capacity: 3,
        pricePerUnit: 3200,
        priceType: 'per_night',
        sizeSqFt: 350,
        amenities: ['AC', 'Attached Bath', 'TV', 'Wi-Fi', 'Breakfast'],
        totalCount: 15,
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80']
      },
      {
        property: mithilaPalace._id,
        name: 'Bridal Luxury Suite',
        unitType: 'suite',
        capacity: 4,
        pricePerUnit: 6500,
        priceType: 'per_night',
        sizeSqFt: 650,
        amenities: ['Balcony', 'Dressing Room', 'Mini Bar', 'Jacuzzi'],
        totalCount: 2,
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80']
      },

      // Royal Banquet Units
      {
        property: royalBanquet._id,
        name: 'Grand Diamond Ballroom',
        unitType: 'banquet_hall',
        capacity: 400,
        pricePerUnit: 80000,
        priceType: 'per_day',
        sizeSqFt: 6000,
        amenities: ['Central AC', 'Acoustic Soundproofing', 'VIP Lounge'],
        images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80']
      },

      // City Celebration Units
      {
        property: cityCelebration._id,
        name: 'Celebration Grand Hall & Garden Lawn',
        unitType: 'lawn',
        capacity: 500,
        pricePerUnit: 95000,
        priceType: 'per_day',
        sizeSqFt: 12000,
        amenities: ['Lawn & Hall Combo', 'Open Sky Stage', 'Fountain View'],
        images: ['https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80']
      },

      // Heritage Grand Units
      {
        property: heritageGrand._id,
        name: 'Executive AC Room',
        unitType: 'room',
        capacity: 2,
        pricePerUnit: 2800,
        priceType: 'per_night',
        sizeSqFt: 300,
        amenities: ['Wi-Fi', 'Coffee Maker', 'Desk', 'Room Service'],
        totalCount: 20,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80']
      },

      // Delhi: The Leela Palace Units
      {
        property: leelaDelhi._id,
        name: 'The Grand Ballroom Chanakyapuri',
        unitType: 'banquet_hall',
        capacity: 500,
        pricePerUnit: 280000,
        priceType: 'per_day',
        sizeSqFt: 8000,
        amenities: ['Gold Leaf Ceiling', 'Pillarless Architecture', 'VIP Lounge'],
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80']
      },
      {
        property: leelaDelhi._id,
        name: 'Royal Heritage Deluxe Room',
        unitType: 'room',
        capacity: 2,
        pricePerUnit: 14000,
        priceType: 'per_night',
        sizeSqFt: 550,
        amenities: ['Marble Bathroom', 'City View', 'Butler Service'],
        totalCount: 25,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80']
      },

      // Mumbai: The Taj Mahal Palace Units
      {
        property: tajMumbai._id,
        name: 'The Historic Crystal Ballroom',
        unitType: 'banquet_hall',
        capacity: 450,
        pricePerUnit: 380000,
        priceType: 'per_day',
        sizeSqFt: 7500,
        amenities: ['Crystal Chandeliers', 'Heritage Wood Finish', 'Sea View'],
        images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80']
      },
      {
        property: tajMumbai._id,
        name: 'Luxury Sea View Palace Suite',
        unitType: 'suite',
        capacity: 3,
        pricePerUnit: 25000,
        priceType: 'per_night',
        sizeSqFt: 900,
        amenities: ['Gateway of India View', 'Jacuzzi', '24/7 Butler'],
        totalCount: 10,
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80']
      },

      // Jaipur: Rambagh Palace Units
      {
        property: rambaghJaipur._id,
        name: 'Mubarak Mahal & Maharani Lawns',
        unitType: 'lawn',
        capacity: 850,
        pricePerUnit: 450000,
        priceType: 'per_day',
        sizeSqFt: 25000,
        amenities: ['Mughal Landscaped Lawns', 'Royal Pavilion', 'Fairy Lights'],
        images: ['https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80']
      },
      {
        property: rambaghJaipur._id,
        name: 'Maharaja Heritage Room',
        unitType: 'room',
        capacity: 2,
        pricePerUnit: 18000,
        priceType: 'per_night',
        sizeSqFt: 600,
        amenities: ['Antique Furniture', 'Garden View', 'Breakfast Included'],
        totalCount: 30,
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80']
      },

      // Udaipur: The Oberoi Udaivilas Units
      {
        property: oberoiUdaivilas._id,
        name: 'Chandra Mahal Promenade & Lawn',
        unitType: 'lawn',
        capacity: 500,
        pricePerUnit: 500000,
        priceType: 'per_day',
        sizeSqFt: 18000,
        amenities: ['Lake Pichola Frontage', 'Domes and Arches', 'Reflecting Pools'],
        images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80']
      },

      // Goa: Taj Exotica Units
      {
        property: tajExoticaGoa._id,
        name: 'Sunset Oceanfront Lawn & Ballroom',
        unitType: 'lawn',
        capacity: 750,
        pricePerUnit: 320000,
        priceType: 'per_day',
        sizeSqFt: 20000,
        amenities: ['Direct Sand Access', 'Palm Tree Lighting', 'Indoor AC Backup'],
        images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80']
      },
      {
        property: tajExoticaGoa._id,
        name: 'Premium Garden Villa Room',
        unitType: 'room',
        capacity: 3,
        pricePerUnit: 12000,
        priceType: 'per_night',
        sizeSqFt: 500,
        amenities: ['Private Balcony', 'Sea Breeze', 'King Bed'],
        totalCount: 20,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80']
      },

      // Hyderabad: Taj Falaknuma Units
      {
        property: falaknumaHyderabad._id,
        name: 'The Royal Durbar Hall & Terrace',
        unitType: 'banquet_hall',
        capacity: 600,
        pricePerUnit: 520000,
        priceType: 'per_day',
        sizeSqFt: 10000,
        amenities: ['Nizam Crystal Chandeliers', 'Panoramic Terrace', 'Royal Throne Stage'],
        images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80']
      },

      // Bengaluru: The Leela Palace Units
      {
        property: leelaBengaluru._id,
        name: 'Grand Ballroom & Royal Gardens',
        unitType: 'banquet_hall',
        capacity: 650,
        pricePerUnit: 220000,
        priceType: 'per_day',
        sizeSqFt: 9500,
        amenities: ['Pillarless Hall', 'Garden Walkway', 'Acoustic Sound'],
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80']
      },

      // Kolkata: ITC Sonar Units
      {
        property: itcKolkata._id,
        name: 'The Bengal Stateroom',
        unitType: 'banquet_hall',
        capacity: 1000,
        pricePerUnit: 230000,
        priceType: 'per_day',
        sizeSqFt: 16000,
        amenities: ['Pillarless Space', 'Lily Pond Backdrop', 'Sound Tech'],
        images: ['https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80']
      },

      // Varanasi: BrijRama Palace Units
      {
        property: brijramaVaranasi._id,
        name: 'Darbhanga Ganga Mandap Terrace',
        unitType: 'lawn',
        capacity: 300,
        pricePerUnit: 140000,
        priceType: 'per_day',
        sizeSqFt: 4500,
        amenities: ['River Ganga Frontage', 'Stone Carved Archways', 'Puja Setup Permitted'],
        images: ['https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=600&q=80']
      },

      // Pune Units
      {
        property: ritzPune._id,
        name: 'The Ritz-Carlton Grand Ballroom',
        unitType: 'banquet_hall',
        capacity: 700,
        pricePerUnit: 260000,
        priceType: 'per_day',
        sizeSqFt: 7200,
        amenities: ['Golf Course Foyer', 'Pillarless Design', 'Crystal Lighting'],
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80']
      },
      // Manali Units
      {
        property: himalayanManali._id,
        name: 'Apple Orchard Mountain Lawn',
        unitType: 'lawn',
        capacity: 350,
        pricePerUnit: 280000,
        priceType: 'per_day',
        sizeSqFt: 12000,
        amenities: ['Snow Peak Panorama', 'Apple Orchard Mandap', 'Bonfire Pits'],
        images: ['https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80']
      },
      // Agra Units
      {
        property: itcAgra._id,
        name: 'Dewan-e-Khas Mughal Lawns',
        unitType: 'lawn',
        capacity: 800,
        pricePerUnit: 280000,
        priceType: 'per_day',
        sizeSqFt: 22000,
        amenities: ['Mughal Water Channels', 'Taj View Platform', 'Royal Foyer'],
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80']
      },
      // Gurugram Units
      {
        property: oberoiGurgaon._id,
        name: 'The Grand Glass Ballroom',
        unitType: 'banquet_hall',
        capacity: 650,
        pricePerUnit: 320000,
        priceType: 'per_day',
        sizeSqFt: 9000,
        amenities: ['Water Courtyard Views', 'Pillarless Glass Structure', 'VIP Green Room'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80']
      },
      // Kochi Units
      {
        property: hyattKochi._id,
        name: 'Bolgatty Island Waterfront Lawn',
        unitType: 'lawn',
        capacity: 900,
        pricePerUnit: 270000,
        priceType: 'per_day',
        sizeSqFt: 25000,
        amenities: ['Vembanad Lake Frontage', 'Private Yacht Pier', 'Coconut Grove'],
        images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80']
      },
      // Rishikesh Units
      {
        property: tajRishikesh._id,
        name: 'Ganga Cliffside Horizon Lawn',
        unitType: 'lawn',
        capacity: 400,
        pricePerUnit: 210000,
        priceType: 'per_day',
        sizeSqFt: 14000,
        amenities: ['Ganga Riverfront Views', 'Vedic Altar Setup', 'Cliffside Deck'],
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80']
      },
      // Mysuru Units
      {
        property: lalithaMysuru._id,
        name: 'Lalitha Mahal Royal Durbar Lawn',
        unitType: 'lawn',
        capacity: 500,
        pricePerUnit: 190000,
        priceType: 'per_day',
        sizeSqFt: 16000,
        amenities: ['Chamundi Hill Backdrop', 'Palace Illumination', 'Italian Marble Foyer'],
        images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80']
      },
      // Indore Units
      {
        property: brilliantIndore._id,
        name: 'Grand Malwi Pillarless Ballroom',
        unitType: 'banquet_hall',
        capacity: 850,
        pricePerUnit: 180000,
        priceType: 'per_day',
        sizeSqFt: 15000,
        amenities: ['High Ceiling Chandeliers', 'Acoustic Wall Panels', '500-Car Parking'],
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80']
      },
      // Amritsar Units
      {
        property: radissonAmritsar._id,
        name: 'Majha Heritage Farmhouse Lawn',
        unitType: 'lawn',
        capacity: 800,
        pricePerUnit: 170000,
        priceType: 'per_day',
        sizeSqFt: 24000,
        amenities: ['Expansive Farmhouse Lawn', 'Baraat Path', 'Live Tandoori Stations'],
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80']
      },
      // Jodhpur Units
      {
        property: jodhpurHeritage._id,
        name: 'Mehrangarh View Royal Sandstone Courtyard',
        unitType: 'lawn',
        capacity: 550,
        pricePerUnit: 210000,
        priceType: 'per_day',
        sizeSqFt: 18000,
        amenities: ['Mehrangarh Fort View', 'Sandstone Carved Arches', 'Folk Dancer Pavilion'],
        images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80']
      },
      // Ayodhya Units
      {
        property: ayodhyaRamayana._id,
        name: 'Saryu Riverfront Mandap Lawn',
        unitType: 'lawn',
        capacity: 600,
        pricePerUnit: 120000,
        priceType: 'per_day',
        sizeSqFt: 16000,
        amenities: ['Saryu River Frontage', 'Ramayana Vedic Mandap', 'Pure Sattvic Setup'],
        images: ['https://images.unsplash.com/photo-1545232979-fbf6c9e0d1aa?auto=format&fit=crop&w=600&q=80']
      },
      // Mathura Units
      {
        property: mathuraSarovar._id,
        name: 'Braj Vivaha Banquet Hall',
        unitType: 'banquet_hall',
        capacity: 400,
        pricePerUnit: 110000,
        priceType: 'per_day',
        sizeSqFt: 6500,
        amenities: ['Braj Floral Stage', 'Central AC', 'Sattvic Kitchen Access'],
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80']
      },
      // Gaya Units
      {
        property: bodhiGaya._id,
        name: 'Mahabodhi Peace Garden Lawn',
        unitType: 'lawn',
        capacity: 400,
        pricePerUnit: 85000,
        priceType: 'per_day',
        sizeSqFt: 12000,
        amenities: ['Peaceful Garden Setting', 'Lotus Pond Deck', 'Covered Stage'],
        images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80']
      }
    ]);
    console.log('Created Property Units.');

    // 4. Seed Event Services (Catering, Decor, Photo, Music, Cake, Makeup)
    const services = await EventService.create([
      // Catering
      {
        name: 'Royal Mithila Traditional & Continental Feast',
        category: 'catering',
        providerName: 'Annapurna Royal Caterers',
        description:
          'Sumptuous buffet menu featuring authentic Maithili delicacies, North Indian royal curries, live chaat counters, tandoori breads, and royal desserts.',
        pricingType: 'per_guest',
        basePrice: 300,
        minGuests: 50,
        inclusions: [
          'Welcome Drink (Mocktails & Kesar Badam Milk)',
          '4 Vegetarian Starters (Paneer Tikka, Crispy Corn, Spring Rolls, Dahi Kebab)',
          '5 Main Course curries & Daal Makhani',
          'Jeera Rice & Kashmiri Pulao',
          'Assorted Tandoori Rotis, Naan & Parathas',
          'Dessert Bar: Hot Gulab Jamun, Rasmalai, Vanilla Ice Cream'
        ],
        images: [
          'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
        ],
        rating: 4.8,
        city: 'Janakpur'
      },
      {
        name: 'Grand Gourmet Premium Banquet Buffet',
        category: 'catering',
        providerName: 'Saffron & Spice Gourmet Kitchen',
        description:
          'Ultra-luxury 7-course multi-cuisine buffet tailored for premier wedding celebrations and VIP corporate delegates.',
        pricingType: 'per_guest',
        basePrice: 450,
        minGuests: 75,
        inclusions: [
          'Live Mocktail Bar & Exotic Juices',
          'Live Italian Pasta & Dimsum Stations',
          '6 Starters (Veg & Non-Veg options)',
          'Shahi Paneer, Dal Bukhara, Biryani',
          'Exotic Dessert Table with Belgian Waffles & Rabri'
        ],
        images: ['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80'],
        rating: 4.9,
        city: 'Janakpur'
      },

      // Decoration
      {
        name: 'Royal Floral Mandap & Grand Entrance Arch',
        category: 'decoration',
        providerName: 'Pushpanjali Decorators & Stylists',
        description:
          'Stunning exotic floral styling with imported orchids, carnations, fairy light tunnels, royal Maharaja seating for the couple, and photobooth canopy.',
        pricingType: 'fixed',
        basePrice: 30000,
        inclusions: [
          'Grand Floral Entrance Arch with fairy lights',
          'Carpeted VIP aisle runner with brass lanterns',
          '16x12 ft Grand Wedding Stage with floral backdrop',
          'Traditional carved wooden Mandap with marigold & rose hangings',
          'Couple Royal Velvet Chairs with cushions'
        ],
        images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'],
        rating: 4.7,
        city: 'Janakpur'
      },
      {
        name: 'Modern Pastel Theme & LED Galaxy Backdrop',
        category: 'decoration',
        providerName: 'Aura Event Stylists',
        description:
          'Chic contemporary pastel hues, neon party signs, ceiling fairy drop lighting, and crystal centerpieces perfect for receptions and cocktails.',
        pricingType: 'fixed',
        basePrice: 22000,
        inclusions: ['Ceiling star-cloth lighting', 'Neon customized photo backdrop', 'Table crystal centerpieces'],
        images: ['https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80'],
        rating: 4.6,
        city: 'Janakpur'
      },

      // Photography
      {
        name: 'Cinematic 4K Wedding Cinema & Drone Coverage',
        category: 'photography',
        providerName: 'Drishti Wedding Films',
        description:
          'Professional film crew equipped with Sony FX3 cinema cameras, 4K DJI Mavic 3 Cine drone, and master candid photographers.',
        pricingType: 'fixed',
        basePrice: 25000,
        inclusions: [
          '2 Senior Candid Photographers',
          '1 Traditional Cinematographer',
          '1 Drone Pilot for aerial reception shots',
          '3-5 Minute High Energy Cinematic Teaser',
          '40-60 Minute Full Event Highlights Video',
          'High-res Raw Photos + 300 Retouched Images',
          'Hardbound Premium Leather Album'
        ],
        images: ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80'],
        rating: 4.9,
        city: 'Janakpur'
      },

      // Music & DJ
      {
        name: 'High Bass Line-Array DJ & Moving Beam Lights',
        category: 'music_dj',
        providerName: 'DJ Vicky Sound & FX',
        description:
          'Unstoppable party vibe with dual 18-inch subwoofers, laser projection show, co2 smoke guns, and live DJ spinning Bollywood, Punjabi, and International hits.',
        pricingType: 'fixed',
        basePrice: 10000,
        inclusions: [
          'JBL Professional Sound Line-Array Setup',
          '4 Sharpy Beam moving head lights with Truss',
          'Wireless Sennheiser Mics for emcee/hosts',
          'Heavy Dry Ice Low Fog machine for couple first dance',
          '4 Hours live DJ performance'
        ],
        images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'],
        rating: 4.8,
        city: 'Janakpur'
      },

      // Cake
      {
        name: 'Custom 3-Tier Floral Fondant Celebration Cake',
        category: 'cake',
        providerName: 'Sugar & Bloom Patisserie',
        description:
          'Architectural 3-tier celebration cake with Belgian chocolate truffle and red velvet layers, edible gold leaf accents, and fresh floral toppers.',
        pricingType: 'fixed',
        basePrice: 4500,
        inclusions: ['3 Tier 5kg Cake', 'Custom name monogram topper', 'Cake stand and cutting knife kit'],
        images: ['https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80'],
        rating: 4.7,
        city: 'Janakpur'
      },

      // Makeup
      {
        name: 'Bridal HD Airbrush Glam & Draping Package',
        category: 'makeup',
        providerName: 'Glamour by Natasha',
        description:
          'Celebrity bridal makeover with waterproof Temptu airbrush makeup, designer hair styling, jewelry setting, and sari/lehenga draping.',
        pricingType: 'fixed',
        basePrice: 12000,
        inclusions: [
          'Airbrush HD Makeup with international cosmetics (MAC/Huda Beauty)',
          'Bridal Hairstyle with fresh flower accessories',
          'Lashes, colored lenses, and nail paint',
          'Outfit and dupatta draping'
        ],
        images: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'],
        rating: 4.9,
        city: 'Janakpur'
      }
    ]);
    console.log('Created Event Services.');

    // 5. Seed Coupons
    await Coupon.create([
      {
        code: 'WELCOME5000',
        discountPercent: 10,
        maxDiscount: 5000,
        minBookingAmount: 25000,
        description: 'Flat ₹5,000 off on your first event booking'
      },
      {
        code: 'FESTIVE15',
        discountPercent: 15,
        maxDiscount: 15000,
        minBookingAmount: 50000,
        description: 'Festival season 15% discount on venues and packages'
      },
      {
        code: 'WEDDING2026',
        discountPercent: 10,
        maxDiscount: 25000,
        minBookingAmount: 100000,
        description: 'Special 10% wedding package discount'
      }
    ]);
    console.log('Created Discount Coupons.');

    // 6. Pre-seed Booking (e.g. November 15 at Mithila Palace as in user prompt!)
    const nov15BookingDate = new Date('2026-11-15T18:00:00.000Z');
    const pastBookingDate = new Date('2026-08-10T18:00:00.000Z');

    const bookingNov15 = await Booking.create({
      bookingNumber: 'EVT-2026-89412',
      user: customer._id,
      property: mithilaPalace._id,
      bookingType: 'event_package',
      eventType: 'Wedding',
      eventDate: nov15BookingDate,
      guestsCount: 300,
      selectedServices: [
        {
          service: services[0]._id,
          name: services[0].name,
          category: 'catering',
          price: 300,
          pricingType: 'per_guest',
          quantity: 300,
          subtotal: 90000
        },
        {
          service: services[2]._id,
          name: services[2].name,
          category: 'decoration',
          price: 30000,
          pricingType: 'fixed',
          quantity: 1,
          subtotal: 30000
        },
        {
          service: services[4]._id,
          name: services[4].name,
          category: 'photography',
          price: 25000,
          pricingType: 'fixed',
          quantity: 1,
          subtotal: 25000
        },
        {
          service: services[5]._id,
          name: services[5].name,
          category: 'music_dj',
          price: 10000,
          pricingType: 'fixed',
          quantity: 1,
          subtotal: 10000
        }
      ],
      pricing: {
        venueBasePrice: 65000,
        servicesTotal: 155000,
        roomsTotal: 0,
        discountAmount: 10000,
        taxAmount: 25200,
        totalAmount: 235200
      },
      couponApplied: {
        code: 'WEDDING2026',
        discountPercent: 10,
        discountAmount: 10000
      },
      payment: {
        method: 'Razorpay / UPI',
        transactionId: 'TXN-98471923',
        status: 'paid',
        paidAt: new Date()
      },
      bookingStatus: 'confirmed',
      specialRequests: 'Special welcome arch with marigold flowers and welcome drinks upon guest arrival.'
    });

    // Past completed booking for reviews
    const pastBooking = await Booking.create({
      bookingNumber: 'EVT-2026-10492',
      user: customer._id,
      property: royalBanquet._id,
      bookingType: 'event_package',
      eventType: 'Reception',
      eventDate: pastBookingDate,
      guestsCount: 250,
      pricing: {
        venueBasePrice: 80000,
        servicesTotal: 60000,
        roomsTotal: 0,
        discountAmount: 5000,
        taxAmount: 16200,
        totalAmount: 151200
      },
      payment: {
        method: 'Net Banking',
        transactionId: 'TXN-77382910',
        status: 'paid',
        paidAt: pastBookingDate
      },
      bookingStatus: 'completed'
    });

    // Reviews
    await Review.create([
      {
        user: customer._id,
        property: royalBanquet._id,
        booking: pastBooking._id,
        rating: 5,
        comment:
          'Hosted our reception here! The crystal chandeliers and acoustic sound quality are extraordinary. Our 250 guests were in complete awe of the lighting and courteous banquet staff.',
        eventType: 'Reception'
      },
      {
        user: customer._id,
        property: mithilaPalace._id,
        rating: 5,
        comment:
          'The premier venue in Janakpur without question! Heritage styling, massive air-conditioned hall, and delicious catering arrangements. Booking the entire package saved us so much time and hassle.',
        eventType: 'Wedding'
      }
    ]);
    console.log('Created Bookings and Reviews.');

    // 7. Seed Complaint for Admin resolution desk
    await Complaint.create({
      user: customer._id,
      property: mithilaPalace._id,
      booking: bookingNov15._id,
      subject: 'Inquiry regarding extra bridal room heating / cooling',
      description: 'Would like to confirm if the bridal preparation room has separate AC temperature controls for the makeup artist.',
      category: 'Facility Issue',
      status: 'open',
      adminNotes: 'Contacted property manager Mr. Ved Prakash Pandey. Confirmed independent AC thermostat exists in Bridal Suite.'
    });
    console.log('Created Complaint.');

    console.log('🎉 Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
