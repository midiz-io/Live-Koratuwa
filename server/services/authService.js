const { supabase, supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const USE_SUPABASE_AUTH = process.env.USE_SUPABASE_AUTH === 'true';

/**
 * Admin login - supports both custom JWT and Supabase Auth
 */
async function loginAdmin(email, password) {
  if (USE_SUPABASE_AUTH) {
    // Use Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error('Invalid credentials');
    }

    return {
      token: data.session.access_token,
      admin: {
        id: data.user.id,
        email: data.user.email
      },
      provider: 'supabase'
    };
  } else {
    // Use custom JWT + Supabase
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      throw new Error('Invalid credentials - user not found');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials - password mismatch');
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email
      },
      provider: 'jwt'
    };
  }
}

/**
 * Verify admin token - supports both JWT and Supabase
 */
async function verifyAdminToken(token) {
  if (USE_SUPABASE_AUTH) {
    // Verify Supabase token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Invalid token');
    }

    return {
      id: user.id,
      email: user.email,
      provider: 'supabase'
    };
  } else {
    // Verify JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        id: decoded.id,
        email: decoded.email,
        provider: 'jwt'
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

/**
 * Middleware to verify admin authentication
 */
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  verifyAdminToken(token)
    .then(admin => {
      req.admin = admin;
      next();
    })
    .catch(error => {
      return res.status(401).json({ error: 'Invalid token' });
    });
}

module.exports = {
  loginAdmin,
  verifyAdminToken,
  requireAdmin,
  USE_SUPABASE_AUTH
};
