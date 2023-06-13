const User = require('../model/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const { json } = require('express');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail')
const multer = require('multer');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const handleNewUser = asyncHandler(async (req,res,next) => {
    const {fnIn, lnIn, emailIn, passwordIn, /* sqIn, sqaIn */} = req.body;
    if(!fnIn || !lnIn || !emailIn || !passwordIn /* || !sqIn || !sqaIn */) return res.status(400).json({'message': 'Full name, email, password, Security Question & Answer are required'});
    //duplication checking in DB
    const duplicate = await User.findOne({email: emailIn}).exec();
    if (duplicate) return res.sendStatus(409);//conflict
    try{
        //encrypt password
        const hashedPwd = await bcrypt.hash(passwordIn, 10)
        //create & store new person
        const result = await User.create({
            firstName: fnIn,
            lastName: lnIn,
            email : emailIn,
            password : hashedPwd,
            /* SecQue: sqIn,
            SQA: sqaIn */
        })
        console.log(result);
        res.status(201).json({'success': `New User created with ${emailIn}`});
    }catch(err){
        res.status(500).json({'message':err.message})
    }
    next()
})
const handleLogin = asyncHandler(async (req,res) => {
    const cookies = req.cookies;
    const {emailIn, passwordIn} = req.body;
    if(!emailIn || !passwordIn) return res.status(400).json({'message': 'email & password are required'});
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
            "UserInfo":{
                "email": foundUser.email,
            }
        },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '30s'}
        );
        const NewRefreshToken = jwt.sign(
            {"email": foundUser.email},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );

        const newRefreshTokenArray =
            !cookies?.jwt
                ? foundUser.refreshToken
                :foundUser.refreshToken.filter(newRT => newRT !== cookies.jwt);
        if(cookies?.jwt){
            res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', /* secure: true */});
        };

        //saves refresh token to current user
        foundUser.refreshToken = [...newRefreshTokenArray, NewRefreshToken];
        const result = await foundUser.save();
        console.log(result);
        
        //secure cookie w/ refresh token
        res.cookie('jwt', NewRefreshToken, {httpOnly: true, sameSite: 'None', /* secure: true  ,*/ maxAge: 24 * 60 * 60 * 1000});
        res.json({accessToken});
    }else{
        res.sendStatus(401)
    }
})
const handleLogout = asyncHandler(async (req,res) => {
    //on client, delete access token when logout is pushed.
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.status(204); //no content
    const refreshToken = cookies.jwt;

    //is refresh token in db?    
    const foundUser = await User.findOne({refreshToken}).exec();
    if(!foundUser) {
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', /* secure: true */});
        return res.sendStatus(204); //success but No content
    }
    //Delete refresh token in db
    foundUser.refreshToken = foundUser.refreshToken.filter(newRT => newRT !== refreshToken);
    const result = await foundUser.save();
    console.log(result);//delete console.log(result) and similar ones in production.
    res.clearCookie('jwt', {httpOnly: true}); //secure: true - only serves on https
    res.sendStatus(204);
})
const handleRefreshToken = asyncHandler(async (req,res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', /* secure: true */}); // deletes cookie after getting data

    const foundUser = await User.findOne({refreshToken}).exec();

    //detection refresh token reuse
    if(!foundUser) {
       
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if(err) return res.sendStatus(403); //Forbidden
                const hackedUser = await User.findOne({email: decoded.email}).exec()
                hackedUser.refreshToken =[];
                const result = await hackedUser.save();
                console.log(result);
            })
            return res.sendStatus(403) //Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(newRT => newRT !== refreshToken)
    //eval. password
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if(err){
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
            }
            if(err || foundUser.email !== decoded.email) return res.sendStatus(403);
            //refresh token was still valid
            //const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                "UserInfo":{
                    "email" : decoded.email,
                }
            },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn : '30s'}
            );

            const newRefreshToken = jwt.sign(
                {"email": foundUser.email},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: '1d'}
            );
            //saves refresh token to current user
            foundUser.refreshToken = [...newRefreshTokenArray,newRefreshToken];
            const result = await foundUser.save();

            res.cookie('jwt', newRefreshToken, {httpOnly: true, sameSite: 'None', /* secure: true  ,*/ maxAge: 24 * 60 * 60 * 1000});
            res.json({accessToken})
        }
    )
})

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

module.exports = {handleNewUser, handleLogin, handleLogout, handleRefreshToken, determineRequestType: determineRequestType() }
