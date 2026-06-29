const express = require('express');
const routerProv = express.Router();
const provenanceService = require('./provenanceStudy.service');

// routes
routerProv.post('/provenance', saveGraphStudy);
routerProv.get('/', getAllGraphsStudy);
routerProv.get('/:id', getByIdGraphsStudy);
routerProv.delete('/:id', _deleteGraphsStudy);

module.exports = routerProv;

function saveGraphStudy(req, res, next) {
    provenanceService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function getAllGraphsStudy(req, res, next) {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = parseInt(req.query.skip) || 0;
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    provenanceService.getAll({ limit, skip, userId, isAdmin })
        .then(graphs => res.json(graphs))
        .catch(err => next(err));
}

function getByIdGraphsStudy(req, res, next) {
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    provenanceService.getById(req.params.id, userId, isAdmin)
        .then(graph => graph ? res.json(graph) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteGraphsStudy(req, res, next) {
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    provenanceService.delete(req.params.id, userId, isAdmin)
        .then(result => result ? res.json({}) : res.sendStatus(403))
        .catch(err => next(err));
}