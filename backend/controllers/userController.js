const { Op } = require('sequelize');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.getProfile = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, email } = req.body;

  if (email && email !== req.user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return next(new AppError('Email already in use', 400));
    }
  }

  req.user.name = name || req.user.name;
  req.user.phone = phone !== undefined ? phone : req.user.phone;
  req.user.email = email || req.user.email;
  await req.user.save();

  res.status(200).json({
    success: true,
    data: req.user,
  });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  const user = await User.scope('withPassword').findByPk(req.user.id);
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {
  await User.update({ isActive: false }, { where: { id: req.user.id } });

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully',
  });
});
