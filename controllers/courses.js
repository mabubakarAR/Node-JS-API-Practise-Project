const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/Course');
const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp');
const res = require('express/lib/response');

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      message: 'Retrieved courses.',
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get a single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with id:   ${req.params.id}.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: 'Retrieved course.',
    data: course,
  });
});

  // @desc    Add a single course
  // @route   POST /api/v1/bootcamps/:bootcampId/courses
  // @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;


  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id:   ${req.params.bootcampId}.`, 404)
    );
  }

  // Make sure user is owner
  if (bootcampReply.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
    new ErrorResponse(
        `User ${req.user.id} does not have permission to add a course to Bootcamp ${bootcamp._id}`,
        401
    ));
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Course Created.',
    data: course,
  });
});

// @desc    Update a single course
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;

  let course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorResponse(`No course with id: ${courseId}.`, 404));
  }

  // Make sure user is owner
  if (bootcampReply.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
    new ErrorResponse(
        `User ${req.user.id} does not have permission to update a course to Bootcamp ${course._id}`,
        401
    ));
  }

  course = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Course Updated.',
    data: course,
  });
});

// @desc    Delete a single course
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorResponse(`No course with id:   ${courseId}.`, 404));
  }

   // Make sure user is owner
  if (bootcampReply.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
    new ErrorResponse(
        `User ${req.user.id} does not have permission to delete a course to Bootcamp ${bootcamp._id}`,
        401
    ));
  }

  const courseDeleted = await course.remove();

  res.status(204).json({
    success: true,
    message: 'Course  Deleted.',
    data: courseDeleted,
  });
});