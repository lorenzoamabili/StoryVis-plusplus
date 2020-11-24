const express = require('express');
const routerText = express.Router();
const textReportService = require('./textReportStudy.service');

// routes
routerText.post('/textReport', saveTextReportStudy);
routerText.get('/', getAllTextReportsStudy);
routerText.get('/:id', getByIdTextReportsStudy);
routerText.delete('/:id', _deleteTextReportsStudy);

module.exports = routerText;

function saveTextReportStudy(req, res, next) {
    textReportService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function getAllTextReportsStudy(req, res, next) {
    textReportService.getAll()
        .then(textReports => res.json(textReports))
        .catch(err => next(err));
}

function getByIdTextReportsStudy(req, res, next) {
    textReportService.getById(req.params.id)
        .then(textReport => textReport ? res.json(textReport) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteTextReportsStudy(req, res, next) {
    textReportService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}