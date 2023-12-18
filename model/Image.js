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
  mineType: {
    type: String,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    //stored in UTC Yr.-Mon.-Day HR:Min.:Sec.:NanoSec.
  }
})
module.exports = imageSchema;
