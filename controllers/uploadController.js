const Image = require('../model/Image');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

// Set up Multer middleware to handle file uploads
const upload = multer().single('unencodedImage');



const addProfilePicture = asyncHandler(async (req, res) => {
  const _imageType = req.body.imageType;
  const _imagePurpose = req.body.imagePurpose;
  const _attachedEmail = req.body.attachedEmail;


  
  if (!_attachedEmail || !_imageType || !_imagePurpose) {
    return res.status(400).json({ 'message': 'Missing parameters. Email, Image Purpose, and Image Type are required.' });
  }

  // Duplication checking in DB
  const duplicate = await Image.findOne({ email: _attachedEmail }).exec();
  if (duplicate) {
    return res.sendStatus(409); // Conflict
  }

  try {
    // Get the file data from Multer
    const _encodedImage = req.file.buffer.toString('base64');

    // Create & store new person
    const result = await Image.create({
      encodedImage: _encodedImage,
      attachedEmail: _attachedEmail,
      imagePurpose: _imagePurpose,
      imageType: _imageType,
    });

    console.log(result);
    res.status(201).json({ 'success': `Profile picture for ${_attachedEmail} uploaded.` });
  } catch (err) {
    res.status(500).json({ 'message': err.message });
  }
});

module.exports = { addProfilePicture, upload };
