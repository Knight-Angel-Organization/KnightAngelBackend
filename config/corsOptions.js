const allowedOrigins = require('./allowedOrigins').default;
// any connection based errors check here first to make sure IP or loacation that accessing to make sure its allowed
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
};

module.exports = corsOptions;
