const express = require('express');
const routerStory = express.Router();
const storyService = require('./story.service');

routerStory.post('/story', saveStory);
routerStory.get('/', getAllStories);
routerStory.get('/:id', getByIdStories);
routerStory.delete('/:id', _deleteStories);

module.exports = routerStory;

function saveStory(req, res, next) {
    storyService.create(req.body).then(() => res.json({})).catch(err => next(err));
}

function getAllStories(req, res, next) {
    const limit = Math.max(Math.min(parseInt(req.query.limit) || 100, 500), 0);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const IDcreator = typeof req.query.IDcreator === 'string' ? req.query.IDcreator : null;
    storyService.getAll({ limit, skip, IDcreator }).then(s => res.json(s)).catch(err => next(err));
}

function getByIdStories(req, res, next) {
    storyService.getById(req.params.id).then(s => s ? res.json(s) : res.sendStatus(404)).catch(err => next(err));
}

function _deleteStories(req, res, next) {
    storyService.delete(req.params.id).then(() => res.json({})).catch(err => next(err));
}
