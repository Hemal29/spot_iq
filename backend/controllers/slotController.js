const { Op } = require('sequelize');
const { Slot, Parking, Booking } = require('../models');
const AppError = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.createSlots = asyncHandler(async (req, res, next) => {
  const { parkingId, slotCount, slotType } = req.body;

  if (!parkingId || !slotCount) {
    return next(new AppError('Parking ID and slot count are required', 400));
  }

  const parking = await Parking.findByPk(parkingId);
  if (!parking) {
    return next(new AppError('Parking not found', 404));
  }

  const existingSlots = await Slot.count({ where: { parkingId } });
  if (existingSlots > 0) {
    return next(new AppError('Slots already exist for this parking', 400));
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const slotsPerRow = Math.ceil(Math.sqrt(slotCount));
  const slots = [];

  for (let i = 0; i < slotCount; i++) {
    const row = Math.floor(i / slotsPerRow);
    const col = (i % slotsPerRow) + 1;
    const slotNumber = `${letters[row]}${col}`;

    slots.push({
      parkingId,
      slotNumber,
      type: slotType || 'standard',
      status: 'available',
    });
  }

  const createdSlots = await Slot.bulkCreate(slots);

  res.status(201).json({
    success: true,
    count: createdSlots.length,
    data: createdSlots,
  });
});

exports.getSlotsByParking = asyncHandler(async (req, res, next) => {
  const { parkingId } = req.params;
  const { status } = req.query;

  const where = { parkingId };

  if (status) {
    where.status = status;
  }

  const slots = await Slot.findAll({
    where,
    order: [['slotNumber', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count: slots.length,
    data: slots,
  });
});

exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { parkingId } = req.params;
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return next(new AppError('Please provide startTime and endTime', 400));
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return next(new AppError('End time must be after start time', 400));
  }

  const conflictingBookings = await Booking.findAll({
    where: {
      parkingId,
      bookingStatus: { [Op.in]: ['upcoming', 'active'] },
      startTime: { [Op.lt]: end },
      endTime: { [Op.gt]: start },
    },
    attributes: ['slotId'],
  });

  const conflictingSlotIds = conflictingBookings
    .filter((b) => b.slotId)
    .map((b) => b.slotId);

  const where = {
    parkingId,
    status: 'available',
  };

  if (conflictingSlotIds.length > 0) {
    where.id = { [Op.notIn]: conflictingSlotIds };
  }

  const availableSlots = await Slot.findAll({
    where,
    order: [['slotNumber', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count: availableSlots.length,
    data: availableSlots,
  });
});

exports.updateSlot = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, type } = req.body;

  const slot = await Slot.findByPk(id);
  if (!slot) {
    return next(new AppError('Slot not found', 404));
  }

  if (status) slot.status = status;
  if (type) slot.type = type;
  await slot.save();

  res.status(200).json({
    success: true,
    data: slot,
  });
});

exports.deleteSlot = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const slot = await Slot.findByPk(id);
  if (!slot) {
    return next(new AppError('Slot not found', 404));
  }

  await Slot.destroy({ where: { id } });

  res.status(200).json({
    success: true,
    message: 'Slot deleted successfully',
  });
});
