const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.route('/addProfilePicture')
    .post(uploadController.addProfilePicture)   


module.exports = router