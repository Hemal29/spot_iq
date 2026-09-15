const { Op } = require('sequelize');
const { Slot, Parking, Booking } = require('../models');
const AppError = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── Generate Slots ──────────────────────────────────────────────────────────

exports.generateSlots = asyncHandler(async (req, res, next) => {
  const { parkingId } = req.params;
  const { count = 10, type = 'standard', floor = 'Ground', zone = 'A', vehicleType = 'car', slotSize = 'standard' } = req.body;

  const parking = await Parking.findByPk(parkingId);
  if (!parking) return next(new AppError('Parking not found', 404));

  // find highest existing slot number for this parking to continue sequence
  const lastSlot = await Slot.findOne({
    where: { parkingId },
    order: [['id', 'DESC']],
  });

  let startNum = 1;
  if (lastSlot) {
    const match = lastSlot.slotNumber.match(/(\d+)$/);
    startNum = match ? parseInt(match[1]) + 1 : 1;
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const slotsPerRow = Math.ceil(Math.sqrt(count));
  const slots = [];
  const slotInfos = [];

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / slotsPerRow);
    const col = (i % slotsPerRow) + 1;
    const slotNumber = `${letters[row]}${startNum + i}`;
    const zoneLetter = letters[row];

    slots.push({
      parkingId,
      slotNumber,
      floor,
      zone: zone,
      vehicleType,
      slotSize,
      type,
      status: 'available',
    });

    slotInfos.push({ slotNumber, floor, zone: zone, vehicleType, type });
  }

  const created = await Slot.bulkCreate(slots);

  // update parking totalSlots
  const total = await Slot.count({ where: { parkingId } });
  await Parking.update({ totalSlots: total, availableSlots: total }, { where: { id: parkingId } });

  res.status(201).json({ success: true, count: created.length, data: created });
});

// ─── Get All Slots (with filters & pagination) ───────────────────────────────

exports.getAllSlots = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, status, type, vehicleType, floor, zone, parkingId, search } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (vehicleType) where.vehicleType = vehicleType;
  if (floor) where.floor = floor;
  if (zone) where.zone = zone;
  if (parkingId) where.parkingId = parseInt(parkingId);
  if (search) {
    where[Op.or] = [
      { slotNumber: { [Op.like]: `%${search}%` } },
      { floor: { [Op.like]: `%${search}%` } },
      { zone: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Slot.findAndCountAll({
    where,
    include: [{ model: Parking, attributes: ['parkingName', 'city', 'address'] }],
    order: [['parkingId', 'ASC'], ['floor', 'ASC'], ['zone', 'ASC'], ['slotNumber', 'ASC']],
    offset: parseInt(offset),
    limit: parseInt(limit),
  });

  res.status(200).json({ success: true, count, total: count, page: parseInt(page), data: rows });
});

// ─── Get Slots by Parking ────────────────────────────────────────────────────

exports.getSlotsByParking = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;
  const { status, type } = req.query;

  const where = { parkingId };
  if (status) where.status = status;
  if (type) where.type = type;

  const slots = await Slot.findAll({
    where,
    include: [{ model: Booking, as: 'currentBookingRef', attributes: ['id', 'customerName', 'startTime', 'endTime'], required: false }],
    order: [['floor', 'ASC'], ['zone', 'ASC'], ['slotNumber', 'ASC']],
  });

  res.status(200).json({ success: true, count: slots.length, data: slots });
});

// ─── Get Available Slots (time-based) ────────────────────────────────────────

exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { parkingId } = req.params;
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return next(new AppError('Please provide startTime and endTime', 400));
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) return next(new AppError('End time must be after start time', 400));

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

  const where = { parkingId, status: 'available' };
  if (conflictingSlotIds.length > 0) {
    where.id = { [Op.notIn]: conflictingSlotIds };
  }

  const availableSlots = await Slot.findAll({
    where,
    order: [['slotNumber', 'ASC']],
  });

  res.status(200).json({ success: true, count: availableSlots.length, data: availableSlots });
});

// ─── Get Slot Statistics ─────────────────────────────────────────────────────

exports.getSlotStats = asyncHandler(async (req, res) => {
  const { parkingId } = req.query;

  const where = {};
  if (parkingId) where.parkingId = parseInt(parkingId);

  const total = await Slot.count({ where });
  const available = await Slot.count({ where: { ...where, status: 'available' } });
  const occupied = await Slot.count({ where: { ...where, status: 'occupied' } });
  const reserved = await Slot.count({ where: { ...where, status: 'reserved' } });
  const maintenance = await Slot.count({ where: { ...where, status: 'maintenance' } });

  const byType = await Slot.findAll({
    where,
    attributes: ['type', [require('sequelize').fn('COUNT', 'type'), 'count']],
    group: ['type'],
    raw: true,
  });

  const byVehicleType = await Slot.findAll({
    where,
    attributes: ['vehicleType', [require('sequelize').fn('COUNT', 'vehicleType'), 'count']],
    group: ['vehicleType'],
    raw: true,
  });

  const byFloor = await Slot.findAll({
    where,
    attributes: ['floor', [require('sequelize').fn('COUNT', 'floor'), 'count']],
    group: ['floor'],
    raw: true,
  });

  const byZone = await Slot.findAll({
    where,
    attributes: ['zone', [require('sequelize').fn('COUNT', 'zone'), 'count']],
    group: ['zone'],
    raw: true,
  });

  // daily trend (last 7 days)
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const daySlots = await Slot.count({
      where: {
        ...where,
        createdAt: {
          [Op.gte]: new Date(dateStr),
          [Op.lt]: new Date(new Date(dateStr).getTime() + 86400000),
        },
      },
    });
    dailyData.push({ date: dateStr, created: daySlots });
  }

  const utilizationRate = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      total,
      available,
      occupied,
      reserved,
      maintenance,
      utilizationRate,
      byType: byType.map((t) => ({ label: t.type, count: parseInt(t.count) })),
      byVehicleType: byVehicleType.map((t) => ({ label: t.vehicleType, count: parseInt(t.count) })),
      byFloor: byFloor.map((f) => ({ label: f.floor, count: parseInt(f.count) })),
      byZone: byZone.map((z) => ({ label: z.zone, count: parseInt(z.count) })),
      dailyTrend: dailyData,
    },
  });
});

// ─── Get Single Slot ─────────────────────────────────────────────────────────

exports.getSlotById = asyncHandler(async (req, res, next) => {
  const slot = await Slot.findByPk(req.params.id, {
    include: [
      { model: Parking, attributes: ['parkingName', 'city'] },
      { model: Booking, as: 'currentBookingRef', required: false },
    ],
  });
  if (!slot) return next(new AppError('Slot not found', 404));
  res.status(200).json({ success: true, data: slot });
});

// ─── Create Single Slot ──────────────────────────────────────────────────────

exports.createSlot = asyncHandler(async (req, res, next) => {
  const { parkingId, slotNumber, floor, zone, vehicleType, slotSize, type, status } = req.body;

  const parking = await Parking.findByPk(parkingId);
  if (!parking) return next(new AppError('Parking not found', 404));

  const existing = await Slot.findOne({ where: { parkingId, slotNumber } });
  if (existing) return next(new AppError('Slot number already exists in this parking', 400));

  const slot = await Slot.create({
    parkingId, slotNumber,
    floor: floor || 'Ground',
    zone: zone || 'A',
    vehicleType: vehicleType || 'car',
    slotSize: slotSize || 'standard',
    type: type || 'standard',
    status: status || 'available',
    qrCode: `${parkingId}-${slotNumber}`,
  });

  // update parking counts
  const total = await Slot.count({ where: { parkingId } });
  const avail = await Slot.count({ where: { parkingId, status: 'available' } });
  await Parking.update({ totalSlots: total, availableSlots: avail }, { where: { id: parkingId } });

  res.status(201).json({ success: true, data: slot });
});

// ─── Update Slot ─────────────────────────────────────────────────────────────

exports.updateSlot = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { slotNumber, floor, zone, vehicleType, slotSize, type, status } = req.body;

  const slot = await Slot.findByPk(id);
  if (!slot) return next(new AppError('Slot not found', 404));

  if (slotNumber) slot.slotNumber = slotNumber;
  if (floor !== undefined) slot.floor = floor;
  if (zone !== undefined) slot.zone = zone;
  if (vehicleType) slot.vehicleType = vehicleType;
  if (slotSize) slot.slotSize = slotSize;
  if (type) slot.type = type;
  if (status) slot.status = status;

  await slot.save();

  // update parking counts
  const total = await Slot.count({ where: { parkingId: slot.parkingId } });
  const avail = await Slot.count({ where: { parkingId: slot.parkingId, status: 'available' } });
  await Parking.update({ totalSlots: total, availableSlots: avail }, { where: { id: slot.parkingId } });

  res.status(200).json({ success: true, data: slot });
});

// ─── Delete Slot ─────────────────────────────────────────────────────────────

exports.deleteSlot = asyncHandler(async (req, res, next) => {
  const slot = await Slot.findByPk(req.params.id);
  if (!slot) return next(new AppError('Slot not found', 404));

  await Slot.destroy({ where: { id: slot.id } });

  // update parking counts
  const total = await Slot.count({ where: { parkingId: slot.parkingId } });
  const avail = await Slot.count({ where: { parkingId: slot.parkingId, status: 'available' } });
  await Parking.update({ totalSlots: total, availableSlots: avail }, { where: { id: slot.parkingId } });

  res.status(200).json({ success: true, message: 'Slot deleted successfully' });
});

// ─── Bulk Delete ─────────────────────────────────────────────────────────────

exports.bulkDeleteSlots = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Provide an array of slot IDs', 400));
  }

  const deleted = await Slot.destroy({ where: { id: ids } });

  res.status(200).json({ success: true, deleted, message: `${deleted} slots deleted` });
});

// ─── Bulk Update Status ──────────────────────────────────────────────────────

exports.bulkUpdateSlots = asyncHandler(async (req, res, next) => {
  const { ids, status } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Provide an array of slot IDs', 400));
  }
  if (!status) return next(new AppError('Provide a status to set', 400));

  await Slot.update({ status }, { where: { id: ids } });

  res.status(200).json({ success: true, message: `${ids.length} slots updated to ${status}` });
});
