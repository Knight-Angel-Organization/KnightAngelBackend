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
    let _postLocation;
    // Check if post location is provided, if not, set it to "false".
    if (!req.body.postLocation) {
        _postLocation = "false";
    } else {
        _postLocation = req.body.postLocation;
    }

if(foundUser){
    if(_watchlistType == "Person" ){
        const _missingPersonFirst = req.body.missingPersonFirst
        const _missingPersonLast = req.body.missingPersonLast
        const _missingPersonSex = req.body.missingPersonSex
        const _missingPersonAge = req.body.missingPersonAge
        const _missingPersonHeight = req.body.missingPersonHeight
        const _missingPersonWeight = req.body.missingPersonWeight
        const _missingPersonEyes = req.body.missingPersonEyes
        const _missingPersonUnique = req.body.missingPersonUnique
        const _missingPersonReward = req.body.missingPersonReward
        const _missingPersonContact = req.body.missingpersonContact
        const _missingPersonLinks = req.body.missingPersonLinks
        const _missingPersonExtra = req.body.missingPersonExtra
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
                        Height: _missingPersonHeight,
                        Weight: _missingPersonWeight,
                        Eyes: _missingPersonEyes,
                        Location : _postLocation,
                        Unique: _missingPersonUnique,
                        Reward: _missingPersonReward,
                        Contact: _missingPersonContact,
                        Links: _missingPersonLinks,
                        Extra: _missingPersonExtra
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
    }else if (_watchlistType == "Pet"){
        const _missingPetName = req.body.missingPetName
        const _missingPetBreed = req.body.missingPetBreed
        const _missingPetSex = req.body.missingPetSex
        const _missingPetSize = req.body.missingPetSize
        const _missingPetColor = req.body.missingPetColor
        const _missingPetUnique = req.body.missingPetUnique
        const _missingPetReward = req.body.missingPetReward
        const _missingPetContact = req.body.missingPetContact
        const _missingPetLinks = req.body.missingPetLinks
        const _missingPetExtra = req.body.missingPetExtra
        if(!req.file){
            try{
                const personPost = await Watchlist.create({
                    userFirstName: foundUser.firstName,
                    userLastName: foundUser.lastName,
                    username: foundUser.username,
                    watchlistType:_watchlistType,
                    MissingPetContent:{
                        Name: _missingPetName,
                        Breed: _missingPetBreed,
                        Sex: _missingPetSex,
                        Size: _missingPetSize,
                        Color: _missingPetColor,
                        Location : _postLocation,
                        Unique: _missingPetUnique,
                        Reward: _missingPetReward,
                        Contact: _missingPetContact,
                        Links: _missingPetLinks,
                        Extra: _missingPetExtra
                    }
                })
                console.log(personPost)
                return res.status(201).json({ 'success': 'Pet Watchlist created successfully.' });
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