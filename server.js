const path = require('path');
const express = require('express');
const dotenv  = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

dotenv.config({path: './config/config.env'});

const bootcamps =  require('./routes/bootcamps');
const courses =  require('./routes/courses');
const auth =  require('./routes/auth');
const users =  require('./routes/users');
const reviews =  require('./routes/reviews');
connectDB();

const app = express();

app.use(express.json());

// Cookie Parser
app.use(cookieParser());

if(process.env.NODE_ENV === 'development' ){
    app.use(morgan('dev'));
}

// File upload
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set Security Helmet
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
});

app.use(limiter);

// Prevent http params pollution
app.use(hpp());

// Enable CORS
app.use(cors())

app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

process.on('unhandledRejection', (error,promise) => {
    console.log(`Error: ${error.message}`.red.bold);
    server.close(() => process.exit(1));
});