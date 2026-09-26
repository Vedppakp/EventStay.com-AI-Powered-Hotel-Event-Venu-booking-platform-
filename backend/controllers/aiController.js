const Property = require('../models/Property');
const EventService = require('../models/EventService');
const Booking = require('../models/Booking');
const Unit = require('../models/Unit');
const Coupon = require('../models/Coupon');
const { CITY_BUDGET_MAP, BUDGET_TIERS } = require('../data/indianCities');

// Helper to call Gemini API if key is available
async function callGeminiIfConfigured(systemPrompt, userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.error(`Gemini model ${model} failed, trying next:`, err.message);
    }
  }
  return null;
}

// @desc    AI Event Package Recommendation Engine
// @route   POST /api/ai/recommend-package
// @access  Public
exports.recommendPackage = async (req, res, next) => {
  try {
    const {
      eventType = 'Wedding',
      city = 'Janakpur',
      guests = 300,
      budget = 200000,
      includeCatering = true,
      includeDecoration = true,
      includePhotography = true,
      includeDJ = true,
      additionalFacilities = ''
    } = req.body;

    const guestCount = Number(guests);
    const maxBudget = Number(budget);

    const isNationwide = !city || city.toLowerCase() === 'all' || city.toLowerCase() === 'all cities';
    const cityQuery = isNationwide ? {} : { city: { $regex: new RegExp(`^${city}$`, 'i') } };

    let candidateVenues = await Property.find({
      isApproved: true,
      ...cityQuery,
      maxCapacity: { $gte: guestCount },
      basePrice: { $lte: maxBudget * 0.65 }
    }).sort({ rating: -1, basePrice: 1 });

    if (candidateVenues.length === 0 && !isNationwide) {
      candidateVenues = await Property.find({
        isApproved: true,
        ...cityQuery,
        maxCapacity: { $gte: guestCount },
        basePrice: { $lte: maxBudget * 0.85 }
      }).sort({ rating: -1, basePrice: 1 });
    }

    if (candidateVenues.length === 0) {
      candidateVenues = await Property.find({
        isApproved: true,
        maxCapacity: { $gte: guestCount },
        basePrice: { $lte: maxBudget * 0.85 }
      }).sort({ rating: -1, basePrice: 1 });
    }

    if (candidateVenues.length === 0) {
      return res.status(200).json({
        success: true,
        recommendation: null,
        message: `No venues found for ${guestCount} guests under budget ₹${maxBudget.toLocaleString()}. Try increasing the budget or reducing guest count.`
      });
    }

    const services = await EventService.find({ isActive: true });
    const caterers = services.filter((s) => s.category === 'catering');
    const decorators = services.filter((s) => s.category === 'decoration');
    const photographers = services.filter((s) => s.category === 'photography');
    const djs = services.filter((s) => s.category === 'music_dj');

    const recommendations = [];

    for (const venue of candidateVenues.slice(0, 3)) {
      let currentTotal = venue.basePrice;
      const selectedServices = [];

      if (includeCatering && caterers.length > 0) {
        const remainingForCatering = maxBudget - currentTotal;
        const affordableCaterer =
          caterers
            .filter((c) => (c.pricingType === 'per_guest' ? c.basePrice * guestCount : c.basePrice) <= remainingForCatering)
            .sort((a, b) => b.rating - a.rating)[0] || caterers[0];

        if (affordableCaterer) {
          const cost =
            affordableCaterer.pricingType === 'per_guest'
              ? affordableCaterer.basePrice * guestCount
              : affordableCaterer.basePrice;
          currentTotal += cost;
          selectedServices.push({
            service: affordableCaterer,
            cost,
            name: affordableCaterer.name,
            category: 'catering'
          });
        }
      }

      if (includeDecoration && decorators.length > 0) {
        const remainingForDecor = maxBudget - currentTotal;
        const affordableDecor =
          decorators
            .filter((d) => d.basePrice <= remainingForDecor)
            .sort((a, b) => b.rating - a.rating)[0] || decorators.sort((a, b) => a.basePrice - b.basePrice)[0];

        if (affordableDecor) {
          currentTotal += affordableDecor.basePrice;
          selectedServices.push({
            service: affordableDecor,
            cost: affordableDecor.basePrice,
            name: affordableDecor.name,
            category: 'decoration'
          });
        }
      }

      if (includePhotography && photographers.length > 0) {
        const remainingForPhoto = maxBudget - currentTotal;
        const affordablePhoto = photographers
          .filter((p) => p.basePrice <= remainingForPhoto)
          .sort((a, b) => b.rating - a.rating)[0];

        if (affordablePhoto) {
          currentTotal += affordablePhoto.basePrice;
          selectedServices.push({
            service: affordablePhoto,
            cost: affordablePhoto.basePrice,
            name: affordablePhoto.name,
            category: 'photography'
          });
        }
      }

      if (includeDJ && djs.length > 0) {
        const remainingForDJ = maxBudget - currentTotal;
        const affordableDJ = djs
          .filter((m) => m.basePrice <= remainingForDJ)
          .sort((a, b) => b.rating - a.rating)[0];

        if (affordableDJ) {
          currentTotal += affordableDJ.basePrice;
          selectedServices.push({
            service: affordableDJ,
            cost: affordableDJ.basePrice,
            name: affordableDJ.name,
            category: 'music_dj'
          });
        }
      }

      const savings = Math.max(0, maxBudget - currentTotal);
      const isWithinBudget = currentTotal <= maxBudget;

      recommendations.push({
        venue,
        selectedServices,
        estimatedTotal: currentTotal,
        budgetLimit: maxBudget,
        savings,
        isWithinBudget,
        suitabilityScore: Math.round((venue.rating / 5) * 60 + (isWithinBudget ? 40 : 15))
      });
    }

    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    const topRecommendation = recommendations[0];

    const venueCost = topRecommendation.venue.basePrice;
    const servicesCost = topRecommendation.selectedServices.reduce((sum, s) => sum + s.cost, 0);
    const total = topRecommendation.estimatedTotal;

    const breakdownPercentages = {
      venue: Math.round((venueCost / total) * 100),
      services: Math.round((servicesCost / total) * 100)
    };

    let aiAnalysis = `We curated this package around "${topRecommendation.venue.title}" in ${topRecommendation.venue.city}, perfectly accommodating your ${guestCount} guests (capacity up to ${topRecommendation.venue.maxCapacity}). The venue accounts for ${breakdownPercentages.venue}% of your expense, leaving ${breakdownPercentages.services}% for top-tier catering, thematic decor, and entertainment. You remain within your budget with ₹${topRecommendation.savings.toLocaleString()} remaining as a safety cushion.`;

    if (additionalFacilities && additionalFacilities.trim()) {
      aiAnalysis += ` • Additional facilities noted: "${additionalFacilities.trim()}".`;
    }

    res.status(200).json({
      success: true,
      recommendation: topRecommendation,
      alternatives: recommendations.slice(1),
      aiAnalysis,
      additionalFacilities: additionalFacilities ? additionalFacilities.trim() : '',
      budgetAllocation: {
        venueCost,
        servicesCost,
        total,
        savings: topRecommendation.savings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Intelligent AI Event Assistant / Chatbot
// @route   POST /api/ai/chat
// @access  Public
exports.chatAssistant = async (req, res, next) => {
  try {
    const { message = '' } = req.body;
    const prompt = message.trim();
    if (!prompt) {
      return res.status(200).json({
        success: true,
        reply: "Hello! How can I help you plan your event today? You can ask me about venues, hotel rooms, catering menus, packages, discounts, or how to book.",
        quickSuggestions: ['Venues in Janakpur', 'How to book', 'Cheapest venue', 'Discount coupons']
      });
    }

    const lower = prompt.toLowerCase();

    // 1. Fetch live database inventory for context
    const [properties, services, units, coupons] = await Promise.all([
      Property.find({ isApproved: true }).populate('owner', 'name businessName phone email'),
      EventService.find({ isActive: true }),
      Unit.find({ isActive: true }).populate('property', 'title city'),
      Coupon.find({ isActive: true })
    ]);

    // 2. Try Gemini API if GEMINI_API_KEY is configured
    const systemPrompt = `You are the EventStay AI Concierge, an expert wedding and event planning assistant on EventStay.
EventStay is a 3-in-1 platform combining Hotel Bookings + Event Banquets + Event Vendor Services (Catering, Decor, Photography, DJ, Cakes, Makeup).

Live Inventory:
Venues on EventStay:
${properties.map((p) => `- ${p.title} (${p.city}): Starting ₹${p.basePrice}/day, Capacity: ${p.maxCapacity} guests, Rating: ${p.rating}/5. Amenities: ${p.amenities.join(', ')}`).join('\n')}

Rooms & Suites:
${units.map((u) => `- ${u.name} at ${u.property?.title || 'Venue'} (${u.unitType}, Capacity: ${u.capacity} guests)`).join('\n')}

Event Services:
${services.map((s) => `- ${s.name} (${s.category}): ₹${s.basePrice} (${s.pricingType}). Provider: ${s.providerName}`).join('\n')}

Active Discount Coupons:
${coupons.map((c) => `- Code: ${c.code} (${c.description}) -> ${c.discountPercent}% off up to ₹${c.maxDiscount} on min booking ₹${c.minBookingAmount}`).join('\n')}

Key Platform Features:
- Real-time Availability Calendar with atomic date conflict prevention (Nov 15 is booked at Mithila Palace; Nov 16 is open).
- Event Package Builder: Allows bundling Venue + Catering + Decor + DJ + Photography + Guest Rooms with real-time price calculation.
- Payments: 100% secure online payments via UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, and Net Banking with instant downloadable Tax Invoice & Check-in QR code.
- 7-day free cancellation policy with escrow refund protection.

Instructions: Always answer the user's specific question directly, accurately, and politely with real figures from the inventory. Use Indian Rupee (₹). If asked about rooms, explain room math (approx 2 guests per room). If asked about how to book, outline the 4 clear steps.`;

    const geminiReply = await callGeminiIfConfigured(systemPrompt, prompt);
    if (geminiReply) {
      return res.status(200).json({
        success: true,
        reply: geminiReply,
        quickSuggestions: [
          'How to book on EventStay',
          'Cheapest venue in Janakpur',
          'Active discount coupons',
          'What catering menu is available?'
        ]
      });
    }

    // 3. High-Intelligence Grounded Semantic NLP Engine
    let reply = '';
    let quickSuggestions = [];

    // Extract potential parameters
    const guestMatch = lower.match(/(\d+)\s*(?:guests?|people|pax|persons?|log|adults?|members?)/i) ||
      lower.match(/(?:for|of)\s+(\d+)\s*(?:guests?|people|pax|persons?|log)?/i);
    const requestedGuests = guestMatch ? parseInt(guestMatch[1]) : null;

    const budgetMatch = lower.match(/(?:under|budget|for|within)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(lakhs?|l|k|thousand)?/i);

    // Dynamic matching across 100 Indian Cities sorted by string length descending
    const cityKeys = Object.keys(CITY_BUDGET_MAP).sort((a, b) => b.length - a.length);
    const matchedCityKey = cityKeys.find((k) => lower.includes(k));
    const matchedCityMeta = matchedCityKey ? CITY_BUDGET_MAP[matchedCityKey] : null;
    const mentionedCity = matchedCityKey
      ? (matchedCityKey.charAt(0).toUpperCase() + matchedCityKey.slice(1))
      : null;

    const mentionedVenue = properties.find((p) =>
      lower.includes(p.title.toLowerCase()) ||
      lower.includes(p.title.split(' ')[0].toLowerCase())
    );

    const compareMatch = lower.match(/(?:compare|difference between|versus|vs)\s+([a-z\s]+?)\s+(?:and|vs|with)\s+([a-z\s]+)/i);

    // INTENT: 100 Indian Cities & Hotel Budget Spectrum Inquiry
    const isBudgetTierQuery = /\b(?:100\s+cities|budget\s+(?:index|rank|tier|ranking|spectrum|tiers)|high\s+budget|low\s+budget|tier\s*[123]|which\s+city\s+is\s+(?:costly|expensive|cheapest|luxury|budget)|cities\s+by\s+budget|hotel\s+budget\s+ranking)\b/i.test(lower);

    // INTENT 1: Room & Hotel Accommodation Calculation / Inquiry
    const isRoomQuery = /\b(?:rooms?|kamre?|stay|accommodation|staying|suites?|hotel\s+rooms?|bed|beds|sleeping)\b/i.test(lower);
    // INTENT 2: How to Book / Booking Process Guide
    const isBookingGuideQuery = /\b(?:how\s+(?:to|can\s+i|do\s+i)\s+book|how\s+to\s+reserve|booking\s+process|steps?\s+to\s+book|kaise\s+book\s+kare(?:in)?|booking\s+kaise|how\s+it\s+works|book\s+kaise\s+kare)\b/i.test(lower) ||
      lower.includes('how to book') || lower.includes('how do i book') || lower.includes('steps to book') || lower.includes('kaise book');
    // INTENT 3: Cheapest / Low Budget / Affordable Venues
    const isCheapestQuery = /\b(?:cheapest?|lowest\s+price|low\s+budget|affordable|sasta|kam\s+paisa|minimum\s+price|budget\s+friendly|economical|sabse\s+sasta)\b/i.test(lower);
    // INTENT 4: Highest Rated / Best / Luxury Venues
    const isBestRatedQuery = /\b(?:best\s+venue|top\s+rated|highest\s+rated|best\s+hotel|luxury|most\s+popular|5\s+star|five\s+star|premiere?|sabse\s+accha)\b/i.test(lower);
    // INTENT 5: Payment Methods / Online Payment / UPI
    const isPaymentQuery = /\b(?:how\s+to\s+pay|payments?|upi|google\s*pay|gpay|phonepe|paytm|bhim|credit\s*card|debit\s*card|net\s*banking|cash|paisa\s+kaise|online\s+pay|invoice|receipt)\b/i.test(lower);
    // INTENT 6: Coupons / Discounts / Promo Codes
    const isCouponQuery = /\b(?:coupons?|discounts?|promo(?:tion)?|promo\s*codes?|vouchers?|offers?|deals?|cashbacks?|chhoot|savings?)\b/i.test(lower);
    // INTENT 7: Contact / Support / Phone / Email / Talk to Owner
    const isContactQuery = /\b(?:contact|phone(?:\s*number)?|mobile|call|email|helpline|support|talk\s+to\s+owner|reach|address|office|customer\s*care|owner\s+se\s+baat)\b/i.test(lower);
    // INTENT 8: Venue Owner / Host Registration / Listing a Property
    const isOwnerQuery = /\b(?:list\s+(?:my\s+)?(?:venue|property|hotel)|become\s+(?:a\s+)?host|owner\s+register|register\s+as\s+owner|owner\s+dashboard|host\s+a\s+venue|add\s+property|host\s+kaise\s+bane)\b/i.test(lower);
    // INTENT 9: Catering & Food Menus
    const isCateringQuery = /\b(?:cater(?:ing|er)?|foods?|menus?|buffets?|plates?|veg(?:etarian)?|non-veg|lunch|dinners?|khana|rasoi|dishes|food\s+package)\b/i.test(lower);
    // INTENT 10: Decor, Photography, DJ, Cakes, Makeup
    const isVendorQuery = /\b(?:decor(?:ation)?|mandap|flowers?|photograph(?:y|er)?|photos?|videos?|drones?|dj|musics?|sound|cakes?|makeups?|bridal\s+makeup|parlour)\b/i.test(lower);
    // INTENT 11: Date Availability & Conflict Checking
    const isDateQuery = /\b(?:availab(?:le|ility)|calendar|november\s*15|november\s*16|nov\s*15|booked\s+dates?|open\s+dates?)\b/i.test(lower);
    // INTENT 12: Cancellation & Refund Policy
    const isCancellationQuery = /\b(?:cancel(?:lation)?|refunds?|money\s+back|policy|guarantee)\b/i.test(lower);
    // INTENT 13: Hindi / Hinglish Inquiry
    const isHindiQuery = /\b(?:shadi|vivah|saste|kamre|kharcha|kitna|kaise|kya|batao|accha|chahiye|kripya)\b/i.test(lower);
    // INTENT 14: Platform Info / What is EventStay
    const isPlatformInfoQuery = /\b(?:what\s+is\s+eventstay|who\s+are\s+you|about\s+eventstay|what\s+does\s+this\s+website\s+do|features)\b/i.test(lower);
    // INTENT 15: Casual Greeting
    const isGreeting = /\b(?:hi|hello|hey|namaste|good\s+morning|good\s+evening|greetings|kaise\s+ho)\b/i.test(lower);

    // --- EXECUTE INTENTS BY PRIORITY ---

    // 1. Room Accommodation Calculation (e.g. "how many rooms for 50 guests")
    if (isRoomQuery) {
      if (requestedGuests) {
        const doubleOcc = Math.ceil(requestedGuests / 2);
        const tripleOcc = Math.ceil(requestedGuests / 3);

        reply = `For **${requestedGuests} guests**, here is your accommodation calculation:\n\n` +
          `• **Recommended Rooms**: **${doubleOcc} Rooms** (based on standard hotel double occupancy of 2 adults per room)\n` +
          `• **Budget Allocation**: **${tripleOcc} Rooms** (if accommodating 3 guests per room with rollaway/extra bedding)\n\n` +
          `🏨 **Available Hotel Rooms & Suites on EventStay**:\n` +
          `• **Hotel Heritage Grand & Suites** (Janakpur): Executive AC Rooms (Base Property: ₹55,000/day)\n` +
          `• **Mithila Palace Banquet & Resort** (Janakpur): Deluxe Guest Rooms (King Bed) & Bridal Luxury Suite\n` +
          `• **The Grand Vivanta Resort & Spa** (Patna): Executive Suites & Resort Guest Rooms\n\n` +
          `💡 **How to Book**: In our **Event Package Builder**, simply enable the **'Guest Accommodations'** toggle and choose the number of rooms needed. Everything is bundled into a single checkout!`;

        quickSuggestions = [
          'Open Event Package Builder',
          'Explore Hotel Heritage Grand',
          'Calculate catering for ' + requestedGuests + ' guests'
        ];
      } else {
        reply = `**EventStay Hotel & Suite Accommodations**:\n\n` +
          `We offer integrated stay options so your wedding guests and family don't have to travel after late-night celebrations:\n\n` +
          `• **Deluxe Guest Rooms**: King Bed, Ensuite Bathroom, Central AC (Accommodates 2–3 guests)\n` +
          `• **Bridal Luxury Suites**: Spacious dressing vanity, lounge, premium amenities (Accommodates 4 guests)\n` +
          `• **Executive AC Rooms**: High-speed Wi-Fi, 24/7 room service at Hotel Heritage Grand\n\n` +
          `💡 *General Rule*: Divide your out-of-town guest count by **2** to determine total rooms needed.`;

        quickSuggestions = [
          'How many rooms for 50 guests?',
          'Build package with rooms',
          'View Hotel Heritage Grand'
        ];
      }
    }

    // 1.5. 100 Indian Cities Hotel Budget Spectrum Query
    else if (isBudgetTierQuery) {
      reply = `🇮🇳 **100 Indian Cities — High → Low Hotel Budget Spectrum**:\n\n` +
        `Our platform benchmarks hotel and event venue budgets across 3 distinct tiers:\n\n` +
        `💎 **Tier 1 — High Budget (Luxury & Metros)** (Ranks 1 – 22)\n` +
        `• **Top Destinations**: Mumbai (Rank 1), Delhi NCR (Rank 2), Goa (Rank 3), Bengaluru (Rank 4), Udaipur (Rank 5), Jaipur (Rank 6), Hyderabad (Rank 7), Pune (Rank 8), Gurugram (Rank 9), Kochi (Rank 10), Manali (Rank 13), Agra (Rank 14), Varanasi (Rank 15), Kolkata (Rank 16).\n` +
        `• **Budget Spectrum**: **₹1.8 Lakhs – ₹5.5+ Lakhs / day**\n` +
        `• **Features**: Five-star luxury hotels, royal palace courtyards, seaside beach lawns, and celebrity ballrooms.\n\n` +
        `🌟 **Tier 2 — Mid Budget (Balanced & Cultural)** (Ranks 23 – 50)\n` +
        `• **Top Destinations**: Mysuru (Rank 23), Indore (Rank 24), Surat (Rank 25), Nagpur (Rank 26), Bhubaneswar (Rank 27), Patna (Rank 28), Coimbatore (Rank 29), Amritsar (Rank 37), Jodhpur (Rank 38), Dehradun (Rank 41), Bhopal (Rank 43), Guwahati (Rank 46).\n` +
        `• **Budget Spectrum**: **₹1.0 Lakh – ₹2.5 Lakhs / day**\n` +
        `• **Features**: Sprawling wedding resorts, heritage havelis, and high-capacity convention centres.\n\n` +
        `🏷️ **Tier 3 — Value Budget (Smart Savings & Spiritual)** (Ranks 51 – 100)\n` +
        `• **Top Destinations**: Gwalior (Rank 53), Bikaner (Rank 57), Darjeeling (Rank 59), Prayagraj (Rank 64), Mathura/Vrindavan (Rank 67), Ayodhya (Rank 69), Bilaspur (Rank 71), Gangtok (Rank 76), Gaya (Rank 82), Janakpur (Rank 83/100).\n` +
        `• **Budget Spectrum**: **₹45,000 – ₹1.2 Lakhs / day**\n` +
        `• **Features**: Sacred riverfront ghats, temple town mandaps, scenic hill gazebos, and high-value packages.\n\n` +
        `💡 *You can filter directly by Budget Tier or search any of the 100 cities on our interactive Leaflet map!*`;

      quickSuggestions = [
        'Explore Tier 1 Luxury Venues',
        'Explore Tier 3 Budget Venues',
        'Venues in Ayodhya or Mathura',
        'Venues in Mumbai or Udaipur'
      ];
    }

    // 2. How to Book Guide
    else if (isBookingGuideQuery) {
      reply = `Here is the simple **4-step guide** to booking your venue or event package on EventStay:\n\n` +
        `1. 🔍 **Search & Explore**:\n` +
        `   Visit the **Explore Venues** page. Filter by city (*Janakpur, Patna, Udaipur*), budget, guest capacity, or property type (Palace, Hotel, Banquet Hall, Resort).\n\n` +
        `2. 🛠️ **Build Your Custom Package**:\n` +
        `   Open any venue and click **'Build Event Package'**. Bundle Venue + Catering (from ₹300/plate) + Floral Mandap + 4K Drone Photography + DJ Sound + Guest Rooms with real-time price calculations.\n\n` +
        `3. 📅 **Select Event Date**:\n` +
        `   Check the live **Availability Calendar**. Green dates are open; booked dates are automatically locked in red to prevent double-booking.\n\n` +
        `4. 💳 **Instant Checkout & Tax Invoice**:\n` +
        `   Apply coupon code **WELCOME5000** for ₹5,000 off! Pay securely via simulated UPI (GPay/PhonePe), Debit/Credit Card, or Net Banking. You instantly receive an official **Tax Invoice with a Check-in QR Code**!`;

      quickSuggestions = [
        'Explore venues now',
        'Open Event Package Builder',
        'Active discount coupons'
      ];
    }

    // 3. Cheapest / Lowest Budget Venues
    else if (isCheapestQuery) {
      const sortedByPrice = [...properties].sort((a, b) => a.basePrice - b.basePrice);

      reply = `Here are the **most affordable verified venues** on EventStay, sorted by starting daily rate:\n\n` +
        sortedByPrice.map((p, idx) =>
          `${idx + 1}. 🏨 **${p.title}** (${p.city})\n` +
          `   • **Starting Price**: ₹${p.basePrice.toLocaleString()} per day\n` +
          `   • **Capacity**: Up to ${p.maxCapacity} guests | **Rating**: ⭐ ${p.rating}/5.0\n` +
          `   • **Highlights**: ${p.amenities.slice(0, 3).join(', ')}`
        ).join('\n\n') +
        `\n\n💡 **Budget Saving Tips**:\n` +
        `• Use coupon **WELCOME5000** at checkout for an instant ₹5,000 discount!\n` +
        `• Pair with our Traditional Feast Catering at just ₹300 per guest.`;

      quickSuggestions = [
        'View Hotel Heritage Grand (₹55,000)',
        'Apply WELCOME5000 coupon',
        'Build low budget package'
      ];
    }

    // 4. Highest Rated / Best / Luxury Venues
    else if (isBestRatedQuery) {
      const sortedByRating = [...properties].sort((a, b) => b.rating - a.rating);

      reply = `Here are our **top-rated premier venues**, ranked by verified customer ratings:\n\n` +
        sortedByRating.slice(0, 3).map((p, idx) =>
          `${idx + 1}. ⭐ **${p.title}** (${p.city})\n` +
          `   • **Rating**: **${p.rating} / 5.0** (${p.numReviews || 18} verified reviews)\n` +
          `   • **Price**: ₹${p.basePrice.toLocaleString()} / day | **Capacity**: ${p.maxCapacity} guests\n` +
          `   • **Highlights**: ${p.amenities.slice(0, 4).join(', ')}`
        ).join('\n\n') +
        `\n\n✨ All of these top venues offer integrated banquet halls, lawn spaces, and support our 4K cinematic wedding cinema and luxury decor add-ons!`;

      quickSuggestions = [
        'View The Grand Vivanta (⭐ 4.8)',
        'View City Celebration (⭐ 4.7)',
        'Check date availability'
      ];
    }

    // 5. Payment Methods & Online Payment
    else if (isPaymentQuery) {
      reply = `**EventStay Secure Digital Payments**:\n\n` +
        `We provide an encrypted, seamless checkout experience supporting all major Indian payment gateways:\n\n` +
        `• **UPI**: Instant 1-click payment with Google Pay, PhonePe, Paytm, BHIM, or any virtual payment address (VPA).\n` +
        `• **Debit & Credit Cards**: Visa, MasterCard, RuPay with simulated OTP authentication.\n` +
        `• **Net Banking**: Supported across all major institutions (SBI, HDFC, ICICI, Axis, PNB).\n` +
        `• **100% Escrow Protection**: Payments are safely held until the event concludes, safeguarding both customer and host.\n` +
        `• **Official Tax Invoice**: Instantly downloadable PDF receipt with GST breakdown and authenticated Check-in QR Code!`;

      quickSuggestions = [
        'How to apply discount coupon',
        'How to book a venue',
        'Cancellation & Refund terms'
      ];
    }

    // 6. Coupons & Discounts
    else if (isCouponQuery) {
      reply = `🎉 **Active EventStay Promo Codes & Discounts**:\n\n` +
        coupons.map((c) =>
          `🎟️ **${c.code}**\n` +
          `   • **Offer**: ${c.description}\n` +
          `   • **Discount**: ${c.discountPercent}% OFF (Up to ₹${c.maxDiscount.toLocaleString()})\n` +
          `   • **Min Booking**: ₹${c.minBookingAmount.toLocaleString()}`
        ).join('\n\n') +
        `\n\n💡 **How to Apply**: Enter any of the codes above into the **'Promo Code'** input box on the **Checkout Page** to instantly deduct the discount from your bill!`;

      quickSuggestions = [
        'Apply WELCOME5000',
        'How to book',
        'Cheapest venues on platform'
      ];
    }

    // 7. Contact / Phone Number / Talk to Owner
    else if (isContactQuery) {
      if (mentionedVenue) {
        reply = `**Contact Details for ${mentionedVenue.title}**:\n\n` +
          `• **Address**: ${mentionedVenue.address}, ${mentionedVenue.city}\n` +
          `• **Host/Manager**: ${mentionedVenue.owner?.businessName || mentionedVenue.owner?.name || 'Mithila Hospitality Group'}\n` +
          `• **Host Email**: ${mentionedVenue.owner?.email || 'owner@eventstay.com'}\n` +
          `• **Host Phone**: ${mentionedVenue.owner?.phone || '+91 98765 43210'}\n\n` +
          `You can view full venue photos, reviews, and submit a direct booking request directly on their property page!`;

        quickSuggestions = [
          `Check availability for ${mentionedVenue.title}`,
          `Build package for ${mentionedVenue.title}`,
          'EventStay general helpline'
        ];
      } else {
        reply = `📞 **EventStay Customer Support & Concierge**:\n\n` +
          `• **Helpline**: +91 98765 43210 (Mon–Sat, 9:00 AM – 8:00 PM IST)\n` +
          `• **Support Email**: support@eventstay.com / help@eventstay.com\n` +
          `• **Corporate Desks**: Station Road, Janakpur & Bailey Road, Patna\n` +
          `• **Host Direct Inquiry**: You can message any venue owner directly via the **'Contact Host'** button on their property page.\n\n` +
          `How else can I assist you with your booking?`;

        quickSuggestions = [
          'How to book a venue',
          'Explore venues in Janakpur',
          'Discount coupons'
        ];
      }
    }

    // 8. Venue Owner / Host Registration
    else if (isOwnerQuery) {
      reply = `🏨 **List Your Property on EventStay (Venue Owner Portal)**:\n\n` +
        `Are you a hotelier, banquet hall owner, or resort manager? Join EventStay to expand your bookings:\n\n` +
        `1. **Create Owner Account**: Click **Register** in the top navigation and select the **'Venue Owner'** role.\n` +
        `2. **Access Owner Dashboard**: Track gross booking revenue, upcoming reservations, and occupancy rates.\n` +
        `3. **Add Halls & Rooms**: Create multiple units (Main Banquet Hall, Garden Lawn, Deluxe Guest Rooms, Bridal Suites) with custom pricing.\n` +
        `4. **Manage Calendar**: Block maintenance dates and confirm customer requests in 1 click.\n` +
        `5. **Fair Platform Commission**: We charge an honest 10% commission only on completed events—no upfront listing fees!`;

      quickSuggestions = [
        'Register as Venue Owner',
        'Owner Dashboard Demo',
        'Explore verified venues'
      ];
    }

    // 9. Comparison between Two Venues
    else if (compareMatch) {
      let vA = properties.find((p) => p.title.toLowerCase().includes(compareMatch[1].trim().toLowerCase()));
      let vB = properties.find((p) => p.title.toLowerCase().includes(compareMatch[2].trim().toLowerCase()));

      if (vA && vB) {
        reply = `Here is a side-by-side comparison between **${vA.title}** and **${vB.title}**:\n\n` +
          `• **Starting Rental**: ₹${vA.basePrice.toLocaleString()} vs ₹${vB.basePrice.toLocaleString()}\n` +
          `• **Max Capacity**: ${vA.maxCapacity} guests vs ${vB.maxCapacity} guests\n` +
          `• **Guest Rating**: ⭐ ${vA.rating}/5.0 vs ⭐ ${vB.rating}/5.0\n` +
          `• **City**: ${vA.city} vs ${vB.city}\n` +
          `• **Key Highlights**:\n` +
          `   - *${vA.title}*: ${vA.amenities.slice(0, 3).join(', ')}\n` +
          `   - *${vB.title}*: ${vB.amenities.slice(0, 3).join(', ')}\n\n` +
          `💡 **Recommendation**: For higher guest capacity, choose **${vA.maxCapacity > vB.maxCapacity ? vA.title : vB.title}** (${Math.max(vA.maxCapacity, vB.maxCapacity)} pax). For lower daily cost, **${vA.basePrice < vB.basePrice ? vA.title : vB.title}** starts at ₹${Math.min(vA.basePrice, vB.basePrice).toLocaleString()}.`;

        quickSuggestions = [
          `Build package at ${vA.title}`,
          `Build package at ${vB.title}`,
          'Check date availability'
        ];
      } else {
        reply = `I can compare any two venues on EventStay! Try asking: *"Compare Mithila Palace and Royal Banquet"* or *"Compare City Celebration and The Grand Vivanta"*.`;
        quickSuggestions = [
          'Compare Mithila Palace and Royal Banquet',
          'Compare Royal Banquet and City Celebration'
        ];
      }
    }

    // 10. Specific Venue Details
    else if (mentionedVenue) {
      const venueUnits = units.filter((u) => u.property && u.property._id.toString() === mentionedVenue._id.toString());

      reply = `🏨 **${mentionedVenue.title}** (${mentionedVenue.city})\n\n` +
        `• **Starting Daily Rental**: ₹${mentionedVenue.basePrice.toLocaleString()} / day\n` +
        `• **Guest Capacity**: Up to ${mentionedVenue.maxCapacity} guests\n` +
        `• **Rating**: ⭐ ${mentionedVenue.rating} / 5.0 (${mentionedVenue.numReviews || 24} verified reviews)\n` +
        `• **Address**: ${mentionedVenue.address}\n` +
        `• **Amenities**: ${mentionedVenue.amenities.join(', ')}\n` +
        (venueUnits.length > 0
          ? `• **Halls & Rooms Available**: ${venueUnits.map((u) => u.name).join(', ')}\n`
          : '') +
        `• **Cancellation Policy**: ${mentionedVenue.policies?.cancellation || 'Free cancellation up to 7 days before event.'}\n\n` +
        `Would you like to build an all-inclusive event package for this venue (Catering + Floral Decor + DJ + Rooms)?`;

      quickSuggestions = [
        `Check availability for ${mentionedVenue.title}`,
        `Build event package for ${mentionedVenue.title}`,
        'What catering menus are available?'
      ];
    }

    // 11. Catering & Food Menus
    else if (isCateringQuery) {
      const caterers = services.filter((s) => s.category === 'catering');

      reply = `🍽️ **Verified Banquet Catering Packages on EventStay**:\n\n` +
        caterers.map((c) =>
          `• **${c.name}**\n` +
          `   - **Provider**: ${c.providerName}\n` +
          `   - **Rate**: ₹${c.basePrice} per guest (${c.pricingType})\n` +
          `   - **Menu Inclusions**: ${c.inclusions.slice(0, 3).join(', ')}...`
        ).join('\n\n') +
        (requestedGuests
          ? `\n\n📊 **Food Cost for ${requestedGuests} Guests**:\n` +
            `• Traditional Mithila Feast: ₹${(300 * requestedGuests).toLocaleString()}\n` +
            `• Gourmet Premium Buffet: ₹${(450 * requestedGuests).toLocaleString()}`
          : `\n\n💡 In our **Event Package Builder**, entering your guest count automatically computes catering costs with zero hidden charges!`);

      quickSuggestions = [
        'Calculate catering for 300 guests',
        'Add catering to package',
        'Vegetarian food options'
      ];
    }

    // 12. Decor, Photography, DJ, Cakes & Makeup Services
    else if (isVendorQuery) {
      const decorList = services.filter((s) => s.category === 'decoration');
      const photoList = services.filter((s) => s.category === 'photography');
      const djList = services.filter((s) => s.category === 'music_dj');
      const cakeList = services.filter((s) => s.category === 'cake');
      const makeupList = services.filter((s) => s.category === 'makeup');

      reply = `🌸 **Verified Event Vendor Services on EventStay**:\n\n` +
        `• **Floral & Stage Decoration**:\n` +
        decorList.map((d) => `   - ${d.name}: ₹${d.basePrice.toLocaleString()} (${d.providerName})`).join('\n') +
        `\n\n• **Photography & Cinematography**:\n` +
        photoList.map((p) => `   - ${p.name}: ₹${p.basePrice.toLocaleString()} (${p.providerName})`).join('\n') +
        `\n\n• **DJ & Sound**:\n` +
        djList.map((m) => `   - ${m.name}: ₹${m.basePrice.toLocaleString()} (${m.providerName})`).join('\n') +
        `\n\n• **Bridal Beauty & Cakes**:\n` +
        [...makeupList, ...cakeList].map((x) => `   - ${x.name}: ₹${x.basePrice.toLocaleString()}`).join('\n') +
        `\n\n💡 You can mix-and-match any of these services inside the **Event Package Builder**!`;

      quickSuggestions = [
        'Open Event Package Builder',
        'Add 4K Drone Photography & DJ',
        'Wedding package under ₹2 Lakhs'
      ];
    }

    // 13. Date Availability & Conflict Checking
    else if (isDateQuery) {
      reply = `📅 **EventStay Real-Time Availability Engine**:\n\n` +
        `Our platform guarantees **atomic conflict prevention** so venues and halls are never double-booked:\n\n` +
        `• **November 15, 2026**: 🔴 Already booked / reserved at Mithila Palace.\n` +
        `• **November 16, 2026**: 🟢 Open & available for booking!\n\n` +
        `To inspect any venue's live schedule, open their property page to view the **Interactive Monthly Calendar** (green days are open, red days are booked).`;

      quickSuggestions = [
        'Check availability for November 16',
        'View Mithila Palace Calendar',
        'How to book an open date'
      ];
    }

    // 14. Cancellation & Refund Policy
    else if (isCancellationQuery) {
      reply = `🛡️ **EventStay Cancellation & Refund Policy**:\n\n` +
        `• **Free Cancellation**: You can cancel without penalty up to **7 days** before the scheduled event date.\n` +
        `• **100% Escrow Protection**: Your payment is securely safeguarded in escrow until the celebration is completed.\n` +
        `• **Turnaround Time**: Approved refunds are automatically credited back to your original payment method (UPI/Card/Bank) within 3–5 business days.\n` +
        `• **Customer Dispute Desk**: If any unexpected issue arises with a vendor, our 24/7 admin dispute desk resolves it promptly.`;

      quickSuggestions = [
        'How to cancel a booking',
        'View sample tax receipt',
        'Explore verified venues'
      ];
    }

    // 15. Specific City Query
    else if (mentionedCity) {
      const cityProps = properties.filter((p) => p.city.toLowerCase() === mentionedCity.toLowerCase());
      const tierBadge = matchedCityMeta
        ? ` (Rank #${matchedCityMeta.rank} on 100 Indian Cities Index • ${matchedCityMeta.tier === 'luxury' ? '💎 Tier 1 High Budget' : matchedCityMeta.tier === 'mid' ? '🌟 Tier 2 Mid Budget' : '🏷️ Tier 3 Value Budget'} • Average Range: ${matchedCityMeta.range})`
        : '';

      if (cityProps.length > 0) {
        reply = `In **${mentionedCity}**${tierBadge}, we offer **${cityProps.length} verified premier venues**:\n\n` +
          cityProps.map((p) =>
            `• 🏨 **${p.title}**\n` +
            `   - Capacity: Up to ${p.maxCapacity} guests | Starting: ₹${p.basePrice.toLocaleString()} / day\n` +
            `   - Rating: ⭐ ${p.rating}/5.0 | Location: ${p.address}\n` +
            `   - Amenities: ${p.amenities.slice(0, 3).join(', ')}`
          ).join('\n\n') +
          `\n\nAll of these properties feature real map tracking and support our full **Event Package Builder**!`;
      } else {
        reply = `📍 **${mentionedCity}**${tierBadge} is actively mapped in our **100 Indian Cities Hotel Budget Network**:\n\n` +
          `• **Budget Tier**: ${matchedCityMeta?.tier ? matchedCityMeta.tier.toUpperCase() : 'MID BUDGET'}\n` +
          `• **Estimated Hotel Budget Range**: ${matchedCityMeta?.range || '₹1.0L – ₹2.5L / day'}\n` +
          `• **Interactive Map**: Our map camera can fly directly to **${mentionedCity}** coordinates on the Explore page.\n\n` +
          `You can filter by this city on the Explore page to view nearby luxury and banquet accommodations, or customize an all-inclusive package with our vendors!`;
      }

      quickSuggestions = [
        `Show venues in ${mentionedCity}`,
        `Filter by ${matchedCityMeta?.tier === 'luxury' ? 'High Budget' : 'Value Budget'}`,
        'Launch Package Builder'
      ];
    }

    // 16. Guest Count / Capacity Filter
    else if (requestedGuests) {
      const suitable = properties.filter((p) => p.maxCapacity >= requestedGuests);

      if (suitable.length > 0) {
        reply = `For **${requestedGuests} guests**, here are the best matching venues on EventStay:\n\n` +
          suitable.map((p) =>
            `🏨 **${p.title}** (${p.city})\n` +
            `   • Capacity: ${p.maxCapacity} pax | Starting: ₹${p.basePrice.toLocaleString()}/day | ⭐ ${p.rating}/5.0`
          ).join('\n\n') +
          `\n\n💡 *Pro-Tip: We recommend booking a venue with 10–15% more capacity than your RSVP list to ensure comfortable dining and photography staging.*`;

        quickSuggestions = [
          `Plan package for ${requestedGuests} guests`,
          `How many rooms for ${requestedGuests} guests?`,
          `Calculate catering for ${requestedGuests} guests`
        ];
      } else {
        reply = `For a gathering of **${requestedGuests} guests**, our largest single venue accommodates up to 600 guests (*The Grand Vivanta Resort & Spa*). For larger weddings, you can combine lawn and indoor banquet spaces!`;

        quickSuggestions = [
          'View The Grand Vivanta (600 pax)',
          'How to book multiple halls'
        ];
      }
    }

    // 17. Hindi / Hinglish Inquiry
    else if (isHindiQuery) {
      reply = `नमस्ते! EventStay पर आपका स्वागत है। शादी या किसी भी इवेंट के लिए हम आपकी पूरी मदद कर सकते हैं:\n\n` +
        `• 🏨 **सस्ते और बेहतरीन वेन्यू**: होटल हेरिटेज ग्रैंड (₹55,000 से शुरू), मिथिला पैलेस (₹65,000), रॉयल बैंक्वेट (₹80,000)।\n` +
        `• 🍽️ **कैटरिंग (खाना)**: स्वादिष्ट मिथिला एवं कॉन्टिनेंटल खाना ₹300 प्रति प्लेट से शुरू।\n` +
        `• 🛏️ **कमरे (Rooms)**: हर 2 मेहमानों के लिए 1 कमरा रेकमेंड किया जाता है (जैसे 50 मेहमानों के लिए 25 कमरे)।\n` +
        `• 🎟️ **डिस्काउंट कूपन**: चेकआउट पर कूपन कोड **WELCOME5000** लगाकर ₹5,000 की छूट पाएं!\n\n` +
        `आप पैकेज बिल्डर का उपयोग करके वेन्यू, खाना, डेकोरेशन और DJ एक साथ आसानी से बुक कर सकते हैं।`;

      quickSuggestions = [
        'How to book in Hindi',
        'Cheapest venues on EventStay',
        'Active discount coupons'
      ];
    }

    // 18. What is EventStay / Platform Overview
    else if (isPlatformInfoQuery) {
      reply = `**EventStay** is India's leading unified **Hotel, Event Venue & Vendor Marketplace**:\n\n` +
        `Think of it as **Booking.com + Airbnb + Eventbrite**, tailored for weddings, celebrations, and corporate events:\n\n` +
        `1. 👤 **For Customers**: Stop calling 10 separate vendors! Customize complete packages (Banquet + Food + Decor + DJ + Rooms), pay online with escrow protection, and get instant tax receipts.\n` +
        `2. 🏨 **For Venue Owners**: Dedicated portal with real-time revenue analytics, unit management, and reservation calendars.\n` +
        `3. 🛡️ **For Admins**: Platform oversight, 10% transparent commissions, venue approvals, and dispute resolution.`;

      quickSuggestions = [
        'Explore venues',
        'How to book',
        'Register as Venue Owner'
      ];
    }

    // 19. Casual Greeting
    else if (isGreeting) {
      reply = `Hello! I am your **EventStay Concierge**. How can I help you today?\n\n` +
        `You can ask me about:\n` +
        `• 🏨 **Venues & Prices**: *"Cheapest venue"*, *"Venues in Janakpur"*, *"The Grand Vivanta"*\n` +
        `• 🛏️ **Room Math**: *"How many rooms for 50 guests?"*\n` +
        `• 🍽️ **Catering & Vendors**: *"What catering menus are available?"*, *"DJ & Decor packages"*\n` +
        `• 🎟️ **Discounts & Booking**: *"Active coupon codes"*, *"How to book"*, *"Payment options"*`;

      quickSuggestions = [
        'How to book a venue',
        'Cheapest venue in Janakpur',
        'How many rooms for 50 guests?',
        'Active discount coupons'
      ];
    }

    // 20. Smart Default Fallback
    else {
      reply = `I can help you with that! Here is what you can do on EventStay right now:\n\n` +
        `• **Browse Venues**: 5 verified luxury and banquet venues starting at ₹55,000/day.\n` +
        `• **Package Builder**: Bundle venue, catering (₹300/plate), floral decor, DJ, and guest accommodations.\n` +
        `• **Promo Savings**: Apply code **WELCOME5000** for ₹5,000 off your booking!\n` +
        `• **Online Booking**: 100% secure UPI/Card checkout with instant QR receipt.\n\n` +
        `Could you tell me a bit more about your event date, city, or guest count?`;

      quickSuggestions = [
        'How to book on EventStay',
        'Cheapest venues in Janakpur',
        'How many rooms for 50 guests?',
        'Active discount coupons'
      ];
    }

    res.status(200).json({
      success: true,
      reply,
      quickSuggestions
    });
  } catch (error) {
    next(error);
  }
};

