const multer = require("multer");
const db = require("../config/database");

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Save image to MySQL with optional property_id
 */
async function saveImageToDb(propertyId, buffer, mimeType, isPrimary = false) {
  const fileSize = buffer.length; // <-- File size in bytes

  const [result] = await db.query(
    `INSERT INTO property_images (property_id, image_data, mime_type, file_size, is_primary)
     VALUES (?, ?, ?, ?, ?)`,
    [propertyId, buffer, mimeType, fileSize, isPrimary ? 1 : 0]
  );

  return result.insertId;
}

module.exports = {
  upload,
  saveImageToDb
};
