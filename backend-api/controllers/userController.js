const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Ensure users table exists
async function ensureUsersTable() {
  try {
    if (db.dbType === 'postgresql') {
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    }
    
    // Seed an admin user if table is empty
    const users = await db.query('SELECT * FROM users LIMIT 1');
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Administrador VBSP', 'admin@vbsp.com', hashedPassword, 'admin']
      );
      console.log('🌱 Base de dados semeada: Utilizador administrador padrão criado (admin@vbsp.com / admin123).');
    }
  } catch (err) {
    console.warn('⚠️ Alerta ao garantir/semear tabela de utilizadores:', err.message);
  }
}

// Run setup table at startup
ensureUsersTable();

// Login handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Por favor, indique o email e a palavra-passe.' });
    }

    // Find user
    const users = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'chave_padrao_secreta',
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Autenticação bem-sucedida!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor: ' + err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nome, email e password são obrigatórios.' });
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Este email já está registado.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'user']
    );

    // Get newly created user
    const newUser = await db.query('SELECT id, name, email, role, created_at FROM users WHERE email = ? LIMIT 1', [email]);

    res.status(201).json({
      success: true,
      message: 'Utilizador criado com sucesso!',
      data: newUser[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Verify user exists
    const users = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Utilizador não encontrado.' });
    }

    const currentUser = users[0];

    // If changing email, ensure it is not taken
    if (email && email !== currentUser.email) {
      const existing = await db.query('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1', [email, id]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: 'Este email já está associado a outro utilizador.' });
      }
    }

    // Prepare updates
    let updatedPassword = currentUser.password;
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    await db.query(
      'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?',
      [name || currentUser.name, email || currentUser.email, updatedPassword, role || currentUser.role, id]
    );

    res.json({
      success: true,
      message: 'Utilizador atualizado com sucesso!'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self (if token matches id)
    if (req.user && String(req.user.id) === String(id)) {
      return res.status(400).json({ success: false, error: 'Não é possível eliminar a sua própria conta ativa.' });
    }

    const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Utilizador removido com sucesso!'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
