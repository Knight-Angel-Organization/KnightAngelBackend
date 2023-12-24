const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;
const imageSchema = require('./Image');
// Making a user schema with all the details required from the user
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
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
    type: Boolean,
    default: false,
    //to check if the account is verified or not
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, //date will be set to the time the account is created
  },
  followers: {//ppl that follow the user
    type: Array,
    default: [],
  },
  followings: {// ppl the user is following
    type: Array,
    default: [],
  },
  refreshToken: [String], //having in array supports multidevice login
  profilePic: imageSchema,// imageSchema id
  emergencyContacts: [String]
})


module.exports = mongoose.model("User", userSchema);
