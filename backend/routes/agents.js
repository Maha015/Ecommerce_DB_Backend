const express = require('express');
const {
  getDeliveryAgents,
  createDeliveryAgent,
  updateDeliveryAgent,
  deleteDeliveryAgent,
  getAgentStats
} = require('../controllers/userController');

const {
  validateAgentCreation,
  handleValidationErrors
} = require('../middleware/validation');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(authorize('admin'), getDeliveryAgents)
  .post(
    authorize('admin'),
    validateAgentCreation,
    handleValidationErrors,
    createDeliveryAgent
  );

router.route('/:id')
  .put(authorize('admin'), updateDeliveryAgent)
  .delete(authorize('admin'), deleteDeliveryAgent);

router.get('/:id/stats', getAgentStats);

module.exports = router;