const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const sendGrid = require('../utils/sendGrid');


router.route('/create')
    .post(postController.addPost)

router.route('/getPost')
    .get(postController.getPost)

router.route('/edit')
    .patch(postController.editPost)

router.route('/delete')
    .delete(postController.deletePost)

router.route('/like')
    .post(postController.likePost)

module.exports = router