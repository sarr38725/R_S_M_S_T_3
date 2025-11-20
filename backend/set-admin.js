const db = require('./config/database');

async function setAdmin() {
  try {
    const email = 'rohit.sarkar55555555@gmail.com';

    const [result] = await db.query(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', email]
    );

    if (result.affectedRows === 0) {
      console.log('User not found with email:', email);
    } else {
      console.log('Successfully set admin role for:', email);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setAdmin();
