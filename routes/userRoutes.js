const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const sendGrid = require('../utils/sendGrid');
const pictureController = require('../controllers/pictureController');
const { getProfilePicture, addProfilePicture, upload } = pictureController; 


// Requires form-data in Postman
router.route('/register')
    .post(userController.determineRequestType, userController.handleNewUser)
    .post(userController.determineRequestType, sendGrid.emailNewUser)
    
router.route('/auth')
    .get(userController.handleLogout)
    .post(userController.determineRequestType, userController.handleLogin)

router.route('/refresh')
    .get(userController.handleRefreshToken)

router.route('/twofactor')
    .post(userController.determineRequestType, sendGrid.TwoFAEmail)

router.route('/twofactorconfirm')
    .post(userController.determineRequestType, sendGrid.ConfirmTwoFAEmail)    

router.route('/profilepicture')
    .post(upload, addProfilePicture)
    .get(getProfilePicture)
    
module.exports = router