const express = require('express');
const routerText = express.Router();
const textReportService = require('./textReport.service');

routerText.post('/textReport', saveTextReport);
routerText.get('/', getAllTextReports);
routerText.get('/:id', getByIdTextReports);
routerText.delete('/:id', _deleteTextReports);

module.exports = routerText;

function saveTextReport(req, res, next) {
    textReportService.create(req.body).then(() => res.json({})).catch(err => next(err));
}

function getAllTextReports(req, res, next) {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = parseInt(req.query.skip) || 0;
    const IDcreator = req.query.IDcreator || null;
    textReportService.getAll({ limit, skip, IDcreator }).then(r => res.json(r)).catch(err => next(err));
}

function getByIdTextReports(req, res, next) {
    textReportService.getById(req.params.id).then(r => r ? res.json(r) : res.sendStatus(404)).catch(err => next(err));
}

function _deleteTextReports(req, res, next) {
    textReportService.delete(req.params.id).then(() => res.json({})).catch(err => next(err));
}
