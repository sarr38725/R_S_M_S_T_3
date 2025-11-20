const multer = require('multer');
const db = require('../config/database');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

async function saveImageToDb(propertyId, buffer, mimetype, isPrimary) {
  const [result] = await db.query(
    `INSERT INTO property_images (property_id, image_data, mime_type, is_primary)
     VALUES (?, ?, ?, ?)`,
    [propertyId, buffer, mimetype, isPrimary]
  );

  return result.insertId; // IMPORTANT
}

module.exports = { upload, saveImageToDb };
