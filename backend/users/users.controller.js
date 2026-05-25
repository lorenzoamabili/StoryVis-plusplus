const express = require('express');
const routerUsers = express.Router();
const userService = require('./user.service');
const authorize = require('_helpers/authorize');

const VALID_ROLES = ['Admin', 'User', 'Student', 'Instructor'];
const VALID_GROUPS = ['A', 'B', 'Control', 'Experimental'];

// routes
routerUsers.post('/authenticate', authenticate);
routerUsers.post('/register', register);
routerUsers.get('/', authorize('Admin'), getAll);
routerUsers.get('/current', getCurrent);
routerUsers.get('/:id', authorize(), getById);
routerUsers.delete('/:id', authorize('Admin'), _delete);

module.exports = routerUsers;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    const { username, password, role, group } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (role && !VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    if (group && !VALID_GROUPS.includes(group)) {
        return res.status(400).json({ message: 'Invalid group' });
    }
    userService.create({ username, password, role: role || 'User', group: group || 'A' })
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
    const skip = parseInt(req.query.skip) || 0;
    userService.getAll({ limit, skip })
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}