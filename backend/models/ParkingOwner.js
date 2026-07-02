const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ParkingOwner = sequelize.define('ParkingOwner', {
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    companyName: { type: DataTypes.STRING, allowNull: true },
    gstNumber: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
    commissionRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 10.0 },
    totalEarnings: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    bankAccount: { type: DataTypes.STRING, allowNull: true },
    ifscCode: { type: DataTypes.STRING, allowNull: true },
  });

  return ParkingOwner;
};
