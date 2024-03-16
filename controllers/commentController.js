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