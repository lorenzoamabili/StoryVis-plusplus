require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

// security headers
app.use(helmet());

// gzip compression
app.use(compression());

// request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '10mb' }));

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';
app.use(cors({ origin: allowedOrigin }));

// rate limiting on auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many requests, please try again later' }
});
app.use('/users/authenticate', authLimiter);
app.use('/users/register', authLimiter);

// health check (before JWT so it's always accessible)
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/ai', require('./ai/ai.controller'));
app.use('/users', require('./users/users.controller'));
app.use('/provGraphs', require('./provGraphs/provGraphs.controller'));
app.use('/textReports', require('./textReports/textReports.controller'));
app.use('/stories', require('./stories/stories.controller'));
app.use('/provGraphsStudy', require('./provGraphsStudy/provGraphsStudy.controller'));
app.use('/storiesStudy', require('./storiesStudy/storiesStudy.controller'));
app.use('/textReportsStudy', require('./textReportsStudy/textReportsStudy.controller'));

// 404 for unknown routes
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 4000);
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});

// prevent unhandled async errors from crashing the process
process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
});

// graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        const mongoose = require('mongoose');
        mongoose.connection.close(false, () => process.exit(0));
    });
});
