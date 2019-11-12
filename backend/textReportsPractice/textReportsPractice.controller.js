const express = require('express');
const routerText = express.Router();
const textReportService = require('./textReportPractice.service');

// routes
routerText.post('/textReport', saveTextReportPractice);
routerText.get('/', getAllTextReportsPractice);
routerText.get('/:id', getByIdTextReportsPractice);
routerText.delete('/:id', _deleteTextReportsPractice);

module.exports = routerText;

function saveTextReportPractice(req, res, next) {
    textReportService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function getAllTextReportsPractice(req, res, next) {
    textReportService.getAll()
        .then(textReports => res.json(textReports))
        .catch(err => next(err));
}

function getByIdTextReportsPractice(req, res, next) {
    textReportService.getById(req.params.id)
        .then(textReport => textReport ? res.json(textReport) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteTextReportsPractice(req, res, next) {
    textReportService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}