const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { addProfilePicture, upload } = uploadController;

router.route('/addProfilePicture')
    .post(upload, addProfilePicture);

module.exports = router