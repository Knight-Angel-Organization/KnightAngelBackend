const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const { json } = require('express');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const multer = require('multer');
const User = require('../model/User');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const handleNewUser = asyncHandler(async (req, res, next) => {
    const { fnIn, lnIn, emailIn, passwordIn, usernameIn /* sqIn, sqaIn */ } = req.body;
    if (!fnIn || !lnIn || !emailIn || !passwordIn || !usernameIn /* || !sqIn || !sqaIn */)
        return res.status(400).json({
            message: 'Full name, username, email, password, are required',
        });

    // Make sure the email is valid, using validator package because regex had too many false positives and negatives

    if (!validator.isEmail(emailIn)) return res.status(400).json({ message: 'Email address is invalid' });
    /*
       Password requirements:
          1. At least 8 characters long
          2. At least 1 uppercase letter
          3. At least 1 lowercase letter
          4. At least 1 number
          5. At least 1 special character
          6. 64 characters maximum
      */
    if (passwordIn.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    if (!passwordIn.match(/[A-Z]/))
        return res.status(400).json({
            message: 'Password must contain at least 1 uppercase letter',
        });
    if (!passwordIn.match(/[a-z]/))
        return res.status(400).json({
            message: 'Password must contain at least 1 lowercase letter',
        });
    if (!passwordIn.match(/[0-9]/)) return res.status(400).json({ message: 'Password must contain at least 1 number' });
    if (!passwordIn.match(/[!@#$%^&*]/))
        return res.status(400).json({
            message: 'Password must contain at least 1 special character',
        });
    if (passwordIn.length > 64) return res.status(400).json({ message: 'Password must be less than 64 characters long' });

    // duplication checking in DB
    const duplicate = await User.findOne({ email: emailIn }).exec();
    const duplicateUsername = await User.findOne({
        username: usernameIn,
    }).exec();
    if (duplicate) return res.sendStatus(409); // conflict
    if (duplicateUsername) return res.sendStatus(409); // duplicate username

    try {
        // encrypt password
        const hashedPwd = await bcrypt.hash(passwordIn, 10);
        // create & store new person
        const result = await User.create({
            firstName: fnIn,
            lastName: lnIn,
            email: emailIn,
            password: hashedPwd,
            username: usernameIn,
            // remove comments when ready to fully deploy
            /* SecQue: sqIn,
                  SQA: sqaIn */
        });
        console.log(result);
        res.status(201).json({ success: `New User created with ${emailIn}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    next()
})

const loginAndLogout = asyncHandler(async(req,res)=>{
    const HTTPMethod = req.method;
    const allCookies = req.cookies;
    const JWTValue = allCookies.jwt //above lines check to see if the user is already signed in on current device.
    if (HTTPMethod === 'POST'){//login is a HTTP post request
        if(!JWTValue){
        const cookies = req.cookies;
        const {emailIn, passwordIn} = req.body;
        if(!emailIn || !passwordIn ) return res.status(400).json({'message': 'email & password are required'});
        const foundUser = await User.findOne({email: emailIn}).exec();
        if(!foundUser) return res.sendStatus(401); //Unauthorized
        //eval. password
        const match = await bcrypt.compare(passwordIn, foundUser.password);
    if(match){
        //const roles = Object.values(foundUser.roles);
        //create JWT
        //requiring users to logout after a certain amount of time. 
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    email: foundUser.email,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const NewRefreshToken = jwt.sign({ email: foundUser.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
        const newRefreshTokenArray = !cookies?.jwt
            ? foundUser.refreshToken
            : foundUser.refreshToken.filter((newRT) => newRT !== cookies.jwt);
        if (cookies?.jwt) {
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None' /* secure: true */,
            });
        }

        // saves refresh token to current user
        foundUser.refreshToken = [...newRefreshTokenArray, NewRefreshToken];
        const result = await foundUser.save();
        console.log(result);

        // secure cookie w/ refresh token
        res.cookie('jwt', NewRefreshToken, {
            httpOnly: true,
            sameSite: 'None',
      /* secure: true  , */ maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
    }else{
        return res.status(403).json({message: "You're already signed in"});
    }
    }else if (HTTPMethod === 'GET'){//logout is a HTTP GET Request
        //on client, delete access token when logout is pushed.
        const cookies = req.cookies;
        if(!cookies?.jwt) return res.status(204); //no content
        const refreshToken = cookies.jwt;

        // is refresh token in db?
        const foundUser = await User.findOne({ refreshToken }).exec();
        if (!foundUser) {
            res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'None' /* secure: true */,
        });
            return res.sendStatus(204); // success but No content
        }
        // Delete refresh token in db
        foundUser.refreshToken = foundUser.refreshToken.filter((newRT) => newRT !== refreshToken);
        const result = await foundUser.save();
        console.log(result); // delete console.log(result) and similar ones in production.
        res.clearCookie('jwt', { httpOnly: true }); // secure: true - only serves on https
        res.sendStatus(204);
    } 
});

const handleRefreshToken = asyncHandler(async (req, res) => {
    const { cookies } = req;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None' /* secure: true */,
    }); // deletes cookie after getting data

    const foundUser = await User.findOne({ refreshToken }).exec();

    // detection refresh token reuse
    if (!foundUser) {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) return res.sendStatus(403); // Forbidden
            const hackedUser = await User.findOne({
                email: decoded.email,
            }).exec();
            hackedUser.refreshToken = [];
            const result = await hackedUser.save();
            console.log(result);
        });
        return res.sendStatus(403); // Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter((newRT) => newRT !== refreshToken);
    // eval. password
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            foundUser.refreshToken = [...newRefreshTokenArray];
            const result = await foundUser.save();
        }
        if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
        // refresh token was still valid
        // const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    email: decoded.email,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );

        const newRefreshToken = jwt.sign({ email: foundUser.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
        // saves refresh token to current user
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();

        res.cookie('jwt', newRefreshToken, {
            httpOnly: true,
            sameSite: 'None',
      /* secure: true  , */ maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
    });
});

// Determine if the request is a multipart request
// If it is, use multer to parse the request
// If it is not, then continue as if it is a normal request (JSON Raw or x-www-form-urlencoded)

// determineRequestType() should be run before any other function

const determineRequestType = () => {
    const multr = multer();

    return (req, res, next) => {
        const contentType = req.headers['content-type'];

        if (contentType && contentType.includes('multipart/form-data')) {
            multr.none()(req, res, next);
        } else {
            next();
        }
    };
};

// Get user's profile

const getProfile = asyncHandler(async (req, res) => {
    const HTTPMethod = req.method;
    if (HTTPMethod === 'GET') {
        // retrives cookies if trying to look at own profile.
        const allCookies = req.cookies;
        const JWTValue = allCookies.jwt;
        if (!JWTValue) return res.status(400).json({ message: `User not signed in: ${JWTValue}` });
        const foundUser = await User.findOne({ refreshToken: JWTValue }).exec();
        if (!foundUser) return res.status(404).json({ message: 'User not found' });
        // Return the user's profile with relevant information (first name, last name, profile picture). Returns a 'default' profile picture if the profilePic object is missing
        if (foundUser.profilePic) {
            const {
                firstName,
                lastName,
                email,
                profilePic: { imageURL },
            } = foundUser;
            res.status(200).json({
                profile: { firstName, lastName, imageURL },
            });
        } else {
            const { firstName, lastName, email } = foundUser;
            const imageURL = 'https://f005.backblazeb2.com/file/knightangel/default-profile-picture.png';
            res.status(200).json({
                profile: { firstName, lastName, imageURL },
            });
        }
    } else if (HTTPMethod === 'POST') {
        // retrives cookies to confirm user is signed in.
        const allCookies = req.cookies;
        const JWTValue = allCookies.jwt;
        if (!JWTValue) return res.status(400).json({ message: `User not signed in: ${JWTValue}` });
        // change to something else that will identify other users in different locations(feed page, services, etc.)
        const { emailIn } = req.body;
        const foundUser = await User.findOne({ email: emailIn }).exec();
        if (!foundUser) return res.status(404).json({ message: 'User not found' });
        // Return the user's profile with relevant information (first name, last name, profile picture). Returns a 'default' profile picture if the profilePic object is missing
        if (foundUser.profilePic) {
            const {
                firstName,
                lastName,
                email,
                profilePic: { imageURL },
            } = foundUser;
            res.status(200).json({
                profile: { firstName, lastName, imageURL },
            });
        } else {
            const { firstName, lastName, email } = foundUser;
            const imageURL = 'https://f005.backblazeb2.com/file/knightangel/default-profile-picture.png';
            res.status(200).json({
                profile: { firstName, lastName, imageURL },
            });
        }
    }
});

const emergencyContacts = asyncHandler(async (req, res) => {
    // change emailIn to something else later, as its only for testing RN. Route will only be ran when user is signed into app.
    const { userEmail, friendEmail } = req.body;
    if (userEmail == friendEmail) return res.status(405).json({ message: `You may not enter your own email address` });

    const foundFriendsEmail = await User.findOne({ email: friendEmail }).exec();
    const foundUserEmail = await User.findOne({ email: userEmail }).exec();
    /*
         Data validation
         Checks for:
         1. Friend's email address is found in the database
         2. User's email address is found in the database
         3. Friend's email address is not already in the user's emergency contacts
         4. User has less than 10 emergency contacts    */

    if (!foundFriendsEmail) return res.status(404).json({ message: `Friend's email address is not found` });
    if (!foundUserEmail) return res.status(404).json({ message: `User's email address not found` });
    if (foundUserEmail.emergencyContacts.includes(foundFriendsEmail.email))
        return res.status(409).json({ message: `Friend's contact already added` });
    if (foundUserEmail.emergencyContacts.length >= 10)
        return res.status(403).json({ message: `You may only have up to 10 emergency contacts` });

    // Functionality for adding the emergency contact

    foundUserEmail.emergencyContacts.push(foundFriendsEmail.email);
    const result = await foundUserEmail.save();
    console.log(result);
    res.status(201).json({success: `Emergency Contact ${foundFriendsEmail.email} set for ${foundUserEmail.email}`})



})

const followUser = asyncHandler(async(req,res)=>{
    const allCookies = req.cookies;
    const JWTValue = allCookies.jwt
    const {usernameTapped} = req.body
    try{
        const currentUser = await User.findOne({ refreshToken: JWTValue }).exec(); //user thats signed into phone
        const followingUser = await User.findOne({username: usernameTapped}) //person that signed in user is trying to follow
        if(!currentUser.followings.includes(followingUser.username)){
            await currentUser.updateOne({$push:{followings:followingUser.username}})
            await followingUser.updateOne({$push:{followers:currentUser.username}})
            res.status(200).json(`You just followed ${followingUser.username}`)
        }else{
            res.status(403).json(`You already follow ${followingUser.username}`)
        }
    }catch{
        res.status(500).json(err)
    }
})

const unfollowUser = asyncHandler(async(req,res)=>{
    const allCookies = req.cookies;
    const JWTValue = allCookies.jwt
    const {usernameTapped} = req.body
    try{
        const currentUser = await User.findOne({ refreshToken: JWTValue }).exec(); //user thats signed into phone
        const followingUser = await User.findOne({username: usernameTapped}) //person that signed in user is trying to follow
        if(currentUser.followings.includes(followingUser.username)){
            await currentUser.updateOne({$pull: {followings:followingUser.username}})
            await followingUser.updateOne({$pull: {followers:currentUser.username}})
            /* await currentUser.updateOne({$pull:{followings:followingUser.username}})
            await followingUser.updateOne({$pull:{followers:currentUser.username}}) */
            res.status(200).json(`You just unfollowed ${followingUser.username}`)
        }else{
            res.status(403).json(`You don't follow ${followingUser.username}`)
        }
    }catch{
        res.status(500).json(err);
    }
})
module.exports = {handleNewUser, loginAndLogout, handleRefreshToken, determineRequestType: determineRequestType(), getProfile, emergencyContacts, followUser, unfollowUser }

