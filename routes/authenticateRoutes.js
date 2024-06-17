const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const postRoutes = require('./postRoutes');

/**
 * This routing file is for authenticated routes
 * All routes in this file will require a valid JWT token and is * insured by the
 * @uses middleware/verifyJWT middleware
 *
 * All the routes in this file will have access to the user
 * object in the request object
 *
 * @example
 * const id = req.user_id
 * const username = req.username
 * const email = req.email
 * const isVerified = req.isVerified
 * @deprecated const roles = req.roles, not
 * implemented yet
 *
 */

// example 1
router.use("/post", postRoutes);

// example 2
router.route("/user/me").get(userController.getProfile);

// not recommended
router.route("/test").get((req, res) => {
    const { user_id, username, email, isVerified } = req.user;
    res.json({ user_id, username, email, isVerified });
});

module.exports = router;