const express = require('express');
const routerStory = express.Router();
const storyService = require('./story.service');

// routes
routerStory.post('/story', saveStory);
routerStory.get('/', getAllStories);
routerStory.get('/:id', getByIdStories);
routerStory.delete('/:id', _deleteStories);

module.exports = routerStory;

function saveStory(req, res, next) {
    storyService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function getAllStories(req, res, next) {
    storyService.getAll()
        .then(stories => res.json(stories))
        .catch(err => next(err));
}

function getByIdStories(req, res, next) {
    storyService.getById(req.params.id)
        .then(story => story ? res.json(story) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteStories(req, res, next) {
    storyService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}