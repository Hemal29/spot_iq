const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define('Vehicle', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        this.setDataValue('vehicleNumber', String(val).toUpperCase());
      },
    },
    vehicleType: {
      type: DataTypes.ENUM('sedan', 'suv', 'hatchback', 'motorcycle', 'truck'),
      defaultValue: 'sedan',
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Vehicle;
};
