const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { upload } = require('../utils/pictureStuff/uploadController');
const sendGrid = require('../utils/sendGrid');

router.route('/create')
    .post(upload('uploadedImage'), watchlistController.addPost)


module.exports = router 