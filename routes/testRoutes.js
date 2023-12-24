const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { upload } = require('../utils/files/uploadController');

router.route('/file-upload')
.post(upload('uploadedImage'), testController.uploadFile,);

router.route('/file-upload').delete(testController.deleteFile);

module.exports = router