const Comment = require('../model/Comment');
const User = require('../model/User');
const asyncHandler = require('express-async-handler')
const path = require('path')
const {ObjectId} = require('mongodb')
const { add } = require('date-fns');
const { uploadToB2 } = require("../utils/pictureStuff/uploadController")

/* 
To-do (Delete lines after completion)
- Create comments:
    *Frontend needs to pass back the unique identifier of the post a user is commenting on (also known as the Post id or if looking at the post collection __oid)
    *Code should be similar to the create post functions with the added affect of having a way to target a specific comment
-
*/

const addComment = asyncHandler(async (req, res) => {

    const _postID = req.body.postID;
    const _userID = req.body.userID;
    const _commentContent = req.body.commentContent;

    if (!_postID || !_userID || !_commentContent) {
        return res.status(400).json({ 'message': 'Error: Post ID, user ID, and comment content are required.' });
    }

    // Verify post ID and user ID is a string of 24 hex characters
    if (!/^[0-9a-fA-F]{24}$/.test(_postID) || !/^[0-9a-fA-F]{24}$/.test(_userID)) {
        return res.status(400).json({ 'message': 'Post ID or user ID is invalid.' });
    }

    // Check if the post ID is in database
    const foundPost = await Post.findOne({ _id: new ObjectId(_postID) });

    if (!foundPost) {
        return res.status(400).json({ 'message': 'Error: Post ID is invalid.' });
    }

    // Check if the user ID exists
    const foundUser = await User.findOne({ _id: new ObjectId(_userID) });

    // Keep same error message to prevent username enumeration
    if (!foundUser) {
        return res.status(400).json({ 'message': 'Post ID or user ID is invalid.' });
    }

    const newComment = {
        postID: _postID,
        username: foundUser.username,
        commentContent: _commentContent,
        commentReactions: []
    };

    const addedComment = await Comment.create(newComment);

    if (addedComment) {
        return res.status(201).json({ 'success': 'Comment added successfully.' });
    } else {
        return res.status(400).json({ 'message': 'Error: Comment could not be added.' });
    }

});

module.exports = {addComment}