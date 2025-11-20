// backend/routes/propertyRoutes.js
const express = require('express');
const {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Create
router.post(
  '/',
  authenticate,
  authorize('admin', 'agent'),
  createProperty
);

// Update
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  updateProperty
);

// Delete
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  deleteProperty
);

module.exports = router;
