const AppError = require('../utils/AppError')

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Recurso no encontrado';
        error = new AppError(message, 404);
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Valor duplicado';
        error = new AppError(message, 400);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new AppError(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Error del servidor'
    });
};
module.exports = errorHandler;