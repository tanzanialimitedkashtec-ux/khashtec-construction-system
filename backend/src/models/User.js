const db = require('../config/database');

class User {
  // Create new user
  static async create(userData) {
    try {
      const [result] = await db.execute(
        `INSERT INTO users (name, email, phone, location, service_type, custom_service, additional_info, password, role, department, registration_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.fullName,
          userData.email,
          userData.phone,
          userData.location,
          userData.serviceType,
          userData.customService || null,
          userData.additionalInfo || null,
          userData.password,
          userData.role || 'Customer',
          userData.department || 'Clients',
          new Date().toISOString().split('T')[0],
          userData.status || 'Active'
        ]
      );
      return { success: true, id: result.insertId, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user by email
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  // Get all users
  static async getAll() {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users ORDER BY registration_date DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Get users by department
  static async getByDepartment(department) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE department = ? ORDER BY registration_date DESC',
        [department]
      );
      return rows;
    } catch (error) {
      console.error('Error getting users by department:', error);
      return [];
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const [result] = await db.execute(
        `UPDATE users SET name = ?, phone = ?, location = ?, service_type = ?, 
         custom_service = ?, additional_info = ?, role = ?, department = ?, status = ? 
         WHERE id = ?`,
        [
          userData.name,
          userData.phone,
          userData.location,
          userData.serviceType,
          userData.customService || null,
          userData.additionalInfo || null,
          userData.role,
          userData.department,
          userData.status,
          id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Authenticate user
  static async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Simple password check (in production, use bcrypt)
      if (user.password !== password) {
        return { success: false, message: 'Invalid password' };
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, message: 'Authentication error' };
    }
  }
}

module.exports = User;
