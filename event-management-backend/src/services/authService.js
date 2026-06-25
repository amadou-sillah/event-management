const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.registerUser = async (userData) => {
  userData.email = userData.email.toLowerCase().trim();

  if (userData.role === 'admin') {
    const error = new Error('Admin registration is not allowed through this endpoint');
    error.statusCode = 403;
    throw error;
  }

  const existingUser = await User.findOne({
    email: userData.email
  });

  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const user = new User({
    name: userData.name.trim(),
    email: userData.email,
    password: userData.password,
    role: userData.role || 'organizer'
  });

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

exports.ensureAdminUser = async () => {
  const existingAdmin = await User.findOne({ role: 'admin' });

  if (existingAdmin) return;

  const adminName = process.env.ADMIN_NAME || 'Default Admin';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com')
    .toLowerCase()
    .trim();

  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existingUser = await User.findOne({
    email: adminEmail
  });

  if (existingUser) {
    existingUser.role = 'admin';
    existingUser.name = adminName;
    await existingUser.save();
    return;
  }

  const admin = new User({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin'
  });

  await admin.save();
};

exports.loginUser = async (email, password) => {
  email = email.toLowerCase().trim();

  const user = await User.findOne({ email });

  console.log('LOGIN EMAIL:', email);
  console.log('USER FOUND:', !!user);

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await user.comparePassword(password);

  console.log('PASSWORD MATCH:', passwordMatch);

  if (!passwordMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};