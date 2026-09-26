const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/eventstay');
  const count = await mongoose.connection.collection('properties').countDocuments();
  const byType = await mongoose.connection.collection('properties').aggregate([
    { $group: { _id: '$propertyType', count: { $sum: 1 } } }
  ]).toArray();
  const byCategory = await mongoose.connection.collection('properties').aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Total properties:', count);
  console.log('By Property Type:', byType);
  console.log('By Category:', byCategory);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
