const defineUser = require('./User');
const defineParking = require('./Parking');
const defineSlot = require('./Slot');
const defineBooking = require('./Booking');
const defineVehicle = require('./Vehicle');
const definePayment = require('./Payment');
const defineReview = require('./Review');
const defineNotification = require('./Notification');
const defineCoupon = require('./Coupon');
const defineSupportTicket = require('./SupportTicket');
const defineParkingOwner = require('./ParkingOwner');

const initModels = (sequelize) => {
  const User = defineUser(sequelize);
  const Parking = defineParking(sequelize);
  const Slot = defineSlot(sequelize);
  const Booking = defineBooking(sequelize);
  const Vehicle = defineVehicle(sequelize);
  const Payment = definePayment(sequelize);
  const Review = defineReview(sequelize);
  const Notification = defineNotification(sequelize);
  const Coupon = defineCoupon(sequelize);
  const SupportTicket = defineSupportTicket(sequelize);
  const ParkingOwner = defineParkingOwner(sequelize);

  // Associations
  User.hasMany(Vehicle, { foreignKey: 'userId' });
  User.hasMany(Booking, { foreignKey: 'userId' });
  User.hasMany(Payment, { foreignKey: 'userId' });
  User.hasMany(Review, { foreignKey: 'userId' });
  User.hasMany(Notification, { foreignKey: 'userId' });
  User.hasOne(ParkingOwner, { foreignKey: 'userId' });

  Parking.hasMany(Slot, { foreignKey: 'parkingId' });
  Parking.hasMany(Booking, { foreignKey: 'parkingId' });
  Parking.hasMany(Review, { foreignKey: 'parkingId' });

  Slot.belongsTo(Parking, { foreignKey: 'parkingId' });
  Slot.belongsTo(Booking, { foreignKey: 'currentBooking', as: 'currentBookingRef' });

  Booking.belongsTo(User, { foreignKey: 'userId' });
  Booking.belongsTo(Parking, { foreignKey: 'parkingId' });
  Booking.belongsTo(Slot, { foreignKey: 'slotId' });
  Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId' });
  Booking.belongsTo(Coupon, { foreignKey: 'couponId' });

  Vehicle.belongsTo(User, { foreignKey: 'userId' });

  Payment.belongsTo(Booking, { foreignKey: 'bookingId' });
  Payment.belongsTo(User, { foreignKey: 'userId' });

  Review.belongsTo(User, { foreignKey: 'userId' });
  Review.belongsTo(Parking, { foreignKey: 'parkingId' });
  Review.belongsTo(Booking, { foreignKey: 'bookingId' });

  Notification.belongsTo(User, { foreignKey: 'userId' });

  Coupon.hasMany(Booking, { foreignKey: 'couponId' });

  SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
  SupportTicket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

  ParkingOwner.belongsTo(User, { foreignKey: 'userId' });

  module.exports.User = User;
  module.exports.Parking = Parking;
  module.exports.Slot = Slot;
  module.exports.Booking = Booking;
  module.exports.Vehicle = Vehicle;
  module.exports.Payment = Payment;
  module.exports.Review = Review;
  module.exports.Notification = Notification;
  module.exports.Coupon = Coupon;
  module.exports.SupportTicket = SupportTicket;
  module.exports.ParkingOwner = ParkingOwner;
};

module.exports = initModels;
