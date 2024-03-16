const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const imageSchema = require('./Image');

const postSchema = new Schema({
    userFirstName: {
      type: String,
      required: true,
    },
    userLastName:{
      type: String,
      required: true,
    },
    username: {
      type: String,
      required:true,

    },
    postContent: {
        type: String,
        required: true,
    },
    postTitle:{
      type: String,
      required: true,
    },
    postLocation: {
      type: String,
      required: true,
    },
    
    postImages: imageSchema,

    postType: {
      type: String,
      required: true,
    },
    postCategory: {
      type: String,
      required: true,
    },

    postLikes: [String],
      
    postDate: {
      type: Date,
      default: Date.now,
  //     date will be set to the time the post is created
    }
})

module.exports = mongoose.model("Post", postSchema);
