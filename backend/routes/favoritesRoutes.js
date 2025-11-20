const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
} = require('../controllers/favoritesController');

router.get('/', authenticate, getUserFavorites);
router.post('/', authenticate, addFavorite);
router.delete('/:property_id', authenticate, removeFavorite);
router.get('/check/:property_id', authenticate, checkFavorite);

module.exports = router;
