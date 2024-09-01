const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const imageSchema = require('./Image');

const missingPersonSchema = new Schema ({
    First:{
        type: String,
    },
    Last:{
        type: String,
    },
    Sex:{
        type: String,
    },
    Age:{
        type: Number
    },
    Height:{
        type: String
    },
    Weight:{
        type: Number
    },
    Eyes:{
        type: String
    },
    Location:{
        type: String
    },
    Unique: {
        type: String
    },
    Reward: {
        type: String
    },
    Contact: {
        type: String
    },
    Links: {
        type: String
    },
    Extra: {
        type: String
    } 
}) 

const missingPetSchema = new Schema({
    Name:{
        type: String
    },
    Breed:{
        type: String
    },
    Sex:{
        type: String
    },
    Size:{
        type: String
    },
    Color:{
        type: String
    },
    Location:{
        type: String
    },
    Unique:{
        type: String
    },
    Reward:{
        type: String
    },
    Contact:{
        type: String
    },
    Links: {
        type: String
    },
    Extra: {
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

    MissingPetContent: missingPetSchema,

    watchlistImages: imageSchema,
    
    postDate: {
       type: Date,
       default: Date.now,
    //date will be set to the time the post is created
    }
})




module.exports = mongoose.model("Watchlist", watchlistSchema)