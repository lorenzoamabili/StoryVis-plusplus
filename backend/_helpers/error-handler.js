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

    // Any other bad field value (e.g. a non-numeric string for a Number field, or a negative skip/limit)
    if (err.name === 'CastError') {
        return res.status(400).json({ message: `Invalid value for field '${err.path}'` });
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
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error');
    return res.status(500).json({ message });
}