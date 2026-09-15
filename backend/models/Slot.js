const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Slot = sequelize.define('Slot', {
    parkingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slotNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    floor: {
      type: DataTypes.STRING,
      defaultValue: 'Ground',
    },
    zone: {
      type: DataTypes.STRING,
      defaultValue: 'A',
    },
    vehicleType: {
      type: DataTypes.ENUM('car', 'bike', 'ev'),
      defaultValue: 'car',
    },
    slotSize: {
      type: DataTypes.ENUM('compact', 'standard', 'large'),
      defaultValue: 'standard',
    },
    type: {
      type: DataTypes.ENUM('standard', 'ev', 'handicapped', 'compact', 'vip'),
      defaultValue: 'standard',
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance'),
      defaultValue: 'available',
    },
    currentBooking: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qrCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Slot;
};
