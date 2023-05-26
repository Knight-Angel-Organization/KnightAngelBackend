const Image = require('../model/Image');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const B2 = require('backblaze-b2');
const crypto = require('crypto');
const path = require('path');

// Set up Multer middleware to handle file uploads
const upload = multer().single('uploadedImage');

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_API_KEY_ID,
  applicationKey: process.env.BACKBLAZE_API_KEY,
  retry: {
      retries: 3
  }
});



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
    const _uploadedImage = req.file.buffer;

    // Ensure unique file name
    const _fileName = crypto.createHash('sha1').update(Date.now() + "_" + Math.floor(Math.random() * 11000) + "_" + _attachedEmail).digest('hex') + path.extname(req.file.originalname);
    
    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    console.log("Authorized");
    let response = await b2.getBucket({
        bucketName: "knightangel",
    });

    b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
  }).then((response) => {
      console.log(
          "getUploadUrl",
          response.data.uploadUrl,
          response.data.authorizationToken
      );

      b2.uploadFile({
          uploadUrl: response.data.uploadUrl,
          uploadAuthToken: response.data.authorizationToken,
          fileName: _fileName,
          data: _uploadedImage, // this is expecting a Buffer, not an encoded string
          onUploadProgress: (event) => {},
      }).then((response) => {
          console.log("uploadFile", response);
      });
  })
    const result = await Image.create({
      imageURL: "https://f005.backblazeb2.com/file/knightangel/" + _fileName,
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
