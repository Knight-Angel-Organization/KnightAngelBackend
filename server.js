require('dotenv').config();
const express = require('express');

const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials');
const connectDB = require('./config/dbConn');;

const PORT = process.env.PORT || 3500;
// everything under this functions like waterfall.

// connect to MongoDB
connectDB();

// custom logger middleware
app.use(logger);

// handles options credential chekc before CORS & fetch cookeis cred. requirement
app.use(credentials);

// cross origin resource sharing
app.use(cors(corsOptions));

// middleware to handle urlencoded form data
app.use(express.urlencoded({  extended:  false  }));
// middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// servs static files
// app.use('/', express.static(path.join(__dirname, '/public')));

//routes
app.use('/users', require('./routes/userRoutes'))//routes to for user authentication
app.use('/posts', require('./routes/postRoutes'))//routes for posts
/* app.use("/test", require('./routes/testRoutes'))//routes for testing */
app.use(verifyJWT); //everything after this will user JWT refresh tokens. usually shorter around 5-10 min.

// app.all('*', (req, res) => {
//     res.status(404);
//     if(req.accepts('html')){
//         res.sendFile(path.join(__dirname, 'views', '404.html'));
//     }else if(req.accepts('json')){
//         res.json({error: "404 Not Found"})
//     }else{
//         res.type('text').send("404 Not Found");
//     }
// });

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
