const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { upload } = require('../utils/pictureStuff/uploadController');
const sendGrid = require('../utils/sendGrid');