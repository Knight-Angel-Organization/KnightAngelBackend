const jwt = require('jsonwebtoken');


const verifyJWT = (req, res, next) => {
    const { cookies } = req;

    const access_token = cookies?.access_token;

    if (!access_token) {
        res.status(401);
        throw new Error('Not Authorized');
    }
    jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                res.status(403);
                throw new Error(err.message);
            } //token is invalid
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles
            console.log(req.user);
            next();
        }
    )
}

module.exports = verifyJWT;