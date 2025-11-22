const db = require('../config/database');

const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.role,
        u.profile_image,
        u.created_at,
        COUNT(DISTINCT p.id) as property_count
      FROM users u
      LEFT JOIN properties p ON u.id = p.agent_id
      GROUP BY u.id, u.email, u.full_name, u.phone, u.role, u.profile_image, u.created_at
      ORDER BY u.created_at DESC`
    );

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.full_name,
      phone: user.phone,
      role: user.role,
      profile_image: user.profile_image,
      status: 'active',
      joinDate: user.created_at,
      properties: user.property_count,
      avatar: (user.full_name || user.email)?.[0]?.toUpperCase() || 'U'
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role } = req.body;

    const [result] = await db.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
      [full_name, email, phone, role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUsers, updateUser, deleteUser };
