require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'spotiq',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const initModels = require('../models');
initModels(sequelize);
const { User } = require('../models');

(async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  const email = 'admin@spotiq.com';
  const password = 'Admin@123';

  let user = await User.scope('withPassword').findOne({ where: { email } });

  if (user) {
    user.password = password;
    user.role = 'admin';
    user.isActive = true;
    await user.save();
    console.log('Updated existing user to admin:', user.email);
  } else {
    user = await User.create({
      name: 'Admin',
      email,
      password,
      phone: '9999999999',
      role: 'admin',
      isActive: true,
    });
    console.log('Created admin user:', user.email);
  }

  const verify = await User.scope('withPassword').findOne({ where: { email } });
  const match = await verify.matchPassword(password);
  console.log('Password verification:', match ? 'PASS' : 'FAIL');
  console.log('Role:', verify.role);

  process.exit(0);
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
