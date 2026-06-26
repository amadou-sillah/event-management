const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', { code: 'VALIDATION_ERROR', details: errors.array() }, 400);
    }
    const user = await authService.registerUser(req.body);
    ApiResponse.success(res, 'Registration successful', user, 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    ApiResponse.success(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    ApiResponse.success(res, 'User profile', userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 🆕 UPDATE PROFILE (name, email)
// ============================================================
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, email } = req.body;

    // Validate input
    if (!name && !email) {
      return ApiResponse.error(res, 'At least one field (name or email) is required', null, 400);
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return ApiResponse.error(res, 'Email already in use', { code: 'EMAIL_TAKEN' }, 409);
      }
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return ApiResponse.error(res, 'User not found', null, 404);
    }

    ApiResponse.success(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 🆕 CHANGE PASSWORD
// ============================================================
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return ApiResponse.error(res, 'Current password and new password are required', null, 400);
    }

    if (newPassword.length < 6) {
      return ApiResponse.error(res, 'New password must be at least 6 characters', null, 400);
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return ApiResponse.error(res, 'User not found', null, 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.error(res, 'Current password is incorrect', null, 401);
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    ApiResponse.success(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};