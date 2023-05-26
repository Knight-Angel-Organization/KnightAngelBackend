const mongoose = require("mongoose");
// Making a user schema with all the details required from the user 
const Schema = mongoose.Schema;
const userSchema = new Schema({
      imageURL: {
        type: String,
        required: false,
      },
      attachedEmail:{
        type: String,
        required: false
      },
      imageType: {
        type: String,
      },
      imagePurpose: {
        type: String,
      },
      uploadDate: {
        type: Date,
        default: Date.now,
      }
})

module.exports = mongoose.model("Image", userSchema);