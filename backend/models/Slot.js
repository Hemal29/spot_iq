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
    type: {
      type: DataTypes.ENUM('standard', 'ev', 'handicapped', 'compact'),
      defaultValue: 'standard',
    },
    status: {
      type: DataTypes.ENUM('available', 'booked', 'maintenance'),
      defaultValue: 'available',
    },
    currentBooking: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  return Slot;
};
