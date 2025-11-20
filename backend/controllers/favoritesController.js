const db = require('../config/database');

const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const [favorites] = await db.query(`
      SELECT
        f.id,
        f.property_id,
        f.created_at,
        p.title,
        p.price,
        p.address,
        p.city,
        p.state,
        p.property_type,
        p.bedrooms,
        p.bathrooms,
        p.area_sqft,
        p.status,
        p.featured
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    const [existing] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, property_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    const [result] = await db.query(
      'INSERT INTO favorites (user_id, property_id) VALUES (?, ?)',
      [userId, property_id]
    );

    res.status(201).json({
      message: 'Property added to favorites',
      favorite: {
        id: result.insertId,
        user_id: userId,
        property_id
      }
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { property_id } = req.params;

    const [result] = await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, property_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Property removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { property_id } = req.params;

    const [favorites] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, property_id]
    );

    res.json({ isFavorited: favorites.length > 0 });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};
