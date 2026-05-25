module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof err === 'string') {
        return res.status(400).json({ message: err });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Invalid Token' });
    }

    // Invalid MongoDB ObjectId (e.g. /users/not-an-id)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Resource not found' });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // MongoDB duplicate key (e.g. unique username)
    if (err.code === 11000) {
        return res.status(409).json({ message: 'Duplicate entry' });
    }

    console.error('[error-handler]', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
}