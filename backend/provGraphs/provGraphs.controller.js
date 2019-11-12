const express = require('express');
const routerProv = express.Router();
const provenanceService = require('./provenance.service');

// routes
routerProv.post('/provenance', saveGraph);
routerProv.get('/', getAllGraphs);
routerProv.get('/:id', getByIdGraphs);
routerProv.delete('/:id', _deleteGraphs);

module.exports = routerProv;

function saveGraph(req, res, next) {
    provenanceService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function getAllGraphs(req, res, next) {
    provenanceService.getAll()
        .then(graphs => res.json(graphs))
        .catch(err => next(err));
}

function getByIdGraphs(req, res, next) {
    provenanceService.getById(req.params.id)
        .then(graph => graph ? res.json(graph) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteGraphs(req, res, next) {
    provenanceService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}