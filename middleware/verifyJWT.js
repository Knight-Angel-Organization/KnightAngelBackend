const jwt = require('jsonwebtoken');


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error('Not Authorized');
    }


    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                res.status(403);
                throw new Error(err.message);
            } //token is invalid
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles
            next();
        }
    )
}

module.exports = verifyJWT;