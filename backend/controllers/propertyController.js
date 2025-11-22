// backend/controllers/propertyController.js
const db = require('../config/database');

// GET /api/properties
const getAllProperties = async (req, res) => {
  try {
    const { property_type, city, min_price, max_price, status, bedrooms, featured } = req.query;

    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];

    if (property_type) {
      query += ' AND property_type = ?';
      params.push(property_type);
    }

    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }

    if (min_price) {
      query += ' AND price >= ?';
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      query += ' AND price <= ?';
      params.push(parseFloat(max_price));
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (bedrooms) {
      query += ' AND bedrooms >= ?';
      params.push(parseInt(bedrooms));
    }

    if (featured) {
      query += ' AND featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }

    const [props] = await db.query(query, params);

    if (props.length === 0) {
      return res.json({ properties: [] });
    }

    const propertyIds = props.map(p => p.id);

    // Load images for these properties
    const [images] = await db.query(
      'SELECT id, property_id, is_primary FROM property_images WHERE property_id IN (?)',
      [propertyIds]
    );

    const imageMap = {};
    images.forEach(img => {
      if (!imageMap[img.property_id]) imageMap[img.property_id] = [];
      imageMap[img.property_id].push(img.id); // store IDs
    });

    const properties = props.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      property_type: p.property_type,
      listing_type: p.listing_type,
      price: p.price,
      address: p.address,
      city: p.city,
      state: p.state,
      zip_code: p.zip_code,
      country: p.country,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area_sqft: p.area_sqft,
      year_built: p.year_built,
      status: p.status,
      featured: p.featured,
      created_at: p.created_at,
      updated_at: p.updated_at,
      images: imageMap[p.id] || []
    }));

    res.json({ properties });
  } catch (err) {
    console.error('Error loading properties:', err);
    res.status(500).json({ message: 'Failed to load properties' });
  }
};

// GET /api/properties/:id
const getPropertyById = async (req, res) => {
  try {
    const id = req.params.id;

    const [[property]] = await db.query(
      'SELECT * FROM properties WHERE id = ?',
      [id]
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const [images] = await db.query(
      'SELECT id, is_primary FROM property_images WHERE property_id = ?',
      [id]
    );

    res.json({
      property: {
        ...property,
        images: images.map(img => img.id)
      }
    });
  } catch (err) {
    console.error('Error loading property:', err);
    res.status(500).json({ message: 'Failed to load property' });
  }
};

// POST /api/properties
const createProperty = async (req, res) => {
  const {
    title,
    description,
    property_type,
    listing_type,
    price,
    address,
    city,
    state,
    zip_code,
    country,
    bedrooms,
    bathrooms,
    area_sqft,
    year_built,
    featured,
    images = []
  } = req.body;

  const agent_id = req.user.id;

  try {
    const [result] = await db.query(
      `INSERT INTO properties 
       (title, description, property_type, listing_type, price, address, city, state, zip_code, country,
        bedrooms, bathrooms, area_sqft, year_built, status, featured, agent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
      [
        title,
        description,
        property_type,
        listing_type,
        price,
        address,
        city,
        state,
        zip_code,
        country || 'USA',
        bedrooms || 0,
        bathrooms || 0,
        area_sqft,
        year_built || null,
        featured || false,
        agent_id
      ]
    );

    const propertyId = result.insertId;

    // Link uploaded images (IDs) to this property
    if (Array.isArray(images) && images.length > 0) {
      await db.query(
        `UPDATE property_images 
         SET property_id = ? 
         WHERE id IN (${images.map(() => '?').join(',')})`,
        [propertyId, ...images]
      );
    }

    res.status(201).json({ message: 'Property created', propertyId });
  } catch (err) {
    console.error('Error creating property:', err);
    res.status(500).json({ message: 'Failed to create property' });
  }
};

// PUT /api/properties/:id
const updateProperty = async (req, res) => {
  const id = req.params.id;
  const {
    title,
    description,
    property_type,
    listing_type,
    price,
    address,
    city,
    state,
    zip_code,
    country,
    bedrooms,
    bathrooms,
    area_sqft,
    year_built,
    status,
    featured,
    images
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE properties SET
        title = ?, description = ?, property_type = ?, listing_type = ?, price = ?,
        address = ?, city = ?, state = ?, zip_code = ?, country = ?,
        bedrooms = ?, bathrooms = ?, area_sqft = ?, year_built = ?,
        status = ?, featured = ?
       WHERE id = ?`,
      [
        title,
        description,
        property_type,
        listing_type,
        price,
        address,
        city,
        state,
        zip_code,
        country,
        bedrooms,
        bathrooms,
        area_sqft,
        year_built || null,
        status,
        featured || false,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Optional: update image associations if images array sent
    if (Array.isArray(images)) {
      // Clear old links
      await db.query(
        'UPDATE property_images SET property_id = NULL WHERE property_id = ?',
        [id]
      );
      if (images.length > 0) {
        await db.query(
          `UPDATE property_images SET property_id = ? 
           WHERE id IN (${images.map(() => '?').join(',')})`,
          [id, ...images]
        );
      }
    }

    res.json({ message: 'Property updated' });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ message: 'Failed to update property' });
  }
};

// DELETE /api/properties/:id
const deleteProperty = async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await db.query(
      'DELETE FROM properties WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted' });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ message: 'Failed to delete property' });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};
