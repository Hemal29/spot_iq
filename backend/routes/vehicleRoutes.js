const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addVehicle, getMyVehicles, updateVehicle, deleteVehicle, setDefaultVehicle } = require('../controllers/vehicleController');

router.use(protect);

router.post('/', addVehicle);
router.get('/', getMyVehicles);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);
router.put('/:id/default', setDefaultVehicle);

module.exports = router;
