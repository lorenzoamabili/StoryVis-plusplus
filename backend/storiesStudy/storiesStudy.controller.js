const express = require('express');
const routerStory = express.Router();
const storyService = require('./storyStudy.service');

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
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = parseInt(req.query.skip) || 0;
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    storyService.getAll({ limit, skip, userId, isAdmin })
        .then(stories => res.json(stories))
        .catch(err => next(err));
}

function getByIdStories(req, res, next) {
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    storyService.getById(req.params.id, userId, isAdmin)
        .then(story => story ? res.json(story) : res.sendStatus(404))
        .catch(err => next(err));
}

function _deleteStories(req, res, next) {
    const userId = String(req.user.sub);
    const isAdmin = req.user.role === 'Admin';
    storyService.delete(req.params.id, userId, isAdmin)
        .then(result => result ? res.json({}) : res.sendStatus(403))
        .catch(err => next(err));
}