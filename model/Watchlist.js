const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const imageSchema = require('./Image');

const missingPersonSchema = new Schema ({
    missingPersonFirst:{
        type: String,
        required: true
    },
    missingPersonLast:{
        type: String,
        required:true
    },
    missingPersonSex:{
        type: String,
    },
    missingPersonAge:{
        type: Number
    },
    missingPersonHeight:{
        type: String
    },
    missingPersonWeight:{
        type: Number
    },
    missingPersonEyes:{
        type: String
    },
    missingPersonLocation:{
        type: String
    },
    missingPersonUnique: {
        type: String
    },
    missingPersonReward: {
        type: String
    },
    missingPersonContact: {
        type: String
    },
    missingPersonLinks: {
        type: String
    },
    missingPersonExtra: {
        type: String
    } 
})  


const watchlistSchema = new Schema ({
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
    watchlistType: {
        type:String,
        required:true,
        //fields here will be for Missing person, property, animals etc. Will be used to determine the post content
    },

    MissingPersonContent: missingPersonSchema,
      

    postDate: {
       type: Date,
       default: Date.now,
    //date will be set to the time the post is created
    }
})




module.exports = mongoose.model("Watchlist", watchlistSchema)