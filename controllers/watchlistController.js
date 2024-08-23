const Watchlist = require('../model/Watchlist')
const User = require('../model/User');
const asyncHandler = require('express-async-handler');
const path = require('path');
const { ObjectId } = require('mongodb');
const { add } = require('date-fns');
const { uploadToB2 } = require("../utils/pictureStuff/uploadController")


const addPost = asyncHandler(async (req, res) => {

    // Get the user ID + post content, title, location and type from the request body. It is optional to have the location.
    const allCookies = req.cookies;
    const JWTValue = allCookies.jwt
    const foundUser = await User.findOne({ refreshToken: JWTValue }).exec(); //user thats signed into phone
    const _watchlistType = req.body.watchlistType;
    const _missingPersonFirst = req.body.missingPersonFirst
    const _missingPersonLast = req.body.missingPersonLast
    const _missingPersonSex = req.body.missingPersonSex
    const _missingPersonAge = req.body.missingPersonAge
    const _missingPersonHeight = req.body.missingPersonHeight

    let _postLocation;
    // Check if post location is provided, if not, set it to "false".
    if (!req.body.postLocation) {
        _postLocation = "false";
    } else {
        _postLocation = req.body.postLocation;
    }

if(foundUser){
    if(_watchlistType == "Person" ){
        if(!req.file){
            try{
                const personPost = await Watchlist.create({
                    userFirstName: foundUser.firstName,
                    userLastName: foundUser.lastName,
                    username: foundUser.username,
                    watchlistType:_watchlistType,
                    MissingPersonContent:{
                        First: _missingPersonFirst,
                        Last: _missingPersonLast,
                        Sex: _missingPersonSex,
                        Age: _missingPersonAge,
                        Height: _missingPersonHeight

                    }
                })
                console.log(personPost)
                return res.status(201).json({ 'success': 'Person Watchlist created successfully.' });
            }catch(err){
                console.log(err)
                res.status(500).json({message: err.message})
            }
        }else{
            try{
                const { buffer, mimetype, originalname } = req.file;
                const picInfo = await uploadToB2(buffer, mimetype, originalname);
                const newPost = await Watchlist.create({
                    userFirstName: foundUser.firstName,
                    userLastName: foundUser.lastName,
                    username: foundUser.username,
                    postContent: _postContent,
                    postTitle: _postTitle,
                    postLocation: _postLocation,
                    postImages: {
                        imageURL: 'https://f005.backblazeb2.com/file/knightangel/' + picInfo.fileName,
                        fileID: picInfo.id,
                        fileName: picInfo.fileName,
                        mimetype: mimetype,
                        uploadDate: new Date()
                    },
                    postType:_postType,
                    postCategory:_postCategory,
                    postLikes: []
                })
                console.log(newPost)
                return res.status(201).json({ 'success': 'Post created successfully.' });
            }catch(err){
                console.log(err)
                res.status(500).json({message: err.message})
            }
        }
    }else if (!_watchlistType) {
        return res.status(400).json({ 'message': 'Error: Type of watchlist post required.' });
    }        
}else{
    return res.status(400).json({ 'message': 'Error: Not signed in.' });
    }
});

module.exports = {addPost}