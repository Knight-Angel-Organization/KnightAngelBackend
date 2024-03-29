const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const imageSchema = require('./Image');

const commentSchema = new Schema({

  commentID: {
    type: String,
    required:true,
  },
  commentOwner:{
    type: String,
  },
  commentContent:{
    type: String,
  },

  commentLikes: [String],

  commentDate:{
    type: Date,
    default: Date.now,
    //stored in UTC Yr.-Mon.-Day HR:Min.:Sec.:NanoSec.
  }

})

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
    postComments: [commentSchema],
      
    postDate: {
      type: Date,
      default: Date.now,
  //     date will be set to the time the post is created
    }
})

module.exports = mongoose.model("Post", postSchema);
