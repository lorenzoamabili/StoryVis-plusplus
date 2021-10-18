const express = require('express');
const routerTextReport = express.Router();
const textReportService = require('./textReport.service');

// routes
routerTextReport.post('/textReport', saveTextReport);
routerTextReport.get('/', getAllTextReports);
routerTextReport.get('/:id', getByIdTextReports);
routerTextReport.delete('/:id', _deleteTextReports);

module.exports = routerTextReport;

function saveTextReport(req, res, next) {
    textReportService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function getAllTextReports(req, res, next) {
    textReportService.getAll()
        .then(textReports => res.json(textReports))
        .catch(err => next(err));
}

function getByIdTextReports(req, res, next) {
    textReportService.getById(req.params.id)
        .then(textReport => textReport ? res.json(textReport) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteTextReports(req, res, next) {
    textReportService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}