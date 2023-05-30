const express = require('express');
const router = express.Router();
const retrieveController = require('../controllers/retrieveController');


router.route('/profilePicture')
    .get(retrieveController.getProfilePicture)

module.exports = router