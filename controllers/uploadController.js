const Image = require('../model/Image');
const { json } = require('express');
const asyncHandler = require('express-async-handler');


const addProfilePicture = asyncHandler(async (req, res) => {
  const { _unencodedImage, _attachedEmail, _imagePurpose, _imageType } = req.body;
  if (!_unencodedImage || !_attachedEmail || !_imageType || !_imagePurpose) {
    return res.status(400).json({ 'message': 'Missing parameters. Email, Image, Image Purpose, and Image Type are required.' });
  }
  // Duplication checking in DB
  const duplicate = await Image.findOne({ email: _attachedEmail }).exec();
  if (duplicate) {
    return res.sendStatus(409); // Conflict
  }

  try {
    // Encode image to base64
    const _encodedImage = Buffer.from(_unencodedImage, 'binary').toString('base64');

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

module.exports = { addProfilePicture };
