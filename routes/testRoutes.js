const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { upload } = require('../utils/pictureStuff/uploadController');

router.route('/file-upload')
.post(upload('uploadedImage'), testController.uploadFile,);

router.route('/file-upload2')
.post(testController.deleteFile);

module.exports = router