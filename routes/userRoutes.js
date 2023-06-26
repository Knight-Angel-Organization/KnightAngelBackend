const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const sendGrid = require('../utils/sendGrid');
const pictureController = require('../controllers/pictureController');


router.route('/register')
    .post(userController.handleNewUser)
    .post(sendGrid.emailNewUser)
    
router.route('/auth')
    .get(userController.handleLogout)
    .post(userController.handleLogin)

router.route('/refresh')
    .get(userController.handleRefreshToken)

router.route('/twofactor')
    .post(sendGrid.TwoFAEmail)

router.route('/twofactorconfirm')
    .post(sendGrid.ConfirmTwoFAEmail)    

router.route('/profilepicture')
    .post(pictureController.upload, pictureController.addProfilePicture)
    .get(pictureController.getProfilePicture)

router.route('/emergencycontact')
    .post(userController.emergencyContacts)    
    
module.exports = router
