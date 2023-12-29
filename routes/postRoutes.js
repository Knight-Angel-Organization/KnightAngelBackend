const express = require('express');

const router = express.Router();
const postController = require('../controllers/postController');
const sendGrid = require('../utils/sendGrid');

router.route('/create').post(postController.addPost);

router.route('/getPost').get(postController.getPost);
module.exports = router;
