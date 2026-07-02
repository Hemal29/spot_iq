const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Parking = sequelize.define('Parking', {
    parkingName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Parking name is required' } },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Address is required' } },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'City is required' } },
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    pricePerHour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    totalSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    availableSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    operatingHours: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    numReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    parkingType: { type: DataTypes.ENUM('mall', 'street', 'multi-level', 'airport', 'hospital', 'residential', 'commercial'), defaultValue: 'multi-level' },
    country: { type: DataTypes.STRING, defaultValue: 'India' },
    area: { type: DataTypes.STRING, allowNull: true },
    ownerName: { type: DataTypes.STRING, allowNull: true },
    ownerEmail: { type: DataTypes.STRING, allowNull: true },
    ownerPhone: { type: DataTypes.STRING, allowNull: true },
    dailyPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    weeklyPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    monthlyPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    nightCharges: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    weekendCharges: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    peakHourCharges: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    carSlots: { type: DataTypes.INTEGER, defaultValue: 0 },
    bikeSlots: { type: DataTypes.INTEGER, defaultValue: 0 },
    evSlots: { type: DataTypes.INTEGER, defaultValue: 0 },
    vipSlots: { type: DataTypes.INTEGER, defaultValue: 0 },
    disabledSlots: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('active', 'closed', 'maintenance', 'full'), defaultValue: 'active' },
    openingTime: { type: DataTypes.STRING, defaultValue: '08:00' },
    closingTime: { type: DataTypes.STRING, defaultValue: '22:00' },
    is24x7: { type: DataTypes.BOOLEAN, defaultValue: false },
    holidaySchedule: { type: DataTypes.JSON, allowNull: true },
  });

  return Parking;
};
