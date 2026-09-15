require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');
const ParkingModel = require('../models/Parking');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

const Parking = ParkingModel(sequelize);

const parkings = [
  {
    parkingName: 'SG Highway Smart Parking',
    address: 'SG Highway, Near Palladium Mall',
    city: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0225,
    longitude: 72.5714,
    pricePerHour: 40,
    totalSlots: 120,
    availableSlots: 45,
    amenities: ['covered', 'cctv', 'evCharging'],
    images: [],
    rating: 4.5,
    numReviews: 128,
    isActive: true,
    parkingType: 'multi-level',
    area: 'SG Highway',
    is24x7: true,
    status: 'active',
  },
  {
    parkingName: 'CG Road Premium Lot',
    address: 'CG Road, Near Law Garden',
    city: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0325,
    longitude: 72.5814,
    pricePerHour: 50,
    totalSlots: 80,
    availableSlots: 12,
    amenities: ['covered', 'cctv', 'valet', '247'],
    images: [],
    rating: 4.8,
    numReviews: 95,
    isActive: true,
    parkingType: 'multi-level',
    area: 'CG Road',
    is24x7: true,
    status: 'active',
  },
  {
    parkingName: 'Kankaria Lake Parking',
    address: 'Kankaria Lake, Maninagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0025,
    longitude: 72.6014,
    pricePerHour: 30,
    totalSlots: 200,
    availableSlots: 78,
    amenities: ['outdoor', 'cctv'],
    images: [],
    rating: 4.2,
    numReviews: 210,
    isActive: true,
    parkingType: 'street',
    area: 'Kankaria Lake',
    is24x7: false,
    openingTime: '06:00',
    closingTime: '22:00',
    status: 'active',
  },
  {
    parkingName: 'Sabarmati Riverfront Parking',
    address: 'Riverfront, Near Gandhi Ashram',
    city: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0525,
    longitude: 72.5714,
    pricePerHour: 35,
    totalSlots: 150,
    availableSlots: 89,
    amenities: ['outdoor', '247', 'cctv'],
    images: [],
    rating: 4.6,
    numReviews: 175,
    isActive: true,
    parkingType: 'street',
    area: 'Sabarmati Riverfront',
    is24x7: true,
    status: 'active',
  },
  {
    parkingName: 'AlphaOne Mall Multi-Level',
    address: 'AlphaOne Mall, Vastrapur',
    city: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0425,
    longitude: 72.5614,
    pricePerHour: 60,
    totalSlots: 500,
    availableSlots: 120,
    amenities: ['covered', 'indoor', 'cctv', 'evCharging', 'valet', '247'],
    images: [],
    rating: 4.7,
    numReviews: 320,
    isActive: true,
    parkingType: 'mall',
    area: 'AlphaOne Mall',
    is24x7: true,
    status: 'active',
  },
  {
    parkingName: 'Navrangpura Municipal Lot',
    address: 'Navrangpura, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0125,
    longitude: 72.5514,
    pricePerHour: 25,
    totalSlots: 60,
    availableSlots: 3,
    amenities: ['outdoor'],
    images: [],
    rating: 4.0,
    numReviews: 45,
    isActive: true,
    parkingType: 'street',
    area: 'Navrangpura',
    is24x7: false,
    openingTime: '08:00',
    closingTime: '20:00',
    status: 'active',
  },
  {
    parkingName: 'Vastrapur Lake Parking',
    address: 'Vastrapur Lake',
    city: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0475,
    longitude: 72.5414,
    pricePerHour: 30,
    totalSlots: 90,
    availableSlots: 55,
    amenities: ['outdoor', 'cctv'],
    images: [],
    rating: 4.3,
    numReviews: 88,
    isActive: true,
    parkingType: 'street',
    area: 'Vastrapur',
    is24x7: false,
    openingTime: '06:00',
    closingTime: '22:00',
    status: 'active',
  },
  {
    parkingName: 'Bodakdev Secure Parking',
    address: 'Bodakdev, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0625,
    longitude: 72.5214,
    pricePerHour: 45,
    totalSlots: 75,
    availableSlots: 30,
    amenities: ['covered', 'cctv', '247', 'evCharging'],
    images: [],
    rating: 4.4,
    numReviews: 67,
    isActive: true,
    parkingType: 'commercial',
    area: 'Bodakdev',
    is24x7: true,
    status: 'active',
  },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const count = await Parking.count();
    if (count > 0) {
      console.log(`Parkings table already has ${count} records. Skipping seed.`);
      process.exit(0);
    }

    await Parking.bulkCreate(parkings);
    console.log(`Seeded ${parkings.length} parking locations.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
