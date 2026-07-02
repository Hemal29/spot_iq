const { Vehicle } = require('../models');
const AppError = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.addVehicle = asyncHandler(async (req, res, next) => {
  const { vehicleNumber, vehicleType, brand, model, color } = req.body;

  const existing = await Vehicle.findOne({
    where: { userId: req.user.id, vehicleNumber: vehicleNumber.toUpperCase() },
  });
  if (existing) {
    return next(new AppError('Vehicle with this number already exists', 400));
  }

  const vehicleCount = await Vehicle.count({ where: { userId: req.user.id } });

  const vehicle = await Vehicle.create({
    userId: req.user.id,
    vehicleNumber,
    vehicleType,
    brand,
    model,
    color,
    isDefault: vehicleCount === 0,
  });

  res.status(201).json({
    success: true,
    data: vehicle,
  });
});

exports.getMyVehicles = asyncHandler(async (req, res, next) => {
  const vehicles = await Vehicle.findAll({
    where: { userId: req.user.id },
    order: [
      ['isDefault', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });

  res.status(200).json({
    success: true,
    count: vehicles.length,
    data: vehicles,
  });
});

exports.updateVehicle = asyncHandler(async (req, res, next) => {
  const { vehicleId } = req.params;
  const { vehicleNumber, vehicleType, brand, model, color } = req.body;

  const vehicle = await Vehicle.findOne({
    where: { id: vehicleId, userId: req.user.id },
  });

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (vehicleNumber !== undefined) vehicle.vehicleNumber = vehicleNumber;
  if (vehicleType !== undefined) vehicle.vehicleType = vehicleType;
  if (brand !== undefined) vehicle.brand = brand;
  if (model !== undefined) vehicle.model = model;
  if (color !== undefined) vehicle.color = color;
  await vehicle.save();

  res.status(200).json({
    success: true,
    data: vehicle,
  });
});

exports.deleteVehicle = asyncHandler(async (req, res, next) => {
  const { vehicleId } = req.params;

  const vehicle = await Vehicle.findOne({
    where: { id: vehicleId, userId: req.user.id },
  });

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  await Vehicle.destroy({ where: { id: vehicleId, userId: req.user.id } });

  const remaining = await Vehicle.count({ where: { userId: req.user.id } });
  if (remaining > 0) {
    const hasDefault = await Vehicle.findOne({
      where: { userId: req.user.id, isDefault: true },
    });
    if (!hasDefault) {
      const oldest = await Vehicle.findOne({
        where: { userId: req.user.id },
        order: [['createdAt', 'ASC']],
      });
      oldest.isDefault = true;
      await oldest.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Vehicle deleted successfully',
  });
});

exports.setDefaultVehicle = asyncHandler(async (req, res, next) => {
  const { vehicleId } = req.params;

  const vehicle = await Vehicle.findOne({
    where: { id: vehicleId, userId: req.user.id },
  });
  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  await Vehicle.update(
    { isDefault: false },
    { where: { userId: req.user.id } }
  );

  vehicle.isDefault = true;
  await vehicle.save();

  res.status(200).json({
    success: true,
    data: vehicle,
  });
});
