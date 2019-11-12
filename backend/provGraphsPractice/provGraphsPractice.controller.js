const express = require('express');
const routerProv = express.Router();
const provenanceService = require('./provenancePractice.service');

// routes
routerProv.post('/provenance', saveGraphPractice);
routerProv.get('/', getAllGraphsPractice);
routerProv.get('/:id', getByIdGraphsPractice);
routerProv.delete('/:id', _deleteGraphsPractice);

module.exports = routerProv;

function saveGraphPractice(req, res, next) {
    provenanceService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function getAllGraphsPractice(req, res, next) {
    provenanceService.getAll()
        .then(graphs => res.json(graphs))
        .catch(err => next(err));
}

function getByIdGraphsPractice(req, res, next) {
    provenanceService.getById(req.params.id)
        .then(graph => graph ? res.json(graph) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteGraphsPractice(req, res, next) {
    provenanceService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}