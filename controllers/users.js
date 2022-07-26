const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users/
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .json({ ...res.advancedResults, message: 'Retrieved all users.' });
});

// @desc    Get one user
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: `Retrieved user ${req.params.id}.`,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/v1/auth/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  if (!user) {
    return next(new ErrorResponse(`User not created,`, 400));
  }

  res.status(201).json({
    success: true,
    message: `Created user ${user._id}.`,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/v1/auth/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse(`User not updated,`, 400));
  }

  res.status(200).json({
    success: true,
    message: `Updated user ${req.params.id}.`,
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `Deleted user ${req.params.id}.`,
    data: {},
  });
});
