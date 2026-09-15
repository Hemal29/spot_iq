const asyncHandler = require('../middleware/asyncHandler');
const { Setting } = require('../models');
const AppError = require('../utils/AppError');

exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne({ where: { key: 'app' } });
  if (!settings) {
    settings = await Setting.create({
      key: 'app',
      data: {
        general: {},
        email: {},
        payment: {},
      },
    });
  }
  res.json({ success: true, data: settings.data });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const [setting] = await Setting.findOrCreate({
    where: { key: 'app' },
    defaults: { key: 'app', data: { general: {}, email: {}, payment: {} } },
  });
  setting.data = req.body;
  await setting.save();
  res.json({ success: true, data: setting.data });
});

exports.testEmailSettings = asyncHandler(async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = req.body || {};
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new AppError('SMTP configuration is incomplete', 400);
  }
  res.json({ success: true, message: 'Email settings validated (SMTP not actually sent in dev mode)' });
});
