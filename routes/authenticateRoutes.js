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
 * const username = req.username
 * const roles = req.roles
 *
 */

// example 1
router.use("/post", postRoutes);

// example 2
router.route("/user/me").get(userController.getProfile);

router.route("/auth").get((req, res) => {
    res.json({
        message: "Hello World"
    });
});


module.exports = router;