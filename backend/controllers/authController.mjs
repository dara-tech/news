import asyncHandler from "express-async-handler";
import User from "../models/User.mjs";
import generateToken from "../utils/generateToken.mjs";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    role: req.body.role || 'user'
  });

  if (user) {
    generateToken(res, user);
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: token // Include token in response for debugging
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: 'Logged out successfully' });
});

// @desc    Promote user to admin
// @route   PUT /api/auth/promote
// @access  Private
const promoteToAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = 'admin';
  await user.save();

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  });
});

// @desc    Update user role
// @route   PATCH /api/auth/role
// @access  Private
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.role = req.body.role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private

const updateUserProfile = asyncHandler(async (req, res) => {
  // The user object is attached to the request by the 'protect' middleware.
  // There is no need to fetch it again.
  const user = req.user;

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (user && (await user.matchPassword(req.body.currentPassword))) {
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  promoteToAdmin,
  updateUserRole,
  updateUserProfile,
  updateUserPassword,
};
