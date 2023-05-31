const Image = require('../model/Image');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const B2 = require('backblaze-b2');
const crypto = require('crypto');
const path = require('path');
//const filetype = require('file-type');


// Set up Multer middleware to handle file uploads
const upload = multer().single('uploadedImage');

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_API_KEY_ID,
  applicationKey: process.env.BACKBLAZE_API_KEY,
  retry: {
      retries: 3
  }
});


/*

Current functionality:

1. Uploads a profile picture to Backblaze B2 and stores the required info in MongoDB
- Checks for pre-existing profile picture and deletes old one from Backblaze and MongoDB
- Returns a success message if the upload was successful
- Requires the following parameters in the request body:
  - attachedEmail: "string"
  - uploadedImage: file
- Todo:
  - Verify the image is legitimately an image and only allow JPG, JPEG, and PNG
  Will refactor later.

*/


const addProfilePicture = asyncHandler(async (req, res) => { 
  const _imagePurpose = "profile_picture";
  const _attachedEmail = req.body.attachedEmail;

  if (!_attachedEmail) {
    return res.status(400).json({ 'message': 'Email is required.' });
  }



  // Duplication checking in DB
  const duplicate = await Image.findOne({ email: _attachedEmail }).exec();
  if (duplicate) {
    // Delete the document from the database and remove old profile picture from Backblaze

    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    console.log("Authorized");
    let response = await b2.getBucket({
        bucketName: "knightangel",
    });

    b2.deleteFileVersion({
      fileName: duplicate.fileName,
      fileId: duplicate.fileID,
    });

    // Delete old document from MongoDB
    await Image.deleteOne({ email: _attachedEmail }).exec();
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
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });

    console.log(
      "getUploadUrl",
      uploadUrlResponse.data.uploadUrl,
      uploadUrlResponse.data.authorizationToken
    );

    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: _fileName,
      data: _uploadedImage, // this is expecting a Buffer, not an encoded string
      onUploadProgress: (event) => {},
    });

    console.log("uploadFile", uploadResponse);
    const _fileID = uploadResponse.data.fileId;
    
    const result = await Image.create({
      imageURL: "https://f005.backblazeb2.com/file/knightangel/" + _fileName,
      attachedEmail: _attachedEmail,
      imagePurpose: _imagePurpose,
      fileID: _fileID,
      fileName: _fileName, // Backblaze file name
    });

    console.log(result);
    res.status(201).json({ 'success': `Profile picture for ${_attachedEmail} uploaded.` });
  } catch (err) {
    res.status(500).json({ 'message': err.message });
  }
});

const getProfilePicture = asyncHandler(async (req, res) => { 
  const _imageID = req.body.imageID;

  if (!_imageID) {
    return res.status(400).json({ 'message': 'Image ID is required.' });
  }

  // Verify image ID is a string of 24 hex characters
    if (!/^[0-9a-fA-F]{24}$/.test(_imageID)) {
        return res.status(400).json({ 'message': 'Image ID is invalid.' });
    }

  const imageFound = await Image.findOne({ _id: new ObjectId(_imageID) });

  if (imageFound) {
    // Retrieve the URL
    const _imageURL = imageFound.imageURL;
    console.log(_imageURL); 
    return res.status(200).json({ 'success': _imageURL });
  } else {
    return res.status(400).json({ 'message': 'Image ID not found.' });
  }
});

module.exports = { addProfilePicture, getProfilePicture , upload };

