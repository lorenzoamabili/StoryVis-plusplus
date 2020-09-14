require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/users', require('./users/users.controller'));
app.use('/provGraphs', require('./provGraphs/provGraphs.controller'));
app.use('/textReports', require('./textReports/textReports.controller'));
app.use('/stories', require('./stories/stories.controller'));
app.use('/provGraphsPractice', require('./provGraphsPractice/provGraphsPractice.controller'));
app.use('/storiesPractice', require('./storiesPractice/storiesPractice.controller'));
app.use('/textReportsPractice', require('./textReportsPractice/textReportsPractice.controller'));

// global error handler
app.use(errorHandler);

// start server
// const port = process.env.PORT || 8080;
const port = 
// process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) :
 27017;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});

// const server = require('http').createServer();
