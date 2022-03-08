const path = require('path');
const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async')

exports.getBootcamps = asyncHandler(async (req, res, next)=> {
    res
    .status(200)
    .json({ ...res.advancedResults, message: 'Retrieved all bootcamps.' });
});

exports.getBootcamp = asyncHandler(async (req, res, next)=> {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, message: `Bootcamp found successfully`, data: bootcamp});
    
});

exports.createBootcamp = asyncHandler(async (req, res, next)=> {
    // Add user to req.body
    req.body.user = req.user.id;
    //Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

    // If user is not admin, they can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with the ID ${req.user.id} has already published a bootcamp`, 400) )
    };
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        message: 'Bootcamp created successfully',
        data: bootcamp
    });    
});

exports.updateBootcamp = asyncHandler(async (req, res, next)=> {
  const numb = req.params.id;
  let bootcampReply = await Bootcamp.findById(numb);

  if (!bootcampReply) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is owner
  if (
    bootcampReply.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} does not have permission to edit Bootcamp ${req.params.id}`,
        401
      )
    );
  }

  bootcampReply = await Bootcamp.findByIdAndUpdate(numb, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({success: true, message: `Bootcamp updated successfully`, data: bootcamp});
});

exports.deleteBootcamp = asyncHandler(async (req, res, next)=> {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is owner
    if (
        bootcampReply.user.toString() !== req.user.id &&
        req.user.role !== 'admin'
    ) {
        return next(
        new ErrorResponse(
            `User ${req.user.id} does not have permission to delete Bootcamp ${req.params.id}`,
            401
        )
        );
    }

    bootcamp.remove();
    res.status(200).json({success: true, message: `Bootcamp deleted successfully`, data: {}});
});

// @desc        GET bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance/:unit
// @access      Private

exports.getBootcampsInRadius = asyncHandler(async(req,res,next) => {
    const {zipcode, distance} = req.params;
    // Get lang/lat from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
    
    // calc radius using randians
    // Earth radius
    const radius = distance/3963;
    const bootcamps = await Bootcamp.find({
        location: {$geoWithin: { $centerSphere: [[lng, lat], radius]}}
    });
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });

});

// Upload bootcamp photo, PUT req.
exports.bootcampPhotoUpload = asyncHandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        )
    }

    // Make sure user is owner
    if (
        bootcampReply.user.toString() !== req.user.id &&
        req.user.role !== 'admin'
    ) {
        return next(
        new ErrorResponse(
            `User ${req.user.id} does not have permission to update this bootcamp ${req.params.id}`,
            401
        )
        );
    }

    if(!req.files){
        return next(
            new ErrorResponse(`Please upload a file`, 400)
        )
    }

    const file = req.files.file;

    if(!file.mimetype.startsWith('image')){
        return next(
            new ErrorResponse(`Please upload a image file`, 400)
        )
    }

    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(
            new ErrorResponse(`Please upload a file less than ${process.env.MAX_FILE_UPLOAD}`, 400)
        )
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`; // Custom file name

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            return next(
                new ErrorResponse(`Problem with file upload`, 500)
            )
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name
        });
    });

});