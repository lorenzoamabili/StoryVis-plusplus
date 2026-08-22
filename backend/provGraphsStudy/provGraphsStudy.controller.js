const express = require('express');
const routerProv = express.Router();
const provenanceService = require('./provenanceStudy.service');

routerProv.post('/provenance', saveGraph);
routerProv.get('/', getAllGraphs);
routerProv.get('/:id', getById);
routerProv.delete('/:id', _delete);

module.exports = routerProv;

function saveGraph(req, res, next) {
    provenanceService.create(req.body).then(() => res.json({})).catch(err => next(err));
}

function getAllGraphs(req, res, next) {
    const limit = Math.max(Math.min(parseInt(req.query.limit) || 100, 500), 0);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const IDcreator = typeof req.query.IDcreator === 'string' ? req.query.IDcreator : null;
    provenanceService.getAll({ limit, skip, IDcreator }).then(g => res.json(g)).catch(err => next(err));
}

function getById(req, res, next) {
    provenanceService.getById(req.params.id).then(g => g ? res.json(g) : res.sendStatus(404)).catch(err => next(err));
}

function _delete(req, res, next) {
    provenanceService.delete(req.params.id).then(() => res.json({})).catch(err => next(err));
}
