const Image = require('../model/Image');
const { MongoClient, ObjectId } = require('mongodb');
const asyncHandler = require('express-async-handler');
const path = require('path');

/*

Current functionality:

1. Get Profile Picture
- Returns the image URL of the profile picture
- Requires the following parameters in the request body:
  - imageID: "string"
- Needs to encoded as x-www-form-urlencoded in Postman
*/


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

module.exports = { getProfilePicture };