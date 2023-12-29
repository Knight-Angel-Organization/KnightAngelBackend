const asyncHandler = require('express-async-handler');
const multer = require('multer');
const B2 = require('backblaze-b2');
const crypto = require('crypto');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { userInfo } = require('os');
const fileTypes = require("../config/fileType");
const { deleteFile: deleteB2File } = require("./pictureStuff/deleteBucketFile");
const { uploadToB2 } = require("./pictureStuff/uploadController");
const { id } = require('date-fns/locale');
const User = require('../model/User');

// const filetype = require('file-type');

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

const addProfilePicture = asyncHandler(async (req,res)=>{
const allCookies = req.cookies;
const JWTValue = allCookies.jwt
const foundUser = await User.findOne({ refreshToken: JWTValue }).exec(); //user thats signed into phone
const { buffer, mimetype, originalname } = req.file;
//Prep work needed(grabbing cookies & looking for User via JWT and making sure a picture(or any file in particular) is attached in request body)

if (!buffer || !mimetype || !originalname) {
  res.status(400).json({ message: "File not found" });
  return;
}
const validMineTypes = fileTypes['image'];
if (!validMineTypes.includes(mimetype)) {
  res.status(400).json({ message: "Invalid file type" });
  return;
}
//"Data Validation" for image uploaded

if(!foundUser.profilePic){
  try{
    const fileInfo = await uploadToB2(buffer, mimetype, originalname);
    const result = foundUser.updateOne({
      profilePic:{
        imageURL: fileInfo.fileName,
        fileID: fileInfo.id,
        fileName: fileInfo.fileName,
        mimeType : mimetype,
        uploadDate: new Date()
      }
    }).exec()
    console.log(result)
    res.status(201).json({ success: `Profile picture for ${foundUser.email} uploaded.` });
  }catch(err){
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}else{
  try{
    const oldFileID = foundUser.profilePic.fileID
    const oldFileName = foundUser.profilePic.fileName
    const oldFileInfo = await deleteB2File(oldFileID, oldFileName)
  }catch(err){
    console.log(err)
    res.status(500).json({message:err.message})
  }

  try{
    const fileInfo = await uploadToB2(buffer, mimetype, originalname);
    const result = foundUser.updateOne({
      profilePic:{
        imageURL: fileInfo.fileName,
        fileID: fileInfo.id,
        fileName: fileInfo.fileName,
        mimeType : mimetype,
        uploadDate: new Date()
      }
    }).exec()
    console.log(result)
    res.status(201).json({ success: `Profile picture for ${foundUser.email} updated.` });
  }catch{
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

})
const addProfilePicture2 = asyncHandler(async (req, res) => {
  const _attachedEmail = req.body.attachedEmail;

  if (!_attachedEmail) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  // Find the existing image associated with the email
  const foundUser = await User.findOne({ email: _attachedEmail }).exec();

  if  (!foundUser.profilePic)  {
      try {
        // Get the file data from Multer
        const _uploadedImage = req.file.buffer;

      // Ensure unique file name
      const _fileName =
        crypto
          .createHash('sha1')
          .update(`${Date.now()}_${Math.floor(Math.random() * 11000)}_${foundUser.email}`)
          .digest('hex') + path.extname(req.file.originalname);

        await b2.authorize();
        const uploadUrlResponse = await b2.getUploadUrl({
          bucketId: process.env.B2_BUCKET_ID,
        });

        const uploadResponse = await b2.uploadFile({
          uploadUrl: uploadUrlResponse.data.uploadUrl,
          uploadAuthToken: uploadUrlResponse.data.authorizationToken,
          fileName: _fileName,
          data: _uploadedImage,
          onUploadProgress: (event) => {  },
        });

        const _fileID = uploadResponse.data.fileId;

      const result = foundUser.updateOne({
        profilePic:
        {
          imageURL: 'https://f005.backblazeb2.com/file/knightangel/' + _fileName,
          fileID: _fileID,

          fileName: _fileName,
          uploadDate: new Date()
        }
      }).exec();
      console.log(result)

      res.status(201).json({ success: `Profile picture for ${_attachedEmail} uploaded.` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {


    // Delete the old profile picture from Backblaze

    await b2.authorize();


    // Check if the file exists in Backblaze

      try {
          const fileExists = await b2.getFileInfo({
            fileId: foundUser.profilePic.fileID,
          });

          if (fileExists.status === 200) {
            await b2.deleteFileVersion({
              fileName: foundUser.profilePic.fileName,
              fileId: foundUser.profilePic.fileID,
            });
          }
        } catch (err) {
          console.log(err);
        }


      try {
        // Get the file data from Multer
        const _uploadedImage = req.file.buffer;

      // Ensure unique file name
      const _fileName =
        crypto
          .createHash('sha1')
          .update(`${Date.now()}_${Math.floor(Math.random() * 11000)}_${foundUser.email}`)
          .digest('hex') + path.extname(req.file.originalname);

      await b2.authorize();
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID,
      });

      const uploadResponse = await b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: _fileName,
        data: _uploadedImage,
        onUploadProgress: (event) => { },
      });

      const _fileID = uploadResponse.data.fileId;

      const result = foundUser
        .updateOne({
          profilePic: {
            imageURL: `https://f005.backblazeb2.com/file/knightangel/${_fileName}`,
            fileID: _fileID,
            fileName: _fileName,
            uploadDate: new Date(),
          },
        })
        .exec();
      console.log(foundUser);

      res.status(201).json({
        success: `Profile picture for ${foundUser.email} updated.`,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
});

const getProfilePicture = asyncHandler(async (req, res) => {
  const _attachedEmail = req.body.attachedEmail;

  if (!_attachedEmail) {
    return res.status(400).json({ message: 'email is required.' });
  }

  const foundUser = await User.findOne({ email: _attachedEmail }).exec();

  if (foundUser.profilePic) {
    // Retrieve the URL
    const _imageURL = foundUser.profilePic.imageURL;
    console.log(_imageURL);
    return res.status(200).json({ success: _imageURL });
  }
  return res.status(400).json({ message: 'Image ID not found.' });
});

module.exports = { upload, addProfilePicture, getProfilePicture  };
