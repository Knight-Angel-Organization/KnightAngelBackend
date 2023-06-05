const mongoose = require("mongoose");
const Image = require ("../model/Image");
// Making a user schema with all the details required from the user 
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  imageURL: {
    type: String,
    required: false,
  },
  attachedEmail:{
    type: String,
    required: false
  },
  imagePurpose: {
    type: String,
  },
  fileID: {
    type: String,
  },
  fileName: {
    type: String,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  }
})

const userSchema = new Schema({
    firstName: {
        type: String,
        required: false,
      },
      
      lastName:{
        type: String,
        required: false
      },
      
      profilePic: imageSchema,

      email: {
        type: String,
        required: true,
        unique: true,
      },
      isVerified: {
    //     to check if the account is verified or not
        type: Boolean,
        default: false,
      },
      password: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
    //     date will be set to the time the account is created
      },
      SecQue: {
        type: String,
        required: false,
      },
      SQA: {
        type: String,
        required: false,
      },
      refreshToken: [String] //having in array supports multidevice login
})

module.exports = mongoose.model("User", userSchema);
