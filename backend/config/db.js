const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'spotiq',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  }
);

const initModels = require('../models');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(' MySQL Connected Successfully');
    console.log(' Host: ' + sequelize.config.host);
    console.log(' Database: ' + sequelize.config.database);

    await sequelize.sync({ alter: true });
    console.log(' All models synchronized');
  } catch (error) {
    console.error(' MySQL connection error: ' + error.message);
    console.error(' Make sure MySQL is running and credentials in backend/.env are correct.');
    process.exit(1);
  }
};

initModels(sequelize);

module.exports = connectDB;
module.exports.sequelize = sequelize;
