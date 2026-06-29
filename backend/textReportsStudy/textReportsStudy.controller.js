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
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = parseInt(req.query.skip) || 0;
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    textReportService.getAll({ limit, skip, userId, isAdmin })
        .then(textReports => res.json(textReports))
        .catch(err => next(err));
}

function getByIdTextReportsStudy(req, res, next) {
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    textReportService.getById(req.params.id, userId, isAdmin)
        .then(textReport => textReport ? res.json(textReport) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteTextReportsStudy(req, res, next) {
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    textReportService.delete(req.params.id, userId, isAdmin)
        .then(result => result ? res.json({}) : res.sendStatus(403))
        .catch(err => next(err));
}