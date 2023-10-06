const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const sendGrid = require('../utils/sendGrid');
const pictureController = require('../utils/pictureController');


router.route('/register')
    .post(userController.handleNewUser)
    .post(sendGrid.emailNewUser)
    
router.route('/auth')
    .get(userController.loginAndLogout)
    .post(userController.loginAndLogout)

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
    
router.route('/profile')
    .get(userController.getProfile)

router.route('/follow')
    .put(userController.followUser)

module.exports = router
