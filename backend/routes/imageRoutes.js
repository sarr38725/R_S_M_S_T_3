// backend/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/images/:id
router.get('/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const imageId = Number(rawId);

    if (!Number.isInteger(imageId)) {
      console.error('Invalid image id:', rawId);
      return res.status(400).json({ message: 'Invalid image id' });
    }

    const [rows] = await db.query(
      'SELECT image_data, mime_type FROM property_images WHERE id = ?',
      [imageId]
    );

    if (!rows || rows.length === 0) {
      console.error('Image not found, id =', imageId);
      return res.status(404).json({ message: 'Image not found' });
    }

    const { image_data, mime_type } = rows[0];

    if (!image_data) {
      console.error('Image has no data, id =', imageId);
      return res.status(500).json({ message: 'Image data missing' });
    }

    res.setHeader('Content-Type', mime_type || 'image/png');
    return res.end(image_data); // safest way to send BLOB

  } catch (err) {
    console.error('GET /api/images/:id error:', err);
    return res.status(500).json({
      message: 'Failed to load image',
      error: err.message,
    });
  }
});

module.exports = router;
