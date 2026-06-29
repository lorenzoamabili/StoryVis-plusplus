const express = require('express');
const routerStory = express.Router();
const storyService = require('./storyStudy.service');

routerStory.post('/story', saveStory);
routerStory.get('/', getAllStories);
routerStory.get('/:id', getById);
routerStory.delete('/:id', _delete);

module.exports = routerStory;

function saveStory(req, res, next) {
    storyService.create(req.body).then(() => res.json({})).catch(err => next(err));
}

function getAllStories(req, res, next) {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = parseInt(req.query.skip) || 0;
    const IDcreator = req.query.IDcreator || null;
    storyService.getAll({ limit, skip, IDcreator }).then(s => res.json(s)).catch(err => next(err));
}

function getById(req, res, next) {
    storyService.getById(req.params.id).then(s => s ? res.json(s) : res.sendStatus(404)).catch(err => next(err));
}

function _delete(req, res, next) {
    storyService.delete(req.params.id).then(() => res.json({})).catch(err => next(err));
}
