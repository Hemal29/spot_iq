const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SupportTicket = sequelize.define('SupportTicket', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('open', 'assigned', 'resolved', 'closed'), defaultValue: 'open' },
    priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
    assignedTo: { type: DataTypes.INTEGER, allowNull: true },
    resolution: { type: DataTypes.TEXT, allowNull: true },
  });

  return SupportTicket;
};
