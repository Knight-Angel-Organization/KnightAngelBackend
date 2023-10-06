const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
// Making a user schema with all the details required from the user 
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  imageURL: {
    type: String,
    required: false,
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
    //stored in UTC yyyy-mm-dd hh:mm:ss.ns
  }
})

/*
const emergencyContactSchema = new Schema({
  
  firstName: {
    type: String,
    required: false,
  },
  
  lastName:{
    type: String,
    required: false
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
  }, 


}) 
*/

const userSchema = new Schema({
    firstName: {
        type: String,
        required: false,
      },
      
      lastName:{
        type: String,
        required: false
      },
      username: {
        type: String,
        required: true,
        unique: true,
      },
      
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
      refreshToken: [String], //having in array supports multidevice login

      profilePic: imageSchema,

      emergencyContacts: [String]
})

module.exports = mongoose.model("User", userSchema);
