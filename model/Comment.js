const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({

  postID: {
    type: String,
    required:true,
  },
  username:{
    type: String,
    required:true,
  },
  commentContent:{
    type: String,
    required:true,
  },

  // make multidimensional array for commentReactions
  commentReactions: {
    type: Array,
  },

  commentDate:{
    type: Date,
    default: Date.now,
    //stored in UTC Yr.-Mon.-Day HR:Min.:Sec.:NanoSec.
  }

})


module.exports = mongoose.model("Comment", commentSchema);
