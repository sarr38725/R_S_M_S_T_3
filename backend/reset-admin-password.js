const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function resetAdminPassword() {
  try {
    const email = 'rohit.sarkar55555555@gmail.com';
    const newPassword = 'admin123';

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      console.log('User not found with email:', email);
    } else {
      console.log('Successfully reset password for:', email);
      console.log('New password:', newPassword);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
