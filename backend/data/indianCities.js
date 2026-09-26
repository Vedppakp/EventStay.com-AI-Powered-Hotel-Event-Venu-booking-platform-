/**
 * 🇮🇳 100 Indian Cities — High → Low Hotel Budget Master Dataset (Backend CommonJS)
 */

// 100 Indian Cities Hotel Budget Spectrum - Tiers Definition
const BUDGET_TIERS = {
  all: { id: 'all', name: 'All 100 Cities', range: '₹45k – ₹5.5L+ / day' },
  luxury: { id: 'luxury', name: 'Tier 1 — High Budget (Luxury & Metros)', range: '₹1.8L – ₹5.5L+ / day' },
  mid: { id: 'mid', name: 'Tier 2 — Mid Budget (Balanced & Cultural)', range: '₹1.0L – ₹2.5L / day' },
  value: { id: 'value', name: 'Tier 3 — Value Budget (Affordable & Spiritual)', range: '₹45k – ₹1.2L / day' }
};

// Quick map of city names to tier & average prices
const CITY_BUDGET_MAP = {
  // Tier 1 High Budget
  mumbai: { tier: 'luxury', avg: 420000, rank: 1, range: '₹3.5L – ₹5.5L / day' },
  delhi: { tier: 'luxury', avg: 380000, rank: 2, range: '₹3.0L – ₹5.0L / day' },
  'new delhi': { tier: 'luxury', avg: 380000, rank: 2, range: '₹3.0L – ₹5.0L / day' },
  goa: { tier: 'luxury', avg: 350000, rank: 3, range: '₹2.8L – ₹4.5L / day' },
  panaji: { tier: 'luxury', avg: 350000, rank: 3, range: '₹2.8L – ₹4.5L / day' },
  bengaluru: { tier: 'luxury', avg: 320000, rank: 4, range: '₹2.5L – ₹4.5L / day' },
  bangalore: { tier: 'luxury', avg: 320000, rank: 4, range: '₹2.5L – ₹4.5L / day' },
  udaipur: { tier: 'luxury', avg: 450000, rank: 5, range: '₹3.5L – ₹5.5L / day' },
  jaipur: { tier: 'luxury', avg: 360000, rank: 6, range: '₹2.5L – ₹4.8L / day' },
  hyderabad: { tier: 'luxury', avg: 300000, rank: 7, range: '₹2.2L – ₹4.2L / day' },
  pune: { tier: 'luxury', avg: 260000, rank: 8, range: '₹2.0L – ₹3.8L / day' },
  gurugram: { tier: 'luxury', avg: 320000, rank: 9, range: '₹2.5L – ₹4.5L / day' },
  gurgaon: { tier: 'luxury', avg: 320000, rank: 9, range: '₹2.5L – ₹4.5L / day' },
  kochi: { tier: 'luxury', avg: 270000, rank: 10, range: '₹2.0L – ₹3.8L / day' },
  cochin: { tier: 'luxury', avg: 270000, rank: 10, range: '₹2.0L – ₹3.8L / day' },
  noida: { tier: 'luxury', avg: 260000, rank: 11, range: '₹2.0L – ₹3.8L / day' },
  chennai: { tier: 'luxury', avg: 260000, rank: 12, range: '₹2.0L – ₹3.6L / day' },
  manali: { tier: 'luxury', avg: 280000, rank: 13, range: '₹2.0L – ₹3.8L / day' },
  agra: { tier: 'luxury', avg: 280000, rank: 14, range: '₹2.0L – ₹3.8L / day' },
  varanasi: { tier: 'luxury', avg: 250000, rank: 15, range: '₹1.8L – ₹3.5L / day' },
  banaras: { tier: 'luxury', avg: 250000, rank: 15, range: '₹1.8L – ₹3.5L / day' },
  kolkata: { tier: 'luxury', avg: 270000, rank: 16, range: '₹2.0L – ₹3.6L / day' },
  calcutta: { tier: 'luxury', avg: 270000, rank: 16, range: '₹2.0L – ₹3.6L / day' },
  ahmedabad: { tier: 'luxury', avg: 240000, rank: 17, range: '₹1.8L – ₹3.4L / day' },
  chandigarh: { tier: 'luxury', avg: 240000, rank: 18, range: '₹1.8L – ₹3.4L / day' },
  lucknow: { tier: 'luxury', avg: 230000, rank: 19, range: '₹1.8L – ₹3.2L / day' },
  shimla: { tier: 'luxury', avg: 240000, rank: 20, range: '₹1.8L – ₹3.4L / day' },
  srinagar: { tier: 'luxury', avg: 250000, rank: 21, range: '₹1.8L – ₹3.4L / day' },
  rishikesh: { tier: 'luxury', avg: 210000, rank: 22, range: '₹1.5L – ₹3.0L / day' },

  // Tier 2 Mid Budget
  mysuru: { tier: 'mid', avg: 190000, rank: 23, range: '₹1.4L – ₹2.6L / day' },
  mysore: { tier: 'mid', avg: 190000, rank: 23, range: '₹1.4L – ₹2.6L / day' },
  indore: { tier: 'mid', avg: 180000, rank: 24, range: '₹1.3L – ₹2.5L / day' },
  surat: { tier: 'mid', avg: 190000, rank: 25, range: '₹1.4L – ₹2.6L / day' },
  nagpur: { tier: 'mid', avg: 170000, rank: 26, range: '₹1.2L – ₹2.3L / day' },
  bhubaneswar: { tier: 'mid', avg: 175000, rank: 27, range: '₹1.3L – ₹2.4L / day' },
  patna: { tier: 'mid', avg: 160000, rank: 28, range: '₹1.1L – ₹2.2L / day' },
  coimbatore: { tier: 'mid', avg: 165000, rank: 29, range: '₹1.2L – ₹2.2L / day' },
  thane: { tier: 'mid', avg: 200000, rank: 30, range: '₹1.5L – ₹2.7L / day' },
  'navi mumbai': { tier: 'mid', avg: 200000, rank: 31, range: '₹1.5L – ₹2.7L / day' },
  visakhapatnam: { tier: 'mid', avg: 170000, rank: 32, range: '₹1.2L – ₹2.3L / day' },
  vizag: { tier: 'mid', avg: 170000, rank: 32, range: '₹1.2L – ₹2.3L / day' },
  madurai: { tier: 'mid', avg: 150000, rank: 33, range: '₹1.1L – ₹2.1L / day' },
  mangaluru: { tier: 'mid', avg: 165000, rank: 34, range: '₹1.2L – ₹2.3L / day' },
  mangalore: { tier: 'mid', avg: 165000, rank: 34, range: '₹1.2L – ₹2.3L / day' },
  pondicherry: { tier: 'mid', avg: 190000, rank: 35, range: '₹1.4L – ₹2.6L / day' },
  puducherry: { tier: 'mid', avg: 190000, rank: 35, range: '₹1.4L – ₹2.6L / day' },
  nashik: { tier: 'mid', avg: 165000, rank: 36, range: '₹1.2L – ₹2.3L / day' },
  amritsar: { tier: 'mid', avg: 170000, rank: 37, range: '₹1.2L – ₹2.3L / day' },
  jodhpur: { tier: 'mid', avg: 210000, rank: 38, range: '₹1.5L – ₹2.8L / day' },
  pushkar: { tier: 'mid', avg: 175000, rank: 39, range: '₹1.2L – ₹2.4L / day' },
  tirupati: { tier: 'mid', avg: 145000, rank: 40, range: '₹1.0L – ₹2.0L / day' },
  dehradun: { tier: 'mid', avg: 180000, rank: 41, range: '₹1.3L – ₹2.5L / day' },
  haridwar: { tier: 'mid', avg: 150000, rank: 42, range: '₹1.1L – ₹2.1L / day' },
  bhopal: { tier: 'mid', avg: 155000, rank: 43, range: '₹1.1L – ₹2.1L / day' },
  ranchi: { tier: 'mid', avg: 150000, rank: 44, range: '₹1.1L – ₹2.1L / day' },
  raipur: { tier: 'mid', avg: 150000, rank: 45, range: '₹1.1L – ₹2.1L / day' },
  guwahati: { tier: 'mid', avg: 165000, rank: 46, range: '₹1.2L – ₹2.3L / day' },
  thiruvananthapuram: { tier: 'mid', avg: 180000, rank: 47, range: '₹1.3L – ₹2.5L / day' },
  trivandrum: { tier: 'mid', avg: 180000, rank: 47, range: '₹1.3L – ₹2.5L / day' },
  kanpur: { tier: 'mid', avg: 145000, rank: 48, range: '₹1.0L – ₹2.1L / day' },
  vadodara: { tier: 'mid', avg: 155000, rank: 49, range: '₹1.1L – ₹2.1L / day' },
  baroda: { tier: 'mid', avg: 155000, rank: 49, range: '₹1.1L – ₹2.1L / day' },
  vijayawada: { tier: 'mid', avg: 150000, rank: 50, range: '₹1.1L – ₹2.1L / day' },

  // Tier 3 Value Budget
  aurangabad: { tier: 'value', avg: 120000, rank: 51, range: '₹85k – ₹1.6L / day' },
  rajkot: { tier: 'value', avg: 120000, rank: 52, range: '₹85k – ₹1.6L / day' },
  gwalior: { tier: 'value', avg: 130000, rank: 53, range: '₹90k – ₹1.7L / day' },
  jamshedpur: { tier: 'value', avg: 120000, rank: 54, range: '₹85k – ₹1.6L / day' },
  jammu: { tier: 'value', avg: 120000, rank: 55, range: '₹85k – ₹1.6L / day' },
  kota: { tier: 'value', avg: 110000, rank: 56, range: '₹75k – ₹1.5L / day' },
  bikaner: { tier: 'value', avg: 130000, rank: 57, range: '₹90k – ₹1.7L / day' },
  ajmer: { tier: 'value', avg: 115000, rank: 58, range: '₹80k – ₹1.5L / day' },
  darjeeling: { tier: 'value', avg: 130000, rank: 59, range: '₹90k – ₹1.7L / day' },
  siliguri: { tier: 'value', avg: 110000, rank: 60, range: '₹80k – ₹1.5L / day' },
  jalandhar: { tier: 'value', avg: 120000, rank: 61, range: '₹85k – ₹1.6L / day' },
  ludhiana: { tier: 'value', avg: 130000, rank: 62, range: '₹90k – ₹1.7L / day' },
  meerut: { tier: 'value', avg: 110000, rank: 63, range: '₹75k – ₹1.5L / day' },
  prayagraj: { tier: 'value', avg: 115000, rank: 64, range: '₹80k – ₹1.6L / day' },
  allahabad: { tier: 'value', avg: 115000, rank: 64, range: '₹80k – ₹1.6L / day' },
  gorakhpur: { tier: 'value', avg: 100000, rank: 65, range: '₹70k – ₹1.4L / day' },
  bareilly: { tier: 'value', avg: 100000, rank: 66, range: '₹70k – ₹1.4L / day' },
  mathura: { tier: 'value', avg: 110000, rank: 67, range: '₹75k – ₹1.5L / day' },
  vrindavan: { tier: 'value', avg: 110000, rank: 68, range: '₹75k – ₹1.5L / day' },
  ayodhya: { tier: 'value', avg: 120000, rank: 69, range: '₹80k – ₹1.6L / day' },
  jabalpur: { tier: 'value', avg: 105000, rank: 70, range: '₹70k – ₹1.4L / day' },
  bilaspur: { tier: 'value', avg: 95000, rank: 71, range: '₹60k – ₹1.3L / day' },
  dhanbad: { tier: 'value', avg: 95000, rank: 72, range: '₹60k – ₹1.3L / day' },
  shillong: { tier: 'value', avg: 130000, rank: 73, range: '₹90k – ₹1.7L / day' },
  agartala: { tier: 'value', avg: 95000, rank: 74, range: '₹60k – ₹1.3L / day' },
  imphal: { tier: 'value', avg: 95000, rank: 75, range: '₹60k – ₹1.3L / day' },
  gangtok: { tier: 'value', avg: 130000, rank: 76, range: '₹90k – ₹1.7L / day' },
  vellore: { tier: 'value', avg: 95000, rank: 77, range: '₹60k – ₹1.3L / day' },
  salem: { tier: 'value', avg: 95000, rank: 78, range: '₹60k – ₹1.3L / day' },
  tiruchirappalli: { tier: 'value', avg: 95000, rank: 79, range: '₹60k – ₹1.3L / day' },
  trichy: { tier: 'value', avg: 95000, rank: 79, range: '₹60k – ₹1.3L / day' },
  hubballi: { tier: 'value', avg: 95000, rank: 80, range: '₹60k – ₹1.3L / day' },
  hubli: { tier: 'value', avg: 95000, rank: 80, range: '₹60k – ₹1.3L / day' },
  kozhikode: { tier: 'value', avg: 110000, rank: 81, range: '₹75k – ₹1.5L / day' },
  calicut: { tier: 'value', avg: 110000, rank: 81, range: '₹75k – ₹1.5L / day' },
  gaya: { tier: 'value', avg: 85000, rank: 82, range: '₹50k – ₹1.2L / day' },
  'bodh gaya': { tier: 'value', avg: 85000, rank: 82, range: '₹50k – ₹1.2L / day' },
  janakpur: { tier: 'value', avg: 90000, rank: 83, range: '₹55k – ₹1.5L / day' }
};

function getCityInfo(name) {
  if (!name) return null;
  const k = name.trim().toLowerCase();
  return CITY_BUDGET_MAP[k] || null;
}

function getCitiesByTier(tier) {
  if (!tier || tier === 'all') return [];
  return Object.entries(CITY_BUDGET_MAP)
    .filter(([_, info]) => info.tier === tier)
    .map(([cityKey]) => cityKey);
}

module.exports = {
  BUDGET_TIERS,
  CITY_BUDGET_MAP,
  getCityInfo,
  getCitiesByTier
};
