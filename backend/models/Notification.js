const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    userId: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.ENUM('booking', 'payment', 'system', 'promo'), defaultValue: 'system' },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    sendToAll: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  return Notification;
};
