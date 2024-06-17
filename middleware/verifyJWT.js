const jwt = require('jsonwebtoken');
/**
* @function verifyJWT
* @description Middleware to verify JWT token
* @param {Object} req - Request object
* @param {Object} res - Response object
* @param {Function} next - Next function
* @returns {Function} next - Next function
* @throws {Error} - Throws error if token is invalid
*
* This middleware function is used to verify the JWT token, if the token is valid, it will add the user object to the * request object.
* If the token is invalid, it will throw an error.
*
* This middleware function can be used in any route that requires a valid JWT token.
* @example  app.use('/v1', verifyJWT, require("./routes/authenticateRoutes")); //routes for authenticated users
*
* @warning The access token is by default passed in auth header, if the token is not found in the header, it will
* check the cookies for the token. If the token is not found in the headers, it will throw an error.
* @warning the token passing method (cookies or headers) will be standardized in the future to avoid confusion.
*
*/
const verifyJWT = (req, res, next) => {


    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        const cookies = req.cookies;
        token = cookies?.jwt; //grabbing JWT from cookies
    }

    if (!token) {
        res.status(401);
        throw new Error('Not Authorized');
    }

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                res.status(403);
                throw new Error(err.message);
            } //token is invalid
            console.log(decoded);
            req.user = decoded.UserInfo
            next();
        }
    );
};

module.exports = verifyJWT;